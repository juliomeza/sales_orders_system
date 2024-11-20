import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { OrderFilters, PaginationParams, orderInclude, formatError } from './order.controller';

const buildWhereClause = (filters: OrderFilters): Prisma.OrderWhereInput => {
  const where: Prisma.OrderWhereInput = {};
  
  if (filters.customerId) {
    where.customerId = filters.customerId;
  }
  
  if (filters.status) {
    where.status = filters.status;
  }
  
  if (filters.fromDate && filters.toDate) {
    where.created_at = {
      gte: filters.fromDate,
      lte: filters.toDate
    };
  }
  
  return where;
};

const listOrders = async (req: Request, res: Response) => {
  try {
    const { 
      status, 
      fromDate, 
      toDate 
    } = req.query;

    const pagination: PaginationParams = {
      page: typeof req.query.page === 'string' ? req.query.page : '1',
      limit: typeof req.query.limit === 'string' ? req.query.limit : '20'
    };

    const filters: OrderFilters = {
      customerId: req.user!.customerId!,
      ...(status && { status: Number(status) }),
      ...(fromDate && toDate && {
        fromDate: new Date(String(fromDate)),
        toDate: new Date(String(toDate))
      })
    };

    const skip = (Number(pagination.page) - 1) * Number(pagination.limit);
    const where = buildWhereClause(filters);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(pagination.limit),
        include: orderInclude,
        orderBy: {
          modified_at: 'desc'
        }
      }),
      prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(total / Number(pagination.limit));

    res.json({
      orders,
      pagination: {
        total,
        page: Number(pagination.page),
        limit: Number(pagination.limit),
        totalPages
      }
    });
  } catch (error) {
    console.error('List orders error:', error);
    res.status(500).json(formatError(error));
  }
};

export const orderListController = {
  list: listOrders
};