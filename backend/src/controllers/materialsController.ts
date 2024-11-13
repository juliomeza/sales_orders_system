// backend/src/controllers/materialsController.ts
import { Request, Response } from 'express';
import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export const materialsController = {
  // Get list of materials with pagination and search
  list: async (req: Request, res: Response) => {
    try {
      const { 
        search = '', 
        page = '1', 
        limit = '20' 
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      
      const where: Prisma.MaterialWhereInput = {
        OR: [
          {
            code: {
              contains: String(search),
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: String(search),
              mode: 'insensitive'
            }
          }
        ]
      };

      const [materials, total] = await Promise.all([
        prisma.material.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { code: 'asc' }
        }),
        prisma.material.count({ where })
      ]);

      res.json({
        materials,
        total,
        page: Number(page),
        limit: Number(limit)
      });
    } catch (error) {
      console.error('List materials error:', error);
      res.status(500).json({ error: 'Error listing materials' });
    }
  },

  // Search materials (with more detailed filtering)
  search: async (req: Request, res: Response) => {
    try {
      const { 
        query = '',
        uom,
        minQuantity,
        maxQuantity,
        page = '1',
        limit = '20'
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      
      // Build conditions array
      const conditions: Prisma.MaterialWhereInput[] = [
        {
          OR: [
            {
              code: {
                contains: String(query),
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: String(query),
                mode: 'insensitive'
              }
            }
          ]
        }
      ];

      // Add optional filters
      if (uom) {
        conditions.push({ uom: String(uom) });
      }

      if (minQuantity !== undefined) {
        conditions.push({ availableQuantity: { gte: Number(minQuantity) } });
      }

      if (maxQuantity !== undefined) {
        conditions.push({ availableQuantity: { lte: Number(maxQuantity) } });
      }

      // Combine all conditions with AND
      const where: Prisma.MaterialWhereInput = {
        AND: conditions
      };

      const [materials, total] = await Promise.all([
        prisma.material.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { code: 'asc' }
        }),
        prisma.material.count({ where })
      ]);

      res.json({
        materials,
        total,
        page: Number(page),
        limit: Number(limit)
      });
    } catch (error) {
      console.error('Search materials error:', error);
      res.status(500).json({ error: 'Error searching materials' });
    }
  },

  // Get material details by ID
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const material = await prisma.material.findUnique({
        where: { id: Number(id) },
        include: {
          orderItems: {
            select: {
              orderId: true,
              quantity: true,
              order: {
                select: {
                  orderNumber: true,
                  status: true,
                  created_at: true
                }
              }
            }
          }
        }
      });

      if (!material) {
        return res.status(404).json({ error: 'Material not found' });
      }

      res.json(material);
    } catch (error) {
      console.error('Get material error:', error);
      res.status(500).json({ error: 'Error retrieving material' });
    }
  },

  // Get available UOMs (for filtering)
  getUOMs: async (_req: Request, res: Response) => {
    try {
      const uoms = await prisma.material.findMany({
        select: { uom: true },
        distinct: ['uom']
      });

      res.json(uoms.map(u => u.uom));
    } catch (error) {
      console.error('Get UOMs error:', error);
      res.status(500).json({ error: 'Error retrieving UOMs' });
    }
  }
};