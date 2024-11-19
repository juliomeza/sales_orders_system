// backend/src/controllers/warehouses/warehouse-update.controller.ts
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../config/database';

export const updateWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      capacity,
      status,
      customerIds
    } = req.body;

    // Verify warehouse exists
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { id: Number(id) }
    });

    if (!existingWarehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    // Update warehouse and customer assignments in a transaction
    const warehouse = await prisma.$transaction(async (tx) => {
      // Update warehouse details
      const updatedWarehouse = await tx.warehouse.update({
        where: { id: Number(id) },
        data: {
          ...(name && { name }),
          ...(address && { address }),
          ...(city && { city }),
          ...(state && { state }),
          ...(zipCode && { zipCode }),
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
          ...(capacity && { capacity: Number(capacity) }),
          ...(status !== undefined && { status: Number(status) }),
          modified_by: req.user?.userId || null,
          modified_at: new Date()
        }
      });

      // Update customer assignments if provided
      if (customerIds !== undefined) {
        // Remove existing assignments
        await tx.customerWarehouse.deleteMany({
          where: { warehouseId: Number(id) }
        });

        // Create new assignments if there are customerIds
        if (customerIds.length > 0) {
          await tx.customerWarehouse.createMany({
            data: customerIds.map((customerId: number) => ({
              customerId,
              warehouseId: Number(id),
              status: 1,
              created_by: req.user?.userId || null,
              modified_by: req.user?.userId || null
            }))
          });
        }
      }

      // Get updated warehouse with all relationships
      return tx.warehouse.findUnique({
        where: { id: Number(id) },
        include: {
          customers: {
            include: {
              customer: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });
    });

    res.json(warehouse);
  } catch (error) {
    console.error('Update warehouse error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Unique constraint violation' });
      }
    }
    res.status(500).json({ 
      error: 'Error updating warehouse',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// También exportamos una versión nombrada para consistencia con el controlador base
export const warehouseUpdateController = {
  update: updateWarehouse
};