import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export async function connectDatabase(uri: string, retries = 3): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  mongoose.set('strictQuery', true);
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri);
      logger.info('Connected to MongoDB');
      return;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt < retries && msg.includes('ECONNREFUSED')) {
        logger.warn(`Waiting for MongoDB at ${uri} (attempt ${attempt + 1}/${retries + 1})...`);
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      if (msg.includes('bad auth') || msg.includes('Authentication failed')) {
        logger.error('MongoDB authentication failed.', {
          hint:
            'Verify your username and password in MONGODB_URI in .env, or switch to local MongoDB: mongodb://127.0.0.1:27017/screenme',
        });
      }
      throw err;
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

