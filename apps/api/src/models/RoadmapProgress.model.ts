import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IRoadmapProgress extends Document {
  reportId: Types.ObjectId;
  userId?: Types.ObjectId | null;
  guestSessionId?: string | null;
  completedTasks: Record<string, boolean>;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapProgressSchema = new Schema<IRoadmapProgress>(
  {
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'AnalysisReport',
      required: true,
      unique: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    guestSessionId: { type: String, default: null },
    completedTasks: { type: Map, of: Boolean, default: {} },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

RoadmapProgressSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RoadmapProgressModel = mongoose.model<IRoadmapProgress>(
  'RoadmapProgress',
  RoadmapProgressSchema
);

