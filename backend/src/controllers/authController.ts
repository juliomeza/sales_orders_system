// backend/src/controllers/authController.ts
/**
 * Controlador de autenticación que maneja las operaciones relacionadas con la autenticación de usuarios.
 * Incluye funcionalidades para login, registro, obtención del usuario actual y renovación de tokens.
 */

// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { UserRepository } from '../repositories/userRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES, LOG_MESSAGES } from '../shared/constants';
import { ApiErrorCode } from '../shared/types/base/responses';
import { createErrorResponse } from '../shared/utils/response';
import Logger from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * Controlador principal de autenticación
 * Gestiona todas las operaciones relacionadas con la autenticación de usuarios
 */
export class AuthController {
  private authService: AuthService;

  /**
   * Constructor del controlador de autenticación
   * @param authService - Servicio de autenticación opcional para inyección de dependencias
   */
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

  /**
   * Maneja el proceso de inicio de sesión de usuarios
   * @param req - Request de Express que contiene las credenciales del usuario
   * @param res - Response de Express para enviar la respuesta al cliente
   * @returns Respuesta con el token y datos del usuario o error en caso de fallo
   */
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

  /**
   * Gestiona el registro de nuevos usuarios en el sistema
   * @param req - Request de Express con los datos del nuevo usuario
   * @param res - Response de Express para enviar la respuesta al cliente
   * @returns Respuesta con los datos del usuario creado o error en caso de fallo
   */
  async register(req: Request, res: Response) {
    // Extraer datos de la solicitud
    const { email, role } = req.body;

    // Registrar intento de registro
    Logger.info(LOG_MESSAGES.AUTH.REGISTRATION.ATTEMPT, {
      email,
      role,
      initiatedBy: req.user?.userId
    });

    // Intentar registrar al usuario
    const result = await this.authService.register(req.body);
    
    // Manejar diferentes casos de error
    if (!result.success) {
      // Usuario ya existe
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

      // Errores de validación
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

      // Error interno del servidor
      Logger.error(LOG_MESSAGES.AUTH.REGISTRATION.FAILED_INTERNAL, {
        email,
        error: result.error,
        initiatedBy: req.user?.userId
      });

      return res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR 
      });
    }

    // Registro exitoso
    Logger.info(LOG_MESSAGES.AUTH.REGISTRATION.SUCCESS, {
      newUserId: result.data?.user.id,
      email,
      role: result.data?.user.role,
      initiatedBy: req.user?.userId
    });

    // Mantener formato de respuesta original
    res.status(201).json(result.data);
  }

  /**
   * Obtiene la información del usuario actualmente autenticado
   * @param req - Request de Express que debe incluir el usuario autenticado
   * @param res - Response de Express para enviar la respuesta al cliente
   * @returns Datos del usuario actual o error si no está autenticado
   */
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

  /**
   * Renueva el token de autenticación para el usuario actual
   * @param req - Request de Express que debe incluir el usuario autenticado
   * @param res - Response de Express para enviar la respuesta al cliente
   * @returns Nuevo token de autenticación o error si no está autenticado
   */
  async refreshToken(req: Request, res: Response) {
    // Verificar si existe usuario autenticado
    if (!req.user) {
      Logger.warn(LOG_MESSAGES.AUTH.TOKEN.FAILED_NO_USER, {
        ip: req.ip
      });

      return res.status(401).json({ 
        error: ERROR_MESSAGES.AUTHENTICATION.INVALID_TOKEN 
      });
    }

    // Registrar solicitud de renovación de token
    Logger.debug(LOG_MESSAGES.AUTH.TOKEN.REQUEST, {
      userId: req.user.userId
    });

    // Intentar renovar el token
    const result = await this.authService.refreshToken(req.user.userId);
    
    // Manejar caso de error
    if (!result.success) {
      Logger.warn(LOG_MESSAGES.AUTH.TOKEN.FAILED, {
        userId: req.user.userId,
        error: result.error
      });

      return res.status(401).json({ 
        error: ERROR_MESSAGES.AUTHENTICATION.INVALID_TOKEN 
      });
    }

    // Token renovado exitosamente
    Logger.info(LOG_MESSAGES.AUTH.TOKEN.SUCCESS, {
      userId: req.user.userId
    });

    // Mantener el formato de respuesta original
    res.json({ token: result.data });
  }
}

// Exportar una instancia única del controlador
export const authController = new AuthController();