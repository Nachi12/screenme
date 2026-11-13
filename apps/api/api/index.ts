import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from '../src/app.js';
import { connectDatabase } from '../src/config/db.js';
import { env } from '../src/config/env.js';

const app = createApp();

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  await connectDatabase(env.MONGODB_URI);
  app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1]);
}
