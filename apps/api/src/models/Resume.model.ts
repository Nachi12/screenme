import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { ParsedResume } from '@screenme/shared';

export interface IResume extends Document {
  userId?: Types.ObjectId | null;
  guestSessionId?: string | null;
  contentHash: string;
  savedByUser: boolean;
  parsed: ParsedResume;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    guestSessionId: { type: String, default: null, index: true },
    contentHash: { type: String, required: true, index: true },
    savedByUser: { type: Boolean, default: false },
    parsed: { type: Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ResumeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ResumeModel = mongoose.model<IResume>('Resume', ResumeSchema);

