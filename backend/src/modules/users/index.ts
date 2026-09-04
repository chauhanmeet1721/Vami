import { MongoUserRepository } from './repositories/mongo-user.repository';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { createUserRouter } from './routes/user.routes';

// Instantiate module dependencies with Inversion of Control
export const userRepository = new MongoUserRepository();
export const userService = new UserService(userRepository);
export const userController = new UserController(userService);
export const userRouter = createUserRouter(userController);

export * from './models/user.model';
export * from './repositories/user.repository.interface';
export * from './services/user.service';
export * from './controllers/user.controller';
export * from './dtos/user.dto';
