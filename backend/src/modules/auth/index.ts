import { userRepository } from '../users';
import { MongoSessionRepository } from './repositories/mongo-session.repository';
import { MongoEmailVerificationRepository } from './repositories/email-verification.repository';
import { MongoPasswordResetRepository } from './repositories/password-reset.repository';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { createAuthRouter } from './routes/auth.routes';

// Instantiate module dependencies with Inversion of Control
export const sessionRepository = new MongoSessionRepository();
export const emailVerificationRepository = new MongoEmailVerificationRepository();
export const passwordResetRepository = new MongoPasswordResetRepository();
export const authService = new AuthService(
  userRepository,
  sessionRepository,
  emailVerificationRepository,
  passwordResetRepository
);
export const authController = new AuthController(authService);
export const authRouter = createAuthRouter(authController);

export * from './models/session.model';
export * from './repositories/session.repository.interface';
export * from './repositories/mongo-session.repository';
export * from './services/auth.service';
export * from './controllers/auth.controller';
export * from './dtos/auth.dto';
