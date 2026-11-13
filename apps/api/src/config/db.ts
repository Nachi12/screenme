import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export async function connectDatabase(uri: string): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri);
    logger.info('Connected to MongoDB');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('bad auth') || msg.includes('Authentication failed')) {
      logger.error('MongoDB authentication failed.', {
        hint:
          'Verify your username and password in MONGODB_URI in .env, or switch to local MongoDB: mongodb://127.0.0.1:27017/screenme',
      });
    }
    throw err;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

