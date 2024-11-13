// backend/src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_EXPIRATION = '30m';

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  customerId: number | null;
  lookupCode: string;
  status: number;
}

export const generateToken = (user: User): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    customerId: user.customerId,
    lookupCode: user.lookupCode,
    status: user.status
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};