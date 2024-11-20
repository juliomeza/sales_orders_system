// backend/src/controllers/orders/order-stats.controller.ts
import { Request, Response } from 'express';
import prisma from '../../config/database';
import { OrderStatsResponse } from './order.controller';

const getOrderStats = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.customerId!;
    const periodInMonths = Number(req.query.period) || 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - periodInMonths);

    const baseWhereClause = {
      customerId,
      created_at: {
        gte: startDate
      }
    };

    const [
      totalOrders,
      ordersByStatus,
      ordersByMonthRaw,
      topCarriersRaw,
      topMaterialsRaw
    ] = await Promise.all([
      // Total orders
      prisma.order.count({
        where: baseWhereClause
      }),

      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        where: baseWhereClause,
        _count: true
      }),

      // Orders by month
      prisma.order.groupBy({
        by: ['created_at'],
        where: baseWhereClause,
        _count: true
      }),

      // Top carriers
      prisma.order.groupBy({
        by: ['carrierId'],
        where: baseWhereClause,
        _count: true,
        orderBy: {
          carrierId: 'desc'
        },
        take: 5
      }),

      // Top materials
      prisma.orderItem.groupBy({
        by: ['materialId'],
        where: {
          order: baseWhereClause
        },
        _count: true,
        _sum: {
          quantity: true
        },
        orderBy: {
          materialId: 'desc'
        },
        take: 5
      })
    ]);

    // Get carrier and material details
    const [carrierDetails, materialDetails] = await Promise.all([
      prisma.carrier.findMany({
        where: {
          id: {
            in: topCarriersRaw.map(c => c.carrierId)
          }
        },
        select: {
          id: true,
          name: true
        }
      }),
      prisma.material.findMany({
        where: {
          id: {
            in: topMaterialsRaw.map(m => m.materialId)
          }
        },
        select: {
          id: true,
          code: true
        }
      })
    ]);

    const ordersByMonth = ordersByMonthRaw.map(month => ({
      month: month.created_at.toISOString().slice(0, 7),
      count: month._count
    }));

    const stats: OrderStatsResponse = {
      totalOrders,
      ordersByStatus: ordersByStatus.map(status => ({
        status: status.status,
        count: status._count,
        percentage: ((status._count / totalOrders) * 100).toFixed(1)
      })),
      ordersByMonth,
      topCarriers: topCarriersRaw.map(carrier => ({
        carrierId: carrier.carrierId,
        carrierName: carrierDetails.find(c => c.id === carrier.carrierId)?.name || 'Unknown',
        orderCount: carrier._count
      })),
      topMaterials: topMaterialsRaw.map(material => ({
        materialId: material.materialId,
        materialCode: materialDetails.find(m => m.id === material.materialId)?.code || 'Unknown',
        orderCount: material._count,
        totalQuantity: material._sum?.quantity || 0
      }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ 
      error: 'Error retrieving order statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const orderStatsController = {
  getStats: getOrderStats
};