// backend/src/servces/shipTo/shipToService.ts
import { ShipToRepository } from '../../repositories/shipToRepository';
import { ServiceResult } from '../shared/types';
import { ValidationService } from '../shared/validationService';
import { CreateShipToAddressDTO, ShipToAddressResponse } from './types';
import { ShipToAddressDomain, ShipToAddressSummary } from '../../domain/shipTo';

export class ShipToService {
  constructor(private shipToRepository: ShipToRepository) {}

  async getAddresses(customerId: number): Promise<ServiceResult<ShipToAddressResponse>> {
    try {
      const addresses = await this.shipToRepository.findByCustomerId(customerId, 'SHIP_TO');
      return {
        success: true,
        data: {
          addresses: addresses.map(this.mapToSummary)
        }
      };
    } catch (error) {
      console.error('List addresses error:', error);
      return {
        success: false,
        error: 'Error listing addresses'
      };
    }
  }

  async getBillingAddresses(customerId: number): Promise<ServiceResult<ShipToAddressResponse>> {
    try {
      const addresses = await this.shipToRepository.findByCustomerId(customerId, 'BILL_TO');
      return {
        success: true,
        data: {
          addresses: addresses.map(this.mapToSummary)
        }
      };
    } catch (error) {
      console.error('List billing addresses error:', error);
      return {
        success: false,
        error: 'Error listing billing addresses'
      };
    }
  }

  async createAddress(data: CreateShipToAddressDTO, customerId: number): Promise<ServiceResult<ShipToAddressSummary>> {
    const validation = this.validateAddressData(data);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      const address = await this.shipToRepository.create({
        ...data,
        customerId
      });

      return {
        success: true,
        data: this.mapToSummary(address)
      };
    } catch (error) {
      console.error('Create address error:', error);
      return {
        success: false,
        error: 'Error creating address'
      };
    }
  }

  private validateAddressData(data: CreateShipToAddressDTO) {
    return ValidationService.validate([
      {
        condition: !!data.name,
        message: 'Name is required'
      },
      {
        condition: !!data.address,
        message: 'Address is required'
      },
      {
        condition: !!data.city,
        message: 'City is required'
      },
      {
        condition: !!data.state,
        message: 'State is required'
      },
      {
        condition: !!data.zipCode,
        message: 'ZIP Code is required'
      }
    ]);
  }

  private mapToSummary(address: ShipToAddressDomain): ShipToAddressSummary {
    return {
      id: address.id.toString(),
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      phone: address.phone || undefined,
      email: address.email || undefined,
      contactName: address.contactName || undefined
    };
  }
}