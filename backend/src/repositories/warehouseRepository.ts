// backend/src/repositories/warehouseRepository.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { WarehouseDomain } from '../domain/warehouse';
import { WarehouseFilters, CreateWarehouseDTO, UpdateWarehouseDTO } from '../services/warehouses/types';

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

    return warehouse ? this.mapToDomain(warehouse) : null;
  }

  async findByLookupCode(lookupCode: string): Promise<WarehouseDomain | null> {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { lookupCode },
      include: this.defaultInclude
    });

    return warehouse ? this.mapToDomain(warehouse) : null;
  }

  async create(data: CreateWarehouseDTO, userId: number): Promise<WarehouseDomain> {
    return this.prisma.$transaction(async (tx) => {
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

      return this.mapToDomain(warehouse);
    });
  }

  async update(id: number, data: UpdateWarehouseDTO, userId: number): Promise<WarehouseDomain> {
    return this.prisma.$transaction(async (tx) => {
      if (data.customerIds !== undefined) {
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

      return this.mapToDomain(warehouse);
    });
  }

  async findAll(filters: WarehouseFilters) {
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

    return {
      data: warehouses.map(this.mapToDomain),
      pagination: {
        total,
        page: filters.page || 1,
        limit: filters.limit || 20,
        totalPages: Math.ceil(total / (filters.limit || 20))
      }
    };
  }

  async getStats() {
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
  }

  async getOrderCount(id: number): Promise<number> {
    return this.prisma.order.count({
      where: { warehouseId: id }
    });
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.warehouse.update({
      where: { id },
      data: { 
        status: 2,
        modified_at: new Date()
      }
    });
  }

  async hardDelete(id: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.customerWarehouse.deleteMany({
        where: { warehouseId: id }
      }),
      this.prisma.warehouse.delete({
        where: { id }
      })
    ]);
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