// backend/src/repositories/shipToRepository.ts
import { PrismaClient } from '@prisma/client';
import { ShipToAddressDomain } from '../domain/shipTo';
import { CreateShipToAddressDTO } from '../shared/types';
import Logger from '../config/logger';
import { ERROR_MESSAGES, LOG_MESSAGES } from '../shared/constants';

export class ShipToRepository {
  constructor(private prisma: PrismaClient) {}

  async findByCustomerId(
    customerId: number, 
    type: 'SHIP_TO' | 'BILL_TO' | 'BOTH'
  ): Promise<ShipToAddressDomain[]> {
    Logger.debug('Repository: Finding addresses by customer ID', {
      customerId,
      addressType: type,
      operation: 'findByCustomerId'
    });

    try {
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

      Logger.debug('Repository: Successfully retrieved addresses', {
        customerId,
        addressCount: accounts.length,
        addressType: type,
        operation: 'findByCustomerId'
      });

      return accounts.map(account => ({
        ...account,
        accountType: account.accountType as 'SHIP_TO' | 'BILL_TO' | 'BOTH'
      }));
    } catch (error) {
      Logger.error('Repository: Error finding addresses by customer ID', {
        customerId,
        addressType: type,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'findByCustomerId'
      });
      throw error;
    }
  }

  async create(data: CreateShipToAddressDTO & { customerId: number }): Promise<ShipToAddressDomain> {
    Logger.info('Repository: Creating new shipping/billing address', {
      customerId: data.customerId,
      accountType: data.accountType || 'SHIP_TO',
      operation: 'create'
    });

    try {
      const lookupCode = data.name.toUpperCase().replace(/\s+/g, '-');
      
      Logger.debug('Repository: Generated lookup code for address', {
        lookupCode,
        originalName: data.name,
        operation: 'create'
      });

      const account = await this.prisma.account.create({
        data: {
          lookupCode,
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

      Logger.info('Repository: Successfully created new address', {
        accountId: account.id,
        lookupCode: account.lookupCode,
        customerId: account.customerId,
        accountType: account.accountType,
        operation: 'create'
      });

      return {
        ...account,
        accountType: account.accountType as 'SHIP_TO' | 'BILL_TO' | 'BOTH'
      };
    } catch (error) {
      Logger.error('Repository: Error creating new address', {
        customerId: data.customerId,
        accountType: data.accountType || 'SHIP_TO',
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'create'
      });
      throw error;
    }
  }

  async findById(id: number): Promise<ShipToAddressDomain | null> {
    Logger.debug('Repository: Finding address by ID', {
      addressId: id,
      operation: 'findById'
    });

    try {
      const account = await this.prisma.account.findUnique({
        where: { id }
      });

      if (account) {
        Logger.debug('Repository: Address found', {
          addressId: id,
          lookupCode: account.lookupCode,
          customerId: account.customerId,
          accountType: account.accountType,
          operation: 'findById'
        });

        return {
          ...account,
          accountType: account.accountType as 'SHIP_TO' | 'BILL_TO' | 'BOTH'
        };
      } else {
        Logger.debug('Repository: Address not found', {
          addressId: id,
          operation: 'findById'
        });

        return null;
      }
    } catch (error) {
      Logger.error('Repository: Error finding address by ID', {
        addressId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'findById'
      });
      throw error;
    }
  }

  async findByLookupCode(lookupCode: string): Promise<ShipToAddressDomain | null> {
    Logger.debug('Repository: Finding address by lookup code', {
      lookupCode,
      operation: 'findByLookupCode'
    });

    try {
      const account = await this.prisma.account.findUnique({
        where: { lookupCode }
      });

      if (account) {
        Logger.debug('Repository: Address found by lookup code', {
          lookupCode,
          accountId: account.id,
          customerId: account.customerId,
          accountType: account.accountType,
          operation: 'findByLookupCode'
        });

        return {
          ...account,
          accountType: account.accountType as 'SHIP_TO' | 'BILL_TO' | 'BOTH'
        };
      } else {
        Logger.debug('Repository: Address not found by lookup code', {
          lookupCode,
          operation: 'findByLookupCode'
        });

        return null;
      }
    } catch (error) {
      Logger.error('Repository: Error finding address by lookup code', {
        lookupCode,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'findByLookupCode'
      });
      throw error;
    }
  }

  async update(
    id: number, 
    data: Partial<CreateShipToAddressDTO>
  ): Promise<ShipToAddressDomain> {
    Logger.info('Repository: Updating address', {
      addressId: id,
      operation: 'update'
    });

    try {
      const account = await this.prisma.account.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.address && { address: data.address }),
          ...(data.city && { city: data.city }),
          ...(data.state && { state: data.state }),
          ...(data.zipCode && { zipCode: data.zipCode }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.contactName !== undefined && { contactName: data.contactName }),
          ...(data.accountType && { accountType: data.accountType }),
          modified_by: null,
          modified_at: new Date()
        }
      });

      Logger.info('Repository: Successfully updated address', {
        addressId: id,
        lookupCode: account.lookupCode,
        customerId: account.customerId,
        accountType: account.accountType,
        operation: 'update'
      });

      return {
        ...account,
        accountType: account.accountType as 'SHIP_TO' | 'BILL_TO' | 'BOTH'
      };
    } catch (error) {
      Logger.error('Repository: Error updating address', {
        addressId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'update'
      });
      throw error;
    }
  }
}