import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    logger.warn(`SECURITY ALERT: IP ${ip} breached global rate-limiting threshold!`);
    next(new ApiError(429, 'Rate limit exceeded. Please try again later.'));
  },
});

export const loginRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 attempts per minute (matches Python's @limiter.limit("5/minute"))
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    logger.warn(`SECURITY ALERT: IP ${ip} breached admin login rate-limiting threshold!`);
    next(new ApiError(429, 'Rate limit exceeded. Please slow down.'));
  },
});
