// backend/src/repositories/carrierRepository.ts
import { PrismaClient } from '@prisma/client';
import { Carrier, CarrierService } from '../domain/carrier';
import { CarrierFilters, CreateCarrierDTO, CreateCarrierServiceDTO, UpdateCarrierDTO, UpdateCarrierServiceDTO } from '../services/carriers/types';

export class CarrierRepository {
    constructor(private prisma: PrismaClient) {}
  
    async findAll(filters?: CarrierFilters): Promise<Carrier[]> {
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
  
      return carriers;
    }

  async findById(id: number): Promise<Carrier | null> {
    const carrier = await this.prisma.carrier.findUnique({
      where: { id },
      include: {
        services: true
      }
    });

    return carrier as Carrier | null;
  }

  async findByLookupCode(lookupCode: string): Promise<Carrier | null> {
    const carrier = await this.prisma.carrier.findUnique({
      where: { lookupCode },
      include: {
        services: true
      }
    });

    return carrier as Carrier | null;
  }

  async create(data: CreateCarrierDTO): Promise<Carrier> {
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

    return carrier as Carrier;
  }

  async update(id: number, data: UpdateCarrierDTO): Promise<Carrier> {
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

    return carrier as Carrier;
  }

  // Carrier Service methods
  async findServiceById(id: number): Promise<CarrierService | null> {
    const service = await this.prisma.carrierService.findUnique({
      where: { id },
      include: {
        carrier: true
      }
    });

    return service as CarrierService | null;
  }

  async findServiceByLookupCode(lookupCode: string): Promise<CarrierService | null> {
    const service = await this.prisma.carrierService.findUnique({
      where: { lookupCode },
      include: {
        carrier: true
      }
    });

    return service as CarrierService | null;
  }

  async createService(data: CreateCarrierServiceDTO): Promise<CarrierService> {
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

    return service as CarrierService;
  }

  async updateService(id: number, data: UpdateCarrierServiceDTO): Promise<CarrierService> {
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

    return service as CarrierService;
  }
}