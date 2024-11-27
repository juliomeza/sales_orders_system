// backend/src/repositories/shipToRepository.ts
import { PrismaClient } from '@prisma/client';
import { ShipToAddressDomain } from '../domain/shipTo';
import { CreateShipToAddressDTO } from '../services/shipTo/types';

export class ShipToRepository {
  constructor(private prisma: PrismaClient) {}

  async findByCustomerId(
    customerId: number, 
    type: 'SHIP_TO' | 'BILL_TO' | 'BOTH'
  ): Promise<ShipToAddressDomain[]> {
    const accounts = await this.prisma.account.findMany({
      where: { 
        customerId,
        OR: [
          { accountType: type },
          { accountType: 'BOTH' }
        ],
        status: 1
      },
      orderBy: {
        name: 'asc'
      }
    });

    return accounts.map(account => ({
      ...account,
      accountType: account.accountType as 'SHIP_TO' | 'BILL_TO' | 'BOTH'
    }));
  }

  async create(data: CreateShipToAddressDTO & { customerId: number }): Promise<ShipToAddressDomain> {
    const account = await this.prisma.account.create({
      data: {
        lookupCode: data.name.toUpperCase().replace(/\s+/g, '-'),
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phone: data.phone || null,
        email: data.email || null,
        contactName: data.contactName || null,
        accountType: data.accountType || 'SHIP_TO',
        customerId: data.customerId,
        status: 1,
        created_by: null,
        modified_by: null
      }
    });

    return {
      ...account,
      accountType: account.accountType as 'SHIP_TO' | 'BILL_TO' | 'BOTH'
    };
  }
}