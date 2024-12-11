// backend/src/repositories/materialRepository.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { MaterialDomain, MaterialFilters, MaterialSearchFilters, PaginatedResponse } from '../domain/material';
import Logger from '../config/logger';
import { ERROR_MESSAGES, LOG_MESSAGES } from '../shared/constants';

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

  async findById(id: number, customerId?: number): Promise<MaterialDomain | null> {
    Logger.debug('Repository: Finding material by ID', {
      materialId: id,
      customerId,
      operation: 'findById'
    });

    try {
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

      if (material) {
        Logger.debug('Repository: Material found', {
          materialId: id,
          code: material.code,
          orderItemsCount: material._count.orderItems,
          operation: 'findById'
        });
      } else {
        Logger.debug('Repository: Material not found', {
          materialId: id,
          customerId,
          operation: 'findById'
        });
      }

      if (!material) return null;

      const materialDomain = this.mapToDomain(material);

      return materialDomain;
    } catch (error) {
      Logger.error('Repository: Error finding material by ID', {
        materialId: id,
        customerId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'findById'
      });
      throw error;
    }
  }

  async findAll(filters: MaterialFilters): Promise<PaginatedResponse<MaterialDomain>> {
    Logger.debug('Repository: Finding all materials with filters', {
      filters,
      operation: 'findAll'
    });

    try {
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

      Logger.debug('Repository: Successfully retrieved materials', {
        count: materials.length,
        total,
        skip,
        take: filters.limit || 20,
        operation: 'findAll'
      });

      return {
        data: materials.map(material => ({
          ...material,
          stats: {
            totalOrders: material._count.orderItems,
            totalQuantityOrdered: 0,
            averageQuantityPerOrder: 0
          }
        })),
        pagination: {
          total,
          page: filters.page || 1,
          limit: filters.limit || 20,
          totalPages: Math.ceil(total / (filters.limit || 20))
        }
      };
    } catch (error) {
      Logger.error('Repository: Error finding all materials', {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'findAll'
      });
      throw error;
    }
  }

  async search(filters: MaterialSearchFilters): Promise<PaginatedResponse<MaterialDomain>> {
    Logger.debug('Repository: Searching materials with filters', {
      filters,
      operation: 'search'
    });

    try {
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

      Logger.debug('Repository: Executing material search', {
        conditions,
        skip,
        take: filters.limit || 20,
        operation: 'search'
      });

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

      Logger.debug('Repository: Successfully completed material search', {
        count: materials.length,
        total,
        filters,
        operation: 'search'
      });

      return {
        data: materials,
        pagination: {
          total,
          page: filters.page || 1,
          limit: filters.limit || 20,
          totalPages: Math.ceil(total / (filters.limit || 20))
        }
      };
    } catch (error) {
      Logger.error('Repository: Error searching materials', {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'search'
      });
      throw error;
    }
  }

  async getUniqueUoms(): Promise<string[]> {
    Logger.debug('Repository: Getting unique UOMs', {
      operation: 'getUniqueUoms'
    });

    try {
      const uoms = await this.prisma.material.findMany({
        select: { uom: true },
        distinct: ['uom']
      });

      Logger.debug('Repository: Successfully retrieved unique UOMs', {
        count: uoms.length,
        operation: 'getUniqueUoms'
      });

      return uoms.map(u => u.uom);
    } catch (error) {
      Logger.error('Repository: Error getting unique UOMs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'getUniqueUoms'
      });
      throw error;
    }
  }

  private buildBaseWhereClause(filters: MaterialFilters): Prisma.MaterialWhereInput {
    Logger.debug('Repository: Building base where clause', {
      filters,
      operation: 'buildBaseWhereClause'
    });

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

  private mapToDomain(material: any): MaterialDomain {
    const orderHistory = material.orderItems?.map((item: any) => ({
      orderId: item.orderId,
      orderNumber: item.order.orderNumber,
      quantity: item.quantity,
      status: item.status,
      customerName: item.order.customer.name,
      expectedDeliveryDate: item.order.expectedDeliveryDate,
      created_at: item.created_at
    }));

    return {
      ...material,
      orderHistory,
      stats: {
        totalOrders: material._count.orderItems,
        totalQuantityOrdered: material.orderItems?.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        ),
        averageQuantityPerOrder: material._count.orderItems > 0
          ? Math.round(
              material.orderItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) / 
              material._count.orderItems
            )
          : 0
      }
    };
  }
}