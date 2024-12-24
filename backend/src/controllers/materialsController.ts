// backend/src/controllers/materialsController.ts
/**
 * Controlador que maneja todas las operaciones relacionadas con materiales
 * Incluye funcionalidades para listar, buscar y obtener detalles de materiales,
 * así como gestionar unidades de medida (UOMs)
 */

import { Request, Response } from 'express';
import { MaterialService } from '../services/materialService';
import { MaterialRepository } from '../repositories/materialRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES, ROLES, LOG_MESSAGES } from '../shared/constants';
import { ApiErrorCode } from '../shared/types';
import { createErrorResponse } from '../shared/utils/response';
import Logger from '../config/logger';
import { MaterialFilters, MaterialSearchFilters } from '../domain/material';

/**
 * Controlador principal de materiales
 * Gestiona operaciones de consulta y búsqueda de materiales en el sistema
 */
export class MaterialsController {
  private materialService: MaterialService;

  /**
   * Constructor del controlador de materiales
   * @param materialService - Servicio de materiales opcional para inyección de dependencias
   */
  constructor(materialService?: MaterialService) {
    this.materialService = materialService || new MaterialService(
      new MaterialRepository(prisma)
    );

    this.list = this.list.bind(this);
    this.search = this.search.bind(this);
    this.getById = this.getById.bind(this);
    this.getUoms = this.getUoms.bind(this);
  }

  /**
   * Lista materiales con filtros opcionales y paginación
   * @param req - Request con parámetros de filtrado y usuario autenticado
   * @param res - Response con la lista de materiales filtrada
   */
  async list(req: Request, res: Response) {
    try {
      // Verificación de autenticación
      if (!req.user) {
        Logger.warn('Unauthorized access attempt to materials list', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      // Extracción de parámetros de consulta y configuración de filtros
      const { 
        search = '', 
        uom,
        status,
        page = '1', 
        limit = '20',
        projectId 
      } = req.query;

      // Validación de permisos y configuración de filtros por cliente
      const customerId = req.user.customerId;
      const isAdmin = req.user.role === ROLES.ADMIN;

      // Registro de solicitud
      Logger.debug(LOG_MESSAGES.MATERIALS.LIST.REQUEST, {
        userId: req.user.userId,
        filters: {
          search,
          uom,
          status,
          page,
          limit,
          projectId,
          customerId: !isAdmin ? customerId : undefined
        }
      });

      // Construcción de filtros
      const filters: MaterialFilters = {
        search: String(search),
        uom: uom ? String(uom) : undefined,
        status: status ? Number(status) : undefined,
        projectId: projectId ? Number(projectId) : undefined,
        customerId: !isAdmin && customerId ? Number(customerId) : undefined,
        page: Number(page),
        limit: Number(limit)
      };

      // Obtención de materiales filtrados
      const result = await this.materialService.listMaterials(filters);

      // Manejo de errores y respuesta
      if (!result.success) {
        if (result.errors) {
          Logger.warn(LOG_MESSAGES.MATERIALS.LIST.FAILED, {
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

        Logger.error(LOG_MESSAGES.MATERIALS.LIST.FAILED, {
          userId: req.user.userId,
          error: result.error
        });

        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      // Registro de éxito y envío de respuesta
      Logger.info(LOG_MESSAGES.MATERIALS.LIST.SUCCESS, {
        userId: req.user.userId,
        count: result.data?.materials?.length || 0,
        filters
      });

      // Mantener formato de respuesta original
      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.MATERIALS.LIST.FAILED, {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }

  /**
   * Realiza búsquedas avanzadas de materiales
   * @param req - Request con criterios de búsqueda
   * @param res - Response con resultados de búsqueda
   */
  async search(req: Request, res: Response) {
    try {
      // Verificación de autenticación
      if (!req.user) {
        Logger.warn('Unauthorized access attempt to materials search', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      // Configuración de parámetros de búsqueda
      const { 
        query = '',
        uom,
        minQuantity,
        maxQuantity,
        projectId,
        page = '1',
        limit = '20'
      } = req.query;

      // Validación de permisos y configuración de filtros por cliente
      const customerId = req.user.customerId;
      const isAdmin = req.user.role === ROLES.ADMIN;

      // Registro de solicitud
      Logger.debug(LOG_MESSAGES.MATERIALS.SEARCH.REQUEST, {
        userId: req.user.userId,
        searchParams: {
          query,
          uom,
          minQuantity,
          maxQuantity,
          projectId,
          page,
          limit,
          customerId: !isAdmin ? customerId : undefined
        }
      });

      // Construcción de filtros de búsqueda
      const filters: MaterialSearchFilters = {
        search: String(query),
        uom: uom ? String(uom) : undefined,
        minQuantity: minQuantity ? Number(minQuantity) : undefined,
        maxQuantity: maxQuantity ? Number(maxQuantity) : undefined,
        projectId: projectId ? Number(projectId) : undefined,
        customerId: !isAdmin && customerId ? Number(customerId) : undefined,
        page: Number(page),
        limit: Number(limit)
      };

      // Ejecutar búsqueda
      const result = await this.materialService.searchMaterials(filters);

      // Manejo de resultados y errores
      if (!result.success) {
        if (result.errors) {
          Logger.warn(LOG_MESSAGES.MATERIALS.SEARCH.FAILED_VALIDATION, {
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

        Logger.error(LOG_MESSAGES.MATERIALS.SEARCH.FAILED, {
          userId: req.user.userId,
          error: result.error
        });

        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.SEARCH_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.MATERIALS.SEARCH.SUCCESS, {
        userId: req.user.userId,
        resultCount: result.data?.materials?.length || 0,
        searchParams: filters
      });

      // Mantener formato de respuesta original
      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.MATERIALS.SEARCH.FAILED, {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.SEARCH_ERROR 
      });
    }
  }

  /**
   * Obtiene detalles de un material específico
   * @param req - Request con ID del material
   * @param res - Response con detalles del material
   */
  async getById(req: Request, res: Response) {
    try {
      if (!req.user) {
        Logger.warn('Unauthorized access attempt to material details', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { id } = req.params;
      const customerId = req.user.customerId;
      const isAdmin = req.user.role === ROLES.ADMIN;

      Logger.debug(LOG_MESSAGES.MATERIALS.GET.REQUEST, {
        userId: req.user.userId,
        materialId: id,
        customerId: !isAdmin ? customerId : undefined
      });

      const result = await this.materialService.getMaterialById(
        Number(id),
        !isAdmin && customerId ? Number(customerId) : undefined
      );

      if (!result.success) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.MATERIAL) {
          Logger.warn(LOG_MESSAGES.MATERIALS.GET.FAILED_NOT_FOUND, {
            userId: req.user.userId,
            materialId: id
          });

          return res.status(404).json(
            createErrorResponse(
              ApiErrorCode.NOT_FOUND,
              ERROR_MESSAGES.NOT_FOUND.MATERIAL,
              undefined,
              req
            )
          );
        }

        Logger.error(LOG_MESSAGES.MATERIALS.GET.FAILED, {
          userId: req.user.userId,
          materialId: id,
          error: result.error
        });

        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.MATERIALS.GET.SUCCESS, {
        userId: req.user.userId,
        materialId: id,
        code: result.data?.code
      });

      // Mantener formato de respuesta original
      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.MATERIALS.GET.FAILED, {
        userId: req.user?.userId || 'anonymous',
        materialId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }

  /**
   * Obtiene lista de unidades de medida disponibles
   * @param req - Request del usuario autenticado
   * @param res - Response con lista de UOMs
   */
  async getUoms(req: Request, res: Response) {
    try {
      if (!req.user) {
        Logger.warn('Unauthorized access attempt to UOMs list', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      Logger.debug(LOG_MESSAGES.MATERIALS.UOMS.REQUEST, {
        userId: req.user.userId
      });

      const result = await this.materialService.getUniqueUoms();

      if (!result.success) {
        Logger.error(LOG_MESSAGES.MATERIALS.UOMS.FAILED, {
          userId: req.user.userId,
          error: result.error
        });

        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.MATERIALS.UOMS.SUCCESS, {
        userId: req.user.userId,
        count: result.data?.length || 0
      });

      // Mantener formato de respuesta original
      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.MATERIALS.UOMS.FAILED, {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }
}

// Exportar instancia única del controlador
export const materialsController = new MaterialsController();