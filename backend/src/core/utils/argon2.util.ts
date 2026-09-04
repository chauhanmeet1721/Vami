import argon2 from 'argon2';

/**
 * Utility for hashing and verifying passwords using Argon2id
 */
export class Argon2Util {
  /**
   * Hashes plain text using Argon2id with OWASP-recommended parameters
   */
  static async hash(plainText: string): Promise<string> {
    return argon2.hash(plainText, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4,
    });
  }

  /**
   * Verifies a plain text against an Argon2 hash
   */
  static async verify(hash: string, plainText: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plainText);
    } catch {
      return false;
    }
  }
}
