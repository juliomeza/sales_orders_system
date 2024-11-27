// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { STATUS, ROLES, ERROR_MESSAGES } from '../shared/constants';
import { Role, Status } from '../shared/types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: string;  // Mantenemos como string aquí también
        customerId: number | null;
        lookupCode: string;
        status: number;  // Mantenemos como number aquí también
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED });
    }

    const userData = verifyToken(token);
    if (userData.status !== STATUS.ACTIVE) {
      return res.status(403).json({ error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED });
    }

    req.user = userData;
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    return res.status(401).json({ error: ERROR_MESSAGES.AUTHENTICATION.INVALID_TOKEN });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED });
  }

  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED });
  }

  next();
};

export const requireSameCustomerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED });
  }

  if (req.user.role === ROLES.ADMIN) {
    return next();
  }

  const requestedCustomerId = parseInt(req.params.customerId);
  if (req.user.customerId !== requestedCustomerId) {
    return res.status(403).json({ error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED });
  }

  next();
};