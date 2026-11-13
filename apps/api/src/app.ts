import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { createV1Router } from './routes/v1.routes.js';
import { sendError } from './utils/response.js';

export function createApp(): express.Application {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());

  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('CORS origin not allowed'));
      },
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));

  app.get('/', (_req, res) => {
    res.json({
      name: 'ScreenMe API',
      status: 'online',
      version: '1.0.0',
      description: 'AI Resume Screening, ATS Analysis & HR Evaluation Platform API',
      endpoints: {
        health: '/api/v1/health',
        apiV1: '/api/v1',
      },
    });
  });

  app.get('/api/v1/health', (_req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/v1', createV1Router());

  app.use((_req, res) => {
    sendError(res, 404, 'ROUTE_NOT_FOUND', 'Endpoint not found');
  });

  app.use(errorHandler);

  return app;
}

