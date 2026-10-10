import crypto from 'crypto';
import { logger } from '../config/logger';

let argon2Module: any = null;
try {
  argon2Module = require('argon2');
} catch (e: any) {
  logger.warn(`Native argon2 module could not be loaded, using PBKDF2 fallback: ${e.message}`);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  if (hashed.startsWith('$argon2') && argon2Module) {
    try {
      return await argon2Module.verify(hashed, plain);
    } catch (err: any) {
      logger.debug(`Argon2 verification failed: ${err.message}`);
      return false;
    }
  } else {
    // Standard PBKDF2 verification fallback
    const salt = Buffer.from('PU_DEPT_PORTAL_SALT_VALUE_2026', 'utf-8');
    const legacyHash = crypto.pbkdf2Sync(plain, salt, 100000, 32, 'sha256').toString('hex');
    return legacyHash === hashed;
  }
}

export async function getPasswordHash(plain: string): Promise<string> {
  if (argon2Module) {
    try {
      return await argon2Module.hash(plain);
    } catch (err) {
      // fallback
    }
  }
  const salt = Buffer.from('PU_DEPT_PORTAL_SALT_VALUE_2026', 'utf-8');
  return crypto.pbkdf2Sync(plain, salt, 100000, 32, 'sha256').toString('hex');
}
