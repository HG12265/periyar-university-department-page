"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jose = __importStar(require("jose"));
const uuid_1 = require("uuid");
const node_cron_1 = __importDefault(require("node-cron"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const userRepository_1 = require("../repositories/userRepository");
const crypto_2 = require("../utils/crypto");
const ApiError_1 = require("../utils/ApiError");
const logger_1 = require("../config/logger");
const db_1 = require("../db");
const jwtSecret = new TextEncoder().encode((0, env_1.getJwtSecret)());
class AuthService {
    // Mint Access (15m) and Refresh (7d) tokens using jose
    static async createSessionTokens(username, conn) {
        const accessJti = (0, uuid_1.v4)();
        const refreshJti = (0, uuid_1.v4)();
        const now = Math.floor(Date.now() / 1000);
        const accessExp = now + 900; // 15 minutes
        const refreshExp = now + 604800; // 7 days
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
        const tokenHash = crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
        // Save to DB
        const user = await userRepository_1.UserRepository.findByUsername(username);
        if (user) {
            const expiresDate = new Date(refreshExp * 1000);
            await userRepository_1.UserRepository.storeRefreshToken(user.id, tokenHash, refreshJti, expiresDate, conn);
        }
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
    // Handle Admin Login flow
    static async login(username, plain) {
        const user = await userRepository_1.UserRepository.findByUsername(username.trim());
        if (!user) {
            throw new ApiError_1.ApiError(401, 'Invalid username or password');
        }
        // Check account lockout status
        if (user.locked_until) {
            const now = new Date();
            if (user.locked_until > now) {
                const diffMs = user.locked_until.getTime() - now.getTime();
                const mins = Math.ceil(diffMs / 60000);
                throw new ApiError_1.ApiError(423, `Account is temporarily locked due to excessive failed attempts. Try again in ${mins} minute(s).`);
            }
            else {
                // Lock expired, reset failed attempts
                await userRepository_1.UserRepository.resetLockout(user.id);
                user.failed_login_attempts = 0;
                user.locked_until = null;
            }
        }
        const verified = await (0, crypto_2.verifyPassword)(plain, user.hashed_password);
        if (!verified) {
            const newAttempts = user.failed_login_attempts + 1;
            let lockedUntil = null;
            if (newAttempts >= 5) {
                lockedUntil = new Date(Date.now() + 15 * 60000); // Lock for 15 minutes
                logger_1.logger.warn(`SECURITY ALERT: Admin account ${user.username} locked for 15 minutes after 5 consecutive failures!`);
            }
            await userRepository_1.UserRepository.updateFailedLoginAttempts(user.id, newAttempts, lockedUntil);
            throw new ApiError_1.ApiError(401, 'Invalid username or password');
        }
        // Reset lockouts and Dynamic password hashing upgrades executed under an atomic database transaction
        const conn = await db_1.primaryDB.getConnection();
        try {
            await conn.beginTransaction();
            if (user.failed_login_attempts > 0 || user.locked_until) {
                await userRepository_1.UserRepository.resetLockout(user.id, conn);
            }
            if (!user.hashed_password.startsWith('$argon2')) {
                const newHashed = await (0, crypto_2.getPasswordHash)(plain);
                await userRepository_1.UserRepository.updatePassword(user.id, newHashed, conn);
                logger_1.logger.info(`SECURITY AUDIT: Password hash auto-upgraded to Argon2id for user ${user.username}`);
            }
            const tokens = await this.createSessionTokens(user.username, conn);
            await conn.commit();
            return {
                ...tokens,
                username: user.username,
                role: user.role,
            };
        }
        catch (txErr) {
            await conn.rollback();
            throw txErr;
        }
        finally {
            conn.release();
        }
    }
    // Handle Token Refresh flow
    static async refresh(refreshTokenStr) {
        try {
            const { payload } = await jose.jwtVerify(refreshTokenStr, jwtSecret);
            if (!payload || !payload.sub) {
                throw new ApiError_1.ApiError(401, 'Invalid refresh token payload');
            }
            const tokenHash = crypto_1.default.createHash('sha256').update(refreshTokenStr).digest('hex');
            const storedToken = await userRepository_1.UserRepository.findRefreshToken(tokenHash);
            if (!storedToken) {
                throw new ApiError_1.ApiError(401, 'Session has been logged out or token is invalid');
            }
            // Token rotation updates executed under an atomic database transaction
            const conn = await db_1.primaryDB.getConnection();
            try {
                await conn.beginTransaction();
                if (storedToken.expires_at < new Date()) {
                    await userRepository_1.UserRepository.deleteRefreshToken(tokenHash, conn);
                    throw new ApiError_1.ApiError(401, 'Refresh token expired');
                }
                // Generate a new set of tokens (rotation)
                const tokens = await this.createSessionTokens(payload.sub, conn);
                // Delete the old refresh token from DB
                await userRepository_1.UserRepository.deleteRefreshToken(tokenHash, conn);
                await conn.commit();
                return tokens;
            }
            catch (txErr) {
                await conn.rollback();
                throw txErr;
            }
            finally {
                conn.release();
            }
        }
        catch (err) {
            if (err instanceof ApiError_1.ApiError)
                throw err;
            throw new ApiError_1.ApiError(401, 'Invalid session refresh token');
        }
    }
    // Handle Admin Logout
    static async logout(accessTokenStr, refreshTokenStr) {
        // 1. Blacklist access token JTI if present
        if (accessTokenStr) {
            try {
                const { payload } = await jose.jwtVerify(accessTokenStr, jwtSecret);
                if (payload && payload.jti && payload.exp) {
                    const expiresAt = new Date(payload.exp * 1000);
                    await userRepository_1.UserRepository.blacklistJti(payload.jti, expiresAt);
                }
            }
            catch (err) {
                // Decryption/expired fail is fine, skip blacklisting
            }
        }
        // 2. Delete refresh token record
        if (refreshTokenStr) {
            const tokenHash = crypto_1.default.createHash('sha256').update(refreshTokenStr).digest('hex');
            await userRepository_1.UserRepository.deleteRefreshToken(tokenHash);
        }
    }
    // Auto-seed admin user at startup
    static async seedDefaultAdmin() {
        if (!env_1.env.ENABLE_DEFAULT_ADMIN_SEED) {
            logger_1.logger.info('Default admin seeding is disabled. (Set ENABLE_DEFAULT_ADMIN_SEED=true to enable)');
            return;
        }
        const adminUser = env_1.env.ADMIN_USERNAME;
        const adminPass = env_1.env.ADMIN_PASSWORD;
        if (!adminUser || !adminPass) {
            logger_1.logger.warn('WARNING: ENABLE_DEFAULT_ADMIN_SEED is true, but ADMIN_USERNAME or ADMIN_PASSWORD is missing in the environment. Seeding skipped.');
            return;
        }
        try {
            const existingUser = await userRepository_1.UserRepository.findByUsername(adminUser);
            if (!existingUser) {
                const hashed = await (0, crypto_2.getPasswordHash)(adminPass);
                await userRepository_1.UserRepository.createUser(adminUser, hashed, 'super_admin');
                logger_1.logger.info(`Default admin user '${adminUser}' seeded successfully!`);
            }
            else if (!existingUser.hashed_password.startsWith('$argon2')) {
                // Upgrade legacy admin seeds
                const upgradedHash = await (0, crypto_2.getPasswordHash)(adminPass);
                await userRepository_1.UserRepository.updatePassword(existingUser.id, upgradedHash);
                logger_1.logger.info(`Legacy admin user '${adminUser}' password upgraded to Argon2id.`);
            }
        }
        catch (err) {
            logger_1.logger.error(`Auto-seeding default administrative user failed: ${err.message}`);
        }
    }
    // Hourly cron to clean expired refresh tokens and JTIs
    static startTokenCleanupJob() {
        node_cron_1.default.schedule('0 * * * *', async () => {
            try {
                const result = await userRepository_1.UserRepository.cleanupExpiredTokens();
                logger_1.logger.info(`Cron task: Cleaned expired tokens. Deleted refresh tokens: ${result.deletedRefresh}, blacklisted JTIs: ${result.deletedJti}`);
            }
            catch (err) {
                logger_1.logger.error(`Cron task failed to clean expired tokens: ${err.message}`);
            }
        });
        logger_1.logger.info('Hourly token cleanup cron job scheduled successfully.');
    }
}
exports.AuthService = AuthService;
