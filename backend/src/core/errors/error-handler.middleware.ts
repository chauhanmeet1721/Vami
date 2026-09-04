import { Request, Response, NextFunction } from 'express';
import { AppError } from './app-error';
import { ApiResponse } from '../utils/response.util';
import { logger } from '../utils/logger';
import { envConfig } from '../config/env.config';

const exposeInternalErrors = envConfig.isDevelopment;

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    // Never forward raw nested error objects to clients in preview/production
    const details = exposeInternalErrors ? err.details : undefined;
    ApiResponse.error(res, err.message, err.statusCode, details);
    return;
  }

  if ((err as { code?: number }).code === 11000) {
    ApiResponse.error(res, 'A record with this value already exists', 409);
    return;
  }

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    ApiResponse.error(
      res,
      exposeInternalErrors ? err.message : 'Invalid request data',
      err.name === 'CastError' ? 400 : 422
    );
    return;
  }

  logger.error({ err }, '[Unhandled Error]');
  ApiResponse.error(
    res,
    exposeInternalErrors ? err.message : 'An unexpected error occurred',
    500
  );
};
