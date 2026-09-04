import Redis from 'ioredis';
import { envConfig } from '../config/env.config';
import { logger } from '../utils/logger';

export class RedisConnection {
  private static client: Redis | null = null;
  private static isConnected = false;

  static getClient(): Redis {
    if (!this.client) {
      this.client = new Redis(envConfig.REDIS_URI, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        logger.info('[Redis] Connection established');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        logger.warn({ err: err.message }, '[Redis] Connection warning/error');
        this.isConnected = false;
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });
    }

    return this.client;
  }

  static async connect(): Promise<void> {
    const client = this.getClient();
    if (['connecting', 'connect', 'ready'].includes(client.status)) {
      return;
    }
    try {
      await client.connect();
    } catch (err: unknown) {
      logger.warn({ err }, '[Redis] Initial connection could not be established — will retry in background');
    }
  }

  static async ping(): Promise<boolean> {
    if (!this.client) return false;
    try {
      const res = await this.client.ping();
      return res === 'PONG';
    } catch {
      return false;
    }
  }

  static async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
      logger.info('[Redis] Connection closed');
    }
  }
}
