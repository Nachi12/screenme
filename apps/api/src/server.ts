import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

export const app = createApp();

let isConnected = false;
export async function ensureDatabase(): Promise<void> {
  if (!isConnected) {
    await connectDatabase(env.MONGODB_URI);
    isConnected = true;
  }
}

async function bootstrap(): Promise<void> {
  await ensureDatabase();

  const server = app.listen(env.PORT, () => {
    logger.info(`ScreenMe API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
}

// In local execution or standard containers, listen on PORT.
// In Vercel serverless environments, VERCEL is defined so we export the handler without listening.
if (!process.env.VERCEL) {
  bootstrap().catch((err) => {
    logger.error('Failed to start ScreenMe API', {
      error: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
  });
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  await ensureDatabase();
  app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1]);
}

