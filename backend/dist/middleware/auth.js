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
exports.requireRole = exports.getCurrentUser = exports.ROLE_HIERARCHY = void 0;
const jose = __importStar(require("jose"));
const env_1 = require("../config/env");
const db_1 = require("../db");
const ApiError_1 = require("../utils/ApiError");
const logger_1 = require("../config/logger");
const secret = new TextEncoder().encode((0, env_1.getJwtSecret)());
// Extensible Hierarchical Role-Based Access Control (RBAC) Weightings
exports.ROLE_HIERARCHY = {
    viewer: 1,
    editor: 2,
    content_editor: 2,
    faculty_editor: 3,
    dept_admin: 4,
    admin: 5,
    super_admin: 5,
    administrator: 5,
};
const getCurrentUser = async (req, res, next) => {
    try {
        let token = req.cookies ? req.cookies['access_token'] : null;
        // Fallback to Bearer token in Authorization header
        const authHeader = req.headers['authorization'];
        if (!token && authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        if (!token || token === 'undefined' || token === 'null') {
            throw new ApiError_1.ApiError(401, 'Not authenticated. Please log in.');
        }
        let payload;
        try {
            const { payload: decodedPayload } = await jose.jwtVerify(token, secret);
            payload = decodedPayload;
        }
        catch (err) {
            logger_1.logger.debug(`JWT verification failed: ${err.message}`);
            throw new ApiError_1.ApiError(401, 'Invalid session token or login session expired');
        }
        if (!payload || !payload.sub) {
            throw new ApiError_1.ApiError(401, 'Invalid session token payload');
        }
        const jti = payload.jti;
        const username = payload.sub;
        // Check Blacklist table for JTI
        if (jti) {
            const [blacklistRows] = await db_1.primaryDB.query('SELECT id FROM jti_blacklist WHERE jti = ? LIMIT 1', [jti]);
            if (blacklistRows.length > 0) {
                throw new ApiError_1.ApiError(401, 'Session has been logged out. Please log in again.');
            }
        }
        // Query user by username
        const [userRows] = await db_1.primaryDB.query('SELECT id, username, role FROM users WHERE username = ? LIMIT 1', [username]);
        if (userRows.length === 0) {
            throw new ApiError_1.ApiError(401, 'User not found');
        }
        const user = userRows[0];
        req.user = {
            id: user.id,
            username: user.username,
            role: user.role,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.getCurrentUser = getCurrentUser;
// Extensible Hierarchical Role-Based Access Control (RBAC) Guard
const requireRole = (minRole) => {
    return (req, res, next) => {
        // Enforce getCurrentUser runs first
        if (!req.user) {
            return next(new ApiError_1.ApiError(401, 'Authentication required'));
        }
        const userRole = req.user.role ? req.user.role.toLowerCase() : 'viewer';
        const userRoleWeight = exports.ROLE_HIERARCHY[userRole] || 0;
        const minRoleWeight = exports.ROLE_HIERARCHY[minRole.toLowerCase()] || 0;
        if (userRoleWeight < minRoleWeight) {
            logger_1.logger.warn(`SECURITY WARNING: User ${req.user.username} with role ${userRole} attempted to access route requiring ${minRole}`);
            return next(new ApiError_1.ApiError(403, 'Forbidden. You do not have sufficient permissions.'));
        }
        next();
    };
};
exports.requireRole = requireRole;
