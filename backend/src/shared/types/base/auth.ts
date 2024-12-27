// backend/src/shared/types/base/auth.ts
import { Request } from 'express';

export interface AuthUser {
  userId: number;
  email: string;
  role: string;
  customerId: number;
  lookupCode: string;
  status: number;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}