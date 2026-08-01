import argon2 from 'argon2';
import crypto from 'crypto';
import { logger } from '../config/logger';

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  if (hashed.startsWith('$argon2')) {
    try {
      return await argon2.verify(hashed, plain);
    } catch (err: any) {
      logger.debug(`Argon2 verification failed: ${err.message}`);
      return false;
    }
  } else {
    // Legacy PBKDF2 verification fallback
    const salt = Buffer.from('PU_DEPT_PORTAL_SALT_VALUE_2026', 'utf-8');
    const legacyHash = crypto.pbkdf2Sync(plain, salt, 100000, 32, 'sha256').toString('hex');
    return legacyHash === hashed;
  }
}

export async function getPasswordHash(plain: string): Promise<string> {
  return await argon2.hash(plain);
}
