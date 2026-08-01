import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const reqId = (req.headers['x-request-id'] || uuidv4()) as string;
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
};

export default requestId;
