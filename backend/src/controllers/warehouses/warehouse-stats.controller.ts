// backend/src/controllers/warehouses/warehouse-stats.controller.ts
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../config/database';

// Interfaces para la respuesta
interface StateDistribution {
  state: string;
  count: number;
  totalCapacity: number;
}

interface CustomerDistribution {
  warehouseId: number;
  customerCount: number;
}

interface WarehouseOrderStats {
  warehouseId: number;
  orderCount: number;
}

interface WarehouseStatsResponse {
  summary: {
    totalActiveWarehouses: number;
    capacity: {
      total: number;
      average: number;
      maximum: number;
      minimum: number;
    };
    utilization: {
      byState: {
        state: string;
        warehouseCount: number;
        totalCapacity: number;
        utilizationPercentage: string;
      }[];
      totalUtilization: number;
    };
    orders?: {
      last30Days: number;
      byWarehouse: WarehouseOrderStats[];
    };
  };
  distributions: {
    byState: StateDistribution[];
    byCustomer?: CustomerDistribution[];
  };
}

export const getWarehouseStats = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.customerId;
    const isAdmin = req.user?.role === 'ADMIN';

    // Base where condition for active warehouses
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

    const [
      activeCount, 
      capacityStats, 
      stateStats,
      customerDistribution,
      orderStats
    ] = await Promise.all([
      // Count of active warehouses
      prisma.warehouse.count({ 
        where: whereCondition
      }),
      
      // Capacity statistics
      prisma.warehouse.aggregate({
        where: whereCondition,
        _sum: { 
          capacity: true 
        },
        _avg: { 
          capacity: true 
        },
        _max: { 
          capacity: true 
        },
        _min: { 
          capacity: true 
        }
      }),
      
      // Distribution by state
      prisma.warehouse.groupBy({
        by: ['state'],
        where: whereCondition,
        _count: true,
        _sum: { 
          capacity: true 
        },
        orderBy: {
          state: 'asc'
        }
      }),

      // Customer distribution (admin only)
      isAdmin ? prisma.customerWarehouse.groupBy({
        by: ['warehouseId'],
        where: {
          warehouse: whereCondition
        },
        _count: true
      }) : null,

      // Order statistics (last 30 days)
      prisma.order.groupBy({
        by: ['warehouseId'],
        where: {
          warehouse: whereCondition,
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        _count: true
      })
    ]);

    // Calculate utilization percentages
    const utilizationStats = stateStats.map(stat => ({
      state: stat.state,
      warehouseCount: stat._count,
      totalCapacity: stat._sum?.capacity ?? 0,
      utilizationPercentage: ((stat._count / activeCount) * 100).toFixed(1)
    }));

    // Initialize response object with correct typing
    const response: WarehouseStatsResponse = {
      summary: {
        totalActiveWarehouses: activeCount,
        capacity: {
          total: capacityStats._sum?.capacity ?? 0,
          average: Math.round(capacityStats._avg?.capacity ?? 0),
          maximum: capacityStats._max?.capacity ?? 0,
          minimum: capacityStats._min?.capacity ?? 0
        },
        utilization: {
          byState: utilizationStats,
          totalUtilization: stateStats.reduce((acc, stat) => 
            acc + (stat._sum?.capacity ?? 0), 0) / activeCount
        }
      },
      distributions: {
        byState: stateStats.map(stat => ({
          state: stat.state,
          count: stat._count,
          totalCapacity: stat._sum?.capacity ?? 0
        }))
      }
    };

    // Add admin-only statistics
    if (isAdmin && customerDistribution) {
      response.distributions.byCustomer = customerDistribution.map(dist => ({
        warehouseId: dist.warehouseId,
        customerCount: dist._count
      }));
    }

    // Add order statistics
    if (orderStats.length > 0) {
        response.summary.orders = {
          last30Days: orderStats.reduce((acc, stat) => acc + stat._count, 0),
          byWarehouse: orderStats
            .filter(stat => stat.warehouseId !== null) // Filtrar los nulls
            .map(stat => ({
              warehouseId: stat.warehouseId as number, // Asegurar que es number
              orderCount: stat._count
            }))
        };
      }

    res.json(response);
  } catch (error) {
    console.error('Get warehouse stats error:', error);
    res.status(500).json({ 
      error: 'Error retrieving warehouse statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// También exportamos una versión nombrada para consistencia con el controlador base
export const warehouseStatsController = {
  getStats: getWarehouseStats
};