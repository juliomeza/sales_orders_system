// backend/src/controllers/customersController.ts
import { Request, Response } from 'express';
import { CustomerService } from '../services/customers/customerService';
import { CreateCustomerDTO, UpdateCustomerDTO } from '../services/customers/types';
import { CustomerRepository } from '../repositories/customerRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES } from '../shared/constants';

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
    const result = await this.customerService.getAllCustomers();
    
    if (!result.success) {
      return res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }

    res.json({ customers: result.data });
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.customerService.getCustomerById(Number(id));
    
    if (!result.success) {
      if (result.error === ERROR_MESSAGES.NOT_FOUND.CUSTOMER) {
        return res.status(404).json({ 
          error: ERROR_MESSAGES.NOT_FOUND.CUSTOMER 
        });
      }
      return res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }

    res.json(result.data);
  }

  async create(req: Request<{}, {}, CreateCustomerDTO>, res: Response) {
    const result = await this.customerService.createCustomer(req.body);
    
    if (!result.success) {
      if (result.errors) {
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.FAILED, 
          details: result.errors 
        });
      }
      return res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR 
      });
    }

    res.status(201).json(result.data);
  }

  async update(req: Request<{id: string}, {}, UpdateCustomerDTO>, res: Response) {
    const { id } = req.params;
    const result = await this.customerService.updateCustomer(Number(id), req.body);
    
    if (!result.success) {
      if (result.errors) {
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.FAILED, 
          details: result.errors 
        });
      }
      return res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR 
      });
    }

    res.json(result.data);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.customerService.deleteCustomer(Number(id));
    
    if (!result.success) {
      return res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.DELETE_ERROR 
      });
    }

    res.status(204).send();
  }
}

export const customersController = new CustomersController();