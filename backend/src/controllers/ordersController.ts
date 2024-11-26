// backend/src/controllers/ordersController.ts
import { Request, Response } from 'express';
import { OrderService } from '../services/orders/orderService';
import { OrderRepository } from '../repositories/orderRepository';
import prisma from '../config/database';

export class OrdersController {
  private orderService: OrderService;

  constructor(orderService?: OrderService) {
    this.orderService = orderService || new OrderService(new OrderRepository(prisma));

    // Bind de los métodos para mantener el contexto correcto
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getStats = this.getStats.bind(this);
  }

  async create(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const customerId = req.user.customerId;
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    // Asegurar que el customerId en el body coincida con el del usuario
    const orderData = {
      ...req.body,
      customerId
    };

    const result = await this.orderService.createOrder(orderData, req.user.userId);
    
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

  async list(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const customerId = req.user.customerId;
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const filters = {
      customerId,
      status: req.query.status ? Number(req.query.status) : undefined,
      fromDate: req.query.fromDate ? new Date(String(req.query.fromDate)) : undefined,
      toDate: req.query.toDate ? new Date(String(req.query.toDate)) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20
    };

    const result = await this.orderService.listOrders(filters);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  }

  async getById(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const customerId = req.user.customerId;
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const result = await this.orderService.getOrderById(Number(req.params.id));
    
    if (!result.success) {
      if (result.error === 'Order not found') {
        return res.status(404).json({ error: result.error });
      }
      return res.status(500).json({ error: result.error });
    }

    if (!result.data) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verificar que el usuario tiene acceso a esta orden
    if (result.data.customerId !== customerId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(result.data);
  }

  async update(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const customerId = req.user.customerId;
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    // Primero verificar que la orden existe y pertenece al cliente
    const existingOrder = await this.orderService.getOrderById(Number(req.params.id));
    
    if (!existingOrder.success || !existingOrder.data) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (existingOrder.data.customerId !== customerId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Si la orden no está en estado DRAFT, no permitir la actualización
    if (existingOrder.data.status !== 10) {
      return res.status(400).json({ error: 'Only draft orders can be updated' });
    }

    const result = await this.orderService.updateOrder(
      Number(req.params.id), 
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

    res.json(result.data);
  }

  async delete(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const customerId = req.user.customerId;
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    // Primero verificar que la orden existe y pertenece al cliente
    const existingOrder = await this.orderService.getOrderById(Number(req.params.id));
    
    if (!existingOrder.success || !existingOrder.data) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (existingOrder.data.customerId !== customerId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Si la orden no está en estado DRAFT, no permitir la eliminación
    if (existingOrder.data.status !== 10) {
      return res.status(400).json({ error: 'Only draft orders can be deleted' });
    }

    const result = await this.orderService.deleteOrder(Number(req.params.id));
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.status(204).send();
  }

  async getStats(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const customerId = req.user.customerId;
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const filters = {
      customerId,
      periodInMonths: req.query.period ? Number(req.query.period) : 12
    };

    const result = await this.orderService.getOrderStats(filters);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  }
}

// Exportar instancia por defecto para mantener compatibilidad
export const ordersController = new OrdersController();