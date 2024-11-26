// backend/src/controllers/customersController.ts
import { Request, Response } from 'express';
import { CustomerService } from '../services/customers/customerService';
import { CreateCustomerDTO, UpdateCustomerDTO } from '../services/customers/types';
import { CustomerRepository } from '../repositories/customerRepository';
import prisma from '../config/database';

export class CustomersController {
  private customerService: CustomerService;

  constructor(customerService?: CustomerService) {
    // Si no se proporciona un servicio, crear uno nuevo con las dependencias por defecto
    this.customerService = customerService || new CustomerService(new CustomerRepository(prisma));
    
    // Bind de los métodos para mantener el contexto correcto
    this.list = this.list.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async list(req: Request, res: Response) {
    const result = await this.customerService.getAllCustomers();
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ customers: result.data });
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.customerService.getCustomerById(Number(id));
    
    if (!result.success) {
      if (result.error === 'Customer not found') {
        return res.status(404).json({ error: result.error });
      }
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  }

  async create(req: Request<{}, {}, CreateCustomerDTO>, res: Response) {
    const result = await this.customerService.createCustomer(req.body);
    
    if (!result.success) {
      if (result.errors) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: result.errors 
        });
      }
      return res.status(500).json({ error: result.error });
    }

    res.status(201).json(result.data);
  }

  async update(req: Request<{id: string}, {}, UpdateCustomerDTO>, res: Response) {
    const { id } = req.params;
    const result = await this.customerService.updateCustomer(Number(id), req.body);
    
    if (!result.success) {
      if (result.errors) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: result.errors 
        });
      }
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.customerService.deleteCustomer(Number(id));
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.status(204).send();
  }
}

// Crear una instancia por defecto para mantener compatibilidad con el código existente
export const customersController = new CustomersController();