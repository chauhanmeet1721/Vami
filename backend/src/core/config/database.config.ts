import { envConfig } from './env.config';

export interface DatabaseConfig {
  uri: string;
  options: {
    autoIndex: boolean;
    serverSelectionTimeoutMS: number;
  };
}

export const databaseConfig: DatabaseConfig = {
  uri: envConfig.MONGO_URI,
  options: {
    autoIndex: !envConfig.isProduction,
    serverSelectionTimeoutMS: 5000,
  },
};
