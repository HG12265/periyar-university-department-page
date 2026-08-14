import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';
import { getJwtSecret } from '../config/env';
import { primaryDB } from '../db';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { RowDataPacket } from 'mysql2';

const secret = new TextEncoder().encode(getJwtSecret());

// Extensible Hierarchical Role-Based Access Control (RBAC) Weightings
export const ROLE_HIERARCHY: Record<string, number> = {
  viewer: 1,
  editor: 2,
  content_editor: 2,
  faculty_editor: 3,
  dept_admin: 4,
  admin: 5,
  super_admin: 5,
  administrator: 5,
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies ? req.cookies['access_token'] : null;
    
    // Fallback to Bearer token in Authorization header
    const authHeader = req.headers['authorization'];
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token || token === 'undefined' || token === 'null') {
      throw new ApiError(401, 'Not authenticated. Please log in.');
    }

    let payload: jose.JWTPayload;
    try {
      const { payload: decodedPayload } = await jose.jwtVerify(token, secret);
      payload = decodedPayload;
    } catch (err: any) {
      logger.debug(`JWT verification failed: ${err.message}`);
      throw new ApiError(401, 'Invalid session token or login session expired');
    }

    if (!payload || !payload.sub) {
      throw new ApiError(401, 'Invalid session token payload');
    }

    const jti = payload.jti;
    const username = payload.sub;

    // Check Blacklist table for JTI
    if (jti) {
      const [blacklistRows] = await primaryDB.query<RowDataPacket[]>(
        'SELECT id FROM jti_blacklist WHERE jti = ? LIMIT 1',
        [jti]
      );
      if (blacklistRows.length > 0) {
        throw new ApiError(401, 'Session has been logged out. Please log in again.');
      }
    }

    // Query user by username
    const [userRows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT id, username, role FROM users WHERE username = ? LIMIT 1',
      [username]
    );

    if (userRows.length === 0) {
      throw new ApiError(401, 'User not found');
    }

    const user = userRows[0];
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Extensible Hierarchical Role-Based Access Control (RBAC) Guard
export const requireRole = (minRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Enforce getCurrentUser runs first
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const userRole = req.user.role ? req.user.role.toLowerCase() : 'viewer';
    const userRoleWeight = ROLE_HIERARCHY[userRole] || 0;
    const minRoleWeight = ROLE_HIERARCHY[minRole.toLowerCase()] || 0;

    if (userRoleWeight < minRoleWeight) {
      logger.warn(`SECURITY WARNING: User ${req.user.username} with role ${userRole} attempted to access route requiring ${minRole}`);
      return next(new ApiError(403, 'Forbidden. You do not have sufficient permissions.'));
    }

    next();
  };
};
