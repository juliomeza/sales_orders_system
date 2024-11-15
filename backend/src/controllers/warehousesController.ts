// backend/src/controllers/warehousesController.ts
import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../config/database';

// Interfaces
interface CustomerData {
  id: number;
  name: string;
}

interface CustomerRelation {
  id: number;
  status: number;
  customerId: number;
  customer: {
    id: number;
    name: string;
  };
  created_at: Date;
  created_by: number | null;
  modified_at: Date;
  modified_by: number | null;
  warehouseId: number;
}

interface WarehouseWithRelations {
  id: number;
  lookupCode: string;
  name: string;
  city: string;
  state: string;
  capacity: number;
  status: number;
  _count: {
    orders: number;
    customers: number;
  };
  customers?: CustomerRelation[];
}

interface FormattedWarehouse {
  id: number;
  lookupCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  capacity: number;
  status: number;
  orderCount: number;
  customerCount: number;
  customers?: CustomerData[];
}

export const warehousesController = {
  // Get list of warehouses with pagination and filtering
  list: async (req: Request, res: Response) => {
    try {
      const { 
        search = '', 
        page = '1', 
        limit = '20',
        status,
        city,
        state 
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const customerId = req.user?.customerId;
      const isAdmin = req.user?.role === 'ADMIN';

      // Base where condition
      let whereCondition: Prisma.WarehouseWhereInput = {
        OR: [
          { name: { contains: String(search), mode: 'insensitive' } },
          { lookupCode: { contains: String(search), mode: 'insensitive' } },
          { city: { contains: String(search), mode: 'insensitive' } }
        ]
      };

      if (status !== undefined) {
        whereCondition.status = Number(status);
      }
      
      if (city) {
        whereCondition.city = { contains: String(city), mode: 'insensitive' };
      }
      
      if (state) {
        whereCondition.state = { contains: String(state), mode: 'insensitive' };
      }

      if (!isAdmin && customerId) {
        whereCondition.customers = {
          some: {
            customerId: customerId,
            status: 1
          }
        };
      }

      const [warehouses, total] = await Promise.all([
        prisma.warehouse.findMany({
          where: whereCondition,
          skip,
          take: Number(limit),
          select: {           // Añadir esta sección select
            id: true,
            lookupCode: true,
            name: true,
            address: true,    // Añadir el campo address
            city: true,
            state: true,
            capacity: true,
            status: true,
            _count: {         // Mover el _count dentro del select
              select: {
                orders: true,
                customers: true
              }
            },
            customers: isAdmin ? {  // Mover customers dentro del select
              select: {
                customer: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              },
              where: {
                status: 1
              }
            } : undefined
          },
          orderBy: [
            { status: 'desc' },
            { name: 'asc' }
          ]
        }),
        prisma.warehouse.count({ where: whereCondition })
      ]);

      const formattedWarehouses = warehouses.map(warehouse => {
        const baseWarehouse: FormattedWarehouse = {
          id: warehouse.id,
          lookupCode: warehouse.lookupCode,
          name: warehouse.name,
          address: warehouse.address,  // Añadir esta línea
          city: warehouse.city,
          state: warehouse.state,
          capacity: warehouse.capacity,
          status: warehouse.status,
          orderCount: warehouse._count.orders,
          customerCount: warehouse._count.customers
        };

        if (isAdmin && warehouse.customers) {
          return {
            ...baseWarehouse,
            customers: warehouse.customers
              .filter(rel => rel.customerId)
              .map(rel => ({
                id: rel.customerId,
                name: warehouse.name
              }))
          };
        }
      
        return baseWarehouse;
      });

      res.json({
        warehouses: formattedWarehouses,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      console.error('List warehouses error:', error);
      res.status(500).json({ 
        error: 'Error listing warehouses',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get warehouse details by ID
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const customerId = req.user?.customerId;
      const isAdmin = req.user?.role === 'ADMIN';

      // Base query
      const whereCondition: Prisma.WarehouseWhereInput = {
        id: Number(id)
      };

      // Add customer filter for non-admin users
      if (!isAdmin && customerId) {
        whereCondition.customers = {
          some: {
            customerId: customerId,
            status: 1
          }
        };
      }

      const warehouse = await prisma.warehouse.findFirst({
        where: whereCondition,
        select: {
          id: true,
          lookupCode: true,
          name: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          phone: true,
          email: true,
          capacity: true,
          status: true,
          created_at: true,
          modified_at: true,
          orders: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              expectedDeliveryDate: true,
              created_at: true,
              customer: {
                select: {
                  name: true
                }
              }
            },
            orderBy: {
              modified_at: 'desc'
            },
            take: 10
          },
          customers: {
            where: {
              status: 1
            },
            select: {
              customerId: true,
              customer: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              orders: true,
              customers: true
            }
          }
        }
      });

      if (!warehouse) {
        return res.status(404).json({ error: 'Warehouse not found' });
      }

      // Format response
      const formattedWarehouse = {
        ...warehouse,
        customers: isAdmin ? warehouse.customers.map(rel => ({
          id: rel.customer.id,
          name: rel.customer.name
        })) : undefined,
        customerCount: warehouse._count.customers,
        orderCount: warehouse._count.orders
      };

      res.json(formattedWarehouse);
    } catch (error) {
      console.error('Get warehouse error:', error);
      res.status(500).json({ 
        error: 'Error retrieving warehouse',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // ...












// Create new warehouse (admin only)
create: async (req: Request, res: Response) => {
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
},

// Update warehouse (admin only)
update: async (req: Request, res: Response) => {
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
      if (customerIds) {
        // Remove existing assignments
        await tx.customerWarehouse.deleteMany({
          where: { warehouseId: Number(id) }
        });

        // Create new assignments
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

      return updatedWarehouse;
    });

    res.json(warehouse);
  } catch (error) {
    console.error('Update warehouse error:', error);
    res.status(500).json({ 
      error: 'Error updating warehouse',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
},

// Delete warehouse (admin only)
delete: async (req: Request, res: Response) => {
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
      // Soft delete
      await prisma.warehouse.update({
        where: { id: Number(id) },
        data: { 
          status: 2,
          modified_by: req.user?.userId || null,
          modified_at: new Date()
        }
      });

      return res.json({ 
        message: 'Warehouse has been deactivated',
        details: 'Warehouse had associated orders and was deactivated instead of deleted'
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
},

// Get warehouse statistics
getStats: async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.customerId;
    const isAdmin = req.user?.role === 'ADMIN';

    // Base where condition
    let whereCondition: Prisma.WarehouseWhereInput = {
      status: 1
    };

    // Add customer filter for non-admin users
    if (!isAdmin && customerId) {
      whereCondition.customers = {
        some: {
          customerId: customerId,
          status: 1
        }
      };
    }

    const [activeCount, capacityStats, stateStats] = await Promise.all([
      // Total active warehouses
      prisma.warehouse.count({ 
        where: whereCondition
      }),
      
      // Capacity statistics
      prisma.warehouse.aggregate({
        where: whereCondition,
        _sum: { capacity: true },
        _avg: { capacity: true },
        _max: { capacity: true },
        _min: { capacity: true }
      }),
      
      // Warehouses by state
      prisma.warehouse.groupBy({
        by: ['state'],
        where: whereCondition,
        _count: true,
        _sum: { capacity: true },
        orderBy: {
          state: 'asc'
        }
      })
    ]);

    res.json({
      summary: {
        totalActiveWarehouses: activeCount,
        totalCapacity: capacityStats._sum?.capacity ?? 0,
        averageCapacity: Math.round(capacityStats._avg?.capacity ?? 0),
        maxCapacity: capacityStats._max?.capacity ?? 0,
        minCapacity: capacityStats._min?.capacity ?? 0
      },
      warehousesByState: stateStats.map(stat => ({
        state: stat.state,
        count: stat._count,
        totalCapacity: stat._sum?.capacity ?? 0
      }))
    });
  } catch (error) {
    console.error('Get warehouse stats error:', error);
    res.status(500).json({ 
      error: 'Error retrieving warehouse statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
};
