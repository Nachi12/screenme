import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { ParsedJD } from '@screenme/shared';

export interface IJobDescription extends Document {
  userId?: Types.ObjectId | null;
  guestSessionId?: string | null;
  jdHash: string;
  sourceUrl?: string | null;
  parsed: ParsedJD;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const JobDescriptionSchema = new Schema<IJobDescription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    guestSessionId: { type: String, default: null, index: true },
    jdHash: { type: String, required: true, index: true },
    sourceUrl: { type: String, default: null },
    parsed: { type: Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

JobDescriptionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const JobDescriptionModel = mongoose.model<IJobDescription>(
  'JobDescription',
  JobDescriptionSchema
);

