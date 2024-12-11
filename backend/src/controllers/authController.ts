// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/auth/authService';
import { UserRepository } from '../repositories/userRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES, LOG_MESSAGES } from '../shared/constants';
import { ApiErrorCode } from '../shared/types/responses';
import { createErrorResponse } from '../shared/utils/response';
import Logger from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET!;

export class AuthController {
  private authService: AuthService;

  constructor(authService?: AuthService) {
    this.authService = authService || new AuthService(
      new UserRepository(prisma),
      JWT_SECRET
    );

    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  async login(req: Request, res: Response) {
    const { email } = req.body;

    Logger.info(LOG_MESSAGES.AUTH.LOGIN.ATTEMPT, {
      email,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    const result = await this.authService.login(req.body);
    
    if (!result.success) {
      Logger.warn(LOG_MESSAGES.AUTH.LOGIN.FAILED, {
        email,
        error: result.error,
        ip: req.ip
      });

      return res.status(401).json({ 
        error: ERROR_MESSAGES.AUTHENTICATION.INVALID_CREDENTIALS 
      });
    }

    Logger.info(LOG_MESSAGES.AUTH.LOGIN.SUCCESS, {
      userId: result.data?.user.id,
      email,
      role: result.data?.user.role
    });

    // Mantener el formato de respuesta original
    res.json(result.data);
  }

  async register(req: Request, res: Response) {
    const { email, role } = req.body;

    Logger.info(LOG_MESSAGES.AUTH.REGISTRATION.ATTEMPT, {
      email,
      role,
      initiatedBy: req.user?.userId
    });

    const result = await this.authService.register(req.body);
    
    if (!result.success) {
      if (result.error === ERROR_MESSAGES.AUTHENTICATION.USER_EXISTS) {
        Logger.warn(LOG_MESSAGES.AUTH.REGISTRATION.FAILED_USER_EXISTS, {
          email,
          initiatedBy: req.user?.userId
        });

        return res.status(409).json(
          createErrorResponse(
            ApiErrorCode.CONFLICT,
            ERROR_MESSAGES.AUTHENTICATION.USER_EXISTS,
            undefined,
            req
          )
        );
      }

      if (result.errors) {
        Logger.warn(LOG_MESSAGES.AUTH.REGISTRATION.FAILED_VALIDATION, {
          email,
          errors: result.errors,
          initiatedBy: req.user?.userId
        });

        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.FAILED,
          details: result.errors
        });
      }

      Logger.error(LOG_MESSAGES.AUTH.REGISTRATION.FAILED_INTERNAL, {
        email,
        error: result.error,
        initiatedBy: req.user?.userId
      });

      return res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR 
      });
    }

    Logger.info(LOG_MESSAGES.AUTH.REGISTRATION.SUCCESS, {
      newUserId: result.data?.user.id,
      email,
      role: result.data?.user.role,
      initiatedBy: req.user?.userId
    });

    // Mantener formato de respuesta original
    res.status(201).json(result.data);
  }

  async getCurrentUser(req: Request, res: Response) {
    if (!req.user) {
      Logger.warn(LOG_MESSAGES.AUTH.CURRENT_USER.FAILED_NO_USER, {
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      return res.status(401).json({ 
        error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
      });
    }

    Logger.debug(LOG_MESSAGES.AUTH.CURRENT_USER.REQUEST, {
      userId: req.user.userId
    });

    const result = await this.authService.getCurrentUser(req.user.userId);
    
    if (!result.success) {
      if (result.error === ERROR_MESSAGES.NOT_FOUND.USER) {
        Logger.warn(LOG_MESSAGES.AUTH.CURRENT_USER.FAILED_NOT_FOUND, {
          userId: req.user.userId
        });

        return res.status(404).json({ 
          error: ERROR_MESSAGES.NOT_FOUND.USER 
        });
      }

      Logger.error(LOG_MESSAGES.AUTH.CURRENT_USER.FAILED_INTERNAL, {
        userId: req.user.userId,
        error: result.error
      });

      return res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }

    Logger.debug(LOG_MESSAGES.AUTH.CURRENT_USER.SUCCESS, {
      userId: req.user.userId
    });

    // Mantener formato de respuesta original
    res.json(result.data);
  }

  async refreshToken(req: Request, res: Response) {
    if (!req.user) {
      Logger.warn(LOG_MESSAGES.AUTH.TOKEN.FAILED_NO_USER, {
        ip: req.ip
      });

      return res.status(401).json({ 
        error: ERROR_MESSAGES.AUTHENTICATION.INVALID_TOKEN 
      });
    }

    Logger.debug(LOG_MESSAGES.AUTH.TOKEN.REQUEST, {
      userId: req.user.userId
    });

    const result = await this.authService.refreshToken(req.user.userId);
    
    if (!result.success) {
      Logger.warn(LOG_MESSAGES.AUTH.TOKEN.FAILED, {
        userId: req.user.userId,
        error: result.error
      });

      return res.status(401).json({ 
        error: ERROR_MESSAGES.AUTHENTICATION.INVALID_TOKEN 
      });
    }

    Logger.info(LOG_MESSAGES.AUTH.TOKEN.SUCCESS, {
      userId: req.user.userId
    });

    // Mantener el formato de respuesta original
    res.json({ token: result.data });
  }
}

export const authController = new AuthController();