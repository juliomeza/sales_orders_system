// backend/src/controllers/materials/material-search.controller.ts
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { MaterialSearchResponse, MaterialSearchFilters } from './material.controller';

const buildSearchWhereClause = (filters: MaterialSearchFilters): Prisma.MaterialWhereInput => {
  const conditions: Prisma.MaterialWhereInput[] = [
    {
      OR: [
        { code: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } }
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

  return { AND: conditions };
};

const searchMaterials = async (req: Request, res: Response) => {
  try {
    const { 
      query = '',
      uom,
      minQuantity,
      maxQuantity,
      projectId,
      page = '1',
      limit = '20'
    } = req.query;

    const customerId = req.user?.customerId;
    const isAdmin = req.user?.role === 'ADMIN';

    const filters: MaterialSearchFilters = {
      query: String(query),
      uom: uom ? String(uom) : undefined,
      minQuantity: minQuantity ? Number(minQuantity) : undefined,
      maxQuantity: maxQuantity ? Number(maxQuantity) : undefined,
      projectId: projectId ? Number(projectId) : undefined,
      customerId: !isAdmin ? customerId : undefined
    };

    const skip = (Number(page) - 1) * Number(limit);
    const where = buildSearchWhereClause(filters);

    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          project: {
            select: {
              name: true,
              customer: {
                select: {
                  name: true
                }
              }
            }
          },
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
      prisma.material.count({ where })
    ]);

    const response: MaterialSearchResponse = {
      materials: materials.map(material => ({
        ...material,
        projectName: material.project.name,
        customerName: material.project.customer.name,
        recentOrders: material.orderItems.map(item => ({
          orderNumber: item.order.orderNumber,
          status: item.order.status,
          quantity: item.quantity,
          date: item.order.created_at
        }))
      })),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Search materials error:', error);
    res.status(500).json({ 
      error: 'Error searching materials',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const materialSearchController = {
  search: searchMaterials
};