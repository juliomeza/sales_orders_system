// backend/src/controllers/ordersController.ts
import { Request, Response } from 'express';
import prisma from '../config/database';

// Definir enum o constantes para status
const OrderStatus = {
  DRAFT: 10,
  SUBMITTED: 11,
  PROCESSING: 12,
  COMPLETED: 13
} as const;

export const ordersController = {
  // Create Order
  create: async (req: Request, res: Response) => {
    try {
      const {
        orderTypeId,
        customerId,
        shipToAccountId,
        billToAccountId,
        carrierId,
        carrierServiceId,
        warehouseId,
        expectedDeliveryDate,
        items
      } = req.body;

      // Generate a unique order number (you might want to implement your own logic)
      const orderNumber = `ORD${Date.now()}`;
      
      const order = await prisma.order.create({
        data: {
          orderNumber,
          lookupCode: orderNumber,
          status: OrderStatus.DRAFT,
          orderTypeId,
          customerId,
          shipToAccountId,
          billToAccountId,
          carrierId,
          carrierServiceId,
          warehouseId,
          expectedDeliveryDate: new Date(expectedDeliveryDate),
          items: {
            create: items.map((item: any) => ({
              materialId: item.materialId,
              quantity: item.quantity,
              status: 1
            }))
          },
          created_by: req.user?.userId,
          modified_by: req.user?.userId
        },
        include: {
          items: true,
          carrier: true,
          carrierService: true
        }
      });

      res.status(201).json(order);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Error creating order' });
    }
  },

  // Get Orders List
  list: async (req: Request, res: Response) => {
    try {
      const { 
        status, 
        fromDate, 
        toDate, 
        page = '1', 
        limit = '20' 
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      
      const where = {
        customerId: req.user!.customerId!,
        ...(status && { status: Number(status) }),
        ...(fromDate && toDate && {
          created_at: {
            gte: new Date(String(fromDate)),
            lte: new Date(String(toDate))
          }
        })
      };

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            items: true,
            carrier: true,
            carrierService: true
          },
          orderBy: {
            modified_at: 'desc'
          }
        }),
        prisma.order.count({ where })
      ]);

      res.json({
        orders,
        total,
        page: Number(page),
        limit: Number(limit)
      });
    } catch (error) {
      console.error('List orders error:', error);
      res.status(500).json({ error: 'Error listing orders' });
    }
  },

  // Get Order Details
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const order = await prisma.order.findUnique({
        where: { id: Number(id) },
        include: {
          items: true,
          carrier: true,
          carrierService: true,
          shipToAccount: true,
          billToAccount: true,
          warehouse: true
        }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.customerId !== req.user!.customerId && req.user!.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(order);
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ error: 'Error retrieving order' });
    }
  },

  // Update Draft Order
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        orderTypeId,
        shipToAccountId,
        billToAccountId,
        carrierId,
        carrierServiceId,
        warehouseId,
        expectedDeliveryDate,
        items
      } = req.body;

      const order = await prisma.order.findUnique({
        where: { id: Number(id) }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.status !== OrderStatus.DRAFT) {
        return res.status(400).json({ error: 'Only draft orders can be updated' });
      }

      if (order.customerId !== req.user!.customerId && req.user!.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Delete existing items
        await tx.orderItem.deleteMany({
          where: { orderId: Number(id) }
        });

        // Update order and create new items
        return tx.order.update({
          where: { id: Number(id) },
          data: {
            orderTypeId,
            shipToAccountId,
            billToAccountId,
            carrierId,
            carrierServiceId,
            warehouseId,
            expectedDeliveryDate: new Date(expectedDeliveryDate),
            modified_by: req.user?.userId,
            modified_at: new Date(),
            items: {
              create: items.map((item: any) => ({
                materialId: item.materialId,
                quantity: item.quantity,
                status: 1,
                created_by: req.user?.userId,
                modified_by: req.user?.userId
              }))
            }
          },
          include: {
            items: true,
            carrier: true,
            carrierService: true,
            shipToAccount: true,
            billToAccount: true,
            warehouse: true
          }
        });
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error('Update order error:', error);
      res.status(500).json({ error: 'Error updating order' });
    }
  },

  // Delete Draft Order
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const order = await prisma.order.findUnique({
        where: { id: Number(id) }
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.status !== OrderStatus.DRAFT) {
        return res.status(400).json({ error: 'Only draft orders can be deleted' });
      }

      if (order.customerId !== req.user!.customerId && req.user!.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied' });
      }

      await prisma.$transaction([
        prisma.orderItem.deleteMany({
          where: { orderId: Number(id) }
        }),
        prisma.order.delete({
          where: { id: Number(id) }
        })
      ]);

      res.status(204).send();
    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({ error: 'Error deleting order' });
    }
  }
};