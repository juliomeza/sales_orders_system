// backend/src/controllers/materialsController.ts
import { Request, Response } from 'express';
import { MaterialService } from '../services/materials/materialService';
import { MaterialRepository } from '../repositories/materialRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES, ROLES, LOG_MESSAGES } from '../shared/constants';
import Logger from '../config/logger';
import { MaterialFilters, MaterialSearchFilters } from '../domain/material';

export class MaterialsController {
  private materialService: MaterialService;

  constructor(materialService?: MaterialService) {
    this.materialService = materialService || new MaterialService(
      new MaterialRepository(prisma)
    );

    this.list = this.list.bind(this);
    this.search = this.search.bind(this);
    this.getById = this.getById.bind(this);
    this.getUoms = this.getUoms.bind(this);
  }

  async list(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { 
        search = '', 
        uom,
        status,
        page = '1', 
        limit = '20',
        projectId 
      } = req.query;

      const customerId = req.user.customerId;
      const isAdmin = req.user.role === ROLES.ADMIN;

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

      const filters: MaterialFilters = {
        search: String(search),
        uom: uom ? String(uom) : undefined,
        status: status ? Number(status) : undefined,
        projectId: projectId ? Number(projectId) : undefined,
        customerId: !isAdmin && customerId ? Number(customerId) : undefined,
        page: Number(page),
        limit: Number(limit)
      };

      const result = await this.materialService.listMaterials(filters);

      if (!result.success) {
        Logger.error(LOG_MESSAGES.MATERIALS.LIST.FAILED, {
          userId: req.user.userId,
          error: result.error,
          errors: result.errors
        });

        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR,
          details: result.errors 
        });
      }

      Logger.info(LOG_MESSAGES.MATERIALS.LIST.SUCCESS, {
        userId: req.user.userId,
        count: result.data?.materials?.length || 0,
        filters
      });

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

  async search(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { 
        query = '',
        uom,
        minQuantity,
        maxQuantity,
        projectId,
        page = '1',
        limit = '20'
      } = req.query;

      const customerId = req.user.customerId;
      const isAdmin = req.user.role === ROLES.ADMIN;

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

      const result = await this.materialService.searchMaterials(filters);

      if (!result.success) {
        if (result.errors) {
          Logger.warn(LOG_MESSAGES.MATERIALS.SEARCH.FAILED_VALIDATION, {
            userId: req.user.userId,
            errors: result.errors
          });

          return res.status(400).json({
            error: ERROR_MESSAGES.VALIDATION.FAILED,
            details: result.errors
          });
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

  async getById(req: Request, res: Response) {
    try {
      if (!req.user) {
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

          return res.status(404).json({ 
            error: ERROR_MESSAGES.NOT_FOUND.MATERIAL 
          });
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

  async getUoms(req: Request, res: Response) {
    try {
      if (!req.user) {
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

export const materialsController = new MaterialsController();