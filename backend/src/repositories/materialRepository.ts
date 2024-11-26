// backend/src/repositories/materialRepository.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { MaterialDomain, MaterialFilters, MaterialSearchFilters, PaginatedResponse } from '../domain/material';

export class MaterialRepository {
  constructor(private prisma: PrismaClient) {}

  private readonly defaultInclude = {
    project: {
      select: {
        id: true,
        name: true,
        description: true,
        customer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    }
  } as const;

  private buildBaseWhereClause(filters: MaterialFilters): Prisma.MaterialWhereInput {
    const conditions: Prisma.MaterialWhereInput[] = [
      {
        OR: [
          { code: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { lookupCode: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    ];

    if (filters.uom) {
      conditions.push({ uom: filters.uom });
    }

    if (filters.status !== undefined) {
      conditions.push({ status: filters.status });
    }

    if (filters.projectId) {
      conditions.push({ projectId: filters.projectId });
    }

    if (filters.customerId) {
      conditions.push({
        project: {
          customerId: filters.customerId
        }
      });
    }

    return { AND: conditions };
  }

  async findById(id: number, customerId?: number): Promise<MaterialDomain | null> {
    // Construir la condición where
    const whereCondition: Prisma.MaterialWhereInput = {
      id,
      ...(customerId && {
        project: {
          customerId
        }
      })
    };
  
    const material = await this.prisma.material.findFirst({
      where: whereCondition,
      include: {
        ...this.defaultInclude,
        orderItems: {
          select: {
            orderId: true,
            quantity: true,
            status: true,
            created_at: true,
            order: {
              select: {
                orderNumber: true,
                status: true,
                expectedDeliveryDate: true,
                created_at: true,
                customer: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    });
  
    if (!material) return null;
  
    return {
      ...material,
      orderHistory: material.orderItems.map(item => ({
        orderId: item.orderId,
        orderNumber: item.order.orderNumber,
        quantity: item.quantity,
        status: item.status,
        customerName: item.order.customer.name,
        expectedDeliveryDate: item.order.expectedDeliveryDate,
        created_at: item.created_at
      })),
      stats: {
        totalOrders: material._count.orderItems,
        totalQuantityOrdered: material.orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        averageQuantityPerOrder: material._count.orderItems > 0
          ? Math.round(
              material.orderItems.reduce((sum, item) => sum + item.quantity, 0) / 
              material._count.orderItems
            )
          : 0
      }
    };
  }

  async findAll(filters: MaterialFilters): Promise<PaginatedResponse<MaterialDomain>> {
    const where = this.buildBaseWhereClause(filters);
    const skip = ((filters.page || 1) - 1) * (filters.limit || 20);

    const [materials, total] = await Promise.all([
      this.prisma.material.findMany({
        where,
        skip,
        take: filters.limit || 20,
        include: {
          ...this.defaultInclude,
          _count: {
            select: {
              orderItems: true
            }
          }
        },
        orderBy: [
          { status: 'desc' },
          { code: 'asc' }
        ]
      }),
      this.prisma.material.count({ where })
    ]);

    return {
      data: materials.map(material => ({
        ...material,
        stats: {
          totalOrders: material._count.orderItems,
          totalQuantityOrdered: 0, // Se calcula solo en detalle
          averageQuantityPerOrder: 0 // Se calcula solo en detalle
        }
      })),
      pagination: {
        total,
        page: filters.page || 1,
        limit: filters.limit || 20,
        totalPages: Math.ceil(total / (filters.limit || 20))
      }
    };
  }

  async search(filters: MaterialSearchFilters): Promise<PaginatedResponse<MaterialDomain>> {
    const conditions: Prisma.MaterialWhereInput[] = [
      {
        OR: [
          { code: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    ];

    if (filters.uom) {
      conditions.push({ uom: filters.uom });
    }

    if (filters.minQuantity !== undefined) {
      conditions.push({ availableQuantity: { gte: filters.minQuantity } });
    }

    if (filters.maxQuantity !== undefined) {
      conditions.push({ availableQuantity: { lte: filters.maxQuantity } });
    }

    if (filters.projectId) {
      conditions.push({ projectId: filters.projectId });
    }

    if (filters.customerId) {
      conditions.push({
        project: {
          customerId: filters.customerId
        }
      });
    }

    const where = { AND: conditions };
    const skip = ((filters.page || 1) - 1) * (filters.limit || 20);

    const [materials, total] = await Promise.all([
      this.prisma.material.findMany({
        where,
        skip,
        take: filters.limit || 20,
        include: {
          ...this.defaultInclude,
          orderItems: {
            select: {
              quantity: true,
              order: {
                select: {
                  orderNumber: true,
                  status: true,
                  created_at: true
                }
              }
            },
            take: 5,
            orderBy: {
              created_at: 'desc'
            }
          }
        },
        orderBy: { code: 'asc' }
      }),
      this.prisma.material.count({ where })
    ]);

    return {
      data: materials,
      pagination: {
        total,
        page: filters.page || 1,
        limit: filters.limit || 20,
        totalPages: Math.ceil(total / (filters.limit || 20))
      }
    };
  }

  async getUniqueUoms(): Promise<string[]> {
    const uoms = await this.prisma.material.findMany({
      select: { uom: true },
      distinct: ['uom']
    });
    return uoms.map(u => u.uom);
  }
}