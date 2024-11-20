// backend/src/controllers/materials/material-detail.controller.ts
import { Request, Response } from 'express';
import prisma from '../../config/database';
import { MaterialDetail, formatMaterialResponse } from './material.controller';

const getMaterialDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.user?.customerId;
    const isAdmin = req.user?.role === 'ADMIN';

    const material = await prisma.material.findUnique({
      where: { 
        id: Number(id),
        ...((!isAdmin && customerId) && {
          project: {
            customerId
          }
        })
      },
      include: {
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
        },
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

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const response: MaterialDetail = formatMaterialResponse(material);
    res.json(response);

  } catch (error) {
    console.error('Get material detail error:', error);
    res.status(500).json({ 
      error: 'Error retrieving material details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const materialDetailController = {
  getById: getMaterialDetail
};