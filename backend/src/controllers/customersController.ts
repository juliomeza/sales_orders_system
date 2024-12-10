// backend/src/controllers/customersController.ts
import { Request, Response } from 'express';
import { CustomerService } from '../services/customers/customerService';
import { CreateCustomerDTO, UpdateCustomerDTO } from '../services/customers/types';
import { CustomerRepository } from '../repositories/customerRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES, LOG_MESSAGES  } from '../shared/constants';
import Logger from '../config/logger';

export class CustomersController {
  private customerService: CustomerService;

  constructor(customerService?: CustomerService) {
    this.customerService = customerService || new CustomerService(new CustomerRepository(prisma));
    
    this.list = this.list.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async list(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      Logger.debug(LOG_MESSAGES.CUSTOMERS.LIST.REQUEST, {
        userId: req.user.userId
      });

      const result = await this.customerService.getAllCustomers();
      
      if (!result.success) {
        Logger.error(LOG_MESSAGES.CUSTOMERS.LIST.FAILED, {
          userId: req.user.userId,
          error: result.error
        });

        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.CUSTOMERS.LIST.SUCCESS, {
        userId: req.user.userId,
        count: result.data?.length || 0
      });

      res.json({ customers: result.data });
    } catch (error) {
      Logger.error(LOG_MESSAGES.CUSTOMERS.LIST.FAILED, {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const id = Number(req.params.id);
      Logger.debug(LOG_MESSAGES.CUSTOMERS.GET.REQUEST, {
        userId: req.user.userId,
        customerId: id
      });

      const result = await this.customerService.getCustomerById(id);
      
      if (!result.success) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.CUSTOMER) {
          Logger.warn(LOG_MESSAGES.CUSTOMERS.GET.FAILED_NOT_FOUND, {
            userId: req.user.userId,
            customerId: id
          });

          return res.status(404).json({ 
            error: ERROR_MESSAGES.NOT_FOUND.CUSTOMER 
          });
        }

        Logger.error(LOG_MESSAGES.CUSTOMERS.GET.FAILED, {
          userId: req.user.userId,
          customerId: id,
          error: result.error
        });

        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.CUSTOMERS.GET.SUCCESS, {
        userId: req.user.userId,
        customerId: id
      });

      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.CUSTOMERS.GET.FAILED, {
        userId: req.user?.userId || 'anonymous',
        customerId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }

  async create(req: Request<{}, {}, CreateCustomerDTO>, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      Logger.info(LOG_MESSAGES.CUSTOMERS.CREATE.ATTEMPT, {
        userId: req.user.userId,
        customerData: {
          lookupCode: req.body.customer.lookupCode,
          name: req.body.customer.name,
          projectsCount: req.body.projects.length,
          usersCount: req.body.users.length
        }
      });

      const result = await this.customerService.createCustomer(req.body);
      
      if (!result.success) {
        if (result.errors) {
          Logger.warn(LOG_MESSAGES.CUSTOMERS.CREATE.FAILED_VALIDATION, {
            userId: req.user.userId,
            errors: result.errors
          });

          return res.status(400).json({ 
            error: ERROR_MESSAGES.VALIDATION.FAILED, 
            details: result.errors 
          });
        }

        Logger.error(LOG_MESSAGES.CUSTOMERS.CREATE.FAILED, {
          userId: req.user.userId,
          error: result.error
        });

        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.CREATE_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.CUSTOMERS.CREATE.SUCCESS, {
        userId: req.user.userId,
        customerId: result.data?.id,
        customerCode: result.data?.lookupCode
      });

      res.status(201).json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.CUSTOMERS.CREATE.FAILED, {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR 
      });
    }
  }

  async update(req: Request<{id: string}, {}, UpdateCustomerDTO>, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const id = Number(req.params.id);
      Logger.info(LOG_MESSAGES.CUSTOMERS.UPDATE.ATTEMPT, {
        userId: req.user.userId,
        customerId: id,
        updateData: {
          customerUpdates: !!req.body.customer,
          projectsUpdates: !!req.body.projects,
          usersUpdates: !!req.body.users
        }
      });

      const result = await this.customerService.updateCustomer(id, req.body);
      
      if (!result.success) {
        if (result.errors) {
          Logger.warn(LOG_MESSAGES.CUSTOMERS.UPDATE.FAILED_VALIDATION, {
            userId: req.user.userId,
            customerId: id,
            errors: result.errors
          });

          return res.status(400).json({ 
            error: ERROR_MESSAGES.VALIDATION.FAILED, 
            details: result.errors 
          });
        }

        Logger.error(LOG_MESSAGES.CUSTOMERS.UPDATE.FAILED, {
          userId: req.user.userId,
          customerId: id,
          error: result.error
        });

        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.CUSTOMERS.UPDATE.SUCCESS, {
        userId: req.user.userId,
        customerId: id
      });

      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.CUSTOMERS.UPDATE.FAILED, {
        userId: req.user?.userId || 'anonymous',
        customerId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR 
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const id = Number(req.params.id);
      Logger.info(LOG_MESSAGES.CUSTOMERS.DELETE.ATTEMPT, {
        userId: req.user.userId,
        customerId: id
      });

      const result = await this.customerService.deleteCustomer(id);
      
      if (!result.success) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.CUSTOMER) {
          Logger.warn(LOG_MESSAGES.CUSTOMERS.DELETE.FAILED_NOT_FOUND, {
            userId: req.user.userId,
            customerId: id
          });
        }

        Logger.error(LOG_MESSAGES.CUSTOMERS.DELETE.FAILED, {
          userId: req.user.userId,
          customerId: id,
          error: result.error
        });

        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.DELETE_ERROR 
        });
      }

      Logger.info(LOG_MESSAGES.CUSTOMERS.DELETE.SUCCESS, {
        userId: req.user.userId,
        customerId: id
      });

      res.status(204).send();
    } catch (error) {
      Logger.error(LOG_MESSAGES.CUSTOMERS.DELETE.FAILED, {
        userId: req.user?.userId || 'anonymous',
        customerId: req.params.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.DELETE_ERROR 
      });
    }
  }
}

export const customersController = new CustomersController();