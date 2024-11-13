// backend/src/controllers/carriersController.ts
import { Request, Response } from 'express';
import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export const carriersController = {
  // Get list of all carriers
  list: async (req: Request, res: Response) => {
    try {
      const carriers = await prisma.carrier.findMany({
        where: {
          status: 1 // Solo carriers activos
        },
        select: {
          id: true,
          name: true,
          lookupCode: true,
          status: true,
          services: {
            where: {
              status: 1 // Solo servicios activos
            },
            select: {
              id: true,
              name: true,
              lookupCode: true,
              description: true,
              status: true
            }
          },
          _count: {
            select: {
              orders: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      console.log('Carriers with services:', JSON.stringify(carriers, null, 2)); // Para debugging

      res.json({
        carriers,
        total: carriers.length
      });
    } catch (error) {
      console.error('List carriers error:', error);
      res.status(500).json({ error: 'Error listing carriers' });
    }
  },

  // Get carrier services
  getServices: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const carrier = await prisma.carrier.findUnique({
        where: { 
          id: Number(id),
        },
        select: {
          id: true,
          name: true,
          lookupCode: true,
          status: true,
          services: {
            where: {
              status: 1
            },
            select: {
              id: true,
              name: true,
              lookupCode: true,
              description: true,
              status: true
            }
          }
        }
      });

      if (!carrier) {
        return res.status(404).json({ error: 'Carrier not found' });
      }

      // Get service usage statistics
      const serviceStats = await Promise.all(
        carrier.services.map(async (service) => {
          const orderCount = await prisma.order.count({
            where: {
              carrierServiceId: service.id
            }
          });

          return {
            ...service,
            orderCount
          };
        })
      );

      res.json({
        id: carrier.id,
        name: carrier.name,
        lookupCode: carrier.lookupCode,
        services: serviceStats
      });

    } catch (error) {
      console.error('Get carrier services error:', error);
      res.status(500).json({ error: 'Error retrieving carrier services' });
    }
  }
};