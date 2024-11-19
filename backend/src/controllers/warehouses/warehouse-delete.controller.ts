// backend/src/controllers/warehouses/warehouse-delete.controller.ts
import { Request, Response } from 'express';
import prisma from '../../config/database';

export const deleteWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    if (!warehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    // Check if warehouse has associated orders
    if (warehouse._count.orders > 0) {
      // Soft delete if warehouse has orders
      await prisma.warehouse.update({
        where: { id: Number(id) },
        data: { 
          status: 2,  // Inactive status
          modified_by: req.user?.userId || null,
          modified_at: new Date()
        }
      });

      return res.json({ 
        message: 'Warehouse has been deactivated',
        details: 'Warehouse had associated orders and was deactivated instead of deleted',
        deactivatedAt: new Date(),
        deactivatedBy: req.user?.userId
      });
    }

    // If no orders, proceed with hard delete
    await prisma.$transaction(async (tx) => {
      // Delete customer warehouse relationships first
      await tx.customerWarehouse.deleteMany({
        where: { warehouseId: Number(id) }
      });

      // Delete warehouse
      await tx.warehouse.delete({
        where: { id: Number(id) }
      });
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete warehouse error:', error);
    res.status(500).json({ 
      error: 'Error deleting warehouse',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// También exportamos una versión nombrada para consistencia con el controlador base
export const warehouseDeleteController = {
  delete: deleteWarehouse
};