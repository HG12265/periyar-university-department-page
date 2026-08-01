import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { primaryDB } from '../db';

export interface User {
  id: number;
  username: string;
  hashed_password: string;
  role: string;
  failed_login_attempts: number;
  locked_until: Date | null;
}

export interface RefreshToken {
  id: number;
  user_id: number;
  token_hash: string;
  jti: string;
  expires_at: Date;
}

export class UserRepository {
  // Find user by username
  static async findByUsername(username: string): Promise<User | null> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT id, username, hashed_password, role, failed_login_attempts, locked_until FROM users WHERE username = ? LIMIT 1',
      [username]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      username: row.username,
      hashed_password: row.hashed_password,
      role: row.role,
      failed_login_attempts: row.failed_login_attempts,
      locked_until: row.locked_until ? new Date(row.locked_until) : null,
    };
  }

  // Find user by id
  static async findById(id: number): Promise<User | null> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT id, username, hashed_password, role, failed_login_attempts, locked_until FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      username: row.username,
      hashed_password: row.hashed_password,
      role: row.role,
      failed_login_attempts: row.failed_login_attempts,
      locked_until: row.locked_until ? new Date(row.locked_until) : null,
    };
  }

  // Create user (for seeding/admin setup)
  static async createUser(username: string, hashed: string, role = 'admin'): Promise<number> {
    const [result] = await primaryDB.query<ResultSetHeader>(
      'INSERT INTO users (username, hashed_password, role, failed_login_attempts) VALUES (?, ?, ?, 0)',
      [username, hashed, role]
    );
    return result.insertId;
  }

  // Update failed login count
  static async updateFailedLoginAttempts(id: number, attempts: number, lockedUntil: Date | null = null): Promise<void> {
    await primaryDB.query(
      'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
      [attempts, lockedUntil, id]
    );
  }

  // Reset login lockouts
  static async resetLockout(id: number, conn?: any): Promise<void> {
    const executor = conn || primaryDB;
    await executor.query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?',
      [id]
    );
  }

  // Update password (e.g. for dynamic hash upgrading)
  static async updatePassword(id: number, hashed: string, conn?: any): Promise<void> {
    const executor = conn || primaryDB;
    await executor.query(
      'UPDATE users SET hashed_password = ? WHERE id = ?',
      [hashed, id]
    );
  }

  // Store refresh token
  static async storeRefreshToken(userId: number, tokenHash: string, jti: string, expiresAt: Date, conn?: any): Promise<void> {
    const executor = conn || primaryDB;
    // Delete any existing/expired tokens for this user first
    await executor.query(
      'DELETE FROM refresh_tokens WHERE user_id = ? OR expires_at < NOW()',
      [userId]
    );
    // Insert new active token
    await executor.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, jti, expires_at) VALUES (?, ?, ?, ?)',
      [userId, tokenHash, jti, expiresAt]
    );
  }

  // Find refresh token hash in DB
  static async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT id, user_id, token_hash, jti, expires_at FROM refresh_tokens WHERE token_hash = ? LIMIT 1',
      [tokenHash]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      user_id: row.user_id,
      token_hash: row.token_hash,
      jti: row.jti,
      expires_at: new Date(row.expires_at),
    };
  }

  // Delete refresh token by hash
  static async deleteRefreshToken(tokenHash: string, conn?: any): Promise<void> {
    const executor = conn || primaryDB;
    await executor.query('DELETE FROM refresh_tokens WHERE token_hash = ?', [tokenHash]);
  }

  // Blacklist a JTI
  static async blacklistJti(jti: string, expiresAt: Date): Promise<void> {
    await primaryDB.query(
      'INSERT INTO jti_blacklist (jti, expires_at) VALUES (?, ?) ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at)',
      [jti, expiresAt]
    );
  }

  // Create Audit Log entry
  static async logAudit(requestId: string, userId: number | null, ipAddress: string, userAgent: string, action: string, resource: string, status: 'SUCCESS' | 'FAILURE'): Promise<void> {
    await primaryDB.query(
      'INSERT INTO audit_logs (timestamp, request_id, user_id, ip_address, user_agent, action, resource, status) VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?)',
      [requestId, userId, ipAddress, userAgent, action, resource, status]
    );
  }

  // Periodic cleanup of expired refresh tokens and JTIs
  static async cleanupExpiredTokens(): Promise<{ deletedRefresh: number; deletedJti: number }> {
    const [resultRefresh] = await primaryDB.query<ResultSetHeader>(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
    );
    const [resultJti] = await primaryDB.query<ResultSetHeader>(
      'DELETE FROM jti_blacklist WHERE expires_at < NOW()'
    );
    return {
      deletedRefresh: resultRefresh.affectedRows,
      deletedJti: resultJti.affectedRows,
    };
  }
}
