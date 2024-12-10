// backend/src/controllers/warehouseController.ts
import { Request, Response } from 'express';
import { WarehouseService } from '../services/warehouses/warehouseService';
import { WarehouseRepository } from '../repositories/warehouseRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES } from '../shared/constants';
import Logger from '../config/logger';

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
    try {
      if (!req.user) {
        Logger.warn('Unauthenticated access attempt to create warehouse', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      Logger.info('Create warehouse attempt', {
        userId: req.user.userId,
        warehouseData: {
          lookupCode: req.body.lookupCode,
          name: req.body.name,
          city: req.body.city,
          state: req.body.state
        }
      });

      const result = await this.warehouseService.createWarehouse(
        req.body,
        req.user.userId
      );

      if (!result.success) {
        if (result.errors) {
          Logger.warn('Validation failed while creating warehouse', {
            userId: req.user.userId,
            errors: result.errors
          });
          return res.status(400).json({ 
            error: ERROR_MESSAGES.VALIDATION.FAILED, 
            details: result.errors 
          });
        }

        Logger.error('Failed to create warehouse', {
          userId: req.user.userId,
          error: result.error
        });
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.CREATE_ERROR 
        });
      }

      Logger.info('Successfully created warehouse', {
        userId: req.user.userId,
        warehouseId: result.data?.id,
        lookupCode: result.data?.lookupCode
      });

      res.status(201).json(result.data);
    } catch (error) {
      Logger.error('Error creating warehouse', {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR 
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        Logger.warn('Unauthenticated access attempt to update warehouse', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { id } = req.params;

      Logger.info('Update warehouse attempt', {
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
          Logger.warn('Update attempted on non-existent warehouse', {
            userId: req.user.userId,
            warehouseId: id
          });
          return res.status(404).json({ 
            error: ERROR_MESSAGES.NOT_FOUND.WAREHOUSE 
          });
        }

        if (result.errors) {
          Logger.warn('Validation failed while updating warehouse', {
            userId: req.user.userId,
            warehouseId: id,
            errors: result.errors
          });
          return res.status(400).json({ 
            error: ERROR_MESSAGES.VALIDATION.FAILED, 
            details: result.errors 
          });
        }

        Logger.error('Failed to update warehouse', {
          userId: req.user.userId,
          warehouseId: id,
          error: result.error
        });
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR 
        });
      }

      Logger.info('Successfully updated warehouse', {
        userId: req.user.userId,
        warehouseId: id
      });

      res.json(result.data);
    } catch (error) {
      Logger.error('Error updating warehouse', {
        userId: req.user?.userId || 'anonymous',
        warehouseId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR 
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        Logger.warn('Unauthenticated access attempt to delete warehouse', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { id } = req.params;

      Logger.info('Delete warehouse attempt', {
        userId: req.user.userId,
        warehouseId: id
      });
      
      const result = await this.warehouseService.deleteWarehouse(Number(id));

      if (!result.success) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.WAREHOUSE) {
          Logger.warn('Delete attempted on non-existent warehouse', {
            userId: req.user.userId,
            warehouseId: id
          });
          return res.status(404).json({ 
            error: ERROR_MESSAGES.NOT_FOUND.WAREHOUSE 
          });
        }

        Logger.error('Failed to delete warehouse', {
          userId: req.user.userId,
          warehouseId: id,
          error: result.error
        });
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.DELETE_ERROR 
        });
      }

      if (result.message) {
        Logger.info('Warehouse deactivated due to existing orders', {
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

      Logger.info('Successfully deleted warehouse', {
        userId: req.user.userId,
        warehouseId: id
      });

      res.status(204).send();
    } catch (error) {
      Logger.error('Error deleting warehouse', {
        userId: req.user?.userId || 'anonymous',
        warehouseId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.DELETE_ERROR 
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      if (!req.user) {
        Logger.warn('Unauthenticated access attempt to get warehouse', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }
  
      const { id } = req.params;
      const customerId = req.user.role !== 'ADMIN' ? Number(req.user.customerId) : undefined;
  
      Logger.debug('Get warehouse by ID request', {
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
          Logger.warn('Attempted to access non-existent warehouse', {
            userId: req.user.userId,
            warehouseId: id
          });
          return res.status(404).json({ 
            error: ERROR_MESSAGES.NOT_FOUND.WAREHOUSE 
          });
        }

        Logger.error('Failed to get warehouse', {
          userId: req.user.userId,
          warehouseId: id,
          error: result.error
        });
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }
  
      Logger.info('Successfully retrieved warehouse', {
        userId: req.user.userId,
        warehouseId: id
      });

      res.json(result.data);
    } catch (error) {
      Logger.error('Error getting warehouse', {
        userId: req.user?.userId || 'anonymous',
        warehouseId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      if (!req.user) {
        Logger.warn('Unauthenticated access attempt to list warehouses', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
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

      Logger.debug('List warehouses request', {
        userId: req.user.userId,
        filters
      });
  
      const result = await this.warehouseService.listWarehouses(filters);
  
      if (!result.success) {
        if (result.errors) {
          Logger.warn('Validation failed while listing warehouses', {
            userId: req.user.userId,
            errors: result.errors
          });
          return res.status(400).json({ 
            error: ERROR_MESSAGES.VALIDATION.FAILED, 
            details: result.errors 
          });
        }

        Logger.error('Failed to list warehouses', {
          userId: req.user.userId,
          error: result.error
        });
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }
  
      Logger.info('Successfully retrieved warehouses list', {
        userId: req.user.userId,
        count: result.data?.warehouses.length,
        totalPages: result.data?.pagination.totalPages
      });

      res.json(result.data);
    } catch (error) {
      Logger.error('Error listing warehouses', {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        Logger.warn('Unauthenticated access attempt to get warehouse stats', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      Logger.debug('Get warehouse stats request', {
        userId: req.user.userId
      });

      const result = await this.warehouseService.getWarehouseStats();

      if (!result.success) {
        Logger.error('Failed to get warehouse stats', {
          userId: req.user.userId,
          error: result.error
        });
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      Logger.info('Successfully retrieved warehouse stats', {
        userId: req.user.userId,
        totalWarehouses: result.data?.summary.totalActiveWarehouses
      });

      res.json(result.data);
    } catch (error) {
      Logger.error('Error getting warehouse stats', {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }
}

export const warehouseController = new WarehouseController();