import mongoose from 'mongoose';
import { databaseConfig } from '../config/database.config';
import { logger } from '../utils/logger';

export class DatabaseConnection {
  private static isConnected = false;

  static async connect(): Promise<void> {
    if (this.isConnected) {
      logger.debug('[Database] Already connected');
      return;
    }

    try {
      mongoose.connection.on('connected', () => {
        logger.info('[Database] MongoDB connection established');
      });

      mongoose.connection.on('error', (err) => {
        logger.error({ err }, '[Database] MongoDB connection error');
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('[Database] MongoDB disconnected');
        this.isConnected = false;
      });

      await mongoose.connect(databaseConfig.uri, databaseConfig.options);
      this.isConnected = true;
    } catch (error) {
      logger.error({ err: error }, '[Database] Failed to connect to MongoDB');
      throw error;
    }
  }

  static async ping(): Promise<boolean> {
    try {
      if (mongoose.connection.readyState !== 1) return false;
      const admin = mongoose.connection.db?.admin();
      if (!admin) return false;
      const res = await admin.ping();
      return !!res.ok;
    } catch {
      return false;
    }
  }

  static async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    await mongoose.disconnect();
    this.isConnected = false;
    logger.info('[Database] MongoDB connection closed');
  }
}
