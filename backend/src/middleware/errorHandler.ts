import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || undefined,
    });
  }

  // Handle Multer file size limit gracefully
  if ((err as any).code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds the allowed limit (100MB maximum).',
    });
  }

  // Log unexpected / system errors using Pino
  logger.error({
    msg: 'Unhandled internal server error',
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred.',
  });
};

export default errorHandler;
