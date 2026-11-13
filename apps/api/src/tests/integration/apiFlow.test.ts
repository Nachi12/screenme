import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import mongoose from 'mongoose';
import request from 'supertest';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';
import type { ZodType } from 'zod';
import { createApp } from '../../app.js';
import { waitForAnalysisJob } from '../../jobs/analysisJob.service.js';
import {
  resetAIProvider,
  setAIProviderForTesting,
  type AIProvider,
  type AIStructuredResult,
} from '../../services/ai/aiProvider.service.js';
import { AIServiceError } from '../../utils/errors.js';
import { createTestPdfBuffer } from '../helpers/pdfFixture.js';

const SAMPLE_JD = `
Junior Full-Stack Software Engineer
Company: PayFlow Systems
Qualifications:
- B.Tech / B.E. in Computer Science (2025/2026 graduates).
Requirements:
- Must have hands-on experience with React and TypeScript.
- Build REST APIs using Node.js and Express.
- Proficiency in PostgreSQL schema design.
- Automated Unit Testing with Vitest or Jest.
- Exposure to Docker preferred.
`;

function buildDeterministicMockAIProvider(): AIProvider {
  return {
    providerName: 'mock-gemini',
    modelId: 'gemini-2.5-flash-test',
    async generateStructured<T>(params: {
      systemInstruction: string;
      userPrompt: string;
      schema: ZodType<T>;
    }): Promise<AIStructuredResult<T>> {
      let payload: unknown;

      if (params.userPrompt.includes('Requirements to Evaluate')) {
        // Extract requirement IDs from prompt JSON
        const match = params.userPrompt.match(/Requirements to Evaluate \(JSON\):\n([\s\S]*?)\n\n<UNTRUSTED_JD_TEXT>/);
        const reqs = match?.[1]
          ? (JSON.parse(match[1]) as Array<{ id: string; canonicalSkill: string | null }>)
          : [];

        payload = {
          summary:
            'Candidate shows strong React, Node.js, and PostgreSQL project foundations, while automated testing and Docker remain missing.',
          matches: reqs.map((r) => {
            const sk = (r.canonicalSkill ?? '').toLowerCase();
            if (sk === 'react' || sk === 'postgresql' || sk === 'node.js') {
              return {
                requirementId: r.id,
                status: 'explicitly_demonstrated',
                resumeEvidenceSnippet:
                  'CampusKart: Built storefront with React and REST APIs using Node.js, Express, and PostgreSQL.',
                resumeSection: 'Projects',
                explanation: `${r.canonicalSkill} is backed by the CampusKart project.`,
                suggestedAction: 'Keep this evidence prominent.',
              };
            }
            if (sk === 'rest apis' || sk === 'typescript') {
              return {
                requirementId: r.id,
                status: 'partially_demonstrated',
                resumeEvidenceSnippet: 'TypeScript, React, REST APIs',
                resumeSection: 'Projects',
                explanation: 'Partially evidenced in project bullets.',
                suggestedAction: 'Specify endpoints and strict types used.',
              };
            }
            if (r.id && !r.canonicalSkill) {
              return {
                requirementId: r.id,
                status: 'explicitly_demonstrated',
                resumeEvidenceSnippet: 'B.Tech in Computer Science, PICT Pune (2022-2026)',
                resumeSection: 'Education',
                explanation: 'Degree aligns with eligibility.',
                suggestedAction: 'No change required.',
              };
            }
            return {
              requirementId: r.id,
              status: 'not_found',
              resumeEvidenceSnippet: null,
              resumeSection: null,
              explanation: 'No supporting evidence found in resume.',
              suggestedAction: `Build a small task using ${r.canonicalSkill ?? 'this skill'}.`,
            };
          }),
          skillGaps: [
            {
              skill: 'Unit Testing',
              group: 'critical_gaps',
              priority: 'high',
              whyItMatters: 'Mandatory engineering quality requirement.',
              jdEvidence: 'Automated Unit Testing with Vitest or Jest.',
              resumeEvidence: null,
              suggestedNextAction: 'Add Vitest integration tests to CampusKart.',
            },
          ],
        };
      } else if (params.userPrompt.includes('Evaluate the candidate\'s projects')) {
        payload = {
          projects: [
            {
              projectName: 'CampusKart',
              relevanceToJD: 'high',
              technologiesDemonstrated: ['React', 'Node.js', 'Express', 'PostgreSQL'],
              technologiesMissingForJD: ['Unit Testing', 'Docker'],
              strengths: ['Full-stack React + PostgreSQL architecture'],
              gaps: ['No automated tests documented'],
              complexityAssessment: 'Solid academic full-stack build.',
              recommendedEnhancements: ['Add Vitest endpoint tests'],
              sourceSnippet: 'CampusKart: Built storefront with React and REST APIs.',
            },
          ],
        };
      } else if (params.userPrompt.includes('Simulate a thoughtful')) {
        payload = {
          verdict: 'Potential Match',
          screeningImpression: 'Strong early-career stack alignment with clear full-stack project work.',
          reasoningSummary: 'Core frontend/backend skills match well; automated testing is the main gap.',
          strengths: ['React + Node.js + PostgreSQL project experience'],
          concerns: ['Automated testing evidence missing'],
          relevantEvidence: ['CampusKart full-stack application'],
          missingEvidence: ['Unit/integration test suite'],
          improvementPriorities: ['Add automated tests to CampusKart'],
          readinessGuidance: 'Apply while adding test coverage over the next 2 weeks.',
        };
      } else if (params.userPrompt.includes('weak or vague resume bullets')) {
        payload = {
          rewrites: [
            {
              id: 'rw-1',
              section: 'Projects — CampusKart',
              originalText: 'Built storefront with React and REST APIs.',
              suggestedRewrite:
                'Developed CampusKart storefront in React backed by Node.js/Express REST APIs and PostgreSQL.',
              whyItIsBetter: 'Clarifies full-stack data flow without inventing metrics.',
              relevantJDSkills: ['React', 'Node.js', 'PostgreSQL'],
              claimsRequiringVerification: ['Confirm number of API endpoints before adding counts.'],
            },
          ],
        };
      } else if (params.userPrompt.includes('2 to 4 week improvement plan')) {
        payload = {
          durationWeeks: 2,
          tasks: [
            {
              taskId: 'rm-w1-1',
              week: 1,
              skill: 'Unit Testing',
              title: 'Add Vitest API Tests',
              description: 'Test CampusKart REST routes.',
              priority: 'high',
              estimatedEffort: '6 hours',
              supportingProjectSuggestion: 'Add 6 Supertest/Vitest tests to CampusKart.',
              completed: false,
            },
          ],
        };
      } else {
        payload = {
          questions: [
            {
              id: 'iq-1',
              category: 'project_based',
              question: 'How did you structure your PostgreSQL tables in CampusKart?',
              difficulty: 'foundational',
              skillTested: 'PostgreSQL',
              whyInterviewerAsks: 'Checks real schema ownership.',
              suggestedAnswerFramework: 'Walk through tables, foreign keys, and constraints.',
            },
          ],
        };
      }

      const parsed = params.schema.parse(payload);
      return {
        data: parsed,
        usage: {
          promptTokens: 300,
          candidatesTokens: 150,
          totalTokens: 450,
          estimatedCostUsd: 0.000135,
        },
        provider: 'mock-gemini',
        modelId: 'gemini-2.5-flash-test',
      };
    },
  };
}

async function findAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const addr = srv.address();
      if (!addr || typeof addr === 'string') {
        srv.close();
        reject(new Error('Failed to allocate ephemeral port'));
        return;
      }
      const { port } = addr;
      srv.close(() => resolve(port));
    });
  });
}

function findMongodBinary(): string | null {
  const candidates = [
    process.env.MONGOMS_SYSTEM_BINARY,
    '/opt/homebrew/bin/mongod',
    '/usr/local/bin/mongod',
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      try {
        fs.accessSync(c, fs.constants.X_OK);
        return c;
      } catch {
        // continue
      }
    }
  }
  return null;
}

async function startLocalTestMongod(): Promise<{
  proc?: ChildProcess;
  dbDir?: string;
  uri: string;
}> {
  // 1. If an explicit test URI is provided and reachable, use it
  const explicitTestUri = process.env.TEST_MONGODB_URI;
  if (explicitTestUri) {
    try {
      await mongoose.connect(explicitTestUri, { serverSelectionTimeoutMS: 2000 });
      return { uri: explicitTestUri };
    } catch {
      // Explicit test URI unreachable, continue to try local alternatives
    }
  }

  // 2. Check if a local MongoDB is already running on standard port 27017
  const defaultLocalUri = 'mongodb://127.0.0.1:27017/screenme_integration_test';
  try {
    await mongoose.connect(defaultLocalUri, { serverSelectionTimeoutMS: 1500 });
    return { uri: defaultLocalUri };
  } catch {
    // Port 27017 not running; proceed to spawn an ephemeral instance
  }

  // 3. Locate local mongod binary
  const mongodPath = findMongodBinary();
  if (!mongodPath) {
    throw new Error(
      'MongoDB is required for integration tests. Either start MongoDB (brew services start mongodb-community) or ensure mongod is installed and available.'
    );
  }

  const port = await findAvailablePort();
  const dbDir = fs.mkdtempSync(path.join('/tmp', 'screenme-mongo-'));
  const proc = spawn(mongodPath, [
    '--port',
    String(port),
    '--dbpath',
    dbDir,
    '--bind_ip',
    '127.0.0.1',
    '--nounixsocket',
    '--wiredTigerCacheSizeGB',
    '0.25',
  ]);

  await new Promise<void>((resolve, reject) => {
    let combinedLog = '';
    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      reject(
        new Error(
          `Timed out (45s) waiting for mongod on port ${port} using ${mongodPath}.\nRecent logs:\n${combinedLog.slice(-1500)}`
        )
      );
    }, 45000);

    proc.stdout?.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      combinedLog += text;
      if (text.includes('Waiting for connections')) {
        clearTimeout(timer);
        resolve();
      }
    });
    proc.stderr?.on('data', (chunk: Buffer) => {
      combinedLog += chunk.toString();
    });
    proc.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`mongod exited early (${code}): ${combinedLog.slice(-1500)}`));
    });
  });

  const uri = `mongodb://127.0.0.1:${port}/screenme_test`;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  return { proc, dbDir, uri };
}

describe('ScreenMe API Integration, Security & Regression Tests', () => {
  let mongodProc: ChildProcess | undefined;
  let mongoTmpDir: string | undefined;
  const app = createApp();

  beforeAll(async () => {
    const started = await startLocalTestMongod();
    mongodProc = started.proc;
    mongoTmpDir = started.dbDir;
  });

  afterEach(() => {
    resetAIProvider();
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      if (!mongodProc && mongoose.connection.db && mongoose.connection.db.databaseName.includes('test')) {
        await mongoose.connection.db.dropDatabase().catch(() => {});
      }
      await mongoose.disconnect();
    }
    if (mongodProc) {
      mongodProc.kill('SIGTERM');
    }
    if (mongoTmpDir) {
      fs.rmSync(mongoTmpDir, { recursive: true, force: true });
    }
  });

  it('handles full auth flow, password reset, and rejects unauthorized /reports access', async () => {
    const unauthRes = await request(app).get('/api/v1/reports');
    expect(unauthRes.status).toBe(401);

    const agent = request.agent(app);
    const regRes = await agent.post('/api/v1/auth/register').send({
      name: 'Aarav Kulkarni',
      email: 'aarav@screenme.test',
      password: 'Password123!',
    });
    expect(regRes.status).toBe(201);
    expect(regRes.body.data.user.email).toBe('aarav@screenme.test');

    // Duplicate registration rejected
    const dupRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Duplicate',
      email: 'aarav@screenme.test',
      password: 'Password123!',
    });
    expect(dupRes.status).toBe(409);

    const meRes = await agent.get('/api/v1/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.name).toBe('Aarav Kulkarni');

    // Forgot + Reset password
    const forgotRes = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'aarav@screenme.test' });
    expect(forgotRes.status).toBe(200);
    const devToken = forgotRes.body.data.devResetToken as string;
    expect(devToken).toBeTruthy();

    const resetRes = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: devToken, newPassword: 'NewPassword456!' });
    expect(resetRes.status).toBe(200);

    const loginRes = await agent.post('/api/v1/auth/login').send({
      email: 'aarav@screenme.test',
      password: 'NewPassword456!',
    });
    expect(loginRes.status).toBe(200);
  });

  it('runs the full vertical workflow, enforces ownership, deduplicates, exports PDF, and deletes cleanly', async () => {
    setAIProviderForTesting(buildDeterministicMockAIProvider());

    const ownerAgent = request.agent(app);
    await ownerAgent.post('/api/v1/auth/register').send({
      name: 'Riya Verma',
      email: 'riya@screenme.test',
      password: 'Password123!',
    });

    const otherUserAgent = request.agent(app);
    await otherUserAgent.post('/api/v1/auth/register').send({
      name: 'Other User',
      email: 'other@screenme.test',
      password: 'Password123!',
    });

    const pdfBuffer = await createTestPdfBuffer([
      'Riya Verma',
      'riya@example.com | +91 9988776655 | https://github.com/riya-dev',
      'Education',
      'B.Tech in Computer Science, PICT Pune (2022-2026)',
      'Skills',
      'TypeScript, React, Node.js, Express, PostgreSQL, Git',
      'Projects',
      '• CampusKart: Built storefront with React and REST APIs using Node.js, Express, and PostgreSQL.',
      '• Implemented structured endpoints and responsive catalog screens.',
      '• Deployed frontend demo and documented database schema.',
      '• Collaborated in a 3-person hackathon team using Git pull requests.',
    ]);

    const uploadRes = await ownerAgent
      .post('/api/v1/resumes/upload')
      .attach('file', pdfBuffer, {
        filename: 'Riya_Resume.pdf',
        contentType: 'application/pdf',
      });
    expect(uploadRes.status).toBe(201);
    const resumeId = uploadRes.body.data.resumeId as string;

    // Missing/short JD rejected
    const badJdRes = await ownerAgent.post('/api/v1/analyses').send({
      resumeId,
      jobDescription: { rawText: 'too short' },
      candidateProfile: {
        experienceLevel: 'fresher',
        hiringEnvironment: 'product_based',
      },
    });
    expect(badJdRes.status).toBe(400);

    // Valid analysis submission
    const createRes = await ownerAgent.post('/api/v1/analyses').send({
      resumeId,
      jobDescription: {
        title: 'Junior Full-Stack Software Engineer',
        company: 'PayFlow Systems',
        rawText: SAMPLE_JD,
      },
      candidateProfile: {
        experienceLevel: 'fresher',
        hiringEnvironment: 'product_based',
      },
    });
    expect(createRes.status).toBe(202);
    const analysisId = createRes.body.data.analysisId as string;

    // Duplicate identical request deduplicates
    const dupAnalysisRes = await ownerAgent.post('/api/v1/analyses').send({
      resumeId,
      jobDescription: {
        title: 'Junior Full-Stack Software Engineer',
        company: 'PayFlow Systems',
        rawText: SAMPLE_JD,
      },
      candidateProfile: {
        experienceLevel: 'fresher',
        hiringEnvironment: 'product_based',
      },
    });
    expect(dupAnalysisRes.body.data.deduplicated).toBe(true);
    expect(dupAnalysisRes.body.data.analysisId).toBe(analysisId);

    await waitForAnalysisJob(analysisId);

    const statusRes = await ownerAgent.get(`/api/v1/analyses/${analysisId}/status`);
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.status).toBe('completed');

    const reportRes = await ownerAgent.get(`/api/v1/reports/${analysisId}`);
    expect(reportRes.status).toBe(200);
    const report = reportRes.body.data.report;

    // Deterministic scoring regression checks
    expect(report.atsEvaluation.score).toBeGreaterThanOrEqual(85);
    expect(report.jobMatch.score).toBeGreaterThanOrEqual(50);
    expect(report.jobMatch.score).toBeLessThanOrEqual(85);
    expect(report.hrEvaluation.verdict).toBe('Potential Match');

    // Cross-user unauthorized access blocked (IDOR protection)
    const forbiddenRes = await otherUserAgent.get(`/api/v1/reports/${analysisId}`);
    expect(forbiddenRes.status).toBe(403);

    // Roadmap progress persistence
    const patchRes = await ownerAgent
      .patch(`/api/v1/roadmaps/${analysisId}/progress`)
      .send({ taskId: 'rm-w1-1', completed: true });
    expect(patchRes.status).toBe(200);

    const updatedReport = await ownerAgent.get(`/api/v1/reports/${analysisId}`);
    expect(updatedReport.body.data.report.roadmap.tasks[0].completed).toBe(true);

    // PDF Export works
    const exportRes = await ownerAgent.get(`/api/v1/reports/${analysisId}/export`);
    expect(exportRes.status).toBe(200);
    expect(exportRes.headers['content-type']).toContain('application/pdf');

    // Dashboard listing
    const listRes = await ownerAgent.get('/api/v1/reports');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.summary.totalAnalyses).toBe(1);

    // Delete report
    const delRes = await ownerAgent.delete(`/api/v1/reports/${analysisId}`);
    expect(delRes.status).toBe(200);

    const afterDelRes = await ownerAgent.get(`/api/v1/reports/${analysisId}`);
    expect(afterDelRes.status).toBe(404);
  });

  it('fails honestly without fake scores when AI returns invalid output or times out', async () => {
    const agent = request.agent(app);
    const pdfBuffer = await createTestPdfBuffer([
      'Karan Mehta',
      'karan@example.com | +91 9123456780',
      'Education',
      'B.Tech IT 2025',
      'Skills',
      'React, Node.js, PostgreSQL',
      'Projects',
      '• Built task manager with React and Node.js backend APIs and PostgreSQL storage.',
    ]);

    const up = await agent
      .post('/api/v1/resumes/upload')
      .attach('file', pdfBuffer, {
        filename: 'Karan.pdf',
        contentType: 'application/pdf',
      });
    const resumeId = up.body.data.resumeId as string;

    // 1. Invalid AI output
    setAIProviderForTesting({
      providerName: 'broken-mock',
      modelId: 'broken',
      async generateStructured() {
        throw new AIServiceError(
          'AI response did not match the required structured schema.',
          'AI_INVALID_OUTPUT',
          502
        );
      },
    });

    const invalidCreate = await agent.post('/api/v1/analyses').send({
      resumeId,
      jobDescription: { rawText: SAMPLE_JD },
      candidateProfile: {
        experienceLevel: 'fresher',
        hiringEnvironment: 'startup',
      },
    });
    const invalidId = invalidCreate.body.data.analysisId as string;
    await waitForAnalysisJob(invalidId);

    const invalidStatus = await agent.get(`/api/v1/analyses/${invalidId}/status`);
    expect(invalidStatus.body.data.status).toBe('failed');
    expect(invalidStatus.body.data.error.code).toBe('AI_INVALID_OUTPUT');

    // 2. AI timeout
    setAIProviderForTesting({
      providerName: 'timeout-mock',
      modelId: 'timeout',
      async generateStructured() {
        throw new AIServiceError('Timed out', 'AI_TIMEOUT', 504);
      },
    });

    const timeoutCreate = await agent.post('/api/v1/analyses').send({
      resumeId,
      jobDescription: { rawText: SAMPLE_JD + '\nAdditional context for distinct hash.' },
      candidateProfile: {
        experienceLevel: 'fresher',
        hiringEnvironment: 'enterprise',
      },
    });
    const timeoutId = timeoutCreate.body.data.analysisId as string;
    await waitForAnalysisJob(timeoutId);

    const timeoutStatus = await agent.get(`/api/v1/analyses/${timeoutId}/status`);
    expect(timeoutStatus.body.data.status).toBe('failed');
    expect(timeoutStatus.body.data.error.code).toBe('AI_TIMEOUT');
  });
});
