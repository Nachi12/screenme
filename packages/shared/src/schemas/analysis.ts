import { z } from 'zod';

export const ExperienceLevelSchema = z.enum([
  'student',
  'fresher',
  '0_1_year',
  '1_3_years',
  '3_plus_years',
]);
export type ExperienceLevel = z.infer<typeof ExperienceLevelSchema>;

export const HiringEnvironmentSchema = z.enum([
  'it_services',
  'product_based',
  'startup',
  'enterprise',
  'internship',
  'auto_detect',
]);
export type HiringEnvironment = z.infer<typeof HiringEnvironmentSchema>;

export const EvidenceStatusSchema = z.enum([
  'explicitly_demonstrated',
  'partially_demonstrated',
  'mentioned_without_evidence',
  'not_found',
  'unable_to_determine',
]);
export type EvidenceStatus = z.infer<typeof EvidenceStatusSchema>;

export const RequirementImportanceSchema = z.enum([
  'must_have',
  'preferred',
  'contextual',
  'unclear',
]);
export type RequirementImportance = z.infer<typeof RequirementImportanceSchema>;

export const RequirementCategorySchema = z.enum([
  'mandatoryTechnical',
  'projectsAndExperience',
  'coreResponsibilities',
  'educationAndEligibility',
  'preferredSkills',
]);
export type RequirementCategory = z.infer<typeof RequirementCategorySchema>;

export const HRVerdictSchema = z.enum([
  'Strong Match',
  'Potential Match',
  'Needs Improvement',
  'Significant Gaps',
]);
export type HRVerdict = z.infer<typeof HRVerdictSchema>;

export const ATSCheckStatusSchema = z.enum([
  'passed',
  'failed',
  'warning',
  'not_evaluated',
]);
export type ATSCheckStatus = z.infer<typeof ATSCheckStatusSchema>;

export const ResumeSectionTypeSchema = z.enum([
  'header',
  'summary',
  'education',
  'skills',
  'projects',
  'internships',
  'experience',
  'certifications',
  'achievements',
  'other',
]);
export type ResumeSectionType = z.infer<typeof ResumeSectionTypeSchema>;

export const ResumeSectionSnippetSchema = z.object({
  type: ResumeSectionTypeSchema,
  heading: z.string(),
  content: z.string(),
  pageNumber: z.number().int().min(1).optional(),
  startLine: z.number().int().min(1).optional(),
  endLine: z.number().int().min(1).optional(),
});
export type ResumeSectionSnippet = z.infer<typeof ResumeSectionSnippetSchema>;

export const ParsedResumeSchema = z.object({
  candidateName: z.string().optional(),
  contact: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    portfolio: z.string().optional(),
    location: z.string().optional(),
  }),
  fileName: z.string(),
  fileType: z.enum(['pdf', 'docx']),
  fileSizeBytes: z.number().int().nonnegative(),
  pageCount: z.number().int().nonnegative(),
  wordCount: z.number().int().nonnegative(),
  rawText: z.string(),
  sections: z.array(ResumeSectionSnippetSchema),
  detectedSkills: z.array(z.string()),
  extractionWarnings: z.array(z.string()),
  readingOrderConfidence: z.enum(['high', 'medium', 'low', 'unable_to_determine']),
});
export type ParsedResume = z.infer<typeof ParsedResumeSchema>;

export const JDRequirementItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  canonicalSkill: z.string().optional(),
  importance: RequirementImportanceSchema,
  category: RequirementCategorySchema,
  sourceExcerpt: z.string(),
});
export type JDRequirementItem = z.infer<typeof JDRequirementItemSchema>;

export const ParsedJDSchema = z.object({
  title: z.string(),
  company: z.string(),
  experienceRequirement: z.string().optional(),
  educationRequirement: z.string().optional(),
  detectedEnvironment: HiringEnvironmentSchema.optional(),
  technicalSkills: z.array(z.string()),
  softSkills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  requirements: z.array(JDRequirementItemSchema),
  rawText: z.string(),
});
export type ParsedJD = z.infer<typeof ParsedJDSchema>;

export const ATSCheckItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: ATSCheckStatusSchema,
  score: z.number().min(0),
  maxScore: z.number().min(0),
  explanation: z.string(),
  recommendation: z.string().optional(),
});
export type ATSCheckItem = z.infer<typeof ATSCheckItemSchema>;

export const ATSEvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  disclaimer: z.string(),
  checks: z.array(ATSCheckItemSchema),
  passedCount: z.number().int().nonnegative(),
  failedCount: z.number().int().nonnegative(),
  warningCount: z.number().int().nonnegative(),
  notEvaluatedCount: z.number().int().nonnegative(),
  recommendedFixes: z.array(z.string()),
});
export type ATSEvaluation = z.infer<typeof ATSEvaluationSchema>;

export const RequirementMatchSchema = z.object({
  requirementId: z.string(),
  requirement: z.string(),
  canonicalSkill: z.string().optional(),
  importance: RequirementImportanceSchema,
  category: RequirementCategorySchema,
  status: EvidenceStatusSchema,
  jdSourceSnippet: z.string(),
  resumeEvidenceSnippet: z.string().nullable(),
  resumeSection: z.string().nullable(),
  explanation: z.string(),
  suggestedAction: z.string(),
});
export type RequirementMatch = z.infer<typeof RequirementMatchSchema>;

export const CategoryScoreBreakdownSchema = z.object({
  category: RequirementCategorySchema,
  label: z.string(),
  baseWeight: z.number(),
  normalizedWeight: z.number(),
  score: z.number().min(0).max(100).nullable(),
  applicableCount: z.number().int().nonnegative(),
});
export type CategoryScoreBreakdown = z.infer<typeof CategoryScoreBreakdownSchema>;

export const JobMatchEvaluationSchema = z.object({
  score: z.number().min(0).max(100).nullable(),
  confidence: z.enum(['high', 'medium', 'low']),
  disclaimer: z.string(),
  fresherModeApplied: z.boolean(),
  summary: z.string(),
  categoryBreakdown: z.array(CategoryScoreBreakdownSchema),
  requirements: z.array(RequirementMatchSchema),
});
export type JobMatchEvaluation = z.infer<typeof JobMatchEvaluationSchema>;

export const HREvaluationSchema = z.object({
  verdict: HRVerdictSchema,
  screeningImpression: z.string(),
  reasoningSummary: z.string(),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  relevantEvidence: z.array(z.string()),
  missingEvidence: z.array(z.string()),
  improvementPriorities: z.array(z.string()),
  readinessGuidance: z.string(),
});
export type HREvaluation = z.infer<typeof HREvaluationSchema>;

export const SkillGapItemSchema = z.object({
  skill: z.string(),
  group: z.enum([
    'critical_gaps',
    'important_gaps',
    'optional_improvements',
    'visibility_gaps',
  ]),
  priority: z.enum(['high', 'medium', 'low']),
  whyItMatters: z.string(),
  jdEvidence: z.string(),
  resumeEvidence: z.string().nullable(),
  suggestedNextAction: z.string(),
});
export type SkillGapItem = z.infer<typeof SkillGapItemSchema>;

export const SkillAnalysisSchema = z.object({
  demonstrated: z.array(z.string()),
  partial: z.array(z.string()),
  mentionedOnly: z.array(z.string()),
  missing: z.array(SkillGapItemSchema),
});
export type SkillAnalysis = z.infer<typeof SkillAnalysisSchema>;

export const ProjectAnalysisItemSchema = z.object({
  projectName: z.string(),
  relevanceToJD: z.enum(['high', 'medium', 'low']),
  technologiesDemonstrated: z.array(z.string()),
  technologiesMissingForJD: z.array(z.string()),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  complexityAssessment: z.string(),
  recommendedEnhancements: z.array(z.string()),
  sourceSnippet: z.string(),
});
export type ProjectAnalysisItem = z.infer<typeof ProjectAnalysisItemSchema>;

export const RewriteSuggestionSchema = z.object({
  id: z.string(),
  section: z.string(),
  originalText: z.string(),
  suggestedRewrite: z.string(),
  whyItIsBetter: z.string(),
  relevantJDSkills: z.array(z.string()),
  claimsRequiringVerification: z.array(z.string()),
});
export type RewriteSuggestion = z.infer<typeof RewriteSuggestionSchema>;

export const RoadmapTaskSchema = z.object({
  taskId: z.string(),
  week: z.number().int().min(1).max(4),
  skill: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  estimatedEffort: z.string(),
  supportingProjectSuggestion: z.string(),
  completed: z.boolean().default(false),
});
export type RoadmapTask = z.infer<typeof RoadmapTaskSchema>;

export const InterviewQuestionSchema = z.object({
  id: z.string(),
  category: z.enum([
    'technical',
    'project_based',
    'problem_solving',
    'behavioral',
    'missing_requirement',
  ]),
  question: z.string(),
  difficulty: z.enum(['foundational', 'intermediate', 'advanced']),
  skillTested: z.string(),
  whyInterviewerAsks: z.string(),
  suggestedAnswerFramework: z.string(),
});
export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>;

export const CandidateProfileInputSchema = z.object({
  experienceLevel: ExperienceLevelSchema,
  hiringEnvironment: HiringEnvironmentSchema,
  targetRole: z.string().trim().max(120).optional(),
  githubUrl: z.string().trim().max(255).optional().or(z.literal('')),
  portfolioUrl: z.string().trim().max(255).optional().or(z.literal('')),
});
export type CandidateProfileInput = z.infer<typeof CandidateProfileInputSchema>;

export const ModelMetadataSchema = z.object({
  provider: z.string(),
  modelId: z.string(),
  promptVersion: z.string(),
  promptTokens: z.number().int().nonnegative(),
  candidatesTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  estimatedCostUsd: z.number().nonnegative(),
});
export type ModelMetadata = z.infer<typeof ModelMetadataSchema>;

export const AnalysisReportSchema = z.object({
  id: z.string(),
  isSample: z.boolean().default(false),
  sampleLabel: z.string().optional(),
  candidateName: z.string(),
  jobTitle: z.string(),
  companyName: z.string(),
  candidateProfile: CandidateProfileInputSchema,
  resumeSummary: z.object({
    fileName: z.string(),
    fileType: z.enum(['pdf', 'docx']),
    pageCount: z.number().int().nonnegative(),
    wordCount: z.number().int().nonnegative(),
    detectedSections: z.array(z.string()),
    extractionWarnings: z.array(z.string()),
  }),
  jobMatch: JobMatchEvaluationSchema,
  atsEvaluation: ATSEvaluationSchema,
  hrEvaluation: HREvaluationSchema,
  skillAnalysis: SkillAnalysisSchema,
  projectAnalysis: z.array(ProjectAnalysisItemSchema),
  rewriteSuggestions: z.array(RewriteSuggestionSchema),
  roadmap: z.object({
    durationWeeks: z.number().int().min(2).max(4),
    disclaimer: z.string(),
    tasks: z.array(RoadmapTaskSchema),
  }),
  interviewQuestions: z.array(InterviewQuestionSchema),
  topRecommendedImprovements: z.array(z.string()),
  analysisVersion: z.string(),
  scoringVersion: z.string(),
  modelMetadata: ModelMetadataSchema,
  jdHash: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type AnalysisReport = z.infer<typeof AnalysisReportSchema>;

export const AnalysisStageStatusSchema = z.object({
  key: z.string(),
  label: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
});
export type AnalysisStageStatus = z.infer<typeof AnalysisStageStatusSchema>;

export const AnalysisJobStatusResponseSchema = z.object({
  analysisId: z.string(),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  currentStage: z.string(),
  progressPercent: z.number().min(0).max(100),
  stages: z.array(AnalysisStageStatusSchema),
  reportId: z.string().optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});
export type AnalysisJobStatusResponse = z.infer<typeof AnalysisJobStatusResponseSchema>;

