// backend/src/controllers/shipToController.ts
import { Request, Response } from 'express';
import { ShipToService } from '../services/shipTo/shipToService';
import { ShipToRepository } from '../repositories/shipToRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES, ROLES, ACCOUNT_TYPES } from '../shared/constants';
import { CreateShipToAddressDTO } from '../services/shipTo/types';
import { Role } from '../shared/types';
import Logger from '../config/logger';

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
        Logger.warn('Unauthenticated access attempt to list shipping addresses', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { customerId, role } = req.user;
      const userRole = role as Role;

      if (!this.isClient(userRole)) {
        Logger.warn('Non-client user attempted to access shipping addresses', {
          userId: req.user.userId,
          role: userRole
        });
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      if (!this.validateCustomerId(customerId)) {
        Logger.warn('Client user without customer ID attempted to access shipping addresses', {
          userId: req.user.userId
        });
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
          field: 'customerId'
        });
      }

      Logger.debug('List shipping addresses request', {
        userId: req.user.userId,
        customerId
      });

      const result = await this.shipToService.getAddresses(customerId as number);
      
      if (!result.success) {
        Logger.error('Failed to list shipping addresses', {
          userId: req.user.userId,
          customerId,
          error: result.error
        });
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      Logger.info('Successfully retrieved shipping addresses', {
        userId: req.user.userId,
        customerId,
        addressCount: result.data?.addresses.length
      });

      res.json(result.data);
    } catch (error) {
      Logger.error('Error listing shipping addresses', {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        Logger.warn('Unauthenticated access attempt to create shipping address', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { customerId, role } = req.user;
      const userRole = role as Role;

      if (!this.isClient(userRole)) {
        Logger.warn('Non-client user attempted to create shipping address', {
          userId: req.user.userId,
          role: userRole
        });
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      if (!this.validateCustomerId(customerId)) {
        Logger.warn('Client user without customer ID attempted to create shipping address', {
          userId: req.user.userId
        });
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
          field: 'customerId'
        });
      }

      Logger.info('Create shipping address attempt', {
        userId: req.user.userId,
        customerId,
        addressData: {
          name: req.body.name,
          city: req.body.city,
          state: req.body.state
        }
      });

      const addressData: CreateShipToAddressDTO = {
        ...req.body,
        accountType: req.body.accountType || 'SHIP_TO'
      };

      const result = await this.shipToService.createAddress(
        addressData,
        customerId as number
      );
      
      if (!result.success) {
        if (result.errors) {
          Logger.warn('Validation failed while creating shipping address', {
            userId: req.user.userId,
            customerId,
            errors: result.errors
          });
          return res.status(400).json({ 
            error: ERROR_MESSAGES.VALIDATION.FAILED, 
            details: result.errors 
          });
        }

        Logger.error('Failed to create shipping address', {
          userId: req.user.userId,
          customerId,
          error: result.error
        });
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.CREATE_ERROR 
        });
      }

      Logger.info('Successfully created shipping address', {
        userId: req.user.userId,
        customerId,
        addressId: result.data?.id
      });

      res.status(201).json(result.data);
    } catch (error) {
      Logger.error('Error creating shipping address', {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR 
      });
    }
  }

  async getBillingAddresses(req: Request, res: Response) {
    try {
      if (!req.user) {
        Logger.warn('Unauthenticated access attempt to list billing addresses', {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const { customerId, role } = req.user;
      const userRole = role as Role;

      if (!this.isClient(userRole)) {
        Logger.warn('Non-client user attempted to access billing addresses', {
          userId: req.user.userId,
          role: userRole
        });
        return res.status(403).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED 
        });
      }

      if (!this.validateCustomerId(customerId)) {
        Logger.warn('Client user without customer ID attempted to access billing addresses', {
          userId: req.user.userId
        });
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
          field: 'customerId'
        });
      }

      Logger.debug('List billing addresses request', {
        userId: req.user.userId,
        customerId
      });

      const result = await this.shipToService.getBillingAddresses(customerId as number);
      
      if (!result.success) {
        Logger.error('Failed to list billing addresses', {
          userId: req.user.userId,
          customerId,
          error: result.error
        });
        return res.status(500).json({ 
          error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      Logger.info('Successfully retrieved billing addresses', {
        userId: req.user.userId,
        customerId,
        addressCount: result.data?.addresses.length
      });

      res.json(result.data);
    } catch (error) {
      Logger.error('Error listing billing addresses', {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  }
}

// Export default instance for compatibility
export const shipToController = new ShipToController();