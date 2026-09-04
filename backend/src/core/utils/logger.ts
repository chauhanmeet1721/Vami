import pino from 'pino';
import { envConfig } from '../config/env.config';

/**
 * Centralized Pino logger for the entire backend.
 *
 * - Development: human-readable output via pino-pretty
 * - Preview/Production: structured JSON output (stdout → platform log aggregator)
 *
 * Usage:
 *   import { logger } from '@/core/utils/logger';
 *   logger.info('Server started');
 *   logger.warn({ userId }, 'Suspicious activity detected');
 *   logger.error({ err }, 'Unhandled error in service');
 *
 * Never use console.log/warn/error in backend code — use this logger.
 */
export const logger = pino(
  {
    level: envConfig.isDevelopment ? 'debug' : 'info',
    // Redact sensitive fields from all log output — security requirement
    redact: {
      paths: ['password', 'token', 'refreshToken', 'accessToken', 'authorization', '*.password', '*.token'],
      censor: '[REDACTED]',
    },
    // Base fields added to every log line
    base: {
      service: 'vami-backend',
      env: envConfig.NODE_ENV,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  envConfig.isDevelopment
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname,service,env',
        },
      })
    : undefined // In preview/production: write JSON to stdout, platform handles it
);
