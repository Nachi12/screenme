import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const maxMb = Math.round((env.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)) * 10) / 10;
      sendError(
        res,
        400,
        'FILE_TOO_LARGE',
        `Resume file exceeds the maximum allowed size of ${maxMb} MB.`
      );
      return;
    }
    sendError(res, 400, 'UPLOAD_ERROR', err.message);
    return;
  }

  if (err instanceof ZodError) {
    sendError(
      res,
      400,
      'VALIDATION_ERROR',
      err.errors[0]?.message ?? 'Validation failed',
      err.flatten()
    );
    return;
  }

  logger.error('Unhandled API error', {
    method: req.method,
    path: req.path,
    errorName: err instanceof Error ? err.name : 'UnknownError',
    errorMessage: err instanceof Error ? err.message : 'Unexpected failure',
  });

  sendError(
    res,
    500,
    'INTERNAL_ERROR',
    'An unexpected server error occurred. Please try again.'
  );
}

