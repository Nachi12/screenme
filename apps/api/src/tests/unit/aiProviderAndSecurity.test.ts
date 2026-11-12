import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
  CreateAnalysisRequestSchema,
  ParseJDRequestSchema,
  RegisterRequestSchema,
  SAMPLE_DEMONSTRATION_REPORT,
} from '@screenme/shared';

const { mockGenerateContent, mockConstructorCalls } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
  mockConstructorCalls: vi.fn(),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: class MockGoogleGenAI {
    public readonly models = {
      generateContent: mockGenerateContent,
    };
    constructor(opts: { apiKey: string }) {
      mockConstructorCalls(opts);
    }
  },
}));

import { env } from '../../config/env.js';
import { getAnalysisStatus } from '../../controllers/analysis.controller.js';
import {
  deleteReportById,
  getReportById,
} from '../../controllers/report.controller.js';
import {
  AUTH_COOKIE_NAME,
  optionalAuth,
  requireAuth,
  verifyAuthToken,
} from '../../middleware/auth.middleware.js';
import { AnalysisReportModel } from '../../models/AnalysisReport.model.js';
import { JobDescriptionModel } from '../../models/JobDescription.model.js';
import { ResumeModel } from '../../models/Resume.model.js';
import { RoadmapProgressModel } from '../../models/RoadmapProgress.model.js';
import { GeminiAIProvider } from '../../services/ai/aiProvider.service.js';
import { parseResumeBuffer } from '../../services/parsing/resumeParser.service.js';
import { AIServiceError, ForbiddenError, UnauthorizedError } from '../../utils/errors.js';

/**
 * Wraps a mock result in a resolved Promise typed as the Mongoose Query return type
 * so controller authorization paths can be unit-tested when MongoDB is unavailable.
 */
function asMongooseQueryResult<R>(value: unknown): R {
  return Promise.resolve(value) as unknown as R;
}

function createMockExpressPair(overrides?: Partial<Request>): {
  req: Request;
  res: Response;
  jsonSpy: ReturnType<typeof vi.fn>;
  statusSpy: ReturnType<typeof vi.fn>;
  cookieSpy: ReturnType<typeof vi.fn>;
} {
  const jsonSpy = vi.fn();
  const statusSpy = vi.fn();
  const cookieSpy = vi.fn();
  const res = {
    status: statusSpy,
    json: jsonSpy,
    cookie: cookieSpy,
    setHeader: vi.fn(),
  } as unknown as Response;
  statusSpy.mockReturnValue(res);
  jsonSpy.mockReturnValue(res);

  const req = {
    cookies: {},
    headers: {},
    params: {},
    query: {},
    body: {},
    ...overrides,
  } as unknown as Request;

  return { req, res, jsonSpy, statusSpy, cookieSpy };
}

describe('GeminiAIProvider (Mocked @google/genai SDK)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('parses fenced JSON, validates Zod schema, and reports token usage and estimated cost', async () => {
    const TestSchema = z.object({
      verdict: z.string(),
      items: z.array(z.string()),
    });

    mockGenerateContent.mockResolvedValueOnce({
      text: '```json\n{"verdict":"Potential Match","items":["Node.js","PostgreSQL"]}\n```',
      usageMetadata: {
        promptTokenCount: 1000,
        candidatesTokenCount: 250,
        totalTokenCount: 1250,
      },
    });

    const provider = new GeminiAIProvider({
      apiKey: 'mock-gemini-key-1234567890',
      modelId: 'gemini-2.5-flash',
      maxRetries: 0,
      timeoutMs: 2000,
    });

    const result = await provider.generateStructured({
      systemInstruction: 'Return strict JSON.',
      userPrompt: 'Evaluate skills',
      schema: TestSchema,
    });

    expect(mockConstructorCalls).toHaveBeenCalledWith({
      apiKey: 'mock-gemini-key-1234567890',
    });
    expect(result.data).toEqual({
      verdict: 'Potential Match',
      items: ['Node.js', 'PostgreSQL'],
    });
    expect(result.provider).toBe('gemini');
    expect(result.modelId).toBe('gemini-2.5-flash');
    expect(result.usage.promptTokens).toBe(1000);
    expect(result.usage.candidatesTokens).toBe(250);
    expect(result.usage.totalTokens).toBe(1250);
    expect(result.usage.estimatedCostUsd).toBeGreaterThan(0);
  });

  it('retries malformed JSON output and rejects honestly with AI_INVALID_OUTPUT (502)', async () => {
    const TestSchema = z.object({ ok: z.boolean() });
    mockGenerateContent.mockResolvedValue({
      text: '{not valid json',
      usageMetadata: undefined,
    });

    const provider = new GeminiAIProvider({
      apiKey: 'mock-gemini-key-1234567890',
      maxRetries: 1,
      timeoutMs: 2000,
    });

    await expect(
      provider.generateStructured({
        systemInstruction: 'sys',
        userPrompt: 'usr',
        schema: TestSchema,
      })
    ).rejects.toMatchObject({
      name: 'AIServiceError',
      code: 'AI_INVALID_OUTPUT',
      statusCode: 502,
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it('rejects schema-mismatched JSON responses with AI_INVALID_OUTPUT (502)', async () => {
    const TestSchema = z.object({ requiredField: z.string().min(3) });
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ wrongField: 123 }),
    });

    const provider = new GeminiAIProvider({
      apiKey: 'mock-gemini-key-1234567890',
      maxRetries: 0,
      timeoutMs: 2000,
    });

    await expect(
      provider.generateStructured({
        systemInstruction: 'sys',
        userPrompt: 'usr',
        schema: TestSchema,
      })
    ).rejects.toMatchObject({
      code: 'AI_INVALID_OUTPUT',
      statusCode: 502,
    });
  });

  it('enforces request timeout and throws AI_TIMEOUT (504) cleanly', async () => {
    const TestSchema = z.object({ ok: z.boolean() });
    mockGenerateContent.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ text: '{"ok":true}' }), 200);
        })
    );

    const provider = new GeminiAIProvider({
      apiKey: 'mock-gemini-key-1234567890',
      maxRetries: 0,
      timeoutMs: 20,
    });

    await expect(
      provider.generateStructured({
        systemInstruction: 'sys',
        userPrompt: 'usr',
        schema: TestSchema,
      })
    ).rejects.toBeInstanceOf(AIServiceError);

    await expect(
      provider.generateStructured({
        systemInstruction: 'sys',
        userPrompt: 'usr',
        schema: TestSchema,
      })
    ).rejects.toMatchObject({
      code: 'AI_TIMEOUT',
      statusCode: 504,
    });
  });

  it('fails fast with AI_NOT_CONFIGURED (503) without invoking SDK when key is absent', async () => {
    const TestSchema = z.object({ ok: z.boolean() });
    const provider = new GeminiAIProvider({ apiKey: '' });

    await expect(
      provider.generateStructured({
        systemInstruction: 'sys',
        userPrompt: 'usr',
        schema: TestSchema,
      })
    ).rejects.toMatchObject({
      code: 'AI_NOT_CONFIGURED',
      statusCode: 503,
    });
    expect(mockConstructorCalls).not.toHaveBeenCalled();
  });
});

describe('Security Regression: Auth, Uploads & Shared Input Validation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects expired JWT tokens and enforces requireAuth / optionalAuth behavior', () => {
    const expiredToken = jwt.sign(
      { userId: 'u-expired', email: 'e@example.com', name: 'Expired' },
      env.JWT_SECRET,
      { expiresIn: -10 }
    );
    expect(verifyAuthToken(expiredToken)).toBeNull();

    const { req: unauthReq, res: unauthRes } = createMockExpressPair();
    const unauthNext = vi.fn() as unknown as NextFunction;
    requireAuth(unauthReq, unauthRes, unauthNext);
    const err = (unauthNext as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect((err as UnauthorizedError).statusCode).toBe(401);

    const { req: expiredReq, res: expiredRes } = createMockExpressPair({
      headers: { authorization: `Bearer ${expiredToken}` },
    });
    const expiredNext = vi.fn() as unknown as NextFunction;
    requireAuth(expiredReq, expiredRes, expiredNext);
    const expiredErr = (expiredNext as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(expiredErr).toBeInstanceOf(UnauthorizedError);
    expect((expiredErr as UnauthorizedError).statusCode).toBe(401);

    const { req: guestReq, res: guestRes, cookieSpy } = createMockExpressPair({
      cookies: { [AUTH_COOKIE_NAME]: 'tampered.jwt.token' },
    });
    const guestNext = vi.fn() as unknown as NextFunction;
    optionalAuth(guestReq, guestRes, guestNext);
    expect(guestReq.user).toBeUndefined();
    expect(typeof guestReq.guestSessionId).toBe('string');
    expect(cookieSpy).toHaveBeenCalledTimes(1);
    expect(guestNext).toHaveBeenCalledWith();
  });

  it('rejects spoofed PDFs, spoofed ZIP-as-DOCX archives, empty files, and unsupported formats', async () => {
    const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    await expect(
      parseResumeBuffer({
        buffer: pngSignature,
        fileName: 'fake-resume.pdf',
        mimeType: 'application/pdf',
      })
    ).rejects.toMatchObject({ code: 'CORRUPTED_PDF', statusCode: 400 });

    // Valid ZIP header (PK\x03\x04) without word/document.xml inside
    const spoofedZipAsDocx = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00]);
    await expect(
      parseResumeBuffer({
        buffer: spoofedZipAsDocx,
        fileName: 'spoofed.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
    ).rejects.toMatchObject({ code: 'CORRUPTED_DOCX', statusCode: 400 });

    await expect(
      parseResumeBuffer({
        buffer: Buffer.alloc(0),
        fileName: 'empty.pdf',
        mimeType: 'application/pdf',
      })
    ).rejects.toMatchObject({ code: 'EMPTY_FILE', statusCode: 400 });

    await expect(
      parseResumeBuffer({
        buffer: Buffer.from('MZ executable bytes'),
        fileName: 'script.exe',
        mimeType: 'application/octet-stream',
      })
    ).rejects.toMatchObject({ code: 'UNSUPPORTED_FILE_TYPE', statusCode: 400 });
  });

  it('validates shared request schemas strictly for auth, JD parsing, and analysis creation', () => {
    expect(
      RegisterRequestSchema.safeParse({
        name: 'A',
        email: 'not-an-email',
        password: '123',
      }).success
    ).toBe(false);

    expect(
      ParseJDRequestSchema.safeParse({
        rawText: 'Too short JD',
        url: 'not-a-url',
      }).success
    ).toBe(false);

    expect(
      CreateAnalysisRequestSchema.safeParse({
        resumeId: '',
        jobDescription: { rawText: 'Short JD text' },
        candidateProfile: {
          experienceLevel: 'fresher',
          hiringEnvironment: 'startup',
        },
      }).success
    ).toBe(false);
  });
});

describe('Authorization Regression: Report & Analysis Ownership Controls', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('denies cross-user and cross-guest report reads and deletions without deleting data', async () => {
    const ownedDoc = {
      _id: 'rep-owned-1',
      id: 'rep-owned-1',
      userId: 'user-owner-1',
      guestSessionId: null,
      resumeId: 'res-1',
      jobDescriptionId: 'jd-1',
      status: 'completed',
      report: SAMPLE_DEMONSTRATION_REPORT,
    };

    vi.spyOn(AnalysisReportModel, 'findById').mockImplementation(() =>
      asMongooseQueryResult<ReturnType<typeof AnalysisReportModel.findById>>(ownedDoc)
    );
    const deleteReportSpy = vi
      .spyOn(AnalysisReportModel, 'deleteOne')
      .mockImplementation(() =>
        asMongooseQueryResult<ReturnType<typeof AnalysisReportModel.deleteOne>>({
          acknowledged: true,
          deletedCount: 1,
        })
      );

    // Different authenticated user -> ForbiddenError (403) on read
    const { req: intruderReq, res: intruderRes } = createMockExpressPair({
      params: { id: 'rep-owned-1' },
      user: { userId: 'user-intruder-2', email: 'x@example.com', name: 'Intruder' },
    });
    const readNext = vi.fn() as unknown as NextFunction;
    await getReportById(intruderReq, intruderRes, readNext);
    const readErr = (readNext as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(readErr).toBeInstanceOf(ForbiddenError);
    expect((readErr as ForbiddenError).statusCode).toBe(403);

    // Different authenticated user -> ForbiddenError (403) on delete and zero deletions executed
    const delNext = vi.fn() as unknown as NextFunction;
    await deleteReportById(intruderReq, intruderRes, delNext);
    const delErr = (delNext as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(delErr).toBeInstanceOf(ForbiddenError);
    expect(deleteReportSpy).not.toHaveBeenCalled();

    // Cross-guest access to a guest-owned report -> ForbiddenError (403) on status
    vi.spyOn(AnalysisReportModel, 'findById').mockImplementation(() =>
      asMongooseQueryResult<ReturnType<typeof AnalysisReportModel.findById>>({
        ...ownedDoc,
        userId: null,
        guestSessionId: 'guest-session-A',
      })
    );
    const { req: otherGuestReq, res: otherGuestRes } = createMockExpressPair({
      params: { id: 'rep-owned-1' },
      guestSessionId: 'guest-session-B',
    });
    const statusNext = vi.fn() as unknown as NextFunction;
    await getAnalysisStatus(otherGuestReq, otherGuestRes, statusNext);
    const statusErr = (statusNext as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(statusErr).toBeInstanceOf(ForbiddenError);
  });

  it('allows report owner to read and cascade-delete their own report', async () => {
    const ownedDoc = {
      _id: 'rep-owned-2',
      id: 'rep-owned-2',
      userId: 'user-owner-1',
      guestSessionId: null,
      resumeId: 'res-2',
      jobDescriptionId: 'jd-2',
      status: 'completed',
      report: SAMPLE_DEMONSTRATION_REPORT,
    };

    vi.spyOn(AnalysisReportModel, 'findById').mockImplementation(() =>
      asMongooseQueryResult<ReturnType<typeof AnalysisReportModel.findById>>(ownedDoc)
    );
    vi.spyOn(RoadmapProgressModel, 'findOne').mockImplementation(() =>
      asMongooseQueryResult<ReturnType<typeof RoadmapProgressModel.findOne>>(null)
    );
    const deleteReportSpy = vi
      .spyOn(AnalysisReportModel, 'deleteOne')
      .mockImplementation(() =>
        asMongooseQueryResult<ReturnType<typeof AnalysisReportModel.deleteOne>>({
          acknowledged: true,
          deletedCount: 1,
        })
      );
    const deleteProgressSpy = vi
      .spyOn(RoadmapProgressModel, 'deleteMany')
      .mockImplementation(() =>
        asMongooseQueryResult<ReturnType<typeof RoadmapProgressModel.deleteMany>>({
          acknowledged: true,
          deletedCount: 1,
        })
      );
    const deleteJdSpy = vi
      .spyOn(JobDescriptionModel, 'deleteOne')
      .mockImplementation(() =>
        asMongooseQueryResult<ReturnType<typeof JobDescriptionModel.deleteOne>>({
          acknowledged: true,
          deletedCount: 1,
        })
      );
    vi.spyOn(AnalysisReportModel, 'countDocuments').mockImplementation(() =>
      asMongooseQueryResult<ReturnType<typeof AnalysisReportModel.countDocuments>>(0)
    );
    const deleteResumeSpy = vi
      .spyOn(ResumeModel, 'deleteOne')
      .mockImplementation(() =>
        asMongooseQueryResult<ReturnType<typeof ResumeModel.deleteOne>>({
          acknowledged: true,
          deletedCount: 1,
        })
      );

    const { req: ownerReq, res: ownerRes, jsonSpy } = createMockExpressPair({
      params: { id: 'rep-owned-2' },
      user: { userId: 'user-owner-1', email: 'owner@example.com', name: 'Owner' },
    });

    const readNext = vi.fn() as unknown as NextFunction;
    await getReportById(ownerReq, ownerRes, readNext);
    expect(readNext).not.toHaveBeenCalled();
    expect(jsonSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ report: SAMPLE_DEMONSTRATION_REPORT }),
      })
    );

    const delNext = vi.fn() as unknown as NextFunction;
    await deleteReportById(ownerReq, ownerRes, delNext);
    expect(delNext).not.toHaveBeenCalled();
    expect(deleteReportSpy).toHaveBeenCalledWith({ _id: 'rep-owned-2' });
    expect(deleteProgressSpy).toHaveBeenCalledWith({ reportId: 'rep-owned-2' });
    expect(deleteJdSpy).toHaveBeenCalledWith({ _id: 'jd-2' });
    expect(deleteResumeSpy).toHaveBeenCalledWith({ _id: 'res-2' });
  });
});
