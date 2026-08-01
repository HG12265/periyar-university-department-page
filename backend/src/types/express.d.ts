import { Request } from 'express';

export interface AuthenticatedUser {
  id: number;
  username: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      id?: string;
    }
  }
}
