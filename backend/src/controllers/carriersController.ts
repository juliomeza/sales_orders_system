// backend/src/controllers/carriersController.ts
/**
 * Controlador que maneja todas las operaciones relacionadas con los transportistas
 * Incluye funcionalidades CRUD y gestión de servicios de transportistas
 */

import { Request, Response } from 'express';
import { CarrierServiceImpl } from '../services/carrierService';
import { ERROR_MESSAGES, LOG_MESSAGES } from '../shared/constants';
import { ApiErrorCode } from '../shared/types/base/responses';
import { createErrorResponse } from '../shared/utils/response';
import Logger from '../config/logger';

/**
 * Controlador principal de transportistas
 * Gestiona operaciones CRUD y consultas relacionadas con carriers
 */
export class CarriersController {
  constructor(private carrierService: CarrierServiceImpl) {}

  /**
   * Obtiene la lista completa de transportistas
   * @param req - Request de Express con datos del usuario autenticado
   * @param res - Response de Express para enviar la lista de transportistas
   */
  getCarriers = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        Logger.warn('Unauthorized access attempt to carriers list', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
        
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      Logger.debug(LOG_MESSAGES.CARRIERS.LIST.REQUEST, {
        userId: req.user.userId,
        filters: req.query
      });

      const result = await this.carrierService.getAllCarriers();

      if (!result.success) {
        Logger.error(LOG_MESSAGES.CARRIERS.LIST.FAILED, {
          userId: req.user.userId,
          error: result.error
        });

        // Mantener formato de respuesta original
        return res.status(500).json({ 
          error: result.error || ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.CARRIERS.LIST.SUCCESS, {
        userId: req.user.userId,
        count: result.data?.carriers.length || 0
      });

      // Mantener formato de respuesta original
      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.CARRIERS.LIST.FAILED, {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  };

  /**
   * Obtiene los detalles de un transportista específico por su ID
   * @param req - Request de Express con el ID del transportista
   * @param res - Response de Express con los detalles del transportista
   */
  getCarrierById = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        Logger.warn('Unauthorized access attempt to carrier details', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const id = Number(req.params.id);
      Logger.debug(LOG_MESSAGES.CARRIERS.GET.REQUEST, {
        userId: req.user.userId,
        carrierId: id
      });

      const result = await this.carrierService.getCarrierById(id);
      
      if (!result.success) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.CARRIER) {
          Logger.warn(LOG_MESSAGES.CARRIERS.GET.FAILED_NOT_FOUND, {
            userId: req.user.userId,
            carrierId: id
          });

          return res.status(404).json({
            error: result.error
          });
        }

        Logger.error(LOG_MESSAGES.CARRIERS.GET.FAILED, {
          userId: req.user.userId,
          carrierId: id,
          error: result.error
        });

        return res.status(500).json({ 
          error: result.error || ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.CARRIERS.GET.SUCCESS, {
        userId: req.user.userId,
        carrierId: id
      });

      // Mantener formato de respuesta original
      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      Logger.error(LOG_MESSAGES.CARRIERS.GET.FAILED, {
        userId: req.user?.userId || 'anonymous',
        carrierId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  };

  /**
   * Crea un nuevo transportista en el sistema
   * @param req - Request de Express con los datos del nuevo transportista
   * @param res - Response de Express con los datos del transportista creado
   */
  createCarrier = async (req: Request, res: Response) => {
    try {
      // Verificación de autenticación
      if (!req.user) {
        Logger.warn('Unauthorized access attempt to create carrier', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      // Registrar intento de creación
      Logger.info(LOG_MESSAGES.CARRIERS.CREATE.ATTEMPT, {
        userId: req.user.userId,
        carrierData: {
          lookupCode: req.body.lookupCode,
          name: req.body.name
        }
      });

      // Intentar crear el transportista
      const result = await this.carrierService.createCarrier(req.body);

      // Manejar casos de error
      if (!result.success) {
        // Error de validación
        if (result.errors) {
          Logger.warn(LOG_MESSAGES.CARRIERS.CREATE.FAILED_VALIDATION, {
            userId: req.user.userId,
            errors: result.errors
          });

          // Usar nuevo formato para errores de validación
          return res.status(400).json(
            createErrorResponse(
              ApiErrorCode.VALIDATION_ERROR,
              ERROR_MESSAGES.VALIDATION.FAILED,
              result.errors,
              req
            )
          );
        }

        // Código duplicado
        if (result.error === ERROR_MESSAGES.VALIDATION.LOOKUP_CODE_EXISTS) {
          Logger.warn(LOG_MESSAGES.CARRIERS.CREATE.FAILED_EXISTS, {
            userId: req.user.userId,
            lookupCode: req.body.lookupCode
          });

          // Usar nuevo formato para error de duplicado
          return res.status(409).json(
            createErrorResponse(
              ApiErrorCode.CONFLICT,
              result.error,
              undefined,
              req
            )
          );
        }

        // Error interno
        Logger.error(LOG_MESSAGES.CARRIERS.CREATE.FAILED, {
          userId: req.user.userId,
          error: result.error
        });

        return res.status(500).json({ 
          error: result.error || ERROR_MESSAGES.OPERATION.CREATE_ERROR 
        });
      }

      // Creación exitosa
      Logger.info(LOG_MESSAGES.CARRIERS.CREATE.SUCCESS, {
        userId: req.user.userId,
        carrierId: result.data?.id,
        lookupCode: result.data?.lookupCode
      });

      // Mantener formato de respuesta original para éxito
      res.status(201).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      Logger.error(LOG_MESSAGES.CARRIERS.CREATE.FAILED, {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR 
      });
    }
  };

  /**
   * Actualiza los datos de un transportista existente
   * @param req - Request de Express con ID y datos actualizados
   * @param res - Response de Express con los datos actualizados
   */
  updateCarrier = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        Logger.warn('Unauthorized access attempt to update carrier', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const id = Number(req.params.id);
      Logger.info(LOG_MESSAGES.CARRIERS.UPDATE.ATTEMPT, {
        userId: req.user.userId,
        carrierId: id,
        updateData: req.body
      });

      const result = await this.carrierService.updateCarrier(id, req.body);
      
      if (!result.success) {
        if (result.errors) {
          Logger.warn(LOG_MESSAGES.CARRIERS.UPDATE.FAILED_VALIDATION, {
            userId: req.user.userId,
            carrierId: id,
            errors: result.errors
          });

          // Usar nuevo formato para errores de validación
          return res.status(400).json(
            createErrorResponse(
              ApiErrorCode.VALIDATION_ERROR,
              ERROR_MESSAGES.VALIDATION.FAILED,
              result.errors,
              req
            )
          );
        }

        if (result.error === ERROR_MESSAGES.NOT_FOUND.CARRIER) {
          Logger.warn(LOG_MESSAGES.CARRIERS.UPDATE.FAILED_NOT_FOUND, {
            userId: req.user.userId,
            carrierId: id
          });

          // Usar nuevo formato para error not found
          return res.status(404).json(
            createErrorResponse(
              ApiErrorCode.NOT_FOUND,
              result.error,
              undefined,
              req
            )
          );
        }

        Logger.error(LOG_MESSAGES.CARRIERS.UPDATE.FAILED, {
          userId: req.user.userId,
          carrierId: id,
          error: result.error
        });

        return res.status(500).json({ 
          error: result.error || ERROR_MESSAGES.OPERATION.UPDATE_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.CARRIERS.UPDATE.SUCCESS, {
        userId: req.user.userId,
        carrierId: id
      });

      // Mantener formato de respuesta original para éxito
      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      Logger.error(LOG_MESSAGES.CARRIERS.UPDATE.FAILED, {
        userId: req.user?.userId || 'anonymous',
        carrierId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR 
      });
    }
  };

  /**
   * Obtiene la lista de servicios asociados a un transportista
   * @param req - Request de Express con el ID del transportista
   * @param res - Response de Express con la lista de servicios
   */
  getCarrierServices = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        Logger.warn('Unauthorized access attempt to carrier services', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const id = Number(req.params.id);
      Logger.debug(LOG_MESSAGES.CARRIERS.SERVICES.GET.REQUEST, {
        userId: req.user.userId,
        carrierId: id
      });

      const result = await this.carrierService.getCarrierById(id);
      
      if (!result.success || !result.data) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.CARRIER) {
          Logger.warn(LOG_MESSAGES.CARRIERS.SERVICES.GET.FAILED_NOT_FOUND, {
            userId: req.user.userId,
            carrierId: id
          });

          // Usar nuevo formato para error not found
          return res.status(404).json(
            createErrorResponse(
              ApiErrorCode.NOT_FOUND,
              result.error,
              undefined,
              req
            )
          );
        }

        Logger.error(LOG_MESSAGES.CARRIERS.SERVICES.GET.FAILED, {
          userId: req.user.userId,
          carrierId: id,
          error: result.error
        });

        return res.status(500).json({ 
          error: result.error || ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.CARRIERS.SERVICES.GET.SUCCESS, {
        userId: req.user.userId,
        carrierId: id,
        serviceCount: result.data.services.length
      });

      // Mantener formato de respuesta original
      res.json({
        success: true,
        data: result.data.services
      });
    } catch (error) {
      Logger.error(LOG_MESSAGES.CARRIERS.SERVICES.GET.FAILED, {
        userId: req.user?.userId || 'anonymous',
        carrierId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  };
}