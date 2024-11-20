// backend/src/controllers/materials/material-list.controller.ts
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { MaterialListResponse, MaterialFilters, buildMaterialWhereClause } from './material.controller';

const listMaterials = async (req: Request, res: Response) => {
  try {
    const { 
      search = '', 
      uom,
      status,
      page = '1', 
      limit = '20',
      projectId 
    } = req.query;

    const customerId = req.user?.customerId;
    const isAdmin = req.user?.role === 'ADMIN';

    const filters: MaterialFilters = {
      search: String(search),
      uom: uom ? String(uom) : undefined,
      status: status ? Number(status) : undefined,
      projectId: projectId ? Number(projectId) : undefined,
      customerId: !isAdmin ? customerId : undefined
    };

    const skip = (Number(page) - 1) * Number(limit);
    const where = buildMaterialWhereClause(filters);

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
      prisma.material.count({ where })
    ]);

    const response: MaterialListResponse = {
      materials: materials.map(material => ({
        ...material,
        orderCount: material._count.orderItems,
        projectName: material.project.name,
        customerName: material.project.customer.name
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
    console.error('List materials error:', error);
    res.status(500).json({ 
      error: 'Error listing materials',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const materialListController = {
  list: listMaterials
};