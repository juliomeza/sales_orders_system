// backend/src/services/orders/orderService.ts
import { OrderRepository } from '../../repositories/orderRepository';
import { ServiceResult } from '../../shared/types';
import { ValidationService } from '../../shared/validations';
import { OrderDomain, OrderStatsDomain } from '../../domain/order';
import { 
  CreateOrderDTO, 
  UpdateOrderDTO, 
  OrderFilters, 
  OrderListResponse,
  OrderStatsFilters 
} from './types';

export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  async createOrder(data: CreateOrderDTO, userId: number): Promise<ServiceResult<OrderDomain>> {
    const validation = this.validateOrderData(data);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      const order = await this.orderRepository.create(data, userId);
      return {
        success: true,
        data: order
      };
    } catch (error) {
      console.error('Create order error:', error);
      return {
        success: false,
        error: 'Error creating order'
      };
    }
  }

  async updateOrder(id: number, data: UpdateOrderDTO, userId: number): Promise<ServiceResult<OrderDomain>> {
    const validation = this.validateUpdateData(data);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      const order = await this.orderRepository.update(id, data, userId);
      return {
        success: true,
        data: order
      };
    } catch (error) {
      console.error('Update order error:', error);
      return {
        success: false,
        error: 'Error updating order'
      };
    }
  }

  async deleteOrder(id: number): Promise<ServiceResult<void>> {
    try {
      const order = await this.orderRepository.findById(id);
      if (!order) {
        return {
          success: false,
          error: 'Order not found'
        };
      }

      if (order.status !== 10) { // Not DRAFT
        return {
          success: false,
          error: 'Only draft orders can be deleted'
        };
      }

      await this.orderRepository.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Delete order error:', error);
      return {
        success: false,
        error: 'Error deleting order'
      };
    }
  }

  async getOrderById(id: number): Promise<ServiceResult<OrderDomain>> {
    try {
      const order = await this.orderRepository.findById(id);
      if (!order) {
        return {
          success: false,
          error: 'Order not found'
        };
      }

      return {
        success: true,
        data: order
      };
    } catch (error) {
      console.error('Get order error:', error);
      return {
        success: false,
        error: 'Error retrieving order'
      };
    }
  }

  async listOrders(filters: OrderFilters): Promise<ServiceResult<OrderListResponse>> {
    try {
      const { orders, total } = await this.orderRepository.list(filters);
      
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
      console.error('List orders error:', error);
      return {
        success: false,
        error: 'Error listing orders'
      };
    }
  }

  async getOrderStats(filters: OrderStatsFilters): Promise<ServiceResult<OrderStatsDomain>> {
    try {
      const stats = await this.orderRepository.getStats(filters);
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Get order stats error:', error);
      return {
        success: false,
        error: 'Error retrieving order statistics'
      };
    }
  }

  private validateOrderData(data: CreateOrderDTO) {
    return ValidationService.validate([
      {
        condition: !!data.orderTypeId,
        message: 'Order type is required'
      },
      {
        condition: !!data.customerId,
        message: 'Customer is required'
      },
      {
        condition: !!data.shipToAccountId,
        message: 'Ship to account is required'
      },
      {
        condition: !!data.billToAccountId,
        message: 'Bill to account is required'
      },
      {
        condition: !!data.carrierId,
        message: 'Carrier is required'
      },
      {
        condition: !!data.carrierServiceId,
        message: 'Carrier service is required'
      },
      {
        condition: !!data.expectedDeliveryDate,
        message: 'Expected delivery date is required'
      },
      {
        condition: Array.isArray(data.items) && data.items.length > 0,
        message: 'At least one item is required'
      },
      {
        condition: data.items?.every(item => item.quantity > 0),
        message: 'All items must have a quantity greater than zero'
      }
    ]);
  }

  private validateUpdateData(data: UpdateOrderDTO) {
    const rules = [];

    if (data.expectedDeliveryDate) {
      rules.push({
        condition: !isNaN(new Date(data.expectedDeliveryDate).getTime()),
        message: 'Invalid expected delivery date'
      });
    }

    if (data.items) {
      rules.push({
        condition: Array.isArray(data.items) && data.items.length > 0,
        message: 'At least one item is required'
      });
      rules.push({
        condition: data.items.every(item => item.quantity > 0),
        message: 'All items must have a quantity greater than zero'
      });
    }

    return ValidationService.validate(rules);
  }
}