// backend/src/repositories/carrierRepository.ts
import { PrismaClient } from '@prisma/client';
import { Carrier, CarrierService } from '../domain/carrier';
import { CarrierFilters, CreateCarrierDTO, CreateCarrierServiceDTO, UpdateCarrierDTO, UpdateCarrierServiceDTO } from '../services/carriers/types';
import Logger from '../config/logger';
import { ERROR_MESSAGES, LOG_MESSAGES } from '../shared/constants';

export class CarrierRepository {
    constructor(private prisma: PrismaClient) {}

    async findAll(filters?: CarrierFilters): Promise<Carrier[]> {
      Logger.debug('Repository: Finding all carriers', {
        filters,
        operation: 'findAll'
      });

      try {
        const where: any = {};
        
        if (filters?.status !== undefined) {
          where.status = filters.status;
        }
        
        if (filters?.search) {
          where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { lookupCode: { contains: filters.search, mode: 'insensitive' } }
          ];
        }

        const carriers = await this.prisma.carrier.findMany({
          where,
          include: {
            services: {
              where: {
                status: 1 // Solo servicios activos
              }
            }
          },
          orderBy: {
            lookupCode: 'asc'
          }
        });

        Logger.debug('Repository: Successfully retrieved carriers', {
          carrierCount: carriers.length,
          filters,
          operation: 'findAll'
        });

        return carriers;
      } catch (error) {
        Logger.error('Repository: Error finding carriers', {
          filters,
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'findAll'
        });
        throw error;
      }
    }

    async findById(id: number): Promise<Carrier | null> {
      Logger.debug('Repository: Finding carrier by ID', {
        carrierId: id,
        operation: 'findById'
      });

      try {
        const carrier = await this.prisma.carrier.findUnique({
          where: { id },
          include: {
            services: true
          }
        });

        if (carrier) {
          Logger.debug('Repository: Carrier found', {
            carrierId: id,
            lookupCode: carrier.lookupCode,
            operation: 'findById'
          });
        } else {
          Logger.debug('Repository: Carrier not found', {
            carrierId: id,
            operation: 'findById'
          });
        }

        return carrier as Carrier | null;
      } catch (error) {
        Logger.error('Repository: Error finding carrier by ID', {
          carrierId: id,
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'findById'
        });
        throw error;
      }
    }

    async findByLookupCode(lookupCode: string): Promise<Carrier | null> {
      Logger.debug('Repository: Finding carrier by lookup code', {
        lookupCode,
        operation: 'findByLookupCode'
      });

      try {
        const carrier = await this.prisma.carrier.findUnique({
          where: { lookupCode },
          include: {
            services: true
          }
        });

        if (carrier) {
          Logger.debug('Repository: Carrier found by lookup code', {
            lookupCode,
            carrierId: carrier.id,
            operation: 'findByLookupCode'
          });
        } else {
          Logger.debug('Repository: Carrier not found by lookup code', {
            lookupCode,
            operation: 'findByLookupCode'
          });
        }

        return carrier as Carrier | null;
      } catch (error) {
        Logger.error('Repository: Error finding carrier by lookup code', {
          lookupCode,
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'findByLookupCode'
        });
        throw error;
      }
    }

    async create(data: CreateCarrierDTO): Promise<Carrier> {
      Logger.info('Repository: Creating new carrier', {
        lookupCode: data.lookupCode,
        operation: 'create'
      });

      try {
        const carrier = await this.prisma.carrier.create({
          data: {
            ...data,
            created_at: new Date(),
            modified_at: new Date()
          },
          include: {
            services: true
          }
        });

        Logger.info('Repository: Successfully created carrier', {
          carrierId: carrier.id,
          lookupCode: carrier.lookupCode,
          operation: 'create'
        });

        return carrier as Carrier;
      } catch (error) {
        Logger.error('Repository: Error creating carrier', {
          lookupCode: data.lookupCode,
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'create'
        });
        throw error;
      }
    }

    async update(id: number, data: UpdateCarrierDTO): Promise<Carrier> {
      Logger.info('Repository: Updating carrier', {
        carrierId: id,
        operation: 'update'
      });

      try {
        const carrier = await this.prisma.carrier.update({
          where: { id },
          data: {
            ...data,
            modified_at: new Date()
          },
          include: {
            services: true
          }
        });

        Logger.info('Repository: Successfully updated carrier', {
          carrierId: id,
          lookupCode: carrier.lookupCode,
          operation: 'update'
        });

        return carrier as Carrier;
      } catch (error) {
        Logger.error('Repository: Error updating carrier', {
          carrierId: id,
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'update'
        });
        throw error;
      }
    }

    // Carrier Service methods
    async findServiceById(id: number): Promise<CarrierService | null> {
      Logger.debug('Repository: Finding carrier service by ID', {
        serviceId: id,
        operation: 'findServiceById'
      });

      try {
        const service = await this.prisma.carrierService.findUnique({
          where: { id },
          include: {
            carrier: true
          }
        });

        if (service) {
          Logger.debug('Repository: Carrier service found', {
            serviceId: id,
            lookupCode: service.lookupCode,
            carrierId: service.carrierId,
            operation: 'findServiceById'
          });
        } else {
          Logger.debug('Repository: Carrier service not found', {
            serviceId: id,
            operation: 'findServiceById'
          });
        }

        return service as CarrierService | null;
      } catch (error) {
        Logger.error('Repository: Error finding carrier service by ID', {
          serviceId: id,
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'findServiceById'
        });
        throw error;
      }
    }

    async findServiceByLookupCode(lookupCode: string): Promise<CarrierService | null> {
      Logger.debug('Repository: Finding carrier service by lookup code', {
        lookupCode,
        operation: 'findServiceByLookupCode'
      });

      try {
        const service = await this.prisma.carrierService.findUnique({
          where: { lookupCode },
          include: {
            carrier: true
          }
        });

        if (service) {
          Logger.debug('Repository: Carrier service found by lookup code', {
            lookupCode,
            serviceId: service.id,
            carrierId: service.carrierId,
            operation: 'findServiceByLookupCode'
          });
        } else {
          Logger.debug('Repository: Carrier service not found by lookup code', {
            lookupCode,
            operation: 'findServiceByLookupCode'
          });
        }

        return service as CarrierService | null;
      } catch (error) {
        Logger.error('Repository: Error finding carrier service by lookup code', {
          lookupCode,
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'findServiceByLookupCode'
        });
        throw error;
      }
    }

    async createService(data: CreateCarrierServiceDTO): Promise<CarrierService> {
      Logger.info('Repository: Creating new carrier service', {
        lookupCode: data.lookupCode,
        carrierId: data.carrierId,
        operation: 'createService'
      });

      try {
        const service = await this.prisma.carrierService.create({
          data: {
            ...data,
            created_at: new Date(),
            modified_at: new Date()
          },
          include: {
            carrier: true
          }
        });

        Logger.info('Repository: Successfully created carrier service', {
          serviceId: service.id,
          lookupCode: service.lookupCode,
          carrierId: service.carrierId,
          operation: 'createService'
        });

        return service as CarrierService;
      } catch (error) {
        Logger.error('Repository: Error creating carrier service', {
          lookupCode: data.lookupCode,
          carrierId: data.carrierId,
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'createService'
        });
        throw error;
      }
    }

    async updateService(id: number, data: UpdateCarrierServiceDTO): Promise<CarrierService> {
      Logger.info('Repository: Updating carrier service', {
        serviceId: id,
        operation: 'updateService'
      });

      try {
        const service = await this.prisma.carrierService.update({
          where: { id },
          data: {
            ...data,
            modified_at: new Date()
          },
          include: {
            carrier: true
          }
        });

        Logger.info('Repository: Successfully updated carrier service', {
          serviceId: id,
          lookupCode: service.lookupCode,
          carrierId: service.carrierId,
          operation: 'updateService'
        });

        return service as CarrierService;
      } catch (error) {
        Logger.error('Repository: Error updating carrier service', {
          serviceId: id,
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'updateService'
        });
        throw error;
      }
    }
}