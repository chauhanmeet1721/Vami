import { createApp } from './app';
import { envConfig } from './core/config/env.config';
import { DatabaseConnection } from './core/database/connection';
import { RedisConnection } from './core/database/redis.connection';
import { logger } from './core/utils/logger';

const startServer = async (): Promise<void> => {
  try {
    // 1. Initialize Databases (MongoDB + Redis)
    await DatabaseConnection.connect();
    await RedisConnection.connect();

    // 2. Instantiate Express App
    const app = createApp();

    // 3. Start HTTP Listener
    const server = app.listen(envConfig.PORT, () => {
      logger.info(
        { port: envConfig.PORT, env: envConfig.NODE_ENV },
        '[Server] Running and accepting connections'
      );
      logger.info(`[Server] Liveness:  /health/liveness`);
      logger.info(`[Server] Readiness: /health/readiness`);
    });

    // Graceful Shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.warn({ signal }, '[Server] Received signal — starting graceful shutdown');
      server.close(async () => {
        logger.info('[Server] HTTP listener closed');
        await DatabaseConnection.disconnect();
        await RedisConnection.disconnect();
        logger.info('[Server] Graceful shutdown complete');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error({ err: error }, '[Server] Fatal bootstrap error');
    process.exit(1);
  }
};

startServer();
