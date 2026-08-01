"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const uuid_1 = require("uuid");
const env_1 = require("../config/env");
// Helper to set auth cookies on the response object
const setAuthCookies = (res, tokens) => {
    const isProd = env_1.env.NODE_ENV === 'production';
    // 1. Access Token Cookie (15 minutes)
    res.cookie('access_token', tokens.access_token, {
        httpOnly: true,
        secure: isProd, // True in production
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 mins in ms
        path: '/',
    });
    // 2. Refresh Token Cookie (7 days)
    res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        path: '/',
    });
    // 3. Double Submit CSRF Token Cookie (7 days, readable by client)
    const csrfToken = (0, uuid_1.v4)();
    res.cookie('csrf_token', csrfToken, {
        httpOnly: false,
        secure: isProd,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
    });
};
// Helper to clear auth cookies
const clearAuthCookies = (res) => {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.clearCookie('csrf_token', { path: '/' });
};
class AuthController {
    // POST /api/admin/login
    static async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const result = await authService_1.AuthService.login(username, password);
            // Set HttpOnly Cookies
            setAuthCookies(res, {
                access_token: result.access_token,
                refresh_token: result.refresh_token,
            });
            return res.status(200).json({
                success: true,
                data: {
                    status: 'success',
                    username: result.username,
                    role: result.role,
                    access_token: result.access_token,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/logout
    static async logout(req, res, next) {
        try {
            const accessToken = req.cookies ? req.cookies['access_token'] : undefined;
            const refreshToken = req.cookies ? req.cookies['refresh_token'] : undefined;
            await authService_1.AuthService.logout(accessToken, refreshToken);
            clearAuthCookies(res);
            return res.status(200).json({
                success: true,
                data: {
                    message: 'Logged out successfully',
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/refresh
    static async refresh(req, res, next) {
        try {
            let refreshToken = req.cookies ? req.cookies['refresh_token'] : null;
            // Fallback to Header if cookie missing
            const authHeader = req.headers['authorization'];
            if (!refreshToken && authHeader && authHeader.startsWith('Bearer ')) {
                refreshToken = authHeader.split(' ')[1];
            }
            const tokens = await authService_1.AuthService.refresh(refreshToken || '');
            setAuthCookies(res, tokens);
            return res.status(200).json({
                success: true,
                data: {
                    status: 'success',
                    access_token: tokens.access_token,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/admin/me
    static getMe(req, res, next) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Not authenticated' });
            }
            return res.status(200).json({
                success: true,
                data: {
                    id: req.user.id,
                    username: req.user.username,
                    role: req.user.role,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.default = AuthController;
