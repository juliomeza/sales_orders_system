// backend/src/controllers/ordersController.ts
import { Request, Response } from 'express';
import { OrderService } from '../services/orders/orderService';
import { OrderRepository } from '../repositories/orderRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES, ORDER_STATUS, ROLES, LOG_MESSAGES } from '../shared/constants';
import { OrderFilters, CreateOrderDTO, UpdateOrderDTO } from '../services/orders/types';
import { Role } from '../shared/types';
import Logger from '../config/logger';

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
        Logger.warn('Non-client user attempted to create order', {
          userId: req.user.userId,
          role: userRole
        });
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      if (!customerId) {
        Logger.warn('Client user without customer ID attempted to create order', {
          userId: req.user.userId
        });
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
          field: 'customerId'
        });
      }

      Logger.info(LOG_MESSAGES.ORDERS.CREATE.ATTEMPT, {
        userId: req.user.userId,
        customerId,
        orderData: {
          orderTypeId: req.body.orderTypeId,
          itemsCount: req.body.items?.length
        }
      });

      const orderData: CreateOrderDTO = {
        ...req.body,
        customerId
      };

      const result = await this.orderService.createOrder(orderData, req.user.userId);
      
      if (!result.success) {
        if (result.errors) {
          Logger.warn(LOG_MESSAGES.ORDERS.CREATE.FAILED_VALIDATION, {
            userId: req.user.userId,
            customerId,
            errors: result.errors
          });
          return res.status(400).json({ 
            error: ERROR_MESSAGES.VALIDATION.FAILED, 
            details: result.errors 
          });
        }

        Logger.error(LOG_MESSAGES.ORDERS.CREATE.FAILED, {
          userId: req.user.userId,
          customerId,
          error: result.error
        });
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.CREATE_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.ORDERS.CREATE.SUCCESS, {
        userId: req.user.userId,
        customerId,
        orderId: result.data?.id,
        orderNumber: result.data?.orderNumber
      });

      res.status(201).json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.ORDERS.CREATE.FAILED, {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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
        Logger.warn('Non-client user attempted to list orders', {
          userId: req.user.userId,
          role: userRole
        });
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      if (!customerId) {
        Logger.warn('Client user without customer ID attempted to list orders', {
          userId: req.user.userId
        });
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

      Logger.debug(LOG_MESSAGES.ORDERS.LIST.REQUEST, {
        userId: req.user.userId,
        customerId,
        filters
      });

      const result = await this.orderService.listOrders(filters);
      
      if (!result.success) {
        Logger.error(LOG_MESSAGES.ORDERS.LIST.FAILED, {
          userId: req.user.userId,
          customerId,
          error: result.error
        });
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.ORDERS.LIST.SUCCESS, {
        userId: req.user.userId,
        customerId,
        count: result.data?.orders.length || 0,
        filters
      });

      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.ORDERS.LIST.FAILED, {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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
      const orderId = Number(req.params.id);

      Logger.debug(LOG_MESSAGES.ORDERS.GET.REQUEST, {
        userId: req.user.userId,
        orderId
      });

      const result = await this.orderService.getOrderById(orderId);
      
      if (!result.success || !result.data) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.ORDER) {
          Logger.warn(LOG_MESSAGES.ORDERS.GET.FAILED_NOT_FOUND, {
            userId: req.user.userId,
            orderId
          });
          return res.status(404).json({ error: result.error });
        }
        Logger.error(LOG_MESSAGES.ORDERS.GET.FAILED, {
          userId: req.user.userId,
          orderId,
          error: result.error
        });
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      if (!this.hasAccessToOrder(customerId, userRole, result.data.customerId)) {
        Logger.warn('User attempted to access unauthorized order', {
          userId: req.user.userId,
          orderId,
          userCustomerId: customerId,
          orderCustomerId: result.data.customerId
        });
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      Logger.info(LOG_MESSAGES.ORDERS.GET.SUCCESS, {
        userId: req.user.userId,
        orderId,
        orderNumber: result.data.orderNumber
      });

      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.ORDERS.GET.FAILED, {
        userId: req.user?.userId || 'anonymous',
        orderId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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
      const orderId = Number(req.params.id);

      Logger.info(LOG_MESSAGES.ORDERS.UPDATE.ATTEMPT, {
        userId: req.user.userId,
        orderId,
        updateData: {
          hasItems: !!req.body.items,
          itemCount: req.body.items?.length
        }
      });

      const existingOrder = await this.orderService.getOrderById(orderId);
      
      if (!existingOrder.success || !existingOrder.data) {
        Logger.warn(LOG_MESSAGES.ORDERS.UPDATE.FAILED_NOT_FOUND, {
          userId: req.user.userId,
          orderId
        });
        return res.status(404).json({ 
          error: ERROR_MESSAGES.NOT_FOUND.ORDER 
        });
      }

      if (!this.hasAccessToOrder(customerId, userRole, existingOrder.data.customerId)) {
        Logger.warn(LOG_MESSAGES.ORDERS.UPDATE.FAILED_ACCESS_DENIED, {
          userId: req.user.userId,
          orderId,
          userCustomerId: customerId,
          orderCustomerId: existingOrder.data.customerId
        });
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      if (existingOrder.data.status !== ORDER_STATUS.DRAFT) {
        Logger.warn(LOG_MESSAGES.ORDERS.UPDATE.FAILED_DRAFT_ONLY, {
          userId: req.user.userId,
          orderId,
          currentStatus: existingOrder.data.status
        });
        return res.status(400).json({ 
          error: 'Only draft orders can be updated' 
        });
      }

      const result = await this.orderService.updateOrder(
        orderId, 
        req.body as UpdateOrderDTO,
        req.user.userId
      );
      
      if (!result.success) {
        if (result.errors) {
          Logger.warn(LOG_MESSAGES.ORDERS.UPDATE.FAILED_VALIDATION, {
            userId: req.user.userId,
            orderId,
            errors: result.errors
          });
          return res.status(400).json({ 
            error: ERROR_MESSAGES.VALIDATION.FAILED, 
            details: result.errors 
          });
        }
        Logger.error(LOG_MESSAGES.ORDERS.UPDATE.FAILED, {
          userId: req.user.userId,
          orderId,
          error: result.error
        });
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.ORDERS.UPDATE.SUCCESS, {
        userId: req.user.userId,
        orderId,
        orderNumber: result.data?.orderNumber
      });

      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.ORDERS.UPDATE.FAILED, {
        userId: req.user?.userId || 'anonymous',
        orderId: req.params.id,
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
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { customerId, role } = req.user;
      const userRole = role as Role;
      const orderId = Number(req.params.id);

      Logger.info(LOG_MESSAGES.ORDERS.DELETE.ATTEMPT, {
        userId: req.user.userId,
        orderId
      });

      const existingOrder = await this.orderService.getOrderById(orderId);
      
      if (!existingOrder.success || !existingOrder.data) {
        Logger.warn(LOG_MESSAGES.ORDERS.DELETE.FAILED_NOT_FOUND, {
          userId: req.user.userId,
          orderId
        });
        return res.status(404).json({ 
          error: ERROR_MESSAGES.NOT_FOUND.ORDER 
        });
      }

      if (!this.hasAccessToOrder(customerId, userRole, existingOrder.data.customerId)) {
        Logger.warn(LOG_MESSAGES.ORDERS.DELETE.FAILED_ACCESS_DENIED, {
          userId: req.user.userId,
          orderId,
          userCustomerId: customerId,
          orderCustomerId: existingOrder.data.customerId
        });
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      if (existingOrder.data.status !== ORDER_STATUS.DRAFT) {
        Logger.warn(LOG_MESSAGES.ORDERS.DELETE.FAILED_DRAFT_ONLY, {
          userId: req.user.userId,
          orderId,
          currentStatus: existingOrder.data.status
        });
        return res.status(400).json({ 
          error: 'Only draft orders can be deleted' 
        });
      }

      const result = await this.orderService.deleteOrder(orderId);
      
      if (!result.success) {
        Logger.error(LOG_MESSAGES.ORDERS.DELETE.FAILED, {
          userId: req.user.userId,
          orderId,
          error: result.error
        });
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.DELETE_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.ORDERS.DELETE.SUCCESS, {
        userId: req.user.userId,
        orderId
      });

      res.status(204).send();
    } catch (error) {
      Logger.error(LOG_MESSAGES.ORDERS.DELETE.FAILED, {
        userId: req.user?.userId || 'anonymous',
        orderId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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
        Logger.warn('Non-client user attempted to get order stats', {
          userId: req.user.userId,
          role: userRole
        });
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      if (!customerId) {
        Logger.warn('Client user without customer ID attempted to get order stats', {
          userId: req.user.userId
        });
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
          field: 'customerId'
        });
      }

      Logger.debug(LOG_MESSAGES.ORDERS.STATS.REQUEST, {
        userId: req.user.userId,
        customerId,
        period: req.query.period
      });

      const filters = {
        customerId,
        periodInMonths: req.query.period ? Number(req.query.period) : 12
      };

      const result = await this.orderService.getOrderStats(filters);
      
      if (!result.success) {
        Logger.error(LOG_MESSAGES.ORDERS.STATS.FAILED, {
          userId: req.user.userId,
          customerId,
          error: result.error
        });
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.ORDERS.STATS.SUCCESS, {
        userId: req.user.userId,
        customerId,
        period: filters.periodInMonths,
        totalOrders: result.data?.totalOrders || 0
      });

      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.ORDERS.STATS.FAILED, {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }
}

export const ordersController = new OrdersController();