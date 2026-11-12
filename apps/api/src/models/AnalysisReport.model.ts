import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type {
  AnalysisReport,
  AnalysisStageStatus,
  CandidateProfileInput,
} from '@screenme/shared';

export interface IAnalysisReportDoc extends Document {
  userId?: Types.ObjectId | null;
  guestSessionId?: string | null;
  resumeId: Types.ObjectId;
  jobDescriptionId: Types.ObjectId;
  dedupeKey: string;
  jdHash: string;
  candidateProfile: CandidateProfileInput;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  currentStage: string;
  progressPercent: number;
  stages: AnalysisStageStatus[];
  errorInfo?: {
    code: string;
    message: string;
  } | null;
  report?: AnalysisReport | null;
  analysisVersion: string;
  scoringVersion: string;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const AnalysisReportSchema = new Schema<IAnalysisReportDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    guestSessionId: { type: String, default: null, index: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
    jobDescriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'JobDescription',
      required: true,
    },
    dedupeKey: { type: String, required: true, index: true },
    jdHash: { type: String, required: true, index: true },
    candidateProfile: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
      index: true,
    },
    currentStage: { type: String, default: 'validating_inputs' },
    progressPercent: { type: Number, default: 0 },
    stages: {
      type: [
        new Schema(
          {
            key: { type: String, required: true },
            label: { type: String, required: true },
            status: {
              type: String,
              enum: ['pending', 'running', 'completed', 'failed'],
              required: true,
            },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    errorInfo: { type: Schema.Types.Mixed, default: null },
    report: { type: Schema.Types.Mixed, default: null },
    analysisVersion: { type: String, required: true },
    scoringVersion: { type: String, required: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

AnalysisReportSchema.index({ userId: 1, createdAt: -1 });
AnalysisReportSchema.index({ userId: 1, status: 1, createdAt: -1 });
AnalysisReportSchema.index({ userId: 1, jdHash: 1, createdAt: -1 });
AnalysisReportSchema.index({ dedupeKey: 1, status: 1, createdAt: -1 });
AnalysisReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AnalysisReportModel = mongoose.model<IAnalysisReportDoc>(
  'AnalysisReport',
  AnalysisReportSchema
);
