import * as jose from 'jose';
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import crypto from 'crypto';
import { getJwtSecret, env } from '../config/env';
import { UserRepository, User } from '../repositories/userRepository';
import { verifyPassword, getPasswordHash } from '../utils/crypto';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { primaryDB } from '../db';

const jwtSecret = new TextEncoder().encode(getJwtSecret());

export interface TokenPayload {
  access_token: string;
  refresh_token: string;
  username: string;
  role: string;
}

export class AuthService {
  // Mint Access (15m) and Refresh (7d) tokens using jose
  static async createSessionTokens(username: string, conn?: any): Promise<{ access_token: string; refresh_token: string }> {
    const accessJti = uuidv4();
    const refreshJti = uuidv4();
    
    const now = Math.floor(Date.now() / 1000);
    const accessExp = now + 900;       // 15 minutes
    const refreshExp = now + 604800;   // 7 days

    const accessToken = await new jose.SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(username)
      .setJti(accessJti)
      .setIssuedAt(now)
      .setNotBefore(now)
      .setExpirationTime(accessExp)
      .sign(jwtSecret);

    const refreshToken = await new jose.SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(username)
      .setJti(refreshJti)
      .setIssuedAt(now)
      .setNotBefore(now)
      .setExpirationTime(refreshExp)
      .sign(jwtSecret);

    // Hash the refresh token using SHA-256 for DB storage
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    // Save to DB
    const user = await UserRepository.findByUsername(username);
    if (user) {
      const expiresDate = new Date(refreshExp * 1000);
      await UserRepository.storeRefreshToken(user.id, tokenHash, refreshJti, expiresDate, conn);
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // Handle Admin Login flow
  static async login(username: string, plain: string): Promise<TokenPayload> {
    const user = await UserRepository.findByUsername(username.trim());
    if (!user) {
      throw new ApiError(401, 'Invalid username or password');
    }

    // Check account lockout status
    if (user.locked_until) {
      const now = new Date();
      if (user.locked_until > now) {
        const diffMs = user.locked_until.getTime() - now.getTime();
        const mins = Math.ceil(diffMs / 60000);
        throw new ApiError(423, `Account is temporarily locked due to excessive failed attempts. Try again in ${mins} minute(s).`);
      } else {
        // Lock expired, reset failed attempts
        await UserRepository.resetLockout(user.id);
        user.failed_login_attempts = 0;
        user.locked_until = null;
      }
    }

    const verified = await verifyPassword(plain, user.hashed_password);
    if (!verified) {
      const newAttempts = user.failed_login_attempts + 1;
      let lockedUntil: Date | null = null;
      
      if (newAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60000); // Lock for 15 minutes
        logger.warn(`SECURITY ALERT: Admin account ${user.username} locked for 15 minutes after 5 consecutive failures!`);
      }
      
      await UserRepository.updateFailedLoginAttempts(user.id, newAttempts, lockedUntil);
      throw new ApiError(401, 'Invalid username or password');
    }

    // Reset lockouts and Dynamic password hashing upgrades executed under an atomic database transaction
    const conn = await primaryDB.getConnection();
    try {
      await conn.beginTransaction();

      if (user.failed_login_attempts > 0 || user.locked_until) {
        await UserRepository.resetLockout(user.id, conn);
      }

      if (!user.hashed_password.startsWith('$argon2')) {
        const newHashed = await getPasswordHash(plain);
        await UserRepository.updatePassword(user.id, newHashed, conn);
        logger.info(`SECURITY AUDIT: Password hash auto-upgraded to Argon2id for user ${user.username}`);
      }

      const tokens = await this.createSessionTokens(user.username, conn);
      
      await conn.commit();

      return {
        ...tokens,
        username: user.username,
        role: user.role,
      };
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }
  }

  // Handle Token Refresh flow
  static async refresh(refreshTokenStr: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const { payload } = await jose.jwtVerify(refreshTokenStr, jwtSecret);
      if (!payload || !payload.sub) {
        throw new ApiError(401, 'Invalid refresh token payload');
      }

      const tokenHash = crypto.createHash('sha256').update(refreshTokenStr).digest('hex');
      const storedToken = await UserRepository.findRefreshToken(tokenHash);
      
      if (!storedToken) {
        throw new ApiError(401, 'Session has been logged out or token is invalid');
      }

      // Token rotation updates executed under an atomic database transaction
      const conn = await primaryDB.getConnection();
      try {
        await conn.beginTransaction();

        if (storedToken.expires_at < new Date()) {
          await UserRepository.deleteRefreshToken(tokenHash, conn);
          throw new ApiError(401, 'Refresh token expired');
        }

        // Generate a new set of tokens (rotation)
        const tokens = await this.createSessionTokens(payload.sub, conn);
        
        // Delete the old refresh token from DB
        await UserRepository.deleteRefreshToken(tokenHash, conn);
        
        await conn.commit();
        return tokens;
      } catch (txErr) {
        await conn.rollback();
        throw txErr;
      } finally {
        conn.release();
      }
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(401, 'Invalid session refresh token');
    }
  }

  // Handle Admin Logout
  static async logout(accessTokenStr?: string, refreshTokenStr?: string): Promise<void> {
    // 1. Blacklist access token JTI if present
    if (accessTokenStr) {
      try {
        const { payload } = await jose.jwtVerify(accessTokenStr, jwtSecret);
        if (payload && payload.jti && payload.exp) {
          const expiresAt = new Date(payload.exp * 1000);
          await UserRepository.blacklistJti(payload.jti, expiresAt);
        }
      } catch (err) {
        // Decryption/expired fail is fine, skip blacklisting
      }
    }

    // 2. Delete refresh token record
    if (refreshTokenStr) {
      const tokenHash = crypto.createHash('sha256').update(refreshTokenStr).digest('hex');
      await UserRepository.deleteRefreshToken(tokenHash);
    }
  }

  // Auto-seed admin user at startup
  static async seedDefaultAdmin(): Promise<void> {
    if (!env.ENABLE_DEFAULT_ADMIN_SEED) {
      logger.info('Default admin seeding is disabled. (Set ENABLE_DEFAULT_ADMIN_SEED=true to enable)');
      return;
    }

    const adminUser = env.ADMIN_USERNAME;
    const adminPass = env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
      logger.warn('WARNING: ENABLE_DEFAULT_ADMIN_SEED is true, but ADMIN_USERNAME or ADMIN_PASSWORD is missing in the environment. Seeding skipped.');
      return;
    }

    try {
      const existingUser = await UserRepository.findByUsername(adminUser);
      if (!existingUser) {
        const hashed = await getPasswordHash(adminPass);
        await UserRepository.createUser(adminUser, hashed, 'super_admin');
        logger.info(`Default admin user '${adminUser}' seeded successfully!`);
      } else if (!existingUser.hashed_password.startsWith('$argon2')) {
        // Upgrade legacy admin seeds
        const upgradedHash = await getPasswordHash(adminPass);
        await UserRepository.updatePassword(existingUser.id, upgradedHash);
        logger.info(`Legacy admin user '${adminUser}' password upgraded to Argon2id.`);
      }
    } catch (err: any) {
      logger.error(`Auto-seeding default administrative user failed: ${err.message}`);
    }
  }

  // Hourly cron to clean expired refresh tokens and JTIs
  static startTokenCleanupJob(): void {
    cron.schedule('0 * * * *', async () => {
      try {
        const result = await UserRepository.cleanupExpiredTokens();
        logger.info(`Cron task: Cleaned expired tokens. Deleted refresh tokens: ${result.deletedRefresh}, blacklisted JTIs: ${result.deletedJti}`);
      } catch (err: any) {
        logger.error(`Cron task failed to clean expired tokens: ${err.message}`);
      }
    });
    logger.info('Hourly token cleanup cron job scheduled successfully.');
  }
}
