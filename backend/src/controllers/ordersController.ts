// backend/src/controllers/ordersController.ts
import { Request, Response } from 'express';
import { OrderService } from '../services/orders/orderService';
import { OrderRepository } from '../repositories/orderRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES, ORDER_STATUS, ROLES } from '../shared/constants';
import { OrderFilters, CreateOrderDTO, UpdateOrderDTO } from '../services/orders/types';
import { Role } from '../shared/types';

export class OrdersController {
  private orderService: OrderService;

  constructor(orderService?: OrderService) {
    this.orderService = orderService || new OrderService(new OrderRepository(prisma));
    this.bindMethods();
  }

  private bindMethods() {
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getStats = this.getStats.bind(this);
  }

  private isAdmin(role: Role): boolean {
    return role === ROLES.ADMIN;
  }

  private isClient(role: Role): boolean {
    return role === ROLES.CLIENT;
  }

  private hasAccessToOrder(customerId: number | null, userRole: Role, orderCustomerId: number): boolean {
    return this.isAdmin(userRole) || customerId === orderCustomerId;
  }

  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { customerId, role } = req.user;
      const userRole = role as Role;

      if (!this.isClient(userRole)) {
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      if (!customerId) {
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
          field: 'customerId'
        });
      }

      const orderData: CreateOrderDTO = {
        ...req.body,
        customerId
      };

      const result = await this.orderService.createOrder(orderData, req.user.userId);
      
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
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR 
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { customerId, role } = req.user;
      const userRole = role as Role;

      if (!this.isClient(userRole)) {
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      if (!customerId) {
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
          field: 'customerId'
        });
      }

      const filters: OrderFilters = {
        customerId,
        status: req.query.status ? Number(req.query.status) : undefined,
        fromDate: req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined,
        toDate: req.query.toDate ? new Date(String(req.query.toDate)) : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20
      };

      const result = await this.orderService.listOrders(filters);
      
      if (!result.success) {
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      res.json(result.data);
    } catch (error) {
      console.error('List orders error:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
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

      const { customerId, role } = req.user;
      const userRole = role as Role;

      if (!this.isClient(userRole) && !this.isAdmin(userRole)) {
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      const result = await this.orderService.getOrderById(Number(req.params.id));
      
      if (!result.success || !result.data) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.ORDER) {
          return res.status(404).json({ error: result.error });
        }
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      if (!this.hasAccessToOrder(customerId, userRole, result.data.customerId)) {
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      res.json(result.data);
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { customerId, role } = req.user;
      const userRole = role as Role;

      if (!this.isClient(userRole)) {
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      const existingOrder = await this.orderService.getOrderById(Number(req.params.id));
      
      if (!existingOrder.success || !existingOrder.data) {
        return res.status(404).json({ 
          error: ERROR_MESSAGES.NOT_FOUND.ORDER 
        });
      }

      if (!this.hasAccessToOrder(customerId, userRole, existingOrder.data.customerId)) {
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      if (existingOrder.data.status !== ORDER_STATUS.DRAFT) {
        return res.status(400).json({ 
          error: 'Only draft orders can be updated' 
        });
      }

      const result = await this.orderService.updateOrder(
        Number(req.params.id), 
        req.body as UpdateOrderDTO,
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
          error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR 
        });
      }

      res.json(result.data);
    } catch (error) {
      console.error('Update order error:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR 
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { customerId, role } = req.user;
      const userRole = role as Role;

      if (!this.isClient(userRole)) {
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      const existingOrder = await this.orderService.getOrderById(Number(req.params.id));
      
      if (!existingOrder.success || !existingOrder.data) {
        return res.status(404).json({ 
          error: ERROR_MESSAGES.NOT_FOUND.ORDER 
        });
      }

      if (!this.hasAccessToOrder(customerId, userRole, existingOrder.data.customerId)) {
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      if (existingOrder.data.status !== ORDER_STATUS.DRAFT) {
        return res.status(400).json({ 
          error: 'Only draft orders can be deleted' 
        });
      }

      const result = await this.orderService.deleteOrder(Number(req.params.id));
      
      if (!result.success) {
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.DELETE_ERROR 
        });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.DELETE_ERROR 
      });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { customerId, role } = req.user;
      const userRole = role as Role;

      if (!this.isClient(userRole)) {
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      if (!customerId) {
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
          field: 'customerId'
        });
      }

      const filters = {
        customerId,
        periodInMonths: req.query.period ? Number(req.query.period) : 12
      };

      const result = await this.orderService.getOrderStats(filters);
      
      if (!result.success) {
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      res.json(result.data);
    } catch (error) {
      console.error('Get order stats error:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }
}

export const ordersController = new OrdersController();