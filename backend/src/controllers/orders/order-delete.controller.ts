// backend/src/controllers/orders/order-delete.controller.ts
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../config/database';

const validateDeletion = async (orderId: number, userId: number, userRole: string): Promise<string[]> => {
  const errors: string[] = [];
  
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { 
      items: true 
    }
  });

  if (!order) {
    errors.push('Order not found');
    return errors;
  }

  if (order.status !== 10) {
    errors.push('Only draft orders can be deleted');
  }

  if (userRole !== 'ADMIN' && order.created_by !== userId) {
    errors.push('You can only delete orders you created');
  }

  return errors;
};

const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orderId = Number(id);

    const validationErrors = await validateDeletion(
      orderId,
      req.user!.userId,
      req.user!.role
    );

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    await prisma.$transaction([
      prisma.orderItem.deleteMany({
        where: { orderId }
      }),
      prisma.order.delete({
        where: { id: orderId }
      })
    ]);

    res.status(204).send();
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ 
      error: 'Error deleting order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const orderDeleteController = {
  delete: deleteOrder
};