export const ANALYSIS_VERSION = 'analysis-v1.0.0' as const;
export const SCORING_VERSION = 'scoring-v1.0.0' as const;
export const PROMPT_VERSION = 'prompt-v1.0.0' as const;

export const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB default

export const JOB_MATCH_WEIGHTS = {
  mandatoryTechnical: 0.40,
  projectsAndExperience: 0.25,
  coreResponsibilities: 0.15,
  educationAndEligibility: 0.10,
  preferredSkills: 0.10,
} as const;

export const EVIDENCE_MULTIPLIERS = {
  explicitly_demonstrated: 1.0,
  partially_demonstrated: 0.6,
  mentioned_without_evidence: 0.3,
  not_found: 0.0,
  unable_to_determine: null, // Excluded from denominator
} as const;

export const ATS_DISCLAIMER =
  "This score estimates compatibility using ScreenMe's documented checks. It does not represent the score assigned by any employer's ATS." as const;

export const JOB_MATCH_DISCLAIMER =
  'Weighted category assumptions estimate resume-to-JD alignment based on available evidence, not actual hiring probability.' as const;

export const ROADMAP_DISCLAIMER =
  'This personalized 2–4 week improvement roadmap targets gaps identified in your resume relative to this job description. Completing it strengthens readiness but does not guarantee job offers.' as const;

export const ANALYSIS_STAGES = [
  { key: 'validating_inputs', label: 'Validating resume & job description', percent: 10 },
  { key: 'parsing_resume', label: 'Extracting resume text & structure', percent: 22 },
  { key: 'parsing_jd', label: 'Analyzing job description requirements', percent: 36 },
  { key: 'normalizing_skills', label: 'Normalizing skills & taxonomy', percent: 48 },
  { key: 'ats_checks', label: 'Running deterministic ATS compatibility checks', percent: 60 },
  { key: 'ai_evaluation', label: 'Evaluating evidence, HR impression & projects', percent: 78 },
  { key: 'generating_guidance', label: 'Generating rewrites, roadmap & interview prep', percent: 90 },
  { key: 'scoring_and_saving', label: 'Computing deterministic scores & assembling report', percent: 100 },
] as const;

export type AnalysisStageKey = (typeof ANALYSIS_STAGES)[number]['key'];

