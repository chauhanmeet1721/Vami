import express, { Application, Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import pinoHttp from 'pino-http';
import { envConfig } from './core/config/env.config';
import { errorHandler } from './core/errors/error-handler.middleware';
import { NotFoundError } from './core/errors/app-error';
import { ApiResponse } from './core/utils/response.util';
import { DatabaseConnection } from './core/database/connection';
import { RedisConnection } from './core/database/redis.connection';
import { authRouter } from './modules/auth';
import { userRouter } from './modules/users';
import { logger } from './core/utils/logger';
import { apiLimiter } from './core/middlewares/rate-limit.middleware';

export const createApp = (): Application => {
  const app = express();

  // ── Security Headers (OWASP) ───────────────────────────────────────────────
  // Configured for an API-only server: CSP is disabled (we serve no HTML)
  // crossOriginResourcePolicy is set to 'cross-origin' to allow Vercel frontend
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // ── Request Logging (All Environments) ─────────────────────────────────────
  // pino-http: attaches a structured logger to every req (req.log)
  // Dev: human-readable via pino-pretty. Preview/Prod: structured JSON.
  app.use(
    pinoHttp({
      logger,
      // Skip logging for health check endpoints to reduce noise
      autoLogging: {
        ignore: (req) => req.url?.startsWith('/health') ?? false,
      },
      // Customize log level per response status
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    })
  );

  // Dynamic CORS: dev → any localhost/127.0.0.1, preview → *.vercel.app, prod → explicit origin
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow server-to-server and non-browser requests
      if (!origin) return callback(null, true);

      if (envConfig.isDevelopment) {
        // Accept all localhost and 127.0.0.1 origins unconditionally in dev (including Docker)
        if (
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:')
        ) {
          return callback(null, true);
        }
      }

      if (envConfig.isPreview) {
        // Accept Vercel preview deployments and the explicitly configured origin
        if (
          /^https:\/\/.*\.vercel\.app$/.test(origin) ||
          origin === envConfig.CORS_ORIGIN
        ) {
          return callback(null, true);
        }
      }

      if (envConfig.isProduction) {
        if (origin === envConfig.CORS_ORIGIN) {
          return callback(null, true);
        }
      }

      callback(new Error(`Origin '${origin}' blocked by CORS policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };

  app.use(cors(corsOptions));
  app.use(cookieParser(envConfig.COOKIE_SECRET));

  // ── Request Size Limits (DoS Prevention) ───────────────────────────────────
  // Limits JSON and URL-encoded bodies to 50kb.
  // Prevents resource exhaustion from oversized payloads.
  app.use(express.json({ limit: '50kb' }));
  app.use(express.urlencoded({ extended: true, limit: '50kb' }));

  // ── NoSQL Injection Sanitization ───────────────────────────────────────────
  // Strips $ and . from request body, params, and query string.
  // Prevents MongoDB operator injection attacks (e.g. { "email": { "$gt": "" } }).
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.body) mongoSanitize.sanitize(req.body, { replaceWith: '_' });
    if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: '_' });
    if (req.query) mongoSanitize.sanitize(req.query, { replaceWith: '_' });
    next();
  });

  // Liveness Probe (is the Node process alive?)
  app.get('/health/liveness', (_req: Request, res: Response) => {
    ApiResponse.success(
      res,
      {
        status: 'UP',
        timestamp: new Date().toISOString(),
      },
      'Service process is alive'
    );
  });

  // Readiness Probe (are dependencies reachable?)
  app.get('/health/readiness', async (_req: Request, res: Response) => {
    const mongoReady = await DatabaseConnection.ping();
    const redisReady = await RedisConnection.ping();

    const isReady = mongoReady; // Mongo is critical; Redis might be optional in local dev
    const statusData = {
      status: isReady ? 'READY' : 'DEGRADED',
      database: mongoReady ? 'CONNECTED' : 'DISCONNECTED',
      redis: redisReady ? 'CONNECTED' : 'DISCONNECTED',
      environment: envConfig.NODE_ENV,
      timestamp: new Date().toISOString(),
    };

    if (isReady) {
      ApiResponse.success(res, statusData, 'Service is ready to accept traffic');
    } else {
      ApiResponse.error(res, 'Service dependencies are unavailable', 503, statusData);
    }
  });

  // Backwards compatible /health
  app.get('/health', (_req: Request, res: Response) => {
    ApiResponse.success(
      res,
      {
        status: 'UP',
        environment: envConfig.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
      'Service is operational'
    );
  });

  // Domain Module Routes
  // Apply general API rate limiter globally to all API routes
  app.use('/api', apiLimiter);
  
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);

  // 404 Catch-All Handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};
