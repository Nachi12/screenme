import { describe, expect, it } from 'vitest';
import { parseResumeBuffer } from '../../services/parsing/resumeParser.service.js';
import { FileValidationError } from '../../utils/errors.js';
import { createTestPdfBuffer } from '../helpers/pdfFixture.js';

describe('resumeParser.service', () => {
  it('extracts text, sections, contact, and skills from a real PDF', async () => {
    const pdfBuf = await createTestPdfBuffer([
      'Aarav Kulkarni',
      'aarav@example.com | +91 9876543210 | https://github.com/aarav-dev',
      'Education',
      'B.Tech in Computer Science, PICT Pune (2022-2026) CGPA 8.4',
      'Skills',
      'JavaScript, TypeScript, React, Node.js, Express, PostgreSQL, Git',
      'Projects',
      '• CampusKart: Built storefront with React and REST APIs using Node.js, Express, and PostgreSQL.',
      '• Deployed frontend and tested core product workflows.',
    ]);

    const { parsed, contentHash } = await parseResumeBuffer({
      buffer: pdfBuf,
      fileName: 'Aarav_Resume.pdf',
      mimeType: 'application/pdf',
    });

    expect(contentHash).toHaveLength(64);
    expect(parsed.fileType).toBe('pdf');
    expect(parsed.contact.email).toBe('aarav@example.com');
    expect(parsed.detectedSkills).toContain('React');
    expect(parsed.detectedSkills).toContain('PostgreSQL');
    expect(parsed.sections.map((s) => s.type)).toContain('projects');
  });

  it('rejects empty files cleanly', async () => {
    await expect(
      parseResumeBuffer({
        buffer: Buffer.alloc(0),
        fileName: 'empty.pdf',
        mimeType: 'application/pdf',
      })
    ).rejects.toMatchObject({ code: 'EMPTY_FILE' });
  });

  it('rejects unsupported file extensions and spoofed MIME types', async () => {
    await expect(
      parseResumeBuffer({
        buffer: Buffer.from('MZ executable content'),
        fileName: 'malware.exe',
        mimeType: 'application/octet-stream',
      })
    ).rejects.toBeInstanceOf(FileValidationError);
  });

  it('rejects corrupted PDF files cleanly', async () => {
    await expect(
      parseResumeBuffer({
        buffer: Buffer.from('%PDF-1.4\n%%corrupted-garbage-bytes'),
        fileName: 'broken.pdf',
        mimeType: 'application/pdf',
      })
    ).rejects.toMatchObject({ code: 'CORRUPTED_PDF' });
  });

  it('detects and rejects image-only / textless PDFs', async () => {
    const blankPdf = await createTestPdfBuffer([]);
    await expect(
      parseResumeBuffer({
        buffer: blankPdf,
        fileName: 'scanned.pdf',
        mimeType: 'application/pdf',
      })
    ).rejects.toMatchObject({ code: 'IMAGE_ONLY_PDF' });
  });
});
