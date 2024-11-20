// backend/src/controllers/orders/order.controller.ts
import { Request, Response } from 'express';
import { Order, Prisma } from '@prisma/client';
import prisma from '../../config/database';

// Shared interfaces
export interface OrderItem {
  materialId: number;
  quantity: number;
}

export interface OrderFilters {
  status?: number;
  fromDate?: Date;
  toDate?: Date;
  customerId?: number;
}

export interface PaginationParams {
  page?: string;
  limit?: string;
}

// Order status enum
export const OrderStatus = {
  DRAFT: 10,
  SUBMITTED: 11,
  PROCESSING: 12,
  COMPLETED: 13
} as const;

// Types for API responses
export interface OrderResponse extends Order {
  items: {
    material: {
      code: string;
      description: string;
      uom: string;
    };
    quantity: number;
  }[];
  carrier: {
    name: string;
    lookupCode: string;
  };
  carrierService: {
    name: string;
    description: string;
  };
  warehouse?: {
    name: string;
    city: string;
    state: string;
  };
  shipToAccount: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  billToAccount: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface OrderListResponse {
  orders: OrderResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrderStatsResponse {
  totalOrders: number;
  ordersByStatus: {
    status: number;
    count: number;
    percentage: string;
  }[];
  ordersByMonth: {
    month: string;
    count: number;
  }[];
  topCarriers: {
    carrierId: number;
    carrierName: string;
    orderCount: number;
  }[];
  topMaterials: {
    materialId: number;
    materialCode: string;
    orderCount: number;
    totalQuantity: number;
  }[];
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Common utilities
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const calculatePagination = (page: string = '1', limit: string = '20') => {
  const pageNum = Number(page);
  const limitNum = Number(limit);
  return {
    skip: (pageNum - 1) * limitNum,
    take: limitNum
  };
};

// Common select objects for Prisma queries
export const orderInclude = {
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
  carrier: {
    select: {
      name: true,
      lookupCode: true
    }
  },
  carrierService: {
    select: {
      name: true,
      description: true
    }
  },
  warehouse: {
    select: {
      name: true,
      city: true,
      state: true
    }
  },
  shipToAccount: {
    select: {
      name: true,
      address: true,
      city: true,
      state: true,
      zipCode: true
    }
  },
  billToAccount: {
    select: {
      name: true,
      address: true,
      city: true,
      state: true,
      zipCode: true
    }
  }
} as const;

// Error formatting
export const formatError = (error: unknown): { error: string; details?: string } => {
  const errorResponse = {
    error: 'An error occurred'
  };

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    errorResponse.error = 'Database error';
    if (error.code === 'P2002') {
      errorResponse.error = 'Unique constraint violation';
    }
  }

  if (error instanceof Error) {
    return {
      error: errorResponse.error,
      details: error.message
    };
  }

  return errorResponse;
};

// GetById implementation
const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: orderInclude
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.customerId !== req.user!.customerId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json(formatError(error));
  }
};

export const ordersController = {
  getById
};