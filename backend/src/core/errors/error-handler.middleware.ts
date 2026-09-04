import { Request, Response, NextFunction } from 'express';
import { AppError } from './app-error';
import { ApiResponse } from '../utils/response.util';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    ApiResponse.error(res, err.message, err.statusCode, err.details);
    return;
  }

  // Handle Mongoose duplicate key error (code 11000)
  if ((err as { code?: number }).code === 11000) {
    ApiResponse.error(res, 'A record with this value already exists', 409);
    return;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    ApiResponse.error(res, err.message, 422, err);
    return;
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    ApiResponse.error(res, 'Invalid token. Please authenticate.', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    ApiResponse.error(res, 'Token expired. Please authenticate again.', 401);
    return;
  }

  // Log unhandled server error for debugging and observability
  logger.error({ err }, '[Unhandled Error]');
  ApiResponse.error(
    res,
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    500
  );
};
