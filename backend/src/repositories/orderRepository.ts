// backend/src/repositories/orderRepository.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { OrderDomain, OrderStatsDomain } from '../domain/order';
import { CreateOrderDTO, UpdateOrderDTO, OrderFilters, OrderStatsFilters } from '../services/orders/types';
import Logger from '../config/logger';
import { ERROR_MESSAGES, LOG_MESSAGES } from '../shared/constants';

export class OrderRepository {
  constructor(private prisma: PrismaClient) {}

  private readonly defaultOrderInclude = {
    items: {
      include: {
        material: {
          select: {
            code: true,
            description: true,
            uom: true
          }
        }
      }
    },
    carrier: {
      select: {
        name: true,
        lookupCode: true
      }
    },
    carrierService: {
      select: {
        name: true,
        description: true
      }
    },
    warehouse: {
      select: {
        name: true,
        city: true,
        state: true
      }
    },
    shipToAccount: {
      select: {
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true
      }
    },
    billToAccount: {
      select: {
        name: true,
        address: true,
        city: true,
        state: true,
        zipCode: true
      }
    },
    customer: {
      select: {
        name: true
      }
    }
  } as const;

  async findById(id: number): Promise<OrderDomain | null> {
    Logger.debug('Repository: Finding order by ID', {
      orderId: id,
      operation: 'findById'
    });

    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: this.defaultOrderInclude
      });

      if (order) {
        Logger.debug('Repository: Order found', {
          orderId: id,
          orderNumber: order.orderNumber,
          status: order.status,
          itemCount: order.items.length,
          operation: 'findById'
        });
      } else {
        Logger.debug('Repository: Order not found', {
          orderId: id,
          operation: 'findById'
        });
      }

      if (!order) return null;
      return this.mapToDomain(order);
    } catch (error) {
      Logger.error('Repository: Error finding order by ID', {
        orderId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'findById'
      });
      throw error;
    }
  }

  async create(data: CreateOrderDTO, userId: number): Promise<OrderDomain> {
    Logger.info('Repository: Creating new order', {
      customerId: data.customerId,
      itemCount: data.items.length,
      userId,
      operation: 'create'
    });

    try {
      const orderNumber = await this.generateOrderNumber();
      Logger.debug('Repository: Generated order number', {
        orderNumber,
        operation: 'create'
      });

      const order = await this.prisma.order.create({
        data: {
          orderNumber,
          lookupCode: orderNumber,
          status: 10, // DRAFT status
          orderTypeId: data.orderTypeId,
          customerId: data.customerId,
          shipToAccountId: data.shipToAccountId,
          billToAccountId: data.billToAccountId,
          carrierId: data.carrierId,
          carrierServiceId: data.carrierServiceId,
          warehouseId: data.warehouseId || null,
          expectedDeliveryDate: new Date(data.expectedDeliveryDate),
          items: {
            create: data.items.map(item => ({
              materialId: item.materialId,
              quantity: item.quantity,
              status: 1,
              created_by: userId,
              modified_by: userId
            }))
          },
          created_by: userId,
          modified_by: userId
        },
        include: this.defaultOrderInclude
      });

      Logger.info('Repository: Successfully created order', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        itemCount: order.items.length,
        userId,
        operation: 'create'
      });

      return this.mapToDomain(order);
    } catch (error) {
      Logger.error('Repository: Error creating order', {
        customerId: data.customerId,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        operation: 'create'
      });
      throw error;
    }
  }

  async update(id: number, data: UpdateOrderDTO, userId: number): Promise<OrderDomain> {
    Logger.info('Repository: Updating order', {
      orderId: id,
      hasItems: !!data.items,
      itemCount: data.items?.length,
      userId,
      operation: 'update'
    });

    try {
      const order = await this.prisma.$transaction(async (tx) => {
        if (data.items) {
          Logger.debug('Repository: Deleting existing order items', {
            orderId: id,
            operation: 'update'
          });

          await tx.orderItem.deleteMany({
            where: { orderId: id }
          });
        }

        const updated = await tx.order.update({
          where: { id },
          data: {
            ...(data.orderTypeId && { orderTypeId: data.orderTypeId }),
            ...(data.shipToAccountId && { shipToAccountId: data.shipToAccountId }),
            ...(data.billToAccountId && { billToAccountId: data.billToAccountId }),
            ...(data.carrierId && { carrierId: data.carrierId }),
            ...(data.carrierServiceId && { carrierServiceId: data.carrierServiceId }),
            ...(data.warehouseId !== undefined && { warehouseId: data.warehouseId || null }),
            ...(data.expectedDeliveryDate && { 
              expectedDeliveryDate: new Date(data.expectedDeliveryDate) 
            }),
            modified_by: userId,
            modified_at: new Date(),
            ...(data.items && {
              items: {
                create: data.items.map(item => ({
                  materialId: item.materialId,
                  quantity: item.quantity,
                  status: 1,
                  created_by: userId,
                  modified_by: userId
                }))
              }
            })
          },
          include: this.defaultOrderInclude
        });

        return updated;
      });

      Logger.info('Repository: Successfully updated order', {
        orderId: id,
        orderNumber: order.orderNumber,
        itemCount: order.items.length,
        userId,
        operation: 'update'
      });

      return this.mapToDomain(order);
    } catch (error) {
      Logger.error('Repository: Error updating order', {
        orderId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        operation: 'update'
      });
      throw error;
    }
  }
  async delete(id: number): Promise<void> {
    Logger.info('Repository: Deleting order', {
      orderId: id,
      operation: 'delete'
    });

    try {
      await this.prisma.$transaction([
        this.prisma.orderItem.deleteMany({
          where: { orderId: id }
        }),
        this.prisma.order.delete({
          where: { id }
        })
      ]);

      Logger.info('Repository: Successfully deleted order and items', {
        orderId: id,
        operation: 'delete'
      });
    } catch (error) {
      Logger.error('Repository: Error deleting order', {
        orderId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'delete'
      });
      throw error;
    }
  }

  async list(filters: OrderFilters) {
    Logger.debug('Repository: Listing orders with filters', {
      filters,
      operation: 'list'
    });

    try {
      const where: Prisma.OrderWhereInput = {
        ...(filters.customerId && { customerId: filters.customerId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.fromDate && filters.toDate && {
          created_at: {
            gte: filters.fromDate,
            lte: filters.toDate
          }
        })
      };

      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          skip: ((filters.page || 1) - 1) * (filters.limit || 20),
          take: filters.limit || 20,
          include: this.defaultOrderInclude,
          orderBy: {
            created_at: 'desc'
          }
        }),
        this.prisma.order.count({ where })
      ]);

      Logger.debug('Repository: Successfully retrieved orders', {
        count: orders.length,
        total,
        filters,
        operation: 'list'
      });

      return {
        orders: orders.map(order => this.mapToDomain(order)),
        total
      };
    } catch (error) {
      Logger.error('Repository: Error listing orders', {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'list'
      });
      throw error;
    }
  }

  async getStats(filters: OrderStatsFilters): Promise<OrderStatsDomain> {
    Logger.debug('Repository: Getting order statistics', {
      filters,
      operation: 'getStats'
    });

    try {
      const baseWhereClause = {
        customerId: filters.customerId,
        created_at: {
          gte: new Date(Date.now() - (filters.periodInMonths || 12) * 30 * 24 * 60 * 60 * 1000)
        }
      };

      const [
        totalOrders,
        ordersByStatus,
        ordersByMonth,
        topCarriers,
        topMaterials
      ] = await Promise.all([
        this.prisma.order.count({
          where: baseWhereClause
        }),
        this.prisma.order.groupBy({
          by: ['status'],
          where: baseWhereClause,
          _count: true
        }),
        this.prisma.order.groupBy({
          by: ['created_at'],
          where: baseWhereClause,
          _count: true
        }),
        this.prisma.order.groupBy({
          by: ['carrierId'],
          where: baseWhereClause,
          _count: true,
          orderBy: {
            carrierId: 'asc'
          },
          take: 5
        }),
        this.prisma.orderItem.groupBy({
          by: ['materialId'],
          where: {
            order: baseWhereClause
          },
          _count: true,
          _sum: {
            quantity: true
          },
          orderBy: {
            materialId: 'asc'
          },
          take: 5
        })
      ]);

      Logger.debug('Repository: Getting additional details for stats', {
        totalOrders,
        statusCount: ordersByStatus.length,
        operation: 'getStats'
      });

      // Get additional details for carriers and materials
      const [carrierDetails, materialDetails] = await Promise.all([
        this.prisma.carrier.findMany({
          where: {
            id: {
              in: topCarriers.map(c => c.carrierId)
            }
          },
          select: {
            id: true,
            name: true
          }
        }),
        this.prisma.material.findMany({
          where: {
            id: {
              in: topMaterials.map(m => m.materialId)
            }
          },
          select: {
            id: true,
            code: true
          }
        })
      ]);

      const stats: OrderStatsDomain = {
        totalOrders,
        ordersByStatus: ordersByStatus.map(status => ({
          status: status.status,
          count: status._count || 0,
          percentage: ((status._count || 0) / totalOrders * 100).toFixed(1)
        })),
        ordersByMonth: ordersByMonth.map(month => ({
          month: month.created_at.toISOString().slice(0, 7),
          count: month._count || 0
        })),
        topCarriers: topCarriers.map(carrier => ({
          carrierId: carrier.carrierId,
          carrierName: carrierDetails.find(c => c.id === carrier.carrierId)?.name || 'Unknown',
          orderCount: carrier._count || 0
        })),
        topMaterials: topMaterials.map(material => ({
          materialId: material.materialId,
          materialCode: materialDetails.find(m => m.id === material.materialId)?.code || 'Unknown',
          orderCount: material._count || 0,
          totalQuantity: material._sum?.quantity || 0
        }))
      };

      Logger.info('Repository: Successfully generated order statistics', {
        totalOrders: stats.totalOrders,
        statusTypesCount: stats.ordersByStatus.length,
        topCarriersCount: stats.topCarriers.length,
        topMaterialsCount: stats.topMaterials.length,
        operation: 'getStats'
      });

      return stats;
    } catch (error) {
      Logger.error('Repository: Error getting order statistics', {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'getStats'
      });
      throw error;
    }
  }

  private async generateOrderNumber(): Promise<string> {
    Logger.debug('Repository: Generating new order number', {
      operation: 'generateOrderNumber'
    });

    try {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      
      const lastOrder = await this.prisma.order.findFirst({
        where: {
          orderNumber: {
            startsWith: `ORD${year}${month}${day}`
          }
        },
        orderBy: {
          orderNumber: 'desc'
        }
      });

      const sequence = lastOrder 
        ? String(Number(lastOrder.orderNumber.slice(-4)) + 1).padStart(4, '0')
        : '0001';

      const orderNumber = `ORD${year}${month}${day}${sequence}`;

      Logger.debug('Repository: Generated order number', {
        orderNumber,
        operation: 'generateOrderNumber'
      });

      return orderNumber;
    } catch (error) {
      Logger.error('Repository: Error generating order number', {
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'generateOrderNumber'
      });
      throw error;
    }
  }

  private mapToDomain(order: any): OrderDomain {
    return {
      id: order.id,
      lookupCode: order.lookupCode,
      orderNumber: order.orderNumber,
      status: order.status,
      orderTypeId: order.orderTypeId,
      customerId: order.customerId,
      shipToAccountId: order.shipToAccountId,
      billToAccountId: order.billToAccountId,
      carrierId: order.carrierId,
      carrierServiceId: order.carrierServiceId,
      warehouseId: order.warehouseId || undefined,
      expectedDeliveryDate: order.expectedDeliveryDate,
      created_at: order.created_at,
      modified_at: order.modified_at,
      created_by: order.created_by,
      modified_by: order.modified_by,
      items: order.items.map((item: any) => ({
        id: item.id,
        materialId: item.materialId,
        quantity: item.quantity,
        status: item.status,
        material: item.material
      })),
      carrier: order.carrier,
      carrierService: order.carrierService,
      warehouse: order.warehouse,
      shipToAccount: order.shipToAccount,
      billToAccount: order.billToAccount,
      customer: order.customer
    };
  }
}