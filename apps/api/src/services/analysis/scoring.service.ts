import {
  EVIDENCE_MULTIPLIERS,
  JOB_MATCH_DISCLAIMER,
  JOB_MATCH_WEIGHTS,
  type CategoryScoreBreakdown,
  type ExperienceLevel,
  type JobMatchEvaluation,
  type RequirementCategory,
  type RequirementMatch,
} from '@screenme/shared';

const CATEGORY_LABELS: Record<RequirementCategory, string> = {
  mandatoryTechnical: 'Mandatory Technical Requirements',
  projectsAndExperience: 'Relevant Projects & Practical Experience',
  coreResponsibilities: 'Core Responsibilities',
  educationAndEligibility: 'Education & Eligibility',
  preferredSkills: 'Preferred Skills',
};

const ALL_CATEGORIES: RequirementCategory[] = [
  'mandatoryTechnical',
  'projectsAndExperience',
  'coreResponsibilities',
  'educationAndEligibility',
  'preferredSkills',
];

export function isFresherMode(experienceLevel: ExperienceLevel): boolean {
  return (
    experienceLevel === 'student' ||
    experienceLevel === 'fresher' ||
    experienceLevel === '0_1_year'
  );
}

/**
 * Deterministic job match scoring from validated requirement evidence classifications.
 * The LLM NEVER assigns numerical scores directly.
 */
export function computeDeterministicJobMatch(params: {
  requirements: RequirementMatch[];
  experienceLevel: ExperienceLevel;
  resumeWordCount: number;
  summary: string;
}): JobMatchEvaluation {
  const { requirements, experienceLevel, resumeWordCount, summary } = params;

  // Group requirements by category and compute raw category scores
  const categoryStats = new Map<
    RequirementCategory,
    { earned: number; applicableCount: number }
  >();

  for (const cat of ALL_CATEGORIES) {
    categoryStats.set(cat, { earned: 0, applicableCount: 0 });
  }

  for (const req of requirements) {
    const multiplier = EVIDENCE_MULTIPLIERS[req.status];
    if (multiplier === null) continue; // unable_to_determine excluded from denominator
    const stat = categoryStats.get(req.category);
    if (!stat) continue;
    stat.earned += multiplier;
    stat.applicableCount += 1;
  }

  const activeWeightSum = ALL_CATEGORIES.reduce((sum, cat) => {
    const stat = categoryStats.get(cat);
    if (stat && stat.applicableCount > 0) {
      return sum + JOB_MATCH_WEIGHTS[cat];
    }
    return sum;
  }, 0);

  const categoryBreakdown: CategoryScoreBreakdown[] = ALL_CATEGORIES.map((cat) => {
    const baseWeight = JOB_MATCH_WEIGHTS[cat];
    const stat = categoryStats.get(cat)!;
    const normalizedWeight =
      activeWeightSum > 0 && stat.applicableCount > 0
        ? Number((baseWeight / activeWeightSum).toFixed(4))
        : 0;
    const score =
      stat.applicableCount > 0
        ? Math.round((stat.earned / stat.applicableCount) * 100)
        : null;

    return {
      category: cat,
      label: CATEGORY_LABELS[cat],
      baseWeight,
      normalizedWeight,
      score,
      applicableCount: stat.applicableCount,
    };
  });

  const totalEvaluated = requirements.filter(
    (r) => EVIDENCE_MULTIPLIERS[r.status] !== null
  ).length;

  let overallScore: number | null = null;
  if (activeWeightSum > 0 && totalEvaluated > 0) {
    const weightedSum = categoryBreakdown.reduce((acc, item) => {
      if (item.score === null) return acc;
      return acc + item.score * item.normalizedWeight;
    }, 0);
    overallScore = Math.round(weightedSum);
  }

  const confidence: 'high' | 'medium' | 'low' =
    totalEvaluated >= 5 && resumeWordCount >= 180
      ? 'high'
      : totalEvaluated >= 3 && resumeWordCount >= 100
        ? 'medium'
        : 'low';

  return {
    score: overallScore,
    confidence,
    disclaimer: JOB_MATCH_DISCLAIMER,
    fresherModeApplied: isFresherMode(experienceLevel),
    summary,
    categoryBreakdown,
    requirements,
  };
}

