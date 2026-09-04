/**
 * Ensures Mongoose indexes exist. Run after deploy when autoIndex is false in production.
 *
 * Usage: pnpm --filter backend exec tsx src/scripts/ensure-indexes.ts
 */
import { DatabaseConnection } from '../core/database/connection';
import { UserModel } from '../modules/users/models/user.model';
import { SessionModel } from '../modules/auth/models/session.model';
import { EmailVerificationModel } from '../modules/auth/models/email-verification.model';
import { PasswordResetModel } from '../modules/auth/models/password-reset.model';
import { logger } from '../core/utils/logger';

async function main() {
  await DatabaseConnection.connect();
  await Promise.all([
    UserModel.syncIndexes(),
    SessionModel.syncIndexes(),
    EmailVerificationModel.syncIndexes(),
    PasswordResetModel.syncIndexes(),
  ]);
  logger.info('[ensure-indexes] All model indexes synchronized');
  await DatabaseConnection.disconnect();
}

main().catch((err) => {
  logger.error({ err }, '[ensure-indexes] Failed');
  process.exit(1);
});
