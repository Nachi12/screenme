import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import {
  ANALYSIS_VERSION,
  CreateAnalysisRequestSchema,
  SCORING_VERSION,
  type ParsedResume,
} from '@screenme/shared';
import { env } from '../config/env.js';
import {
  buildInitialStages,
  launchAnalysisJob,
} from '../jobs/analysisJob.service.js';
import { AnalysisReportModel } from '../models/AnalysisReport.model.js';
import { JobDescriptionModel } from '../models/JobDescription.model.js';
import { ResumeModel } from '../models/Resume.model.js';
import { parseJobDescription } from '../services/parsing/jdParser.service.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';

function assertOwnership(
  doc: { userId?: unknown; guestSessionId?: string | null },
  req: Request
): void {
  if (doc.userId) {
    if (!req.user || String(doc.userId) !== req.user.userId) {
      throw new ForbiddenError('You do not have access to this analysis.');
    }
    return;
  }

  if (doc.guestSessionId) {
    if (!req.guestSessionId || doc.guestSessionId !== req.guestSessionId) {
      throw new ForbiddenError('You do not have access to this guest analysis.');
    }
    return;
  }

  throw new ForbiddenError('Access denied.');
}

export async function createAnalysis(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = CreateAnalysisRequestSchema.parse(req.body);
    const resumeDoc = await ResumeModel.findById(input.resumeId);
    if (!resumeDoc) {
      throw new NotFoundError('Uploaded resume session was not found or expired.');
    }
    assertOwnership(resumeDoc, req);

    const parsedResume = resumeDoc.parsed as ParsedResume;

    if (req.user && input.saveResume) {
      resumeDoc.savedByUser = true;
      resumeDoc.expiresAt = null;
      await resumeDoc.save();
    }

    const { parsed: parsedJD, jdHash } = parseJobDescription({
      rawText: input.jobDescription.rawText,
      title: input.jobDescription.title,
      company: input.jobDescription.company,
    });

    const ownerKey = req.user ? `u:${req.user.userId}` : `g:${req.guestSessionId}`;
    const dedupeKey = crypto
      .createHash('sha256')
      .update(
        JSON.stringify({
          ownerKey,
          resumeHash: resumeDoc.contentHash,
          jdHash,
          profile: input.candidateProfile,
          analysisVersion: ANALYSIS_VERSION,
          scoringVersion: SCORING_VERSION,
        })
      )
      .digest('hex');

    // Deduplicate identical in-flight or very recent (10 min) completed requests
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const existingAnalysis = await AnalysisReportModel.findOne({
      dedupeKey,
      status: { $in: ['queued', 'processing', 'completed'] },
      createdAt: { $gte: tenMinutesAgo },
    }).sort({ createdAt: -1 });

    if (existingAnalysis) {
      sendSuccess(
        res,
        {
          analysisId: existingAnalysis.id,
          status: existingAnalysis.status,
          deduplicated: true,
        },
        existingAnalysis.status === 'completed' ? 200 : 202
      );
      return;
    }

    const expiresAt = req.user
      ? null
      : new Date(Date.now() + env.GUEST_REPORT_TTL_HOURS * 60 * 60 * 1000);

    const jdDoc = await JobDescriptionModel.create({
      userId: req.user?.userId ?? null,
      guestSessionId: req.user ? null : req.guestSessionId ?? null,
      jdHash,
      parsed: parsedJD,
      expiresAt,
    });

    const analysisDoc = await AnalysisReportModel.create({
      userId: req.user?.userId ?? null,
      guestSessionId: req.user ? null : req.guestSessionId ?? null,
      resumeId: resumeDoc._id,
      jobDescriptionId: jdDoc._id,
      dedupeKey,
      jdHash,
      candidateProfile: input.candidateProfile,
      status: 'queued',
      currentStage: 'validating_inputs',
      progressPercent: 10,
      stages: buildInitialStages(),
      analysisVersion: ANALYSIS_VERSION,
      scoringVersion: SCORING_VERSION,
      expiresAt,
    });

    launchAnalysisJob({
      analysisId: analysisDoc.id,
      resume: parsedResume,
      jd: parsedJD,
      jdHash,
      profile: input.candidateProfile,
    });

    sendSuccess(
      res,
      {
        analysisId: analysisDoc.id,
        status: 'queued',
        deduplicated: false,
      },
      202
    );
  } catch (err) {
    next(err);
  }
}

export async function getAnalysisStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doc = await AnalysisReportModel.findById(req.params.id);
    if (!doc) {
      throw new NotFoundError('Analysis job not found.');
    }
    assertOwnership(doc, req);

    sendSuccess(res, {
      analysisId: doc.id,
      status: doc.status,
      currentStage: doc.currentStage,
      progressPercent: doc.progressPercent,
      stages: doc.stages,
      ...(doc.status === 'completed' ? { reportId: doc.id } : {}),
      ...(doc.errorInfo ? { error: doc.errorInfo } : {}),
    });
  } catch (err) {
    next(err);
  }
}

export async function getAnalysisResult(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doc = await AnalysisReportModel.findById(req.params.id);
    if (!doc) {
      throw new NotFoundError('Analysis not found.');
    }
    assertOwnership(doc, req);

    sendSuccess(res, {
      analysisId: doc.id,
      status: doc.status,
      ...(doc.report ? { report: doc.report } : {}),
      ...(doc.errorInfo ? { error: doc.errorInfo } : {}),
    });
  } catch (err) {
    next(err);
  }
}

