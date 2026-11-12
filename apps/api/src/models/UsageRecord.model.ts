import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IUsageRecord extends Document {
  userId?: Types.ObjectId | null;
  guestSessionId?: string | null;
  analysisId: Types.ObjectId;
  provider: string;
  modelId: string;
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  createdAt: Date;
}

const UsageRecordSchema = new Schema<IUsageRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    guestSessionId: { type: String, default: null, index: true },
    analysisId: {
      type: Schema.Types.ObjectId,
      ref: 'AnalysisReport',
      required: true,
      index: true,
    },
    provider: { type: String, required: true },
    modelId: { type: String, required: true },
    promptTokens: { type: Number, default: 0 },
    candidatesTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    estimatedCostUsd: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

UsageRecordSchema.index({ userId: 1, createdAt: -1 });

export const UsageRecordModel = mongoose.model<IUsageRecord>(
  'UsageRecord',
  UsageRecordSchema
);

