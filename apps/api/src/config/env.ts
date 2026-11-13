import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const DEV_DEFAULT_JWT_SECRET = 'dev-screenme-secret-change-in-production-please';

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/screenme'),
    JWT_SECRET: z.string().min(16).default(DEV_DEFAULT_JWT_SECRET),
    COOKIE_SECURE: z
      .string()
      .optional()
      .transform((v) => v === 'true'),
    AI_PROVIDER: z.enum(['gemini']).default('gemini'),
    GEMINI_API_KEY: z.string().optional().default(''),
    GEMINI_MODEL: z.string().default('gemini-flash-lite-latest'),
    AI_TIMEOUT_MS: z.coerce.number().int().positive().default(45000),
    AI_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(2),
    MAX_UPLOAD_SIZE_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
    GUEST_REPORT_TTL_HOURS: z.coerce.number().int().positive().default(24),
    ANALYSIS_RATE_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(20),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production' && data.JWT_SECRET === DEV_DEFAULT_JWT_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'A unique JWT_SECRET must be configured in production.',
      });
    }
  });

export type AppEnv = z.infer<typeof EnvSchema>;

export function loadEnv(): AppEnv {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }
  return parsed.data;
}

export const env = loadEnv();

