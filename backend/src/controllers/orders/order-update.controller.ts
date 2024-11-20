// backend/src/controllers/orders/order-update.controller.ts
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../config/database';

interface OrderUpdateData {
  orderTypeId?: number;
  shipToAccountId?: number;
  billToAccountId?: number;
  carrierId?: number;
  carrierServiceId?: number;
  warehouseId?: number;
  expectedDeliveryDate?: string;
  items?: {
    materialId: number;
    quantity: number;
  }[];
}

const validateUpdateData = async (id: number, data: OrderUpdateData): Promise<string[]> => {
  const errors: string[] = [];

  const order = await prisma.order.findUnique({ where: { id: Number(id) } });
  if (!order) {
    errors.push('Order not found');
    return errors;
  }

  if (order.status !== 10) { // Not DRAFT
    errors.push('Only draft orders can be updated');
    return errors;
  }

  if (data.expectedDeliveryDate) {
    const date = new Date(data.expectedDeliveryDate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid expected delivery date');
    }
  }

  if (data.items && data.items.length > 0) {
    const materials = await prisma.material.findMany({
      where: { id: { in: data.items.map(item => item.materialId) } }
    });
    
    if (materials.length !== data.items.length) {
      errors.push('One or more materials not found');
    }
  }

  const checkExists = async (id: number | undefined, model: string): Promise<boolean> => {
    if (!id) return true;
    const record = await (prisma as any)[model].findUnique({ where: { id } });
    return !!record;
  };

  const validations = await Promise.all([
    data.shipToAccountId && checkExists(data.shipToAccountId, 'account'),
    data.billToAccountId && checkExists(data.billToAccountId, 'account'),
    data.carrierId && checkExists(data.carrierId, 'carrier'),
    data.carrierServiceId && checkExists(data.carrierServiceId, 'carrierService'),
    data.warehouseId && checkExists(data.warehouseId, 'warehouse')
  ]);

  const entities = ['Ship to account', 'Bill to account', 'Carrier', 'Carrier service', 'Warehouse'];
  validations.forEach((exists, index) => {
    if (!exists) errors.push(`${entities[index]} not found`);
  });

  return errors;
};

const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: OrderUpdateData = req.body;

    const validationErrors = await validateUpdateData(Number(id), updateData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (updateData.items) {
        await tx.orderItem.deleteMany({
          where: { orderId: Number(id) }
        });
      }

      return tx.order.update({
        where: { id: Number(id) },
        data: {
          ...(updateData.orderTypeId && { orderTypeId: updateData.orderTypeId }),
          ...(updateData.shipToAccountId && { shipToAccountId: updateData.shipToAccountId }),
          ...(updateData.billToAccountId && { billToAccountId: updateData.billToAccountId }),
          ...(updateData.carrierId && { carrierId: updateData.carrierId }),
          ...(updateData.carrierServiceId && { carrierServiceId: updateData.carrierServiceId }),
          ...(updateData.warehouseId && { warehouseId: updateData.warehouseId }),
          ...(updateData.expectedDeliveryDate && { 
            expectedDeliveryDate: new Date(updateData.expectedDeliveryDate) 
          }),
          modified_by: req.user?.userId,
          modified_at: new Date(),
          ...(updateData.items && {
            items: {
              create: updateData.items.map(item => ({
                materialId: item.materialId,
                quantity: item.quantity,
                status: 1,
                created_by: req.user?.userId,
                modified_by: req.user?.userId
              }))
            }
          })
        },
        include: {
          items: {
            include: {
              material: {
                select: {
                  code: true,
                  description: true,
                  uom: true
                }
              }
            }
          },
          carrier: true,
          carrierService: true,
          warehouse: true,
          shipToAccount: true,
          billToAccount: true
        }
      });
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ 
      error: 'Error updating order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const orderUpdateController = {
  update: updateOrder
};