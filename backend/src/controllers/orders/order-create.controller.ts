import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../config/database';

interface OrderItem {
  materialId: number;
  quantity: number;
}

interface CreateOrderData {
  orderTypeId: number;
  customerId: number;
  shipToAccountId: number;
  billToAccountId: number;
  carrierId: number;
  carrierServiceId: number;
  warehouseId: number;
  expectedDeliveryDate: string;
  items: OrderItem[];
}

const validateOrderData = async (data: CreateOrderData): Promise<string[]> => {
  const errors: string[] = [];

  const [material, shipTo, billTo, carrier, service, warehouse] = await Promise.all([
    prisma.material.findMany({
      where: { id: { in: data.items.map(item => item.materialId) } }
    }),
    prisma.account.findUnique({ where: { id: data.shipToAccountId } }),
    prisma.account.findUnique({ where: { id: data.billToAccountId } }),
    prisma.carrier.findUnique({ where: { id: data.carrierId } }),
    prisma.carrierService.findUnique({ where: { id: data.carrierServiceId } }),
    prisma.warehouse.findUnique({ where: { id: data.warehouseId } })
  ]);

  if (material.length !== data.items.length) {
    errors.push('One or more materials not found');
  }

  if (!shipTo) errors.push('Ship to account not found');
  if (!billTo) errors.push('Bill to account not found');
  if (!carrier) errors.push('Carrier not found');
  if (!service) errors.push('Carrier service not found');
  if (!warehouse) errors.push('Warehouse not found');

  const expectedDate = new Date(data.expectedDeliveryDate);
  if (isNaN(expectedDate.getTime())) {
    errors.push('Invalid expected delivery date');
  }

  return errors;
};

const generateOrderNumber = async (): Promise<string> => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  const lastOrder = await prisma.order.findFirst({
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

  return `ORD${year}${month}${day}${sequence}`;
};

const createOrder = async (req: Request, res: Response) => {
  try {
    const orderData: CreateOrderData = req.body;
    
    const validationErrors = await validateOrderData(orderData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    const orderNumber = await generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        lookupCode: orderNumber,
        status: 10, // DRAFT status
        orderTypeId: orderData.orderTypeId,
        customerId: orderData.customerId,
        shipToAccountId: orderData.shipToAccountId,
        billToAccountId: orderData.billToAccountId,
        carrierId: orderData.carrierId,
        carrierServiceId: orderData.carrierServiceId,
        warehouseId: orderData.warehouseId,
        expectedDeliveryDate: new Date(orderData.expectedDeliveryDate),
        items: {
          create: orderData.items.map(item => ({
            materialId: item.materialId,
            quantity: item.quantity,
            status: 1,
            created_by: req.user?.userId,
            modified_by: req.user?.userId
          }))
        },
        created_by: req.user?.userId,
        modified_by: req.user?.userId
      },
      include: {
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
        carrier: true,
        carrierService: true,
        warehouse: true,
        shipToAccount: true,
        billToAccount: true
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Order number already exists' });
      }
    }
    res.status(500).json({ 
      error: 'Error creating order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const orderCreateController = {
  create: createOrder
};