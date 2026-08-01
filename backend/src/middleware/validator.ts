import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodIssue } from 'zod';
import { ApiError } from '../utils/ApiError';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Format validation errors to match FastAPI's RequestValidationError format
      const formattedErrors = result.error.issues.map((err: ZodIssue) => ({
        loc: ['body', ...err.path.map(String)],
        msg: err.message,
        type: err.code,
      }));
      return next(new ApiError(422, 'Request validation failed', formattedErrors));
    }
    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const formattedErrors = result.error.issues.map((err: ZodIssue) => ({
        loc: ['query', ...err.path.map(String)],
        msg: err.message,
        type: err.code,
      }));
      return next(new ApiError(422, 'Query parameter validation failed', formattedErrors));
    }
    req.query = result.data as any;
    next();
  };
};
