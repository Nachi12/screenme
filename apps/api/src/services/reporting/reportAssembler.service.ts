import {
  ANALYSIS_VERSION,
  AnalysisReportSchema,
  PROMPT_VERSION,
  SCORING_VERSION,
  type AnalysisReport,
  type CandidateProfileInput,
  type ParsedJD,
  type ParsedResume,
} from '@screenme/shared';
import type { AIUsageMetrics } from '../ai/aiProvider.service.js';
import { evaluateATSCompatibility } from '../analysis/atsAnalyzer.service.js';
import { evaluateHRImpression } from '../analysis/hrEvaluator.service.js';
import { generateInterviewQuestions } from '../analysis/interviewGenerator.service.js';
import { matchJobRequirements } from '../analysis/jobMatcher.service.js';
import { evaluateProjects } from '../analysis/projectEvaluator.service.js';
import { generateResumeRewrites } from '../analysis/resumeRewrite.service.js';
import { generateImprovementRoadmap } from '../analysis/roadmapGenerator.service.js';
import { computeDeterministicJobMatch } from '../analysis/scoring.service.js';

export type StageProgressCallback = (stageKey: string) => Promise<void> | void;

function mergeUsage(usages: AIUsageMetrics[]): AIUsageMetrics {
  return usages.reduce(
    (acc, u) => ({
      promptTokens: acc.promptTokens + u.promptTokens,
      candidatesTokens: acc.candidatesTokens + u.candidatesTokens,
      totalTokens: acc.totalTokens + u.totalTokens,
      estimatedCostUsd: Number((acc.estimatedCostUsd + u.estimatedCostUsd).toFixed(6)),
    }),
    { promptTokens: 0, candidatesTokens: 0, totalTokens: 0, estimatedCostUsd: 0 }
  );
}

export async function runFullAnalysisPipeline(params: {
  reportId: string;
  resume: ParsedResume;
  jd: ParsedJD;
  jdHash: string;
  profile: CandidateProfileInput;
  onStage?: StageProgressCallback;
}): Promise<AnalysisReport> {
  const { reportId, resume, jd, jdHash, profile, onStage } = params;
  const usages: AIUsageMetrics[] = [];

  await onStage?.('ats_checks');
  const atsEvaluation = evaluateATSCompatibility(resume, jd);

  await onStage?.('ai_evaluation');
  const [matchResult, projectResult] = await Promise.all([
    matchJobRequirements({ resume, jd, profile }),
    evaluateProjects({ resume, jd, profile }),
  ]);
  usages.push(matchResult.usage, projectResult.usage);

  const jobMatch = computeDeterministicJobMatch({
    requirements: matchResult.requirements,
    experienceLevel: profile.experienceLevel,
    resumeWordCount: resume.wordCount,
    summary: matchResult.summary,
  });

  const hrResult = await evaluateHRImpression({
    resume,
    jd,
    profile,
    ats: atsEvaluation,
    jobMatch,
  });
  usages.push(hrResult.usage);

  await onStage?.('generating_guidance');
  const [rewriteResult, roadmapResult, interviewResult] = await Promise.all([
    generateResumeRewrites({ resume, jd }),
    generateImprovementRoadmap({
      jd,
      skillAnalysis: matchResult.skillAnalysis,
      profile,
    }),
    generateInterviewQuestions({
      resume,
      jd,
      skillAnalysis: matchResult.skillAnalysis,
      profile,
    }),
  ]);
  usages.push(rewriteResult.usage, roadmapResult.usage, interviewResult.usage);

  await onStage?.('scoring_and_saving');
  const totalUsage = mergeUsage(usages);
  const nowIso = new Date().toISOString();

  const topRecommendedImprovements = [
    ...hrResult.hrEvaluation.improvementPriorities.slice(0, 3),
    ...atsEvaluation.recommendedFixes.slice(0, 2),
  ].slice(0, 5);

  const assembled: AnalysisReport = {
    id: reportId,
    isSample: false,
    candidateName: resume.candidateName || 'Candidate',
    jobTitle: profile.targetRole || jd.title,
    companyName: jd.company,
    candidateProfile: profile,
    resumeSummary: {
      fileName: resume.fileName,
      fileType: resume.fileType,
      pageCount: resume.pageCount,
      wordCount: resume.wordCount,
      detectedSections: resume.sections.map((s) => s.heading),
      extractionWarnings: resume.extractionWarnings,
    },
    jobMatch,
    atsEvaluation,
    hrEvaluation: hrResult.hrEvaluation,
    skillAnalysis: matchResult.skillAnalysis,
    projectAnalysis: projectResult.projects,
    rewriteSuggestions: rewriteResult.rewrites,
    roadmap: roadmapResult.roadmap,
    interviewQuestions: interviewResult.interviewQuestions,
    topRecommendedImprovements,
    analysisVersion: ANALYSIS_VERSION,
    scoringVersion: SCORING_VERSION,
    modelMetadata: {
      provider: matchResult.provider,
      modelId: matchResult.modelId,
      promptVersion: PROMPT_VERSION,
      ...totalUsage,
    },
    jdHash,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  return AnalysisReportSchema.parse(assembled);
}

