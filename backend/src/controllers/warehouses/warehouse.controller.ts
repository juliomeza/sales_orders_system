// backend/src/controllers/warehouses/warehouse.controller.ts
import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../../config/database';

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
          select: {
            id: true,
            lookupCode: true,
            name: true,
            address: true,
            city: true,
            state: true,
            capacity: true,
            status: true,
            _count: {
              select: {
                orders: true,
                customers: true
              }
            },
            customers: isAdmin ? {
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
            { lookupCode: 'asc' }
          ]
        }),
        prisma.warehouse.count({ where: whereCondition })
      ]);

      const formattedWarehouses = warehouses.map(warehouse => {
        const baseWarehouse: FormattedWarehouse = {
          id: warehouse.id,
          lookupCode: warehouse.lookupCode,
          name: warehouse.name,
          address: warehouse.address,
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
  }
};

// Export interfaces for use in other controllers
export type {
  CustomerData,
  CustomerRelation,
  WarehouseWithRelations,
  FormattedWarehouse
};