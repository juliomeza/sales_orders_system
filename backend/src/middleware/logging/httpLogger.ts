// backend/src/middleware/logging/httpLogger.ts
import { Request, Response, NextFunction } from 'express';
import Logger from '../../config/logger';

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    Logger.http({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent') || '',
      ip: req.ip,
      userId: req.user?.userId || 'anonymous'
    });
  });

  next();
};