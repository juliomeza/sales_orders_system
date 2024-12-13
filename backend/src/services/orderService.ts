// backend/src/services/orderService.ts
import { OrderRepository } from '../repositories/orderRepository';
import { ServiceResult } from '../shared/types';
import { ValidationService } from '../shared/validations';
import { OrderDomain, OrderStatsDomain } from '../domain/order';
import { ERROR_MESSAGES, ORDER_STATUS, LOG_MESSAGES } from '../shared/constants';
import Logger from '../config/logger';
import { 
  CreateOrderDTO, 
  UpdateOrderDTO, 
  OrderFilters, 
  OrderListResponse,
  OrderStatsFilters 
} from '../shared/types';

export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  async createOrder(data: CreateOrderDTO, userId: number): Promise<ServiceResult<OrderDomain>> {
    Logger.info(LOG_MESSAGES.ORDERS.CREATE.ATTEMPT, {
      customerId: data.customerId,
      orderTypeId: data.orderTypeId,
      itemsCount: data.items.length,
      userId
    });

    const validation = this.validateOrderData(data);
    if (!validation.isValid) {
      Logger.warn(LOG_MESSAGES.ORDERS.CREATE.FAILED_VALIDATION, {
        customerId: data.customerId,
        errors: validation.errors,
        userId
      });

      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      const order = await this.orderRepository.create(data, userId);

      Logger.info(LOG_MESSAGES.ORDERS.CREATE.SUCCESS, {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        itemsCount: order.items.length,
        userId
      });

      return {
        success: true,
        data: order
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.ORDERS.CREATE.FAILED, {
        customerId: data.customerId,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR
      };
    }
  }

  async updateOrder(id: number, data: UpdateOrderDTO, userId: number): Promise<ServiceResult<OrderDomain>> {
    Logger.info(LOG_MESSAGES.ORDERS.UPDATE.ATTEMPT, {
      orderId: id,
      hasItems: !!data.items,
      itemCount: data.items?.length,
      userId
    });

    const validation = this.validateUpdateData(data);
    if (!validation.isValid) {
      Logger.warn(LOG_MESSAGES.ORDERS.UPDATE.FAILED_VALIDATION, {
        orderId: id,
        errors: validation.errors,
        userId
      });

      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      const order = await this.orderRepository.findById(id);
      if (!order) {
        Logger.warn(LOG_MESSAGES.ORDERS.UPDATE.FAILED_NOT_FOUND, {
          orderId: id,
          userId
        });

        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.ORDER
        };
      }

      if (order.status !== ORDER_STATUS.DRAFT) {
        Logger.warn(LOG_MESSAGES.ORDERS.UPDATE.FAILED_DRAFT_ONLY, {
          orderId: id,
          currentStatus: order.status,
          userId
        });

        return {
          success: false,
          error: 'Only draft orders can be updated'
        };
      }

      const updatedOrder = await this.orderRepository.update(id, data, userId);

      Logger.info(LOG_MESSAGES.ORDERS.UPDATE.SUCCESS, {
        orderId: id,
        orderNumber: updatedOrder.orderNumber,
        itemsCount: updatedOrder.items.length,
        userId
      });

      return {
        success: true,
        data: updatedOrder
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.ORDERS.UPDATE.FAILED, {
        orderId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR
      };
    }
  }

  async deleteOrder(id: number): Promise<ServiceResult<void>> {
    Logger.info(LOG_MESSAGES.ORDERS.DELETE.ATTEMPT, { orderId: id });

    try {
      const order = await this.orderRepository.findById(id);
      if (!order) {
        Logger.warn(LOG_MESSAGES.ORDERS.DELETE.FAILED_NOT_FOUND, { orderId: id });
        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.ORDER
        };
      }

      if (order.status !== ORDER_STATUS.DRAFT) {
        Logger.warn(LOG_MESSAGES.ORDERS.DELETE.FAILED_DRAFT_ONLY, {
          orderId: id,
          currentStatus: order.status
        });

        return {
          success: false,
          error: 'Only draft orders can be deleted'
        };
      }

      await this.orderRepository.delete(id);

      Logger.info(LOG_MESSAGES.ORDERS.DELETE.SUCCESS, {
        orderId: id,
        orderNumber: order.orderNumber
      });

      return { success: true };
    } catch (error) {
      Logger.error(LOG_MESSAGES.ORDERS.DELETE.FAILED, {
        orderId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.DELETE_ERROR
      };
    }
  }

  async getOrderById(id: number): Promise<ServiceResult<OrderDomain>> {
    Logger.debug(LOG_MESSAGES.ORDERS.GET.REQUEST, { orderId: id });

    try {
      const order = await this.orderRepository.findById(id);
      
      if (!order) {
        Logger.warn(LOG_MESSAGES.ORDERS.GET.FAILED_NOT_FOUND, { orderId: id });
        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.ORDER
        };
      }

      Logger.info(LOG_MESSAGES.ORDERS.GET.SUCCESS, {
        orderId: id,
        orderNumber: order.orderNumber,
        status: order.status
      });

      return {
        success: true,
        data: order
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.ORDERS.GET.FAILED, {
        orderId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async listOrders(filters: OrderFilters): Promise<ServiceResult<OrderListResponse>> {
    Logger.debug(LOG_MESSAGES.ORDERS.LIST.REQUEST, {
      customerId: filters.customerId,
      status: filters.status,
      dateRange: filters.fromDate && filters.toDate ? `${filters.fromDate}-${filters.toDate}` : undefined,
      page: filters.page,
      limit: filters.limit
    });

    try {
      const { orders, total } = await this.orderRepository.list(filters);
      
      Logger.info(LOG_MESSAGES.ORDERS.LIST.SUCCESS, {
        count: orders.length,
        total,
        customerId: filters.customerId
      });

      return {
        success: true,
        data: {
          orders: orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            expectedDeliveryDate: order.expectedDeliveryDate,
            customerName: order.customer?.name || '',
            itemCount: order.items.length,
            totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
            created_at: order.created_at,
            modified_at: order.modified_at
          })),
          pagination: {
            total,
            page: filters.page || 1,
            limit: filters.limit || 20,
            totalPages: Math.ceil(total / (filters.limit || 20))
          }
        }
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.ORDERS.LIST.FAILED, {
        customerId: filters.customerId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async getOrderStats(filters: OrderStatsFilters): Promise<ServiceResult<OrderStatsDomain>> {
    Logger.debug(LOG_MESSAGES.ORDERS.STATS.REQUEST, {
      customerId: filters.customerId,
      periodInMonths: filters.periodInMonths
    });

    try {
      const stats = await this.orderRepository.getStats(filters);

      Logger.info(LOG_MESSAGES.ORDERS.STATS.SUCCESS, {
        customerId: filters.customerId,
        totalOrders: stats.totalOrders,
        period: filters.periodInMonths
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.ORDERS.STATS.FAILED, {
        customerId: filters.customerId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  private validateOrderData(data: CreateOrderDTO) {
    Logger.debug('Validating order data', {
      customerId: data.customerId,
      itemsCount: data.items?.length
    });

    return ValidationService.validate([
      {
        condition: !!data.orderTypeId,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Order type')
      },
      {
        condition: !!data.customerId,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Customer')
      },
      {
        condition: !!data.shipToAccountId,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Ship to account')
      },
      {
        condition: !!data.billToAccountId,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Bill to account')
      },
      {
        condition: !!data.carrierId,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Carrier')
      },
      {
        condition: !!data.carrierServiceId,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Carrier service')
      },
      {
        condition: !!data.expectedDeliveryDate,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Expected delivery date')
      },
      {
        condition: Array.isArray(data.items) && data.items.length > 0,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Items')
      },
      {
        condition: data.items?.every(item => item.quantity > 0),
        message: ERROR_MESSAGES.VALIDATION.INVALID_QUANTITY
      }
    ]);
  }

  private validateUpdateData(data: UpdateOrderDTO) {
    Logger.debug('Validating order update data', {
      hasItems: !!data.items,
      itemCount: data.items?.length
    });

    const rules = [];

    if (data.expectedDeliveryDate) {
      rules.push({
        condition: !isNaN(new Date(data.expectedDeliveryDate).getTime()),
        message: ERROR_MESSAGES.VALIDATION.INVALID_TYPE
      });
    }

    if (data.items) {
      rules.push({
        condition: Array.isArray(data.items) && data.items.length > 0,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Items')
      });
      rules.push({
        condition: data.items.every(item => item.quantity > 0),
        message: ERROR_MESSAGES.VALIDATION.INVALID_QUANTITY
      });
    }

    return ValidationService.validate(rules);
  }
}