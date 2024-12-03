// backend/src/controllers/carriersController.ts
import { Request, Response } from 'express';
import { CarrierServiceImpl } from '../services/carriers/carrierService';
import { ERROR_MESSAGES } from '../shared/constants';
import { ServiceResult } from '../shared/types';
import { Carrier } from '../domain/carrier';
import { CarrierResult, CarriersListResult } from '../services/carriers/types';

export class CarriersController {
  constructor(private carrierService: CarrierServiceImpl) {}

  getCarriers = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const result = await this.carrierService.getAllCarriers();
      if (!result.success) {
        return res.status(500).json({ 
          error: result.error || ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      res.json(result.data);
    } catch (error) {
      console.error('Error getting carriers:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  };

  getCarrierById = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const id = Number(req.params.id);
      const result = await this.carrierService.getCarrierById(id);
      
      if (!result.success) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.CARRIER) {
          return res.status(404).json({
            error: result.error
          });
        }
        return res.status(500).json({ 
          error: result.error || ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Error getting carrier:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  };

  createCarrier = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const result = await this.carrierService.createCarrier(req.body);
      if (!result.success) {
        if (result.errors) {
          return res.status(400).json({
            error: ERROR_MESSAGES.VALIDATION.FAILED,
            details: result.errors
          });
        }
        return res.status(500).json({ 
          error: result.error || ERROR_MESSAGES.OPERATION.CREATE_ERROR 
        });
      }

      res.status(201).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Error creating carrier:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR 
      });
    }
  };

  updateCarrier = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const id = Number(req.params.id);
      const result = await this.carrierService.updateCarrier(id, req.body);
      
      if (!result.success) {
        if (result.errors) {
          return res.status(400).json({
            error: ERROR_MESSAGES.VALIDATION.FAILED,
            details: result.errors
          });
        }
        return res.status(500).json({ 
          error: result.error || ERROR_MESSAGES.OPERATION.UPDATE_ERROR 
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Error updating carrier:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR 
      });
    }
  };

  getCarrierServices = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const id = Number(req.params.id);
      const result = await this.carrierService.getCarrierById(id);
      
      if (!result.success || !result.data) {
        if (result.error === ERROR_MESSAGES.NOT_FOUND.CARRIER) {
          return res.status(404).json({
            error: result.error
          });
        }
        return res.status(500).json({ 
          error: result.error || ERROR_MESSAGES.OPERATION.LIST_ERROR 
        });
      }

      res.json({
        success: true,
        data: result.data.services
      });
    } catch (error) {
      console.error('Error getting carrier services:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  };
}