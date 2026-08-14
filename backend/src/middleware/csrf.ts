import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

export const verifyCsrf = (req: Request, res: Response, next: NextFunction) => {
  // Only verify for state-modifying HTTP methods
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const authHeader = req.headers['authorization'];
    const accessToken = req.cookies ? req.cookies['access_token'] : null;

    // If request has valid auth header or access_token cookie, allow request
    if ((authHeader && authHeader.startsWith('Bearer ')) || (accessToken && accessToken !== 'undefined' && accessToken !== 'null')) {
      return next();
    }

    // Enforce Double Submit Cookie verification for cookie-based sessions
    const csrfCookie = req.cookies ? req.cookies['csrf_token'] : null;
    const csrfHeader = req.headers['x-csrf-token'];

    if (csrfCookie && csrfHeader && csrfCookie === csrfHeader) {
      return next();
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    logger.warn(`SECURITY WARNING: CSRF guard blocked ${req.method} request from IP ${ip} due to missing/mismatched tokens!`);
    return next(new ApiError(403, 'CSRF verification failed. Request rejected.'));
  }
  
  next();
};

export default verifyCsrf;
