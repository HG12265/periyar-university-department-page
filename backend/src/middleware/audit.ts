import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/userRepository';
import { logger } from '../config/logger';

export const auditAction = (action: string, resource: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Intercept res.json to capture response status
    const originalJson = res.json;

    res.json = function (body: any) {
      const requestId = String(req.id || 'unknown');
      const userId = req.user ? req.user.id : null;
      
      // Determine client IP address
      const ipAddress =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        'unknown';
        
      const userAgent = req.headers['user-agent'] || 'unknown';
      const status = res.statusCode < 400 ? 'SUCCESS' : 'FAILURE';

      // Fire-and-forget log insertion to prevent slowing down request thread
      UserRepository.logAudit(requestId, userId, ipAddress, userAgent, action, resource, status)
        .catch((err) => {
          logger.error(`AUDIT LOGGING FAILURE: Failed to write audit record for action '${action}': ${err.message}`);
        });

      return originalJson.call(this, body);
    };

    next();
  };
};

export default auditAction;
