import { Response } from 'express';

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  details?: unknown;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200
  ): Response {
    const payload: ApiResponsePayload<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(payload);
  }

  static error(
    res: Response,
    message = 'Internal Server Error',
    statusCode = 500,
    details?: unknown
  ): Response {
    const payload: ApiResponsePayload = {
      success: false,
      message,
      ...(details ? { details } : {}),
    };
    return res.status(statusCode).json(payload);
  }
}
