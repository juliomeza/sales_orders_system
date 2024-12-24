// backend/src/controllers/shipToController.ts
/**
 * Controlador que maneja todas las operaciones relacionadas con direcciones de envío
 * Incluye funcionalidades para listar, crear y gestionar direcciones de envío y facturación
 */

import { Request, Response } from 'express';
import { ShipToService } from '../services/shipToService';
import { ShipToRepository } from '../repositories/shipToRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES, ROLES, LOG_MESSAGES } from '../shared/constants';
import { ApiErrorCode } from '../shared/types';
import { createErrorResponse } from '../shared/utils/response';
import Logger from '../config/logger';
import { Role } from '../shared/types';

/**
 * Controlador principal de direcciones de envío
 * Gestiona operaciones CRUD y consultas relacionadas con direcciones
 */
export class ShipToController {
  private shipToService: ShipToService;

  /**
   * Constructor del controlador de direcciones
   * @param shipToService - Servicio de direcciones opcional para inyección de dependencias
   */
  constructor(shipToService?: ShipToService) {
    this.shipToService = shipToService || new ShipToService(
      new ShipToRepository(prisma)
    );
    this.bindMethods();
  }

  /**
   * Vincula los métodos del controlador al contexto actual
   */
  private bindMethods() {
    this.list = this.list.bind(this);
    this.create = this.create.bind(this);
    this.getBillingAddresses = this.getBillingAddresses.bind(this);
  }

  /**
   * Verifica si un rol corresponde a un cliente
   * @param role - Rol del usuario a verificar
   * @returns true si el rol es cliente, false en caso contrario
   */
  private isClient(role: Role): boolean {
    return role === ROLES.CLIENT;
  }

  /**
   * Valida que exista un ID de cliente válido
   * @param customerId - ID del cliente a validar
   * @returns true si el ID es válido, false en caso contrario
   */
  private validateCustomerId(customerId: number | null | undefined): boolean {
    return customerId !== null && customerId !== undefined;
  }

  /**
   * Lista las direcciones de envío de un cliente
   * Solo disponible para usuarios con rol cliente
   * @param req - Request con datos del usuario autenticado
   * @param res - Response con lista de direcciones
   */
  async list(req: Request, res: Response) {
    try {
      // Verificación de autenticación
      if (!req.user) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.LIST.FAILED_AUTH, {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(401).json(
          createErrorResponse(
            ApiErrorCode.UNAUTHORIZED,
            ERROR_MESSAGES.AUTHENTICATION.REQUIRED,
            undefined,
            req
          )
        );
      }

      // Validación de permisos y cliente
      const { customerId, role } = req.user;
      const userRole = role as Role;

      if (!this.isClient(userRole)) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.LIST.FAILED_ROLE, {
          userId: req.user.userId,
          role: userRole
        });

        return res.status(403).json(
          createErrorResponse(
            ApiErrorCode.FORBIDDEN,
            ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED,
            undefined,
            req
          )
        );
      }

      // Validación de ID de cliente
      if (!this.validateCustomerId(customerId)) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.LIST.FAILED_CUSTOMER, {
          userId: req.user.userId
        });

        return res.status(400).json(
          createErrorResponse(
            ApiErrorCode.VALIDATION_ERROR,
            ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('customerId'),
            undefined,
            req
          )
        );
      }

      Logger.debug(LOG_MESSAGES.SHIP_TO.LIST.REQUEST, {
        userId: req.user.userId,
        customerId
      });

      // Obtener y procesar direcciones
      const result = await this.shipToService.getAddresses(customerId as number);

      if (!result.success) {
        Logger.error(LOG_MESSAGES.SHIP_TO.LIST.FAILED, {
          userId: req.user.userId,
          customerId,
          error: result.error
        });

        return res.status(500).json(
          createErrorResponse(
            ApiErrorCode.INTERNAL_ERROR,
            ERROR_MESSAGES.OPERATION.LIST_ERROR,
            undefined,
            req
          )
        );
      }

      Logger.info(LOG_MESSAGES.SHIP_TO.LIST.SUCCESS, {
        userId: req.user.userId,
        customerId,
        addressCount: result.data?.addresses.length
      });

      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.SHIP_TO.LIST.FAILED, {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json(
        createErrorResponse(
          ApiErrorCode.INTERNAL_ERROR,
          ERROR_MESSAGES.OPERATION.LIST_ERROR,
          undefined,
          req
        )
      );
    }
  }

  /**
   * Crea una nueva dirección de envío
   * Requiere autenticación y rol de cliente
   * @param req - Request con datos de la nueva dirección
   * @param res - Response con la dirección creada
   */
  async create(req: Request, res: Response) {
    try {
      // Verificaciones de seguridad
      if (!req.user) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.CREATE.FAILED_AUTH, {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(401).json(
          createErrorResponse(
            ApiErrorCode.UNAUTHORIZED,
            ERROR_MESSAGES.AUTHENTICATION.REQUIRED,
            undefined,
            req
          )
        );
      }

      // Validaciones de rol y cliente
      const { customerId, role } = req.user;
      const userRole = role as Role;

      // Verificación de permisos
      if (!this.isClient(userRole)) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.CREATE.FAILED_ROLE, {
          userId: req.user.userId,
          role: userRole
        });

        return res.status(403).json(
          createErrorResponse(
            ApiErrorCode.FORBIDDEN,
            ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED,
            undefined,
            req
          )
        );
      }

      if (!this.validateCustomerId(customerId)) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.CREATE.FAILED_CUSTOMER, {
          userId: req.user.userId
        });

        return res.status(400).json(
          createErrorResponse(
            ApiErrorCode.VALIDATION_ERROR,
            ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('customerId'),
            undefined,
            req
          )
        );
      }

      // Registro y creación de dirección
      Logger.info(LOG_MESSAGES.SHIP_TO.CREATE.ATTEMPT, {
        userId: req.user.userId,
        customerId,
        addressData: {
          name: req.body.name,
          city: req.body.city,
          state: req.body.state
        }
      });

      const result = await this.shipToService.createAddress(
        req.body,
        customerId as number
      );

      // Procesar resultado
      if (!result.success) {
        if (result.errors) {
          Logger.warn(LOG_MESSAGES.SHIP_TO.CREATE.FAILED_VALIDATION, {
            userId: req.user.userId,
            customerId,
            errors: result.errors
          });

          return res.status(400).json(
            createErrorResponse(
              ApiErrorCode.VALIDATION_ERROR,
              ERROR_MESSAGES.VALIDATION.FAILED,
              result.errors,
              req
            )
          );
        }

        Logger.error(LOG_MESSAGES.SHIP_TO.CREATE.FAILED, {
          userId: req.user.userId,
          customerId,
          error: result.error
        });

        return res.status(500).json(
          createErrorResponse(
            ApiErrorCode.INTERNAL_ERROR,
            ERROR_MESSAGES.OPERATION.CREATE_ERROR,
            undefined,
            req
          )
        );
      }

      Logger.info(LOG_MESSAGES.SHIP_TO.CREATE.SUCCESS, {
        userId: req.user.userId,
        customerId,
        addressId: result.data?.id
      });

      res.status(201).json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.SHIP_TO.CREATE.FAILED, {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json(
        createErrorResponse(
          ApiErrorCode.INTERNAL_ERROR,
          ERROR_MESSAGES.OPERATION.CREATE_ERROR,
          undefined,
          req
        )
      );
    }
  }

  /**
   * Obtiene las direcciones de facturación de un cliente
   * Solo disponible para usuarios con rol cliente
   * @param req - Request con datos del usuario autenticado
   * @param res - Response con lista de direcciones de facturación
   */
  async getBillingAddresses(req: Request, res: Response) {
    try {
      // Verificaciones de seguridad y permisos
      if (!req.user) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.BILLING.FAILED_AUTH, {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(401).json(
          createErrorResponse(
            ApiErrorCode.UNAUTHORIZED,
            ERROR_MESSAGES.AUTHENTICATION.REQUIRED,
            undefined,
            req
          )
        );
      }

      const { customerId, role } = req.user;
      const userRole = role as Role;

      // Validaciones de acceso
      if (!this.isClient(userRole)) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.BILLING.FAILED_ROLE, {
          userId: req.user.userId,
          role: userRole
        });

        return res.status(403).json(
          createErrorResponse(
            ApiErrorCode.FORBIDDEN,
            ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED,
            undefined,
            req
          )
        );
      }

      if (!this.validateCustomerId(customerId)) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.BILLING.FAILED_CUSTOMER, {
          userId: req.user.userId
        });

        return res.status(400).json(
          createErrorResponse(
            ApiErrorCode.VALIDATION_ERROR,
            ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('customerId'),
            undefined,
            req
          )
        );
      }

      Logger.debug(LOG_MESSAGES.SHIP_TO.BILLING.REQUEST, {
        userId: req.user.userId,
        customerId
      });

      // Obtener y procesar direcciones de facturación
      const result = await this.shipToService.getBillingAddresses(customerId as number);

      if (!result.success) {
        Logger.error(LOG_MESSAGES.SHIP_TO.BILLING.FAILED, {
          userId: req.user.userId,
          customerId,
          error: result.error
        });

        return res.status(500).json(
          createErrorResponse(
            ApiErrorCode.INTERNAL_ERROR,
            ERROR_MESSAGES.OPERATION.LIST_ERROR,
            undefined,
            req
          )
        );
      }

      Logger.info(LOG_MESSAGES.SHIP_TO.BILLING.SUCCESS, {
        userId: req.user.userId,
        customerId,
        addressCount: result.data?.addresses.length
      });

      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.SHIP_TO.BILLING.FAILED, {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json(
        createErrorResponse(
          ApiErrorCode.INTERNAL_ERROR,
          ERROR_MESSAGES.OPERATION.LIST_ERROR,
          undefined,
          req
        )
      );
    }
  }
}

// Exportar instancia única del controlador
export const shipToController = new ShipToController();