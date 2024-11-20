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