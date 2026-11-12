import type { NextFunction, Request, Response } from 'express';
import { ParseJDRequestSchema } from '@screenme/shared';
import { env } from '../config/env.js';
import { ResumeModel } from '../models/Resume.model.js';
import { parseJobDescription } from '../services/parsing/jdParser.service.js';
import { importJobDescriptionFromUrl } from '../services/parsing/jdUrlImporter.service.js';
import { parseResumeBuffer } from '../services/parsing/resumeParser.service.js';
import { FileValidationError, ValidationError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';

export async function uploadResume(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      throw new FileValidationError(
        'Please attach a PDF or DOCX resume file.',
        'MISSING_FILE'
      );
    }

    const { parsed, contentHash } = await parseResumeBuffer({
      buffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
    });

    const isAuthenticated = Boolean(req.user);
    const expiresAt = isAuthenticated
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + env.GUEST_REPORT_TTL_HOURS * 60 * 60 * 1000);

    const saved = await ResumeModel.create({
      userId: req.user?.userId ?? null,
      guestSessionId: req.user ? null : req.guestSessionId ?? null,
      contentHash,
      savedByUser: false,
      parsed,
      expiresAt,
    });

    sendSuccess(
      res,
      {
        resumeId: saved.id,
        fileName: parsed.fileName,
        fileType: parsed.fileType,
        fileSizeBytes: parsed.fileSizeBytes,
        pageCount: parsed.pageCount,
        wordCount: parsed.wordCount,
        detectedSections: parsed.sections.map((s) => s.heading),
        detectedSkills: parsed.detectedSkills,
        extractionWarnings: parsed.extractionWarnings,
        textPreview: parsed.rawText.slice(0, 600),
      },
      201
    );
  } catch (err) {
    next(err);
  }
}

export async function parseJobDescriptionEndpoint(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = ParseJDRequestSchema.parse(req.body);
    let rawText = input.rawText ?? '';
    let importedTitle = input.title;
    let fallbackReason: string | undefined;

    if (input.url && (!rawText || rawText.length < 40)) {
      const importRes = await importJobDescriptionFromUrl(input.url);
      if (importRes.imported && importRes.rawText) {
        rawText = importRes.rawText;
        importedTitle = importedTitle || importRes.title;
      } else {
        fallbackReason = importRes.fallbackReason;
        if (!rawText) {
          sendSuccess(res, {
            imported: false,
            fallbackReason:
              fallbackReason ??
              'Could not extract JD from URL. Please paste the description manually.',
          });
          return;
        }
      }
    }

    if (rawText.trim().length < 40) {
      throw new ValidationError(
        'Job description text must be at least 40 characters.'
      );
    }

    const { parsed, jdHash } = parseJobDescription({
      rawText,
      title: importedTitle,
      company: input.company,
    });

    sendSuccess(res, {
      imported: !fallbackReason,
      ...(fallbackReason ? { fallbackReason } : {}),
      jdHash,
      parsed: {
        title: parsed.title,
        company: parsed.company,
        detectedEnvironment: parsed.detectedEnvironment,
        technicalSkills: parsed.technicalSkills,
        requirementCount: parsed.requirements.length,
        rawText: parsed.rawText,
      },
    });
  } catch (err) {
    next(err);
  }
}

