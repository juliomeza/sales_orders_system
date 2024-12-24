// backend/src/controllers/warehouseController.ts
/**
 * Controlador que maneja todas las operaciones relacionadas con almacenes
 * Incluye funcionalidades CRUD, estadísticas y gestión de almacenes del sistema
 */

import { Request, Response } from 'express';
import { WarehouseService } from '../services/warehouseService';
import { WarehouseRepository } from '../repositories/warehouseRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES, LOG_MESSAGES } from '../shared/constants';
import { ApiErrorCode } from '../shared/types';
import { createErrorResponse } from '../shared/utils/response';
import Logger from '../config/logger';

/**
 * Controlador principal de almacenes
 * Gestiona operaciones CRUD y consultas relacionadas con warehouses
 */
export class WarehouseController {
  private warehouseService: WarehouseService;

  /**
   * Constructor del controlador de almacenes
   * @param warehouseService - Servicio de almacenes opcional para inyección de dependencias
   */
  constructor(warehouseService?: WarehouseService) {
    this.warehouseService = warehouseService || new WarehouseService(
      new WarehouseRepository(prisma)
    );
    this.bindMethods();
  }

  /**
   * Vincula los métodos del controlador al contexto actual
   */
  private bindMethods() {
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getById = this.getById.bind(this);
    this.list = this.list.bind(this);
    this.getStats = this.getStats.bind(this);
  }

  /**
   * Crea un nuevo almacén en el sistema
   * @param req - Request con datos del nuevo almacén
   * @param res - Response con el almacén creado
   */
  async create(req: Request, res: Response) {
    try {
      // Verificación de autenticación
      if (!req.user) {
        Logger.warn(LOG_MESSAGES.WAREHOUSES.CREATE.FAILED_AUTH, {
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

      // Registro del intento de creación
      Logger.info(LOG_MESSAGES.WAREHOUSES.CREATE.ATTEMPT, {
        userId: req.user.userId,
        warehouseData: {
          lookupCode: req.body.lookupCode,
          name: req.body.name,
          city: req.body.city,
          state: req.body.state
        }
      });

      // Procesamiento de la creación
      const result = await this.warehouseService.createWarehouse(
        req.body,
        req.user.userId
      );

      // Manejo de errores y respuesta
      if (!result.success) {
        if (result.errors) {
          Logger.warn(LOG_MESSAGES.WAREHOUSES.CREATE.FAILED_VALIDATION, {
            userId: req.user.userId,
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

        Logger.error(LOG_MESSAGES.WAREHOUSES.CREATE.FAILED, {
          userId: req.user.userId,
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

      Logger.info(LOG_MESSAGES.WAREHOUSES.CREATE.SUCCESS, {
        userId: req.user.userId,
        warehouseId: result.data?.id,
        lookupCode: result.data?.lookupCode
      });

      res.status(201).json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.WAREHOUSES.CREATE.FAILED, {
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
   * Actualiza un almacén existente
   * @param req - Request con ID y datos de actualización
   * @param res - Response con el almacén actualizado
   */
  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        Logger.warn(LOG_MESSAGES.WAREHOUSES.UPDATE.FAILED_AUTH, {
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

      const { id } = req.params;

      Logger.info(LOG_MESSAGES.WAREHOUSES.UPDATE.ATTEMPT, {
        userId: req.user.userId,
        warehouseId: id,
        updateData: {
          name: req.body.name,
          status: req.body.status,
          customerCount: req.body.customerIds?.length
        }
      });

      const result = await this.warehouseService.updateWarehouse(
        Number(id),
        req.body,
        req.user.userId
      );

      if (!result.success) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.WAREHOUSE) {
          Logger.warn(LOG_MESSAGES.WAREHOUSES.UPDATE.FAILED_NOT_FOUND, {
            userId: req.user.userId,
            warehouseId: id
          });

          return res.status(404).json(
            createErrorResponse(
              ApiErrorCode.NOT_FOUND,
              ERROR_MESSAGES.NOT_FOUND.WAREHOUSE,
              undefined,
              req
            )
          );
        }

        if (result.errors) {
          Logger.warn(LOG_MESSAGES.WAREHOUSES.UPDATE.FAILED_VALIDATION, {
            userId: req.user.userId,
            warehouseId: id,
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

        Logger.error(LOG_MESSAGES.WAREHOUSES.UPDATE.FAILED, {
          userId: req.user.userId,
          warehouseId: id,
          error: result.error
        });

        return res.status(500).json(
          createErrorResponse(
            ApiErrorCode.INTERNAL_ERROR,
            ERROR_MESSAGES.OPERATION.UPDATE_ERROR,
            undefined,
            req
          )
        );
      }

      Logger.info(LOG_MESSAGES.WAREHOUSES.UPDATE.SUCCESS, {
        userId: req.user.userId,
        warehouseId: id
      });

      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.WAREHOUSES.UPDATE.FAILED, {
        userId: req.user?.userId || 'anonymous',
        warehouseId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json(
        createErrorResponse(
          ApiErrorCode.INTERNAL_ERROR,
          ERROR_MESSAGES.OPERATION.UPDATE_ERROR,
          undefined,
          req
        )
      );
    }
  }

  /**
   * Obtiene detalles de un almacén específico
   * Filtra acceso según rol del usuario
   * @param req - Request con ID del almacén
   * @param res - Response con detalles del almacén
   */
  async getById(req: Request, res: Response) {
    try {
      if (!req.user) {
        Logger.warn(LOG_MESSAGES.WAREHOUSES.GET.FAILED_AUTH, {
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

      const { id } = req.params;
      const customerId = req.user.role !== 'ADMIN' ? Number(req.user.customerId) : undefined;

      Logger.debug(LOG_MESSAGES.WAREHOUSES.GET.REQUEST, {
        userId: req.user.userId,
        warehouseId: id,
        customerId
      });

      const result = await this.warehouseService.getWarehouseById(
        Number(id),
        customerId
      );

      if (!result.success) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.WAREHOUSE) {
          Logger.warn(LOG_MESSAGES.WAREHOUSES.GET.FAILED_NOT_FOUND, {
            userId: req.user.userId,
            warehouseId: id
          });

          return res.status(404).json(
            createErrorResponse(
              ApiErrorCode.NOT_FOUND,
              ERROR_MESSAGES.NOT_FOUND.WAREHOUSE,
              undefined,
              req
            )
          );
        }

        Logger.error(LOG_MESSAGES.WAREHOUSES.GET.FAILED, {
          userId: req.user.userId,
          warehouseId: id,
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

      Logger.info(LOG_MESSAGES.WAREHOUSES.GET.SUCCESS, {
        userId: req.user.userId,
        warehouseId: id
      });

      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.WAREHOUSES.GET.FAILED, {
        userId: req.user?.userId || 'anonymous',
        warehouseId: req.params.id,
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
   * Lista almacenes con filtros opcionales y paginación
   * Implementa filtrado por cliente según rol
   * @param req - Request con parámetros de filtrado
   * @param res - Response con lista de almacenes
   */
  async list(req: Request, res: Response) {
    try {
      // Verificación de autenticación
      if (!req.user) {
        Logger.warn(LOG_MESSAGES.WAREHOUSES.LIST.FAILED_AUTH, {
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

      // Configuración de filtros
      const filters = {
        search: req.query.search as string,
        status: req.query.status ? Number(req.query.status) : undefined,
        city: req.query.city as string,
        state: req.query.state as string,
        customerId: req.user.role !== 'ADMIN' ? Number(req.user.customerId) : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20
      };

      // Registro de solicitud y procesamiento
      Logger.debug(LOG_MESSAGES.WAREHOUSES.LIST.REQUEST, {
        userId: req.user.userId,
        filters
      });

      const result = await this.warehouseService.listWarehouses(filters);

      if (!result.success) {
        if (result.errors) {
          Logger.warn(LOG_MESSAGES.WAREHOUSES.LIST.FAILED_VALIDATION, {
            userId: req.user.userId,
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

        Logger.error(LOG_MESSAGES.WAREHOUSES.LIST.FAILED, {
          userId: req.user.userId,
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

      Logger.info(LOG_MESSAGES.WAREHOUSES.LIST.SUCCESS, {
        userId: req.user.userId,
        count: result.data?.warehouses.length,
        totalPages: result.data?.pagination.totalPages
      });

      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.WAREHOUSES.LIST.FAILED, {
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
   * Elimina o desactiva un almacén
   * Maneja tanto eliminación física como lógica
   * @param req - Request con ID del almacén
   * @param res - Response con confirmación de eliminación
   */
  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        Logger.warn(LOG_MESSAGES.WAREHOUSES.DELETE.FAILED_AUTH, {
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

      const { id } = req.params;

      Logger.info(LOG_MESSAGES.WAREHOUSES.DELETE.ATTEMPT, {
        userId: req.user.userId,
        warehouseId: id
      });

      const result = await this.warehouseService.deleteWarehouse(Number(id));

      if (!result.success) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.WAREHOUSE) {
          Logger.warn(LOG_MESSAGES.WAREHOUSES.DELETE.FAILED_NOT_FOUND, {
            userId: req.user.userId,
            warehouseId: id
          });

          return res.status(404).json(
            createErrorResponse(
              ApiErrorCode.NOT_FOUND,
              ERROR_MESSAGES.NOT_FOUND.WAREHOUSE,
              undefined,
              req
            )
          );
        }

        Logger.error(LOG_MESSAGES.WAREHOUSES.DELETE.FAILED, {
          userId: req.user.userId,
          warehouseId: id,
          error: result.error
        });

        return res.status(500).json(
          createErrorResponse(
            ApiErrorCode.INTERNAL_ERROR,
            ERROR_MESSAGES.OPERATION.DELETE_ERROR,
            undefined,
            req
          )
        );
      }

      if (result.message) {
        Logger.info(LOG_MESSAGES.WAREHOUSES.DELETE.DEACTIVATED, {
          userId: req.user.userId,
          warehouseId: id,
          deactivatedAt: new Date()
        });

        return res.json({ 
          message: result.message,
          deactivatedAt: new Date(),
          deactivatedBy: req.user.userId
        });
      }

      Logger.info(LOG_MESSAGES.WAREHOUSES.DELETE.SUCCESS, {
        userId: req.user.userId,
        warehouseId: id
      });

      res.status(204).send();
    } catch (error) {
      Logger.error(LOG_MESSAGES.WAREHOUSES.DELETE.FAILED, {
        userId: req.user?.userId || 'anonymous',
        warehouseId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json(
        createErrorResponse(
          ApiErrorCode.INTERNAL_ERROR,
          ERROR_MESSAGES.OPERATION.DELETE_ERROR,
          undefined,
          req
        )
      );
    }
  }

  /**
   * Obtiene estadísticas generales de almacenes
   * Incluye totales y métricas relevantes
   * @param req - Request del usuario autenticado
   * @param res - Response con estadísticas
   */
  async getStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        Logger.warn(LOG_MESSAGES.WAREHOUSES.STATS.FAILED_AUTH, {
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

      Logger.debug(LOG_MESSAGES.WAREHOUSES.STATS.REQUEST, {
        userId: req.user.userId
      });

      const result = await this.warehouseService.getWarehouseStats();

      if (!result.success) {
        Logger.error(LOG_MESSAGES.WAREHOUSES.STATS.FAILED, {
          userId: req.user.userId,
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

      Logger.info(LOG_MESSAGES.WAREHOUSES.STATS.SUCCESS, {
        userId: req.user.userId,
        totalWarehouses: result.data?.summary.totalActiveWarehouses
      });

      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.WAREHOUSES.STATS.FAILED, {
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
export const warehouseController = new WarehouseController();