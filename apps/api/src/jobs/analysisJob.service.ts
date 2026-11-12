import {
  ANALYSIS_STAGES,
  type AnalysisStageStatus,
  type CandidateProfileInput,
  type ParsedJD,
  type ParsedResume,
} from '@screenme/shared';
import { AnalysisReportModel } from '../models/AnalysisReport.model.js';
import { RoadmapProgressModel } from '../models/RoadmapProgress.model.js';
import { UsageRecordModel } from '../models/UsageRecord.model.js';
import { runFullAnalysisPipeline } from '../services/reporting/reportAssembler.service.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const inFlightJobs = new Map<string, Promise<void>>();

export function buildInitialStages(): AnalysisStageStatus[] {
  return ANALYSIS_STAGES.map((stage, idx) => ({
    key: stage.key,
    label: stage.label,
    status: idx === 0 ? 'completed' : 'pending',
  }));
}

function updateStagesForCurrent(
  currentKey: string
): { stages: AnalysisStageStatus[]; percent: number } {
  const currentIdx = ANALYSIS_STAGES.findIndex((s) => s.key === currentKey);
  const percent = currentIdx >= 0 ? ANALYSIS_STAGES[currentIdx]!.percent : 15;
  const stages: AnalysisStageStatus[] = ANALYSIS_STAGES.map((stage, idx) => ({
    key: stage.key,
    label: stage.label,
    status:
      idx < currentIdx
        ? 'completed'
        : idx === currentIdx
          ? 'running'
          : 'pending',
  }));
  return { stages, percent };
}

export function launchAnalysisJob(params: {
  analysisId: string;
  resume: ParsedResume;
  jd: ParsedJD;
  jdHash: string;
  profile: CandidateProfileInput;
}): void {
  const { analysisId, resume, jd, jdHash, profile } = params;

  const jobPromise = (async () => {
    try {
      await AnalysisReportModel.findByIdAndUpdate(analysisId, {
        status: 'processing',
        currentStage: 'parsing_jd',
        ...(() => {
          const u = updateStagesForCurrent('parsing_jd');
          return { stages: u.stages, progressPercent: u.percent };
        })(),
      });

      const report = await runFullAnalysisPipeline({
        reportId: analysisId,
        resume,
        jd,
        jdHash,
        profile,
        onStage: async (stageKey) => {
          const u = updateStagesForCurrent(stageKey);
          await AnalysisReportModel.findByIdAndUpdate(analysisId, {
            status: 'processing',
            currentStage: stageKey,
            stages: u.stages,
            progressPercent: u.percent,
          });
        },
      });

      const doc = await AnalysisReportModel.findByIdAndUpdate(
        analysisId,
        {
          status: 'completed',
          currentStage: 'scoring_and_saving',
          progressPercent: 100,
          stages: ANALYSIS_STAGES.map((s) => ({
            key: s.key,
            label: s.label,
            status: 'completed',
          })),
          report,
          errorInfo: null,
        },
        { new: true }
      );

      if (doc) {
        await Promise.all([
          UsageRecordModel.create({
            userId: doc.userId ?? null,
            guestSessionId: doc.guestSessionId ?? null,
            analysisId: doc._id,
            provider: report.modelMetadata.provider,
            modelId: report.modelMetadata.modelId,
            promptTokens: report.modelMetadata.promptTokens,
            candidatesTokens: report.modelMetadata.candidatesTokens,
            totalTokens: report.modelMetadata.totalTokens,
            estimatedCostUsd: report.modelMetadata.estimatedCostUsd,
          }),
          RoadmapProgressModel.findOneAndUpdate(
            { reportId: doc._id },
            {
              $setOnInsert: {
                reportId: doc._id,
                userId: doc.userId ?? null,
                guestSessionId: doc.guestSessionId ?? null,
                completedTasks: {},
                expiresAt: doc.expiresAt ?? null,
              },
            },
            { upsert: true }
          ),
        ]);
      }
    } catch (err) {
      const code = err instanceof AppError ? err.code : 'ANALYSIS_FAILED';
      const message =
        err instanceof AppError
          ? err.message
          : 'Analysis failed unexpectedly. Please try again.';

      logger.error('Analysis pipeline failed', { analysisId, code });

      const existing = await AnalysisReportModel.findById(analysisId);
      const currentKey = existing?.currentStage ?? 'ai_evaluation';
      const failedStages: AnalysisStageStatus[] = ANALYSIS_STAGES.map((s) => ({
        key: s.key,
        label: s.label,
        status: s.key === currentKey ? 'failed' : 'pending',
      }));

      await AnalysisReportModel.findByIdAndUpdate(analysisId, {
        status: 'failed',
        stages: failedStages,
        errorInfo: { code, message },
      });
    } finally {
      inFlightJobs.delete(analysisId);
    }
  })();

  inFlightJobs.set(analysisId, jobPromise);
}

export async function waitForAnalysisJob(analysisId: string): Promise<void> {
  const pending = inFlightJobs.get(analysisId);
  if (pending) {
    await pending;
  }
}

