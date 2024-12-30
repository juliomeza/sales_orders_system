import { Request, Response } from 'express';
import { OrderService } from '../services/orderService';
import { OrderRepository } from '../repositories/orderRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES, ORDER_STATUS, LOG_MESSAGES } from '../shared/constants';
import { ApiErrorCode, Role, Status } from '../shared/types';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createPaginatedResponse 
} from '../shared/utils/response';
import { ApiError } from '../shared/errors/ApiError';
import { handleCommonErrors } from '../shared/errors/handleCommonErrors';
import { ValidationService } from '../shared/validations/validationService';
import Logger from '../config/logger';
import { CreateOrderDTO, UpdateOrderDTO, OrderFilters } from '../shared/types/dto/requests/order';
import { AuthenticatedRequest } from '../shared/types/base/auth';

/**
 * Controlador de órdenes
 * Gestiona operaciones relacionadas con órdenes siguiendo estándares del backend
 */
export class OrdersController {
  constructor(
    private readonly orderService: OrderService = new OrderService(
      new OrderRepository(prisma)
    )
  ) {
    this.bindMethods();
  }

  /**
   * Vincula métodos al contexto actual
   */
  private bindMethods(): void {
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getStats = this.getStats.bind(this);
  }

  /**
   * Crea una nueva orden
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }

      const authenticatedReq = req as AuthenticatedRequest;
      const { customerId } = authenticatedReq.user;

      if (!customerId) {
        throw ApiError.badRequest(
          ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('customerId')
        );
      }

      Logger.info(LOG_MESSAGES.ORDERS.CREATE.ATTEMPT, {
        userId: authenticatedReq.user.userId,
        orderData: req.body
      });

      // Validación de campos requeridos
      ValidationService.validateRequired('orderTypeId', req.body.orderTypeId);
      ValidationService.validateRequired('carrierId', req.body.carrierId);
      ValidationService.validateRequired('items', req.body.items);

      const orderData: CreateOrderDTO = {
        ...req.body,
        customerId
      };

      const result = await this.orderService.createOrder(
        orderData,
        authenticatedReq.user.userId
      );

      if (!result.success) {
        if (result.errors) {
          throw ApiError.badRequest(
            ERROR_MESSAGES.VALIDATION.FAILED,
            result.errors
          );
        }
        throw ApiError.internal(ERROR_MESSAGES.OPERATION.LIST_ERROR);
      }

      Logger.info(LOG_MESSAGES.ORDERS.CREATE.SUCCESS, {
        userId: authenticatedReq.user.userId,
        orderId: result.data?.id
      });

      res.status(201).json(createSuccessResponse(result.data, req));
    } catch (error) {
      handleCommonErrors(res, error, req);
    }
  }

  /**
   * Lista órdenes con filtros y paginación
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }

      const authenticatedReq = req as AuthenticatedRequest;
      const { customerId } = authenticatedReq.user;

      // Extraer y validar parámetros
      const { 
        page = 1, 
        limit = 20,
        status,
        fromDate,
        toDate,
        ...unknownParams
      } = req.query;

      // Validar parámetros desconocidos
      if (Object.keys(unknownParams).length > 0) {
        throw ApiError.badRequest(
          `Invalid filter parameters: ${Object.keys(unknownParams).join(', ')}`
        );
      }

      // Validar status si existe
      let validatedStatus: number | undefined;
      if (status) {
        const statusNumber = Number(status);
        const typedStatus = statusNumber as Status;
        ValidationService.validateStatus(typedStatus);
        validatedStatus = statusNumber;
      }

      const filters: OrderFilters = {
        customerId,
        status: validatedStatus,
        fromDate: fromDate ? new Date(String(fromDate)) : undefined,
        toDate: toDate ? new Date(String(toDate)) : undefined,
        page: Number(page),
        limit: Number(limit)
      };

      Logger.debug(LOG_MESSAGES.ORDERS.LIST.REQUEST, {
        userId: authenticatedReq.user.userId,
        filters
      });

      const result = await this.orderService.listOrders(filters);

      if (!result.success || !result.data) {
        throw ApiError.internal(ERROR_MESSAGES.OPERATION.LIST_ERROR);
      }

      Logger.info(LOG_MESSAGES.ORDERS.LIST.SUCCESS, {
        userId: authenticatedReq.user.userId,
        count: result.data.orders.length
      });

      res.json(createPaginatedResponse(
        result.data.orders,
        filters.page || 1,
        filters.limit || 20,
        result.data.pagination.total,
        req
      ));
    } catch (error) {
      handleCommonErrors(res, error, req);
    }
  }

  /**
   * Obtiene una orden por ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }

      const authenticatedReq = req as AuthenticatedRequest;
      const orderId = Number(req.params.id);

      Logger.debug(LOG_MESSAGES.ORDERS.GET.REQUEST, {
        userId: authenticatedReq.user.userId,
        orderId
      });

      const result = await this.orderService.getOrderById(orderId);

      if (!result.success || !result.data) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.ORDER) {
          throw ApiError.notFound('ORDER');
        }
        throw ApiError.internal(ERROR_MESSAGES.OPERATION.LIST_ERROR);
      }

      // Verificar acceso
      if (!this.hasAccessToOrder(authenticatedReq.user, result.data.customerId)) {
        throw ApiError.forbidden();
      }

      Logger.info(LOG_MESSAGES.ORDERS.GET.SUCCESS, {
        userId: authenticatedReq.user.userId,
        orderId
      });

      res.json(createSuccessResponse(result.data, req));
    } catch (error) {
      handleCommonErrors(res, error, req);
    }
  }

  /**
   * Actualiza una orden existente
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }

      const authenticatedReq = req as AuthenticatedRequest;
      const orderId = Number(req.params.id);

      Logger.info(LOG_MESSAGES.ORDERS.UPDATE.ATTEMPT, {
        userId: authenticatedReq.user.userId,
        orderId,
        updateData: req.body
      });

      // Verificar existencia y acceso
      const existingOrder = await this.orderService.getOrderById(orderId);

      if (!existingOrder.success || !existingOrder.data) {
        throw ApiError.notFound('ORDER');
      }

      // Verificar acceso
      if (!this.hasAccessToOrder(authenticatedReq.user, existingOrder.data.customerId)) {
        throw ApiError.forbidden();
      }

      // Verificar estado
      if (existingOrder.data.status !== ORDER_STATUS.DRAFT) {
        throw ApiError.badRequest('Only draft orders can be updated');
      }

      const updateData: UpdateOrderDTO = req.body;
      const result = await this.orderService.updateOrder(
        orderId,
        updateData,
        authenticatedReq.user.userId
      );

      if (!result.success) {
        if (result.errors) {
          throw ApiError.badRequest(
            ERROR_MESSAGES.VALIDATION.FAILED,
            result.errors
          );
        }
        throw ApiError.internal(ERROR_MESSAGES.OPERATION.LIST_ERROR);
      }

      Logger.info(LOG_MESSAGES.ORDERS.UPDATE.SUCCESS, {
        userId: authenticatedReq.user.userId,
        orderId
      });

      res.json(createSuccessResponse(result.data, req));
    } catch (error) {
      handleCommonErrors(res, error, req);
    }
  }

  /**
   * Elimina una orden
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }

      const authenticatedReq = req as AuthenticatedRequest;
      const orderId = Number(req.params.id);

      Logger.info(LOG_MESSAGES.ORDERS.DELETE.ATTEMPT, {
        userId: authenticatedReq.user.userId,
        orderId
      });

      // Verificar existencia y acceso
      const existingOrder = await this.orderService.getOrderById(orderId);

      if (!existingOrder.success || !existingOrder.data) {
        throw ApiError.notFound('ORDER');
      }

      // Verificar acceso
      if (!this.hasAccessToOrder(authenticatedReq.user, existingOrder.data.customerId)) {
        throw ApiError.forbidden();
      }

      // Verificar estado
      if (existingOrder.data.status !== ORDER_STATUS.DRAFT) {
        throw ApiError.badRequest('Only draft orders can be deleted');
      }

      const result = await this.orderService.deleteOrder(orderId);

      if (!result.success) {
        throw ApiError.internal(ERROR_MESSAGES.OPERATION.LIST_ERROR);
      }

      Logger.info(LOG_MESSAGES.ORDERS.DELETE.SUCCESS, {
        userId: authenticatedReq.user.userId,
        orderId
      });

      res.status(204).send();
    } catch (error) {
      handleCommonErrors(res, error, req);
    }
  }

  /**
   * Obtiene estadísticas de órdenes
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }

      const authenticatedReq = req as AuthenticatedRequest;
      const { customerId } = authenticatedReq.user;

      if (!customerId) {
        throw ApiError.badRequest(
          ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('customerId')
        );
      }

      const periodInMonths = req.query.period ? 
        Number(req.query.period) : 12;

      Logger.debug(LOG_MESSAGES.ORDERS.STATS.REQUEST, {
        userId: authenticatedReq.user.userId,
        customerId,
        period: periodInMonths
      });

      const result = await this.orderService.getOrderStats({
        customerId,
        periodInMonths
      });

      if (!result.success) {
        throw ApiError.internal(ERROR_MESSAGES.OPERATION.LIST_ERROR);
      }

      Logger.info(LOG_MESSAGES.ORDERS.STATS.SUCCESS, {
        userId: authenticatedReq.user.userId,
        customerId,
        totalOrders: result.data?.totalOrders || 0
      });

      res.json(createSuccessResponse(result.data, req));
    } catch (error) {
      handleCommonErrors(res, error, req);
    }
  }

  /**
   * Verifica si un usuario tiene acceso a una orden
   */
  private hasAccessToOrder(user: AuthenticatedRequest['user'], orderCustomerId: number): boolean {
    return user.role === 'ADMIN' || user.customerId === orderCustomerId;
  }
}

export const ordersController = new OrdersController();