// backend/src/controllers/warehouseController.ts
import { Request, Response } from 'express';
import { WarehouseService } from '../services/warehouses/warehouseService';
import { WarehouseRepository } from '../repositories/warehouseRepository';
import prisma from '../config/database';
import { WarehouseFilters } from '../services/warehouses/types';

export class WarehouseController {
  private warehouseService: WarehouseService;

  constructor(warehouseService?: WarehouseService) {
    this.warehouseService = warehouseService || new WarehouseService(
      new WarehouseRepository(prisma)
    );

    // Bind methods to maintain correct context
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getById = this.getById.bind(this);
    this.list = this.list.bind(this);
    this.getStats = this.getStats.bind(this);
  }

  async create(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await this.warehouseService.createWarehouse(
      req.body,
      req.user.userId
    );

    if (!result.success) {
      if (result.errors) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: result.errors 
        });
      }
      return res.status(500).json({ error: result.error });
    }

    res.status(201).json(result.data);
  }

  async update(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    const result = await this.warehouseService.updateWarehouse(
      Number(id),
      req.body,
      req.user.userId
    );

    if (!result.success) {
      if (result.error === 'Warehouse not found') {
        return res.status(404).json({ error: result.error });
      }
      if (result.errors) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: result.errors 
        });
      }
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  }

  async delete(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    
    const result = await this.warehouseService.deleteWarehouse(Number(id));

    if (!result.success) {
      if (result.error === 'Warehouse not found') {
        return res.status(404).json({ error: result.error });
      }
      return res.status(500).json({ error: result.error });
    }

    // If there's a message, it means it was a soft delete
    if (result.message) {
      return res.json({ 
        message: result.message,
        deactivatedAt: new Date(),
        deactivatedBy: req.user.userId
      });
    }

    // Hard delete
    res.status(204).send();
  }

  async getById(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  
    const { id } = req.params;
    const customerId = req.user.role !== 'ADMIN' ? Number(req.user.customerId) : undefined;
  
    const result = await this.warehouseService.getWarehouseById(
      Number(id),
      customerId
    );
  
    if (!result.success) {
      if (result.error === 'Warehouse not found') {
        return res.status(404).json({ error: result.error });
      }
      return res.status(500).json({ error: result.error });
    }
  
    res.json(result.data);
  }

  async list(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  
    const filters: WarehouseFilters = {
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
          error: 'Invalid filters', 
          details: result.errors 
        });
      }
      return res.status(500).json({ error: result.error });
    }
  
    res.json(result.data);
  }

  async getStats(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await this.warehouseService.getWarehouseStats();

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  }
}

// Export default instance for compatibility
export const warehouseController = new WarehouseController();