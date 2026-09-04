import { MongoUserRepository } from './repositories/mongo-user.repository';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { createUserRouter } from './routes/user.routes';
import { MongoSessionRepository } from '../auth/repositories/mongo-session.repository';

// Instantiate module dependencies with Inversion of Control
// Session repo imported by path (not ../auth barrel) to avoid circular DI with auth module.
export const userRepository = new MongoUserRepository();
const sessionRepository = new MongoSessionRepository();
export const userService = new UserService(userRepository, sessionRepository);
export const userController = new UserController(userService);
export const userRouter = createUserRouter(userController);

export * from './models/user.model';
export * from './repositories/user.repository.interface';
export * from './services/user.service';
export * from './controllers/user.controller';
export * from './dtos/user.dto';
