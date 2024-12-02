// backend/src/controllers/materialsController.ts
import { Request, Response } from 'express';
import { MaterialService } from '../services/materials/materialService';
import { MaterialRepository } from '../repositories/materialRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES, STATUS, ROLES } from '../shared/constants';
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
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR,
          details: result.errors 
        });
      }

      res.json(result.data);
    } catch (error) {
      console.error('List materials error:', error);
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
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.SEARCH_ERROR,
          details: result.errors 
        });
      }

      res.json(result.data);
    } catch (error) {
      console.error('Search materials error:', error);
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

      const result = await this.materialService.getMaterialById(
        Number(id),
        !isAdmin && customerId ? Number(customerId) : undefined
      );

      if (!result.success) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.MATERIAL) {
          return res.status(404).json({ 
            error: ERROR_MESSAGES.NOT_FOUND.MATERIAL 
          });
        }
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      res.json(result.data);
    } catch (error) {
      console.error('Get material error:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }

  async getUoms(_req: Request, res: Response) {
    try {
      if (!_req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const result = await this.materialService.getUniqueUoms();

      if (!result.success) {
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      res.json(result.data);
    } catch (error) {
      console.error('Get UOMs error:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }
}

export const materialsController = new MaterialsController();