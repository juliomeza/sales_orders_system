// backend/src/controllers/carriersController.ts
import { Request, Response } from 'express';
import { CarrierServiceImpl } from '../services/carriers/carrierService';
import { ERROR_MESSAGES } from '../shared/constants';
import { ServiceResult } from '../shared/types';
import { Carrier } from '../domain/carrier';

export class CarriersController {
  constructor(private carrierService: CarrierServiceImpl) {}

  getCarriers = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: ERROR_MESSAGES.AUTHENTICATION.REQUIRED 
        });
      }

      const carriers = await this.carrierService.getAllCarriers();
      res.json({
        carriers,
        total: carriers.length
      });
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
      const carrier = await this.carrierService.getCarrierById(id);
      
      if (!carrier) {
        return res.status(404).json({
          error: ERROR_MESSAGES.NOT_FOUND.CARRIER
        });
      }

      res.json({
        success: true,
        data: carrier
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

      const carrier = await this.carrierService.createCarrier(req.body);
      res.status(201).json({
        success: true,
        data: carrier
      });
    } catch (error: any) {
      console.error('Error creating carrier:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.FAILED,
          details: [error.message]
        });
      }
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
      const carrier = await this.carrierService.updateCarrier(id, req.body);
      res.json({
        success: true,
        data: carrier
      });
    } catch (error: any) {
      console.error('Error updating carrier:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          error: ERROR_MESSAGES.VALIDATION.FAILED,
          details: [error.message]
        });
      }
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
      const carrier = await this.carrierService.getCarrierById(id);
      
      if (!carrier) {
        return res.status(404).json({
          error: ERROR_MESSAGES.NOT_FOUND.CARRIER
        });
      }

      res.json({
        success: true,
        data: carrier.services
      });
    } catch (error) {
      console.error('Error getting carrier services:', error);
      res.status(500).json({ 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  };
}