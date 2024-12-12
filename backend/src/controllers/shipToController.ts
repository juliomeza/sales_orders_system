// backend/src/controllers/shipToController.ts
import { Request, Response } from 'express';
import { ShipToService } from '../services/shipToService';
import { ShipToRepository } from '../repositories/shipToRepository';
import prisma from '../config/database';
import { ERROR_MESSAGES, ROLES, LOG_MESSAGES } from '../shared/constants';
import { ApiErrorCode } from '../shared/types/base/responses';
import { createErrorResponse } from '../shared/utils/response';
import Logger from '../config/logger';
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
        Logger.warn(LOG_MESSAGES.SHIP_TO.LIST.FAILED_AUTH, {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(401).json(
          createErrorResponse(
            ApiErrorCode.UNAUTHORIZED,
            ERROR_MESSAGES.AUTHENTICATION.REQUIRED,
            undefined,
            req
          )
        );
      }

      const { customerId, role } = req.user;
      const userRole = role as Role;

      if (!this.isClient(userRole)) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.LIST.FAILED_ROLE, {
          userId: req.user.userId,
          role: userRole
        });

        return res.status(403).json(
          createErrorResponse(
            ApiErrorCode.FORBIDDEN,
            ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED,
            undefined,
            req
          )
        );
      }

      if (!this.validateCustomerId(customerId)) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.LIST.FAILED_CUSTOMER, {
          userId: req.user.userId
        });

        return res.status(400).json(
          createErrorResponse(
            ApiErrorCode.VALIDATION_ERROR,
            ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('customerId'),
            undefined,
            req
          )
        );
      }

      Logger.debug(LOG_MESSAGES.SHIP_TO.LIST.REQUEST, {
        userId: req.user.userId,
        customerId
      });

      const result = await this.shipToService.getAddresses(customerId as number);

      if (!result.success) {
        Logger.error(LOG_MESSAGES.SHIP_TO.LIST.FAILED, {
          userId: req.user.userId,
          customerId,
          error: result.error
        });

        return res.status(500).json(
          createErrorResponse(
            ApiErrorCode.INTERNAL_ERROR,
            ERROR_MESSAGES.OPERATION.LIST_ERROR,
            undefined,
            req
          )
        );
      }

      Logger.info(LOG_MESSAGES.SHIP_TO.LIST.SUCCESS, {
        userId: req.user.userId,
        customerId,
        addressCount: result.data?.addresses.length
      });

      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.SHIP_TO.LIST.FAILED, {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json(
        createErrorResponse(
          ApiErrorCode.INTERNAL_ERROR,
          ERROR_MESSAGES.OPERATION.LIST_ERROR,
          undefined,
          req
        )
      );
    }
  }

  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.CREATE.FAILED_AUTH, {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(401).json(
          createErrorResponse(
            ApiErrorCode.UNAUTHORIZED,
            ERROR_MESSAGES.AUTHENTICATION.REQUIRED,
            undefined,
            req
          )
        );
      }

      const { customerId, role } = req.user;
      const userRole = role as Role;

      if (!this.isClient(userRole)) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.CREATE.FAILED_ROLE, {
          userId: req.user.userId,
          role: userRole
        });

        return res.status(403).json(
          createErrorResponse(
            ApiErrorCode.FORBIDDEN,
            ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED,
            undefined,
            req
          )
        );
      }

      if (!this.validateCustomerId(customerId)) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.CREATE.FAILED_CUSTOMER, {
          userId: req.user.userId
        });

        return res.status(400).json(
          createErrorResponse(
            ApiErrorCode.VALIDATION_ERROR,
            ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('customerId'),
            undefined,
            req
          )
        );
      }

      Logger.info(LOG_MESSAGES.SHIP_TO.CREATE.ATTEMPT, {
        userId: req.user.userId,
        customerId,
        addressData: {
          name: req.body.name,
          city: req.body.city,
          state: req.body.state
        }
      });

      const result = await this.shipToService.createAddress(
        req.body,
        customerId as number
      );

      if (!result.success) {
        if (result.errors) {
          Logger.warn(LOG_MESSAGES.SHIP_TO.CREATE.FAILED_VALIDATION, {
            userId: req.user.userId,
            customerId,
            errors: result.errors
          });

          return res.status(400).json(
            createErrorResponse(
              ApiErrorCode.VALIDATION_ERROR,
              ERROR_MESSAGES.VALIDATION.FAILED,
              result.errors,
              req
            )
          );
        }

        Logger.error(LOG_MESSAGES.SHIP_TO.CREATE.FAILED, {
          userId: req.user.userId,
          customerId,
          error: result.error
        });

        return res.status(500).json(
          createErrorResponse(
            ApiErrorCode.INTERNAL_ERROR,
            ERROR_MESSAGES.OPERATION.CREATE_ERROR,
            undefined,
            req
          )
        );
      }

      Logger.info(LOG_MESSAGES.SHIP_TO.CREATE.SUCCESS, {
        userId: req.user.userId,
        customerId,
        addressId: result.data?.id
      });

      res.status(201).json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.SHIP_TO.CREATE.FAILED, {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json(
        createErrorResponse(
          ApiErrorCode.INTERNAL_ERROR,
          ERROR_MESSAGES.OPERATION.CREATE_ERROR,
          undefined,
          req
        )
      );
    }
  }

  async getBillingAddresses(req: Request, res: Response) {
    try {
      if (!req.user) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.BILLING.FAILED_AUTH, {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });

        return res.status(401).json(
          createErrorResponse(
            ApiErrorCode.UNAUTHORIZED,
            ERROR_MESSAGES.AUTHENTICATION.REQUIRED,
            undefined,
            req
          )
        );
      }

      const { customerId, role } = req.user;
      const userRole = role as Role;

      if (!this.isClient(userRole)) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.BILLING.FAILED_ROLE, {
          userId: req.user.userId,
          role: userRole
        });

        return res.status(403).json(
          createErrorResponse(
            ApiErrorCode.FORBIDDEN,
            ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED,
            undefined,
            req
          )
        );
      }

      if (!this.validateCustomerId(customerId)) {
        Logger.warn(LOG_MESSAGES.SHIP_TO.BILLING.FAILED_CUSTOMER, {
          userId: req.user.userId
        });

        return res.status(400).json(
          createErrorResponse(
            ApiErrorCode.VALIDATION_ERROR,
            ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('customerId'),
            undefined,
            req
          )
        );
      }

      Logger.debug(LOG_MESSAGES.SHIP_TO.BILLING.REQUEST, {
        userId: req.user.userId,
        customerId
      });

      const result = await this.shipToService.getBillingAddresses(customerId as number);

      if (!result.success) {
        Logger.error(LOG_MESSAGES.SHIP_TO.BILLING.FAILED, {
          userId: req.user.userId,
          customerId,
          error: result.error
        });

        return res.status(500).json(
          createErrorResponse(
            ApiErrorCode.INTERNAL_ERROR,
            ERROR_MESSAGES.OPERATION.LIST_ERROR,
            undefined,
            req
          )
        );
      }

      Logger.info(LOG_MESSAGES.SHIP_TO.BILLING.SUCCESS, {
        userId: req.user.userId,
        customerId,
        addressCount: result.data?.addresses.length
      });

      res.json(result.data);
    } catch (error) {
      Logger.error(LOG_MESSAGES.SHIP_TO.BILLING.FAILED, {
        userId: req.user?.userId || 'anonymous',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json(
        createErrorResponse(
          ApiErrorCode.INTERNAL_ERROR,
          ERROR_MESSAGES.OPERATION.LIST_ERROR,
          undefined,
          req
        )
      );
    }
  }
}

export const shipToController = new ShipToController();