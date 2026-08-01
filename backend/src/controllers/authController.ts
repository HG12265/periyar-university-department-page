import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';

// Helper to set auth cookies on the response object
const setAuthCookies = (res: Response, tokens: { access_token: string; refresh_token: string }) => {
  const isProd = env.NODE_ENV === 'production';

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
  const csrfToken = uuidv4();
  res.cookie('csrf_token', csrfToken, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

// Helper to clear auth cookies
const clearAuthCookies = (res: Response) => {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/' });
  res.clearCookie('csrf_token', { path: '/' });
};

export class AuthController {
  
  // POST /api/admin/login
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const result = await AuthService.login(username, password);
      
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
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/logout
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken = req.cookies ? req.cookies['access_token'] : undefined;
      const refreshToken = req.cookies ? req.cookies['refresh_token'] : undefined;
      
      await AuthService.logout(accessToken, refreshToken);
      clearAuthCookies(res);

      return res.status(200).json({
        success: true,
        data: {
          message: 'Logged out successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/refresh
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      let refreshToken = req.cookies ? req.cookies['refresh_token'] : null;
      
      // Fallback to Header if cookie missing
      const authHeader = req.headers['authorization'];
      if (!refreshToken && authHeader && authHeader.startsWith('Bearer ')) {
        refreshToken = authHeader.split(' ')[1];
      }

      const tokens = await AuthService.refresh(refreshToken || '');
      
      setAuthCookies(res, tokens);

      return res.status(200).json({
        success: true,
        data: {
          status: 'success',
          access_token: tokens.access_token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/me
  static getMe(req: Request, res: Response, next: NextFunction) {
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
    } catch (error) {
      next(error);
    }
  }
}
export default AuthController;
