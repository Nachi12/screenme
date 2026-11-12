import { describe, expect, it } from 'vitest';
import type { ParsedJD, ParsedResume } from '@screenme/shared';
import { evaluateATSCompatibility } from '../../services/analysis/atsAnalyzer.service.js';

function makeResume(overrides?: Partial<ParsedResume>): ParsedResume {
  return {
    candidateName: 'Priya Sharma',
    contact: {
      email: 'priya@example.com',
      phone: '+91 9876543210',
      github: 'https://github.com/priya-dev',
    },
    fileName: 'priya.pdf',
    fileType: 'pdf',
    fileSizeBytes: 120000,
    pageCount: 1,
    wordCount: 320,
    rawText: `Priya Sharma\nEducation\nB.Tech CSE 2022-2026\nSkills\nReact, Node.js, PostgreSQL\nProjects\n• Built API in Node.js\n• Built UI in React\n• Designed PostgreSQL tables\n• Tested endpoints`,
    sections: [
      { type: 'education', heading: 'Education', content: 'B.Tech CSE' },
      { type: 'skills', heading: 'Skills', content: 'React, Node.js, PostgreSQL' },
      { type: 'projects', heading: 'Projects', content: 'Built full-stack app' },
    ],
    detectedSkills: ['React', 'Node.js', 'PostgreSQL'],
    extractionWarnings: [],
    readingOrderConfidence: 'high',
    ...overrides,
  };
}

const sampleJD: ParsedJD = {
  title: 'Junior Engineer',
  company: 'Acme',
  technicalSkills: ['React', 'Node.js', 'PostgreSQL'],
  softSkills: [],
  responsibilities: [],
  requirements: [],
  rawText: 'React, Node.js, PostgreSQL',
};

describe('atsAnalyzer.service', () => {
  it('produces identical deterministic scores for identical inputs', () => {
    const res = makeResume();
    const first = evaluateATSCompatibility(res, sampleJD);
    const second = evaluateATSCompatibility(res, sampleJD);
    expect(first.score).toBe(second.score);
    expect(first.score).toBeGreaterThanOrEqual(90);
    expect(first.checks).toEqual(second.checks);
  });

  it('marks unobservable reading order as not_evaluated without unfair score deduction', () => {
    const res = makeResume({ readingOrderConfidence: 'unable_to_determine' });
    const ats = evaluateATSCompatibility(res, sampleJD);
    const ro = ats.checks.find((c) => c.id === 'ats-reading-order');
    expect(ro?.status).toBe('not_evaluated');
    expect(ro?.maxScore).toBe(0);
    expect(ats.notEvaluatedCount).toBe(1);
    expect(ats.score).toBeGreaterThanOrEqual(95);
  });
});

