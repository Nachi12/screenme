import { z } from 'zod';
import { CandidateProfileInputSchema } from './analysis.js';

export const RegisterRequestSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().email('Enter a valid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().trim().email('Enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().trim().email('Enter a valid email address').toLowerCase(),
});
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(10, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

export const ParseJDRequestSchema = z
  .object({
    title: z.string().trim().max(150).optional(),
    company: z.string().trim().max(150).optional(),
    rawText: z.string().trim().optional(),
    url: z.string().trim().url('Enter a valid URL').optional().or(z.literal('')),
  })
  .refine(
    (data) => Boolean((data.rawText && data.rawText.length >= 40) || data.url),
    { message: 'Provide a job description (at least 40 characters) or a supported job URL.' }
  );
export type ParseJDRequest = z.infer<typeof ParseJDRequestSchema>;

export const CreateAnalysisRequestSchema = z.object({
  resumeId: z.string().min(1, 'Resume must be uploaded first'),
  jobDescription: z.object({
    title: z.string().trim().max(150).optional(),
    company: z.string().trim().max(150).optional(),
    rawText: z
      .string()
      .trim()
      .min(50, 'Job description must be at least 50 characters for meaningful analysis')
      .max(25000, 'Job description exceeds 25,000 character limit'),
  }),
  candidateProfile: CandidateProfileInputSchema,
  saveResume: z.boolean().default(false),
});
export type CreateAnalysisRequest = z.infer<typeof CreateAnalysisRequestSchema>;

export const UpdateRoadmapProgressSchema = z.object({
  taskId: z.string().min(1),
  completed: z.boolean(),
});
export type UpdateRoadmapProgressRequest = z.infer<typeof UpdateRoadmapProgressSchema>;

export const ReportListQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: z.string().trim().optional(),
  sort: z.enum(['newest', 'oldest', 'match_desc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type ReportListQuery = z.infer<typeof ReportListQuerySchema>;

