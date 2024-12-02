// backend/src/controllers/carriersController.ts
import { Request, Response } from 'express';
import { CarrierServiceImpl } from '../services/carriers/carrierService';
import { ERROR_MESSAGES } from '../shared/constants';

export class CarriersController {
  constructor(private carrierService: CarrierServiceImpl) {}

  getCarriers = async (req: Request, res: Response) => {
    try {
      const carriers = await this.carrierService.getAllCarriers();
      // Mantenemos la misma estructura de respuesta para compatibilidad con el frontend
      res.json({
        carriers: carriers,
        total: carriers.length
      });
    } catch (error) {
      console.error('Error getting carriers:', error);
      res.status(500).json({ 
        success: false, 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  };

  getCarrierById = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const carrier = await this.carrierService.getCarrierById(id);
      
      if (!carrier) {
        return res.status(404).json({
          success: false,
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
        success: false, 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  };

  createCarrier = async (req: Request, res: Response) => {
    try {
      const carrier = await this.carrierService.createCarrier(req.body);
      res.status(201).json({
        success: true,
        data: carrier
      });
    } catch (error: any) {
      console.error('Error creating carrier:', error);
      res.status(400).json({ 
        success: false, 
        error: error.message || ERROR_MESSAGES.OPERATION.CREATE_ERROR 
      });
    }
  };

  updateCarrier = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const carrier = await this.carrierService.updateCarrier(id, req.body);
      res.json({
        success: true,
        data: carrier
      });
    } catch (error: any) {
      console.error('Error updating carrier:', error);
      res.status(400).json({ 
        success: false, 
        error: error.message || ERROR_MESSAGES.OPERATION.UPDATE_ERROR 
      });
    }
  };

  getCarrierServices = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const carrier = await this.carrierService.getCarrierById(id);
      
      if (!carrier) {
        return res.status(404).json({
          success: false,
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
        success: false, 
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR 
      });
    }
  };
}