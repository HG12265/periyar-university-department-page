import pinoHttp from 'pino-http';
import { stdSerializers } from 'pino';
import { logger } from '../config/logger';

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req: any) => req.id,
  // Select appropriate log levels based on HTTP status codes
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  // Custom serializers to keep logs clean and GDPR-compliant
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      query: req.query,
      ip: (req.headers && req.headers['x-forwarded-for']) || (req.socket && req.socket.remoteAddress) || '',
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: stdSerializers.err,
  },
});

export default httpLogger;
