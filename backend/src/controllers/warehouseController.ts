// backend/src/controllers/warehouseController.ts
import { Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { WarehouseService } from '../services/warehouses/warehouseService';
import { WarehouseRepository } from '../repositories/warehouseRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES } from '../shared/constants';

export class WarehouseController {
  private warehouseService: WarehouseService;

  constructor(warehouseService?: WarehouseService) {
    this.warehouseService = warehouseService || new WarehouseService(
      new WarehouseRepository(prisma)
    );

    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getById = this.getById.bind(this);
    this.list = this.list.bind(this);
    this.getStats = this.getStats.bind(this);
  }

  async create(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ 
        error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
      });
    }

    const result = await this.warehouseService.createWarehouse(
      req.body,
      req.user.userId
    );

    if (!result.success) {
      if (result.errors) {
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.FAILED, 
          details: result.errors 
        });
      }
      return res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR 
      });
    }

    res.status(201).json(result.data);
  }

  async update(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ 
        error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
      });
    }

    const { id } = req.params;

    const result = await this.warehouseService.updateWarehouse(
      Number(id),
      req.body,
      req.user.userId
    );

    if (!result.success) {
      if (result.error === ERROR_MESSAGES.NOT_FOUND.WAREHOUSE) {
        return res.status(404).json({ 
          error: ERROR_MESSAGES.NOT_FOUND.WAREHOUSE 
        });
      }
      if (result.errors) {
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.FAILED, 
          details: result.errors 
        });
      }
      return res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR 
      });
    }

    res.json(result.data);
  }

  async delete(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ 
        error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
      });
    }

    const { id } = req.params;
    
    const result = await this.warehouseService.deleteWarehouse(Number(id));

    if (!result.success) {
      if (result.error === ERROR_MESSAGES.NOT_FOUND.WAREHOUSE) {
        return res.status(404).json({ 
          error: ERROR_MESSAGES.NOT_FOUND.WAREHOUSE 
        });
      }
      return res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.DELETE_ERROR 
      });
    }

    if (result.message) {
      return res.json({ 
        message: result.message,
        deactivatedAt: new Date(),
        deactivatedBy: req.user.userId
      });
    }

    res.status(204).send();
  }

  async getById(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ 
        error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
      });
    }
  
    const { id } = req.params;
    const customerId = req.user.role !== 'ADMIN' ? Number(req.user.customerId) : undefined;
  
    const result = await this.warehouseService.getWarehouseById(
      Number(id),
      customerId
    );
  
    if (!result.success) {
      if (result.error === ERROR_MESSAGES.NOT_FOUND.WAREHOUSE) {
        return res.status(404).json({ 
          error: ERROR_MESSAGES.NOT_FOUND.WAREHOUSE 
        });
      }
      return res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  
    res.json(result.data);
  }

  async list(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ 
        error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
      });
    }
  
    const filters = {
      search: req.query.search as string,
      status: req.query.status ? Number(req.query.status) : undefined,
      city: req.query.city as string,
      state: req.query.state as string,
      customerId: req.user.role !== 'ADMIN' ? Number(req.user.customerId) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20
    };
  
    const result = await this.warehouseService.listWarehouses(filters);
  
    if (!result.success) {
      if (result.errors) {
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.FAILED, 
          details: result.errors 
        });
      }
      return res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  
    res.json(result.data);
  }

  async getStats(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ 
        error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
      });
    }

    const result = await this.warehouseService.getWarehouseStats();

    if (!result.success) {
      return res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }

    res.json(result.data);
  }
}

export const warehouseController = new WarehouseController();