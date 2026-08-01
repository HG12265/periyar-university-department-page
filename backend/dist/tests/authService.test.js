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
Object.defineProperty(exports, "__esModule", { value: true });
// Mock db first before any imports to prevent database pool instantiation
jest.mock('../db', () => {
    return {
        primaryDB: {
            getConnection: jest.fn(),
            query: jest.fn(),
        },
        resumeDB: {
            getConnection: jest.fn(),
            query: jest.fn(),
        },
        testDbConnections: jest.fn(),
        closeDbPools: jest.fn(),
    };
});
// Mock jose module to avoid ES modules import parsing errors
jest.mock('jose', () => ({
    SignJWT: class {
        setProtectedHeader() { return this; }
        setSubject() { return this; }
        setJti() { return this; }
        setIssuedAt() { return this; }
        setNotBefore() { return this; }
        setExpirationTime() { return this; }
        sign() { return Promise.resolve('mocked_token'); }
    },
    jwtVerify: jest.fn(),
}));
const authService_1 = require("../services/authService");
const userRepository_1 = require("../repositories/userRepository");
const crypto_1 = require("../utils/crypto");
const ApiError_1 = require("../utils/ApiError");
const db_1 = require("../db");
const jose = __importStar(require("jose"));
jest.mock('../repositories/userRepository');
jest.mock('../utils/crypto');
describe('AuthService', () => {
    let mockConnection;
    beforeEach(() => {
        jest.clearAllMocks();
        mockConnection = {
            beginTransaction: jest.fn().mockResolvedValue(undefined),
            commit: jest.fn().mockResolvedValue(undefined),
            rollback: jest.fn().mockResolvedValue(undefined),
            release: jest.fn().mockResolvedValue(undefined),
            query: jest.fn(),
        };
        db_1.primaryDB.getConnection.mockResolvedValue(mockConnection);
    });
    describe('login', () => {
        it('should throw 401 if user does not exist', async () => {
            userRepository_1.UserRepository.findByUsername.mockResolvedValue(null);
            await expect(authService_1.AuthService.login('nonexistent', 'password')).rejects.toThrow(new ApiError_1.ApiError(401, 'Invalid username or password'));
        });
        it('should throw 423 if account is locked', async () => {
            const lockedUntil = new Date(Date.now() + 600000); // Locked for 10 min
            userRepository_1.UserRepository.findByUsername.mockResolvedValue({
                id: 1,
                username: 'admin',
                hashed_password: 'hash',
                failed_login_attempts: 5,
                locked_until: lockedUntil,
            });
            await expect(authService_1.AuthService.login('admin', 'password')).rejects.toThrow(new ApiError_1.ApiError(423, 'Account is temporarily locked due to excessive failed attempts. Try again in 10 minute(s).'));
        });
        it('should increment lockout attempts and throw 401 on wrong password', async () => {
            userRepository_1.UserRepository.findByUsername.mockResolvedValue({
                id: 1,
                username: 'admin',
                hashed_password: 'hash',
                failed_login_attempts: 0,
                locked_until: null,
            });
            crypto_1.verifyPassword.mockResolvedValue(false);
            await expect(authService_1.AuthService.login('admin', 'wrong_pass')).rejects.toThrow(new ApiError_1.ApiError(401, 'Invalid username or password'));
            expect(userRepository_1.UserRepository.updateFailedLoginAttempts).toHaveBeenCalledWith(1, 1, null);
        });
        it('should complete login flow under transaction, reset lockouts, and return session tokens on success', async () => {
            const mockUser = {
                id: 1,
                username: 'admin',
                hashed_password: '$argon2id$v=19$m=65536,t=3,p=4$somehash',
                failed_login_attempts: 2,
                locked_until: null,
                role: 'super_admin',
            };
            userRepository_1.UserRepository.findByUsername.mockResolvedValue(mockUser);
            crypto_1.verifyPassword.mockResolvedValue(true);
            const result = await authService_1.AuthService.login('admin', 'correct_pass');
            expect(db_1.primaryDB.getConnection).toHaveBeenCalled();
            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(userRepository_1.UserRepository.resetLockout).toHaveBeenCalledWith(mockUser.id, mockConnection);
            expect(userRepository_1.UserRepository.storeRefreshToken).toHaveBeenCalled();
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('refresh_token');
            expect(result.username).toBe('admin');
            expect(result.role).toBe('super_admin');
        });
        it('should auto-upgrade legacy PBKDF2 password hashes to Argon2id under transaction', async () => {
            const mockUser = {
                id: 1,
                username: 'admin',
                hashed_password: 'pbkdf2_sha256$260000$legacyhash',
                failed_login_attempts: 0,
                locked_until: null,
                role: 'admin',
            };
            userRepository_1.UserRepository.findByUsername.mockResolvedValue(mockUser);
            crypto_1.verifyPassword.mockResolvedValue(true);
            crypto_1.getPasswordHash.mockResolvedValue('$argon2id$upgradedhash');
            await authService_1.AuthService.login('admin', 'correct_pass');
            expect(crypto_1.getPasswordHash).toHaveBeenCalledWith('correct_pass');
            expect(userRepository_1.UserRepository.updatePassword).toHaveBeenCalledWith(mockUser.id, '$argon2id$upgradedhash', mockConnection);
        });
    });
    describe('refresh', () => {
        it('should throw 401 if refresh token is not found in database', async () => {
            userRepository_1.UserRepository.findRefreshToken.mockResolvedValue(null);
            jose.jwtVerify.mockResolvedValue({
                payload: { sub: 'admin', jti: 'test-jti' },
            });
            await expect(authService_1.AuthService.refresh('dummyToken')).rejects.toThrow(new ApiError_1.ApiError(401, 'Session has been logged out or token is invalid'));
        });
        it('should rotate tokens and delete old refresh token under transaction', async () => {
            const mockStoredToken = {
                id: 1,
                user_id: 10,
                token_hash: 'somehash',
                jti: 'test-jti',
                expires_at: new Date(Date.now() + 100000),
            };
            userRepository_1.UserRepository.findRefreshToken.mockResolvedValue(mockStoredToken);
            userRepository_1.UserRepository.findByUsername.mockResolvedValue({ id: 10, username: 'admin' });
            jose.jwtVerify.mockResolvedValue({
                payload: { sub: 'admin', jti: 'test-jti' },
            });
            const result = await authService_1.AuthService.refresh('dummyToken');
            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(userRepository_1.UserRepository.deleteRefreshToken).toHaveBeenCalledWith('cc111dababe54901d142e1198fa360aeefb28a3b3b279ce23e900f276c738394', mockConnection);
            expect(userRepository_1.UserRepository.storeRefreshToken).toHaveBeenCalled();
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('refresh_token');
        });
    });
});
