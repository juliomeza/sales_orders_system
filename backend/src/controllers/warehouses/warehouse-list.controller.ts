// backend/src/controllers/warehouses/warehouse-list.controller.ts
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { FormattedWarehouse } from './warehouse.controller';

export const listWarehouses = async (req: Request, res: Response) => {
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
              customerId: true,
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
};

export const warehouseListController = {
  list: listWarehouses
};