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

import { AuthService } from '../services/authService';
import { UserRepository } from '../repositories/userRepository';
import { verifyPassword, getPasswordHash } from '../utils/crypto';
import { ApiError } from '../utils/ApiError';
import { primaryDB } from '../db';
import * as jose from 'jose';

jest.mock('../repositories/userRepository');
jest.mock('../utils/crypto');

describe('AuthService', () => {
  let mockConnection: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockConnection = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      query: jest.fn(),
    };

    (primaryDB.getConnection as jest.Mock).mockResolvedValue(mockConnection);
  });

  describe('login', () => {
    it('should throw 401 if user does not exist', async () => {
      (UserRepository.findByUsername as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.login('nonexistent', 'password')).rejects.toThrow(
        new ApiError(401, 'Invalid username or password')
      );
    });

    it('should throw 423 if account is locked', async () => {
      const lockedUntil = new Date(Date.now() + 600000); // Locked for 10 min
      (UserRepository.findByUsername as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'admin',
        hashed_password: 'hash',
        failed_login_attempts: 5,
        locked_until: lockedUntil,
      });

      await expect(AuthService.login('admin', 'password')).rejects.toThrow(
        new ApiError(423, 'Account is temporarily locked due to excessive failed attempts. Try again in 10 minute(s).')
      );
    });

    it('should increment lockout attempts and throw 401 on wrong password', async () => {
      (UserRepository.findByUsername as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'admin',
        hashed_password: 'hash',
        failed_login_attempts: 0,
        locked_until: null,
      });
      (verifyPassword as jest.Mock).mockResolvedValue(false);

      await expect(AuthService.login('admin', 'wrong_pass')).rejects.toThrow(
        new ApiError(401, 'Invalid username or password')
      );
      expect(UserRepository.updateFailedLoginAttempts).toHaveBeenCalledWith(1, 1, null);
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
      (UserRepository.findByUsername as jest.Mock).mockResolvedValue(mockUser);
      (verifyPassword as jest.Mock).mockResolvedValue(true);

      const result = await AuthService.login('admin', 'correct_pass');

      expect(primaryDB.getConnection).toHaveBeenCalled();
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(UserRepository.resetLockout).toHaveBeenCalledWith(mockUser.id, mockConnection);
      expect(UserRepository.storeRefreshToken).toHaveBeenCalled();
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
      (UserRepository.findByUsername as jest.Mock).mockResolvedValue(mockUser);
      (verifyPassword as jest.Mock).mockResolvedValue(true);
      (getPasswordHash as jest.Mock).mockResolvedValue('$argon2id$upgradedhash');

      await AuthService.login('admin', 'correct_pass');

      expect(getPasswordHash).toHaveBeenCalledWith('correct_pass');
      expect(UserRepository.updatePassword).toHaveBeenCalledWith(
        mockUser.id,
        '$argon2id$upgradedhash',
        mockConnection
      );
    });
  });

  describe('refresh', () => {
    it('should throw 401 if refresh token is not found in database', async () => {
      (UserRepository.findRefreshToken as jest.Mock).mockResolvedValue(null);
      (jose.jwtVerify as jest.Mock).mockResolvedValue({
        payload: { sub: 'admin', jti: 'test-jti' },
      });

      await expect(AuthService.refresh('dummyToken')).rejects.toThrow(
        new ApiError(401, 'Session has been logged out or token is invalid')
      );
    });

    it('should rotate tokens and delete old refresh token under transaction', async () => {
      const mockStoredToken = {
        id: 1,
        user_id: 10,
        token_hash: 'somehash',
        jti: 'test-jti',
        expires_at: new Date(Date.now() + 100000),
      };
      (UserRepository.findRefreshToken as jest.Mock).mockResolvedValue(mockStoredToken);
      (UserRepository.findByUsername as jest.Mock).mockResolvedValue({ id: 10, username: 'admin' });
      (jose.jwtVerify as jest.Mock).mockResolvedValue({
        payload: { sub: 'admin', jti: 'test-jti' },
      });

      const result = await AuthService.refresh('dummyToken');

      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(UserRepository.deleteRefreshToken).toHaveBeenCalledWith('cc111dababe54901d142e1198fa360aeefb28a3b3b279ce23e900f276c738394', mockConnection);
      expect(UserRepository.storeRefreshToken).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });
  });
});
