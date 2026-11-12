import crypto from 'node:crypto';
import mammoth from 'mammoth';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type {
  ParsedResume,
  ResumeSectionSnippet,
  ResumeSectionType,
} from '@screenme/shared';
import { FileValidationError } from '../../utils/errors.js';
import { extractSkillsFromText } from './skillNormalizer.service.js';

interface PdfExtractResult {
  numpages: number;
  text: string;
}

async function extractTextFromPdfBuffer(buffer: Buffer): Promise<PdfExtractResult> {
  const data = new Uint8Array(buffer);
  const loadingTask = getDocument({
    data,
    verbosity: 0,
    useSystemFonts: true,
    disableFontFace: true,
  });

  const pdfDoc = await loadingTask.promise;
  try {
    const numpages = pdfDoc.numPages;
    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= numpages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      const lines: string[] = [];
      let currentLine: string[] = [];
      let lastY: number | null = null;

      for (const item of textContent.items) {
        if (!('str' in item)) continue;
        const textItem = item as { str: string; transform?: number[]; hasEOL?: boolean };
        const y = Array.isArray(textItem.transform) ? textItem.transform[5] : undefined;

        if (
          lastY !== null &&
          typeof y === 'number' &&
          Math.abs(y - lastY) > 3 &&
          currentLine.length > 0
        ) {
          lines.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
          currentLine = [];
        }

        if (textItem.str.trim().length > 0) {
          currentLine.push(textItem.str);
        }
        if (typeof y === 'number') {
          lastY = y;
        }
        if (textItem.hasEOL && currentLine.length > 0) {
          lines.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
          currentLine = [];
        }
      }

      if (currentLine.length > 0) {
        lines.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
      }

      pageTexts.push(lines.filter(Boolean).join('\n'));
    }

    return {
      numpages,
      text: pageTexts.join('\n\n').trim(),
    };
  } finally {
    if (typeof pdfDoc.cleanup === 'function') {
      await pdfDoc.cleanup();
    }
    if (typeof loadingTask.destroy === 'function') {
      await loadingTask.destroy();
    }
  }
}

const SECTION_PATTERNS: Array<{ type: ResumeSectionType; pattern: RegExp }> = [
  { type: 'summary', pattern: /^(?:professional\s+)?(?:summary|profile|objective|about\s+me)$/i },
  { type: 'education', pattern: /^(?:education|academic\s+background|academics|qualifications)$/i },
  { type: 'skills', pattern: /^(?:technical\s+)?(?:skills|core\s+competencies|tech\s+stack|technologies)$/i },
  { type: 'projects', pattern: /^(?:academic\s+|personal\s+|key\s+)?projects?$/i },
  { type: 'internships', pattern: /^internships?$/i },
  { type: 'experience', pattern: /^(?:work\s+|professional\s+)?experience|employment(?:\s+history)?$/i },
  { type: 'certifications', pattern: /^(?:certifications?|licenses?(?:\s+&\s+certifications?)?|courses?)$/i },
  { type: 'achievements', pattern: /^(?:achievements?|awards?|honors?|publications?|hackathons?|extracurriculars?)$/i },
];

function classifyHeading(line: string): ResumeSectionType | null {
  const cleaned = line
    .replace(/[:\-–—|_]+$/g, '')
    .replace(/^[•*\-\s]+/, '')
    .trim();
  if (cleaned.length < 3 || cleaned.length > 48) return null;
  for (const entry of SECTION_PATTERNS) {
    if (entry.pattern.test(cleaned)) {
      return entry.type;
    }
  }
  return null;
}

function detectSections(rawText: string): ResumeSectionSnippet[] {
  const lines = rawText.split(/\r?\n/);
  const sections: ResumeSectionSnippet[] = [];

  let currentType: ResumeSectionType = 'header';
  let currentHeading = 'Header';
  let currentStart = 1;
  let buffer: string[] = [];

  const flush = (endLine: number): void => {
    const content = buffer.join('\n').trim();
    if (content.length > 0) {
      sections.push({
        type: currentType,
        heading: currentHeading,
        content,
        startLine: currentStart,
        endLine,
      });
    }
    buffer = [];
  };

  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    const trimmed = rawLine.trim();
    const detected = classifyHeading(trimmed);
    if (detected) {
      flush(Math.max(currentStart, lineNum - 1));
      currentType = detected;
      currentHeading = trimmed.replace(/[:\-–—]+$/, '').trim();
      currentStart = lineNum;
    } else {
      buffer.push(rawLine);
    }
  });

  flush(lines.length);
  return sections;
}

function extractContactAndName(rawText: string): {
  candidateName?: string;
  contact: ParsedResume['contact'];
} {
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{4,5}/);
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/i);
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/?/i);
  const portfolioMatch = rawText.match(/https?:\/\/(?!(?:www\.)?(?:linkedin|github)\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s)]*)?/i);

  const firstLines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, 5);

  let candidateName: string | undefined;
  for (const line of firstLines) {
    if (
      !line.includes('@') &&
      !/https?:\/\//i.test(line) &&
      !/linkedin\.com|github\.com/i.test(line) &&
      !/^\+?\d[\d\s\-()]{6,}$/.test(line) &&
      line.split(/\s+/).length >= 2 &&
      line.split(/\s+/).length <= 5 &&
      line.length <= 50 &&
      !classifyHeading(line)
    ) {
      candidateName = line.replace(/[|•].*$/, '').trim();
      break;
    }
  }

  return {
    candidateName,
    contact: {
      email: emailMatch?.[0],
      phone: phoneMatch?.[0]?.trim(),
      linkedin: linkedinMatch?.[0],
      github: githubMatch?.[0],
      portfolio: portfolioMatch?.[0],
    },
  };
}

function assessReadingOrder(rawText: string): ParsedResume['readingOrderConfidence'] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 5) return 'unable_to_determine';
  const shortLines = lines.filter((l) => l.length <= 18).length;
  const ratio = shortLines / lines.length;
  if (ratio > 0.68) return 'low';
  if (ratio > 0.48) return 'medium';
  return 'high';
}

export function detectFileType(
  fileName: string,
  mimeType: string,
  buffer: Buffer
): 'pdf' | 'docx' {
  if (buffer.length === 0) {
    throw new FileValidationError('The uploaded file is empty.', 'EMPTY_FILE');
  }

  const lowerName = fileName.toLowerCase();
  const isPdfMagic = buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  const isZipMagic =
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04;

  if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
    if (!isPdfMagic) {
      throw new FileValidationError(
        'File does not have a valid PDF signature. It may be renamed or corrupted.',
        'CORRUPTED_PDF'
      );
    }
    return 'pdf';
  }

  if (
    lowerName.endsWith('.docx') ||
    mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    if (!isZipMagic) {
      throw new FileValidationError(
        'File does not have a valid DOCX archive signature. Legacy .doc files are not supported—please save as .docx or .pdf.',
        'CORRUPTED_DOCX'
      );
    }
    return 'docx';
  }

  throw new FileValidationError(
    'Unsupported file format. Please upload a PDF (.pdf) or Word (.docx) resume.',
    'UNSUPPORTED_FILE_TYPE'
  );
}

export async function parseResumeBuffer(params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<{ parsed: ParsedResume; contentHash: string }> {
  const { buffer, fileName, mimeType } = params;
  const fileType = detectFileType(fileName, mimeType, buffer);

  let rawText = '';
  let pageCount = 1;
  const extractionWarnings: string[] = [];

  if (fileType === 'pdf') {
    let pdfData: PdfExtractResult;
    try {
      pdfData = await extractTextFromPdfBuffer(buffer);
    } catch {
      throw new FileValidationError(
        'Unable to parse this PDF. It may be corrupted, encrypted, or password-protected.',
        'CORRUPTED_PDF'
      );
    }

    rawText = (pdfData.text ?? '').replace(/\u0000/g, '').trim();
    pageCount = Math.max(1, pdfData.numpages || 1);

    const alphaNumChars = rawText.replace(/[^a-zA-Z0-9]/g, '').length;
    if (alphaNumChars < 30) {
      throw new FileValidationError(
        'This PDF appears to be scanned or image-only with no extractable text. Please upload a text-based PDF or a DOCX file.',
        'IMAGE_ONLY_PDF'
      );
    }
  } else {
    try {
      const result = await mammoth.extractRawText({ buffer });
      rawText = (result.value ?? '').replace(/\u0000/g, '').trim();
      for (const msg of result.messages) {
        if (msg.type === 'warning') {
          extractionWarnings.push(msg.message);
        }
      }
      pageCount = Math.max(1, Math.ceil(rawText.split(/\s+/).length / 450));
    } catch {
      throw new FileValidationError(
        'Unable to read this DOCX file. It may be corrupted or malformed.',
        'CORRUPTED_DOCX'
      );
    }
  }

  const words = rawText.split(/\s+/).filter(Boolean);
  if (words.length < 15 || rawText.length < 60) {
    throw new FileValidationError(
      'Extracted resume text is too short to analyze. Please verify your document is not blank.',
      'EMPTY_DOCUMENT'
    );
  }

  const sections = detectSections(rawText);
  const { candidateName, contact } = extractContactAndName(rawText);
  const detectedSkills = extractSkillsFromText(rawText).map((s) => s.canonical);
  const readingOrderConfidence = assessReadingOrder(rawText);

  if (contact.github && !/^https?:\/\//i.test(contact.github)) {
    extractionWarnings.push(
      'GitHub URL was detected without an https:// prefix; adding https:// improves ATS link parsing.'
    );
  }
  if (readingOrderConfidence === 'low') {
    extractionWarnings.push(
      'High proportion of very short lines detected; if using a multi-column template, verify reading order.'
    );
  }

  const contentHash = crypto.createHash('sha256').update(rawText).digest('hex');

  return {
    contentHash,
    parsed: {
      candidateName,
      contact,
      fileName,
      fileType,
      fileSizeBytes: buffer.length,
      pageCount,
      wordCount: words.length,
      rawText,
      sections,
      detectedSkills,
      extractionWarnings,
      readingOrderConfidence,
    },
  };
}
