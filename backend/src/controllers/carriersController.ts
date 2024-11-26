// backend/src/controllers/carriersController.ts
import { Request, Response } from 'express';
import { CarrierServiceImpl } from '../services/carriers/carrierService';

export class CarriersController {
  constructor(private carrierService: CarrierServiceImpl) {}

  getCarriers = async (req: Request, res: Response) => {
    try {
      const carriers = await this.carrierService.getAllCarriers();
      // Cambiar esta parte
      res.json({
        carriers: carriers, // Enviar los carriers directamente en la propiedad carriers
        total: carriers.length
      });
    } catch (error) {
      console.error('Error getting carriers:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error retrieving carriers' 
      });
    }
  };

  getCarrierById = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const carrier = await this.carrierService.getCarrierById(id);
      res.json({
        success: true,
        data: carrier
      });
    } catch (error) {
      console.error('Error getting carrier:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error retrieving carrier' 
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
        error: error.message || 'Error creating carrier' 
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
        error: error.message || 'Error updating carrier' 
      });
    }
  };

  getCarrierServices = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const carrier = await this.carrierService.getCarrierById(id);
      res.json({
        success: true,
        data: carrier.services
      });
    } catch (error) {
      console.error('Error getting carrier services:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error retrieving carrier services' 
      });
    }
  };
}