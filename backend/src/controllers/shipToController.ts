// backend/src/controllers/shipToController.ts
import { Request, Response } from 'express';
import { ShipToService } from '../services/shipTo/shipToService';
import { ShipToRepository } from '../repositories/shipToRepository';
import prisma from '../config/database';

export class ShipToController {
  private shipToService: ShipToService;

  constructor(shipToService?: ShipToService) {
    this.shipToService = shipToService || new ShipToService(
      new ShipToRepository(prisma)
    );

    this.list = this.list.bind(this);
    this.create = this.create.bind(this);
    this.getBillingAddresses = this.getBillingAddresses.bind(this);
  }

  async list(req: Request, res: Response) {
    if (!req.user?.customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const result = await this.shipToService.getAddresses(req.user.customerId);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  }

  async create(req: Request, res: Response) {
    if (!req.user?.customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const result = await this.shipToService.createAddress(
      req.body,
      req.user.customerId
    );
    
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

  async getBillingAddresses(req: Request, res: Response) {
    if (!req.user?.customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const result = await this.shipToService.getBillingAddresses(req.user.customerId);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  }
}

// Exportar instancia por defecto para mantener compatibilidad
export const shipToController = new ShipToController();