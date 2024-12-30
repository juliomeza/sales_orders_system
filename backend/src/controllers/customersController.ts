import { Request, Response } from 'express';
import { CustomerService } from '../services/customerService';
import { CustomerRepository } from '../repositories/customerRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES, LOG_MESSAGES } from '../shared/constants';
import { ApiErrorCode, Status } from '../shared/types';
import { CreateCustomerDTO, UpdateCustomerDTO } from '../shared/types/dto/requests/customer';
import { createSuccessResponse, createErrorResponse, createPaginatedResponse } from '../shared/utils/response';
import { ApiError } from '../shared/errors/ApiError';
import { handleCommonErrors } from '../shared/errors/handleCommonErrors';
import { ValidationService } from '../shared/validations/validationService';
import Logger from '../config/logger';
import { AuthenticatedRequest } from '../shared/types/base/auth';

interface CustomerFilters {
  search?: string;
  status?: Status;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
}

export class CustomersController {
  constructor(
    private readonly customerService: CustomerService = new CustomerService(
      new CustomerRepository(prisma)
    )
  ) {
    this.bindMethods();
  }

  private bindMethods(): void {
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }

      const authenticatedReq = req as AuthenticatedRequest;

      // Extraer y validar parámetros
      const { 
        page = 1, 
        limit = 20,
        status,
        search,
        city,
        state,
        ...unknownParams
      } = req.query;

      // Validar parámetros desconocidos
      if (Object.keys(unknownParams).length > 0) {
        throw ApiError.badRequest(
          `Invalid filter parameters: ${Object.keys(unknownParams).join(', ')}`
        );
      }

      // Validar status si existe
      let validatedStatus: Status | undefined;
      if (status) {
        const statusNumber = Number(status);
        ValidationService.validateStatus(statusNumber as Status);
        validatedStatus = statusNumber as Status;
      }

      const filters: CustomerFilters = {
        search: search as string,
        status: validatedStatus,
        city: city as string,
        state: state as string,
        page: Number(page),
        limit: Number(limit)
      };

      Logger.debug(LOG_MESSAGES.CUSTOMERS.LIST.REQUEST, {
        userId: authenticatedReq.user.userId,
        filters
      });

      const result = await this.customerService.getAllCustomers();
      
      if (!result.success || !result.data) {
        throw ApiError.internal(ERROR_MESSAGES.OPERATION.LIST_ERROR);
      }

      Logger.info(LOG_MESSAGES.CUSTOMERS.LIST.SUCCESS, {
        userId: authenticatedReq.user.userId,
        count: result.data.length
      });

      res.json(createPaginatedResponse(
        result.data,
        filters.page || 1,
        filters.limit || 20,
        result.data.length,
        req
      ));
    } catch (error) {
      handleCommonErrors(res, error, req);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }

      const authenticatedReq = req as AuthenticatedRequest;
      const id = Number(req.params.id);

      Logger.debug(LOG_MESSAGES.CUSTOMERS.GET.REQUEST, {
        userId: authenticatedReq.user.userId,
        customerId: id
      });

      const result = await this.customerService.getCustomerById(id);
      
      if (!result.success || !result.data) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.CUSTOMER) {
          throw ApiError.notFound('CUSTOMER');
        }
        throw ApiError.internal(ERROR_MESSAGES.OPERATION.LIST_ERROR);
      }

      Logger.info(LOG_MESSAGES.CUSTOMERS.GET.SUCCESS, {
        userId: authenticatedReq.user.userId,
        customerId: id
      });

      res.json(createSuccessResponse(result.data, req));
    } catch (error) {
      handleCommonErrors(res, error, req);
    }
  }

  async create(req: Request<{}, {}, CreateCustomerDTO>, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }

      const authenticatedReq = req as AuthenticatedRequest;

      Logger.info(LOG_MESSAGES.CUSTOMERS.CREATE.ATTEMPT, {
        userId: authenticatedReq.user.userId,
        customerData: {
          lookupCode: req.body.customer.lookupCode,
          name: req.body.customer.name,
          projectsCount: req.body.projects.length,
          usersCount: req.body.users.length
        }
      });

      // Validar campos requeridos
      ValidationService.validateRequired('lookupCode', req.body.customer.lookupCode);
      ValidationService.validateRequired('name', req.body.customer.name);
      ValidationService.validateLookupCode(req.body.customer.lookupCode);

      const result = await this.customerService.createCustomer(req.body);
      
      if (!result.success) {
        if (result.errors) {
          throw ApiError.badRequest(
            ERROR_MESSAGES.VALIDATION.FAILED,
            result.errors
          );
        }
        throw ApiError.internal(ERROR_MESSAGES.OPERATION.LIST_ERROR);
      }

      Logger.info(LOG_MESSAGES.CUSTOMERS.CREATE.SUCCESS, {
        userId: authenticatedReq.user.userId,
        customerId: result.data?.id,
        customerCode: result.data?.lookupCode
      });

      res.status(201).json(createSuccessResponse(result.data, req));
    } catch (error) {
      handleCommonErrors(res, error, req);
    }
  }

  async update(req: Request<{id: string}, {}, UpdateCustomerDTO>, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }

      const authenticatedReq = req as AuthenticatedRequest;
      const id = Number(req.params.id);

      Logger.info(LOG_MESSAGES.CUSTOMERS.UPDATE.ATTEMPT, {
        userId: authenticatedReq.user.userId,
        customerId: id,
        updateData: {
          customerUpdates: !!req.body.customer,
          projectsUpdates: !!req.body.projects,
          usersUpdates: !!req.body.users
        }
      });

      // Validar lookupCode si se proporciona
      if (req.body.customer?.lookupCode) {
        ValidationService.validateLookupCode(req.body.customer.lookupCode);
      }

      // Validar status si se proporciona
      if (req.body.customer?.status) {
        ValidationService.validateStatus(req.body.customer.status);
      }

      const result = await this.customerService.updateCustomer(id, req.body);
      
      if (!result.success) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.CUSTOMER) {
          throw ApiError.notFound('CUSTOMER');
        }
        if (result.errors) {
          throw ApiError.badRequest(
            ERROR_MESSAGES.VALIDATION.FAILED,
            result.errors
          );
        }
        throw ApiError.internal(ERROR_MESSAGES.OPERATION.LIST_ERROR);
      }

      Logger.info(LOG_MESSAGES.CUSTOMERS.UPDATE.SUCCESS, {
        userId: authenticatedReq.user.userId,
        customerId: id
      });

      res.json(createSuccessResponse(result.data, req));
    } catch (error) {
      handleCommonErrors(res, error, req);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }

      const authenticatedReq = req as AuthenticatedRequest;
      const id = Number(req.params.id);

      Logger.info(LOG_MESSAGES.CUSTOMERS.DELETE.ATTEMPT, {
        userId: authenticatedReq.user.userId,
        customerId: id
      });

      const result = await this.customerService.deleteCustomer(id);
      
      if (!result.success) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.CUSTOMER) {
          throw ApiError.notFound('CUSTOMER');
        }
        throw ApiError.internal(ERROR_MESSAGES.OPERATION.LIST_ERROR);
      }

      Logger.info(LOG_MESSAGES.CUSTOMERS.DELETE.SUCCESS, {
        userId: authenticatedReq.user.userId,
        customerId: id
      });

      res.status(204).send();
    } catch (error) {
      handleCommonErrors(res, error, req);
    }
  }
}

export const customersController = new CustomersController();