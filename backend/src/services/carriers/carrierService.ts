// src/services/carriers/carrierService.ts
import { Carrier, CarrierService as ICarrierService } from '../../domain/carrier';
import { CarrierRepository } from '../../repositories/carrierRepository';
import { 
  CarrierFilters, 
  CreateCarrierDTO, 
  CreateCarrierServiceDTO, 
  UpdateCarrierDTO, 
  UpdateCarrierServiceDTO 
} from './types';
import { ValidationError } from '../shared/errors';

export class CarrierServiceImpl {
  constructor(private carrierRepository: CarrierRepository) {}
  
  async getAllCarriers(filters?: CarrierFilters): Promise<Carrier[]> {
    try {
      const carriers = await this.carrierRepository.findAll(filters);
      return carriers;
    } catch (error) {
      console.error('Error in getAllCarriers:', error);
      throw new Error('Error retrieving carriers');
    }
  }

  async getCarrierById(id: number): Promise<Carrier> {
    const carrier = await this.carrierRepository.findById(id);
    if (!carrier) {
      throw new ValidationError('Carrier not found');
    }
    return carrier;
  }

  async createCarrier(data: CreateCarrierDTO): Promise<Carrier> {
    const existing = await this.carrierRepository.findByLookupCode(data.lookupCode);
    if (existing) {
      throw new ValidationError('Carrier lookup code already exists');
    }

    const carrierData = {
      ...data,
      status: data.status ?? 1
    };

    return this.carrierRepository.create(carrierData);
  }

  async updateCarrier(id: number, data: UpdateCarrierDTO): Promise<Carrier> {
    const carrier = await this.carrierRepository.findById(id);
    if (!carrier) {
      throw new ValidationError('Carrier not found');
    }

    if (data.lookupCode && data.lookupCode !== carrier.lookupCode) {
      const existing = await this.carrierRepository.findByLookupCode(data.lookupCode);
      if (existing) {
        throw new ValidationError('Carrier lookup code already exists');
      }
    }

    return this.carrierRepository.update(id, data);
  }

  async getServiceById(id: number): Promise<ICarrierService> {
    const service = await this.carrierRepository.findServiceById(id);
    if (!service) {
      throw new ValidationError('Carrier service not found');
    }
    return service;
  }

  async createCarrierService(data: CreateCarrierServiceDTO): Promise<ICarrierService> {
    const carrier = await this.carrierRepository.findById(data.carrierId);
    if (!carrier) {
      throw new ValidationError('Carrier not found');
    }

    const existing = await this.carrierRepository.findServiceByLookupCode(data.lookupCode);
    if (existing) {
      throw new ValidationError('Carrier service lookup code already exists');
    }

    const serviceData = {
      ...data,
      status: data.status ?? 1
    };

    return this.carrierRepository.createService(serviceData);
  }

  async updateCarrierService(id: number, data: UpdateCarrierServiceDTO): Promise<ICarrierService> {
    const service = await this.carrierRepository.findServiceById(id);
    if (!service) {
      throw new ValidationError('Carrier service not found');
    }

    if (data.lookupCode && data.lookupCode !== service.lookupCode) {
      const existing = await this.carrierRepository.findServiceByLookupCode(data.lookupCode);
      if (existing) {
        throw new ValidationError('Carrier service lookup code already exists');
      }
    }

    return this.carrierRepository.updateService(id, data);
  }
}