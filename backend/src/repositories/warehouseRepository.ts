// backend/src/repositories/warehouseRepository.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { WarehouseDomain } from '../domain/warehouse';
import { WarehouseFilters, CreateWarehouseDTO, UpdateWarehouseDTO } from '../services/warehouses/types';
import Logger from '../config/logger';
import { ERROR_MESSAGES, LOG_MESSAGES } from '../shared/constants';

export class WarehouseRepository {
  constructor(private prisma: PrismaClient) {}

  private readonly defaultInclude = {
    customers: {
      include: {
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
  };

  async findById(id: number, customerId?: number): Promise<WarehouseDomain | null> {
    Logger.debug('Repository: Finding warehouse by ID', {
      warehouseId: id,
      customerId,
      operation: 'findById'
    });

    try {
      const whereCondition: Prisma.WarehouseWhereInput = {
        id,
        ...(customerId && {
          customers: {
            some: {
              customerId,
              status: 1
            }
          }
        })
      };

      const warehouse = await this.prisma.warehouse.findFirst({
        where: whereCondition,
        include: this.defaultInclude
      });

      if (warehouse) {
        Logger.debug('Repository: Warehouse found', {
          warehouseId: id,
          lookupCode: warehouse.lookupCode,
          customerId,
          customerCount: warehouse._count.customers,
          orderCount: warehouse._count.orders,
          operation: 'findById'
        });
      } else {
        Logger.debug('Repository: Warehouse not found', {
          warehouseId: id,
          customerId,
          operation: 'findById'
        });
      }

      return warehouse ? this.mapToDomain(warehouse) : null;
    } catch (error) {
      Logger.error('Repository: Error finding warehouse by ID', {
        warehouseId: id,
        customerId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'findById'
      });
      throw error;
    }
  }

  async findByLookupCode(lookupCode: string): Promise<WarehouseDomain | null> {
    Logger.debug('Repository: Finding warehouse by lookup code', {
      lookupCode,
      operation: 'findByLookupCode'
    });

    try {
      const warehouse = await this.prisma.warehouse.findUnique({
        where: { lookupCode },
        include: this.defaultInclude
      });

      if (warehouse) {
        Logger.debug('Repository: Warehouse found by lookup code', {
          lookupCode,
          warehouseId: warehouse.id,
          customerCount: warehouse._count.customers,
          orderCount: warehouse._count.orders,
          operation: 'findByLookupCode'
        });
      } else {
        Logger.debug('Repository: Warehouse not found by lookup code', {
          lookupCode,
          operation: 'findByLookupCode'
        });
      }

      return warehouse ? this.mapToDomain(warehouse) : null;
    } catch (error) {
      Logger.error('Repository: Error finding warehouse by lookup code', {
        lookupCode,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'findByLookupCode'
      });
      throw error;
    }
  }

  async create(data: CreateWarehouseDTO, userId: number): Promise<WarehouseDomain> {
    Logger.info('Repository: Creating new warehouse', {
      lookupCode: data.lookupCode,
      customerCount: data.customerIds?.length || 0,
      userId,
      operation: 'create'
    });

    return this.prisma.$transaction(async (tx) => {
      try {
        const warehouse = await tx.warehouse.create({
          data: {
            lookupCode: data.lookupCode,
            name: data.name,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            phone: data.phone,
            email: data.email,
            capacity: data.capacity,
            status: 1,
            created_by: userId,
            modified_by: userId,
            customers: {
              create: data.customerIds?.map(customerId => ({
                customerId,
                status: 1,
                created_by: userId,
                modified_by: userId
              })) || []
            }
          },
          include: this.defaultInclude
        });

        Logger.info('Repository: Successfully created warehouse', {
          warehouseId: warehouse.id,
          lookupCode: warehouse.lookupCode,
          customerCount: warehouse._count.customers,
          userId,
          operation: 'create'
        });

        return this.mapToDomain(warehouse);
      } catch (error) {
        Logger.error('Repository: Error creating warehouse', {
          lookupCode: data.lookupCode,
          error: error instanceof Error ? error.message : 'Unknown error',
          userId,
          operation: 'create'
        });
        throw error;
      }
    });
  }

  async update(id: number, data: UpdateWarehouseDTO, userId: number): Promise<WarehouseDomain> {
    Logger.info('Repository: Updating warehouse', {
      warehouseId: id,
      hasCustomerUpdates: Array.isArray(data.customerIds),
      userId,
      operation: 'update'
    });

    return this.prisma.$transaction(async (tx) => {
      try {
        if (data.customerIds !== undefined) {
          Logger.debug('Repository: Updating warehouse customer relationships', {
            warehouseId: id,
            newCustomerCount: data.customerIds.length,
            operation: 'update'
          });

          await tx.customerWarehouse.deleteMany({
            where: { warehouseId: id }
          });

          if (data.customerIds.length > 0) {
            await tx.customerWarehouse.createMany({
              data: data.customerIds.map(customerId => ({
                customerId,
                warehouseId: id,
                status: 1,
                created_by: userId,
                modified_by: userId
              }))
            });
          }
        }

        const warehouse = await tx.warehouse.update({
          where: { id },
          data: {
            ...(data.name && { name: data.name }),
            ...(data.address && { address: data.address }),
            ...(data.city && { city: data.city }),
            ...(data.state && { state: data.state }),
            ...(data.zipCode && { zipCode: data.zipCode }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.email !== undefined && { email: data.email }),
            ...(data.capacity && { capacity: data.capacity }),
            ...(data.status !== undefined && { status: data.status }),
            modified_by: userId,
            modified_at: new Date()
          },
          include: this.defaultInclude
        });

        Logger.info('Repository: Successfully updated warehouse', {
          warehouseId: id,
          lookupCode: warehouse.lookupCode,
          customerCount: warehouse._count.customers,
          userId,
          operation: 'update'
        });

        return this.mapToDomain(warehouse);
      } catch (error) {
        Logger.error('Repository: Error updating warehouse', {
          warehouseId: id,
          error: error instanceof Error ? error.message : 'Unknown error',
          userId,
          operation: 'update'
        });
        throw error;
      }
    });
  }
  async findAll(filters: WarehouseFilters) {
    Logger.debug('Repository: Finding all warehouses with filters', {
      filters,
      operation: 'findAll'
    });

    try {
      const whereCondition: Prisma.WarehouseWhereInput = {
        ...(filters.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { lookupCode: { contains: filters.search, mode: 'insensitive' } },
            { city: { contains: filters.search, mode: 'insensitive' } }
          ]
        }),
        ...(filters.status !== undefined && { status: filters.status }),
        ...(filters.city && { city: { contains: filters.city, mode: 'insensitive' } }),
        ...(filters.state && { state: { contains: filters.state, mode: 'insensitive' } }),
        ...(filters.customerId && {
          customers: {
            some: {
              customerId: filters.customerId,
              status: 1
            }
          }
        })
      };

      const [warehouses, total] = await Promise.all([
        this.prisma.warehouse.findMany({
          where: whereCondition,
          skip: ((filters.page || 1) - 1) * (filters.limit || 20),
          take: filters.limit || 20,
          include: this.defaultInclude,
          orderBy: [
            { status: 'desc' },
            { lookupCode: 'asc' }
          ]
        }),
        this.prisma.warehouse.count({ where: whereCondition })
      ]);

      Logger.debug('Repository: Successfully retrieved warehouses', {
        count: warehouses.length,
        total,
        filters,
        operation: 'findAll'
      });

      return {
        data: warehouses.map(this.mapToDomain),
        pagination: {
          total,
          page: filters.page || 1,
          limit: filters.limit || 20,
          totalPages: Math.ceil(total / (filters.limit || 20))
        }
      };
    } catch (error) {
      Logger.error('Repository: Error finding warehouses', {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'findAll'
      });
      throw error;
    }
  }

  async getStats() {
    Logger.debug('Repository: Getting warehouse statistics', {
      operation: 'getStats'
    });

    try {
      const [
        activeCount,
        capacityStats,
        stateStats,
        customerDistribution,
        orderStats
      ] = await Promise.all([
        this.prisma.warehouse.count({ 
          where: { status: 1 }
        }),
        this.prisma.warehouse.aggregate({
          where: { status: 1 },
          _sum: { capacity: true },
          _avg: { capacity: true },
          _max: { capacity: true },
          _min: { capacity: true }
        }),
        this.prisma.warehouse.groupBy({
          by: ['state'],
          where: { status: 1 },
          _count: true,
          _sum: { capacity: true }
        }),
        this.prisma.customerWarehouse.groupBy({
          by: ['warehouseId'],
          where: { status: 1 },
          _count: true
        }),
        this.prisma.order.groupBy({
          by: ['warehouseId'],
          where: {
            created_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          },
          _count: true
        })
      ]);

      Logger.debug('Repository: Successfully retrieved warehouse statistics', {
        activeWarehouses: activeCount,
        totalCapacity: capacityStats._sum?.capacity,
        stateCount: stateStats.length,
        operation: 'getStats'
      });

      return {
        summary: {
          totalActiveWarehouses: activeCount,
          capacity: {
            total: capacityStats._sum?.capacity ?? 0,
            average: Math.round(capacityStats._avg?.capacity ?? 0),
            maximum: capacityStats._max?.capacity ?? 0,
            minimum: capacityStats._min?.capacity ?? 0
          },
          utilization: {
            byState: stateStats.map(stat => ({
              state: stat.state,
              warehouseCount: stat._count,
              totalCapacity: stat._sum?.capacity ?? 0,
              utilizationPercentage: ((stat._count / activeCount) * 100).toFixed(1)
            })),
            totalUtilization: stateStats.reduce((acc, stat) => 
              acc + (stat._sum?.capacity ?? 0), 0) / activeCount
          },
          orders: {
            last30Days: orderStats.reduce((acc, stat) => acc + stat._count, 0),
            byWarehouse: orderStats.map(stat => ({
              warehouseId: stat.warehouseId as number,
              orderCount: stat._count
            }))
          }
        },
        distributions: {
          byState: stateStats.map(stat => ({
            state: stat.state,
            count: stat._count,
            totalCapacity: stat._sum?.capacity ?? 0
          })),
          byCustomer: customerDistribution.map(dist => ({
            warehouseId: dist.warehouseId,
            customerCount: dist._count
          }))
        }
      };
    } catch (error) {
      Logger.error('Repository: Error getting warehouse statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'getStats'
      });
      throw error;
    }
  }

  async getOrderCount(id: number): Promise<number> {
    Logger.debug('Repository: Getting order count for warehouse', {
      warehouseId: id,
      operation: 'getOrderCount'
    });

    try {
      const count = await this.prisma.order.count({
        where: { warehouseId: id }
      });

      Logger.debug('Repository: Successfully retrieved order count', {
        warehouseId: id,
        count,
        operation: 'getOrderCount'
      });

      return count;
    } catch (error) {
      Logger.error('Repository: Error getting order count', {
        warehouseId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'getOrderCount'
      });
      throw error;
    }
  }

  async softDelete(id: number): Promise<void> {
    Logger.info('Repository: Soft deleting warehouse', {
      warehouseId: id,
      operation: 'softDelete'
    });

    try {
      await this.prisma.warehouse.update({
        where: { id },
        data: { 
          status: 2,
          modified_at: new Date()
        }
      });

      Logger.info('Repository: Successfully soft deleted warehouse', {
        warehouseId: id,
        operation: 'softDelete'
      });
    } catch (error) {
      Logger.error('Repository: Error soft deleting warehouse', {
        warehouseId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'softDelete'
      });
      throw error;
    }
  }

  async hardDelete(id: number): Promise<void> {
    Logger.info('Repository: Hard deleting warehouse', {
      warehouseId: id,
      operation: 'hardDelete'
    });

    try {
      await this.prisma.$transaction([
        this.prisma.customerWarehouse.deleteMany({
          where: { warehouseId: id }
        }),
        this.prisma.warehouse.delete({
          where: { id }
        })
      ]);

      Logger.info('Repository: Successfully hard deleted warehouse', {
        warehouseId: id,
        operation: 'hardDelete'
      });
    } catch (error) {
      Logger.error('Repository: Error hard deleting warehouse', {
        warehouseId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'hardDelete'
      });
      throw error;
    }
  }

  private mapToDomain(warehouse: any): WarehouseDomain {
    return {
      id: warehouse.id,
      lookupCode: warehouse.lookupCode,
      name: warehouse.name,
      address: warehouse.address,
      city: warehouse.city,
      state: warehouse.state,
      zipCode: warehouse.zipCode,
      phone: warehouse.phone,
      email: warehouse.email,
      capacity: warehouse.capacity,
      status: warehouse.status,
      customers: warehouse.customers?.map((rel: any) => ({
        customerId: rel.customer.id,
        customer: rel.customer
      })),
      stats: {
        orderCount: warehouse._count.orders,
        customerCount: warehouse._count.customers
      }
    };
  }
}