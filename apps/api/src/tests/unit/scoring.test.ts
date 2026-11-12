import { describe, expect, it } from 'vitest';
import type { EvidenceStatus, RequirementCategory, RequirementMatch } from '@screenme/shared';
import { computeDeterministicJobMatch } from '../../services/analysis/scoring.service.js';
import { parseJobDescription } from '../../services/parsing/jdParser.service.js';

function makeReq(params: {
  id: string;
  skill?: string;
  importance?: RequirementMatch['importance'];
  category: RequirementCategory;
  status: EvidenceStatus;
}): RequirementMatch {
  return {
    requirementId: params.id,
    requirement: params.skill ?? `Requirement ${params.id}`,
    canonicalSkill: params.skill,
    importance: params.importance ?? 'must_have',
    category: params.category,
    status: params.status,
    jdSourceSnippet: params.skill ?? `Snippet ${params.id}`,
    resumeEvidenceSnippet:
      params.status === 'not_found' || params.status === 'unable_to_determine'
        ? null
        : `Evidence for ${params.skill ?? params.id}`,
    resumeSection:
      params.status === 'mentioned_without_evidence'
        ? 'Skills'
        : params.status === 'not_found' || params.status === 'unable_to_determine'
          ? null
          : 'Projects',
    explanation: `Status: ${params.status}`,
    suggestedAction: 'Action',
  };
}

describe('scoring.service', () => {
  it('normalizes weights across applicable categories and computes deterministic score', () => {
    const reqs: RequirementMatch[] = [
      makeReq({
        id: '1',
        skill: 'React',
        category: 'mandatoryTechnical',
        status: 'explicitly_demonstrated',
      }),
      makeReq({
        id: '2',
        skill: 'Authentication',
        category: 'mandatoryTechnical',
        status: 'not_found',
      }),
      makeReq({
        id: '3',
        skill: 'B.Tech CS',
        category: 'educationAndEligibility',
        status: 'explicitly_demonstrated',
      }),
    ];

    const result = computeDeterministicJobMatch({
      requirements: reqs,
      experienceLevel: 'fresher',
      resumeWordCount: 300,
      summary: 'Summary',
    });

    // mandatoryTechnical = 50% (weight 0.4 -> normalized 0.8), education = 100% (weight 0.1 -> normalized 0.2)
    // 50 * 0.8 + 100 * 0.2 = 40 + 20 = 60
    expect(result.score).toBe(60);
    expect(result.fresherModeApplied).toBe(true);
  });

  it('returns null score when no requirements can be determined', () => {
    const result = computeDeterministicJobMatch({
      requirements: [
        makeReq({
          id: '1',
          importance: 'unclear',
          category: 'mandatoryTechnical',
          status: 'unable_to_determine',
        }),
      ],
      experienceLevel: '1_3_years',
      resumeWordCount: 250,
      summary: 'Insufficient evidence',
    });

    expect(result.score).toBeNull();
    expect(result.fresherModeApplied).toBe(false);
  });

  it('scores strong technical match and partial technical match accurately', () => {
    const strongReqs: RequirementMatch[] = [
      makeReq({ id: '1', skill: 'React', category: 'mandatoryTechnical', status: 'explicitly_demonstrated' }),
      makeReq({ id: '2', skill: 'Node.js', category: 'mandatoryTechnical', status: 'explicitly_demonstrated' }),
      makeReq({ id: '3', skill: 'REST APIs', category: 'projectsAndExperience', status: 'explicitly_demonstrated' }),
      makeReq({ id: '4', skill: 'Unit Testing', category: 'coreResponsibilities', status: 'explicitly_demonstrated' }),
      makeReq({ id: '5', skill: 'B.Tech', category: 'educationAndEligibility', status: 'explicitly_demonstrated' }),
      makeReq({ id: '6', skill: 'Docker', importance: 'preferred', category: 'preferredSkills', status: 'partially_demonstrated' }),
    ];
    const partialReqs: RequirementMatch[] = strongReqs.map((r) => ({
      ...r,
      status: 'partially_demonstrated',
    }));

    const strong = computeDeterministicJobMatch({
      requirements: strongReqs,
      experienceLevel: '0_1_year',
      resumeWordCount: 320,
      summary: 'Strong',
    });
    const partial = computeDeterministicJobMatch({
      requirements: partialReqs,
      experienceLevel: '0_1_year',
      resumeWordCount: 320,
      summary: 'Partial',
    });

    // Strong: 90% from 0.90 + 60% from 0.10 = 96; Partial: 60 everywhere = 60
    expect(strong.score).toBe(96);
    expect(strong.confidence).toBe('high');
    expect(partial.score).toBe(60);
    expect(strong.score!).toBeGreaterThan(partial.score!);
  });

  it('gives project evidence significantly higher credit than keyword-only mentions', () => {
    const keywordOnly = computeDeterministicJobMatch({
      requirements: [
        makeReq({ id: '1', skill: 'React', category: 'mandatoryTechnical', status: 'mentioned_without_evidence' }),
        makeReq({ id: '2', skill: 'Node.js', category: 'mandatoryTechnical', status: 'mentioned_without_evidence' }),
        makeReq({ id: '3', skill: 'PostgreSQL', category: 'projectsAndExperience', status: 'mentioned_without_evidence' }),
      ],
      experienceLevel: 'student',
      resumeWordCount: 220,
      summary: 'Keyword only',
    });

    const projectEvidenced = computeDeterministicJobMatch({
      requirements: [
        makeReq({ id: '1', skill: 'React', category: 'mandatoryTechnical', status: 'explicitly_demonstrated' }),
        makeReq({ id: '2', skill: 'Node.js', category: 'mandatoryTechnical', status: 'explicitly_demonstrated' }),
        makeReq({ id: '3', skill: 'PostgreSQL', category: 'projectsAndExperience', status: 'explicitly_demonstrated' }),
      ],
      experienceLevel: 'student',
      resumeWordCount: 220,
      summary: 'Project backed',
    });

    expect(keywordOnly.score).toBe(30);
    expect(projectEvidenced.score).toBe(100);
    expect(projectEvidenced.fresherModeApplied).toBe(true);
  });

  it('penalizes missing mandatory skills more heavily than missing preferred skills', () => {
    const missingMandatory = computeDeterministicJobMatch({
      requirements: [
        makeReq({ id: '1', skill: 'React', importance: 'must_have', category: 'mandatoryTechnical', status: 'not_found' }),
        makeReq({ id: '2', skill: 'Docker', importance: 'preferred', category: 'preferredSkills', status: 'explicitly_demonstrated' }),
      ],
      experienceLevel: 'fresher',
      resumeWordCount: 250,
      summary: 'Missing mandatory',
    });

    const missingPreferred = computeDeterministicJobMatch({
      requirements: [
        makeReq({ id: '1', skill: 'React', importance: 'must_have', category: 'mandatoryTechnical', status: 'explicitly_demonstrated' }),
        makeReq({ id: '2', skill: 'Docker', importance: 'preferred', category: 'preferredSkills', status: 'not_found' }),
      ],
      experienceLevel: 'fresher',
      resumeWordCount: 250,
      summary: 'Missing preferred',
    });

    // mandatory weight 0.4, preferred weight 0.1 -> normalized 0.8 and 0.2
    expect(missingMandatory.score).toBe(20);
    expect(missingPreferred.score).toBe(80);
  });

  it('excludes unable_to_determine items without treating them as missing, lowers confidence on thin resumes, and stays identical across runs', () => {
    const reqs: RequirementMatch[] = [
      makeReq({ id: '1', skill: 'React', category: 'mandatoryTechnical', status: 'explicitly_demonstrated' }),
      makeReq({ id: '2', skill: 'Ambiguous Cloud Scope', category: 'mandatoryTechnical', status: 'unable_to_determine' }),
      makeReq({ id: '3', skill: 'Node.js', category: 'projectsAndExperience', status: 'partially_demonstrated' }),
    ];

    const first = computeDeterministicJobMatch({
      requirements: reqs,
      experienceLevel: 'fresher',
      resumeWordCount: 90,
      summary: 'Ambiguous subset',
    });
    const second = computeDeterministicJobMatch({
      requirements: reqs,
      experienceLevel: 'fresher',
      resumeWordCount: 90,
      summary: 'Ambiguous subset',
    });

    // React (1.0) in mandatoryTechnical (unable_to_determine excluded => 100), Node.js (0.6 => 60) in projectsAndExperience
    // Weights 0.4 + 0.25 = 0.65 => 100*(0.4/0.65) + 60*(0.25/0.65) = 84.615 -> 85
    expect(first.score).toBe(85);
    expect(first.confidence).toBe('low');
    expect(first.score).toBe(second.score);
    expect(first.categoryBreakdown).toEqual(second.categoryBreakdown);
  });

  it('ensures preferred JD clauses never become mandatory requirements', () => {
    const { parsed } = parseJobDescription({
      rawText: `
        Required Qualifications:
        - Strong experience in TypeScript and PostgreSQL.
        Nice to have:
        - Familiarity with Kubernetes and AWS.
      `,
    });
    const bySkill = new Map(
      parsed.requirements.filter((r) => r.canonicalSkill).map((r) => [r.canonicalSkill!, r])
    );
    expect(bySkill.get('TypeScript')?.importance).toBe('must_have');
    expect(bySkill.get('PostgreSQL')?.importance).toBe('must_have');
    expect(bySkill.get('Kubernetes')?.importance).toBe('preferred');
    expect(bySkill.get('AWS')?.importance).toBe('preferred');
  });
});

