// backend/src/controllers/warehouses/warehouse-create.controller.ts
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../config/database';

export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const {
      lookupCode,
      name,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      capacity,
      customerIds = [] // Array of customer IDs to assign to warehouse
    } = req.body;

    // Validate required fields
    if (!lookupCode || !name || !address || !city || !state || !zipCode || !capacity) {
      return res.status(400).json({
        error: 'Missing required fields',
        requiredFields: ['lookupCode', 'name', 'address', 'city', 'state', 'zipCode', 'capacity']
      });
    }

    // Check if warehouse lookupCode already exists
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { lookupCode }
    });

    if (existingWarehouse) {
      return res.status(409).json({ error: 'Warehouse lookupCode already exists' });
    }

    // Create warehouse with customer assignments in a transaction
    const warehouse = await prisma.$transaction(async (tx) => {
      // Create warehouse
      const newWarehouse = await tx.warehouse.create({
        data: {
          lookupCode,
          name,
          address,
          city,
          state,
          zipCode,
          phone,
          email,
          capacity: Number(capacity),
          status: 1,
          created_by: req.user?.userId || null,
          modified_by: req.user?.userId || null
        }
      });

      // Create customer warehouse relationships
      if (customerIds.length > 0) {
        await tx.customerWarehouse.createMany({
          data: customerIds.map((customerId: number) => ({
            customerId,
            warehouseId: newWarehouse.id,
            status: 1,
            created_by: req.user?.userId || null,
            modified_by: req.user?.userId || null
          }))
        });
      }

      return newWarehouse;
    });

    res.status(201).json(warehouse);
  } catch (error) {
    console.error('Create warehouse error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Warehouse with this lookupCode already exists' });
      }
    }
    res.status(500).json({ 
      error: 'Error creating warehouse',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// También exportamos una versión nombrada para consistencia con el controlador base
export const warehouseCreateController = {
  create: createWarehouse
};