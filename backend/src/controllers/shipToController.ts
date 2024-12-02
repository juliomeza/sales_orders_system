// backend/src/controllers/shipToController.ts
import { Request, Response } from 'express';
import { ShipToService } from '../services/shipTo/shipToService';
import { ShipToRepository } from '../repositories/shipToRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES, ROLES, ACCOUNT_TYPES } from '../shared/constants';
import { CreateShipToAddressDTO } from '../services/shipTo/types';
import { Role } from '../shared/types';

export class ShipToController {
  private shipToService: ShipToService;

  constructor(shipToService?: ShipToService) {
    this.shipToService = shipToService || new ShipToService(
      new ShipToRepository(prisma)
    );

    this.bindMethods();
  }

  private bindMethods() {
    this.list = this.list.bind(this);
    this.create = this.create.bind(this);
    this.getBillingAddresses = this.getBillingAddresses.bind(this);
  }

  private isClient(role: Role): boolean {
    return role === ROLES.CLIENT;
  }

  private validateCustomerId(customerId: number | null | undefined): boolean {
    return customerId !== null && customerId !== undefined;
  }

  async list(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { customerId, role } = req.user;
      const userRole = role as Role;

      if (!this.isClient(userRole)) {
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      if (!this.validateCustomerId(customerId)) {
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
          field: 'customerId'
        });
      }

      const result = await this.shipToService.getAddresses(customerId as number);
      
      if (!result.success) {
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      res.json(result.data);
    } catch (error) {
      console.error('List shipping addresses error:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { customerId, role } = req.user;
      const userRole = role as Role;

      if (!this.isClient(userRole)) {
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      if (!this.validateCustomerId(customerId)) {
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
          field: 'customerId'
        });
      }

      const addressData: CreateShipToAddressDTO = {
        ...req.body,
        accountType: req.body.accountType || ACCOUNT_TYPES.SHIP_TO
      };

      const result = await this.shipToService.createAddress(
        addressData,
        customerId as number
      );
      
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
    } catch (error) {
      console.error('Create shipping address error:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR 
      });
    }
  }

  async getBillingAddresses(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { customerId, role } = req.user;
      const userRole = role as Role;

      if (!this.isClient(userRole)) {
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      if (!this.validateCustomerId(customerId)) {
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
          field: 'customerId'
        });
      }

      const result = await this.shipToService.getBillingAddresses(customerId as number);
      
      if (!result.success) {
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      res.json(result.data);
    } catch (error) {
      console.error('List billing addresses error:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }
}

// Export default instance for compatibility
export const shipToController = new ShipToController();