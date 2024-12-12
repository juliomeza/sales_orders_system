// backend/src/servces/shipToService.ts
import { ShipToRepository } from '../repositories/shipToRepository';
import { ServiceResult } from '../shared/types';
import { ValidationService } from '../shared/validations';
import { CreateShipToAddressDTO, ShipToAddressResponse } from '../shared/types/shipto.types';
import { ShipToAddressDomain, ShipToAddressSummary } from '../domain/shipTo';
import { ERROR_MESSAGES, LOG_MESSAGES } from '../shared/constants';
import Logger from '../config/logger';

export class ShipToService {
  constructor(private shipToRepository: ShipToRepository) {}

  async getAddresses(customerId: number): Promise<ServiceResult<ShipToAddressResponse>> {
    Logger.debug(LOG_MESSAGES.SHIP_TO.LIST.REQUEST, {
      customerId
    });

    try {
      const addresses = await this.shipToRepository.findByCustomerId(customerId, 'SHIP_TO');

      Logger.info(LOG_MESSAGES.SHIP_TO.LIST.SUCCESS, {
        customerId,
        addressCount: addresses.length
      });

      return {
        success: true,
        data: {
          addresses: addresses.map(this.mapToSummary)
        }
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.SHIP_TO.LIST.FAILED, {
        customerId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async getBillingAddresses(customerId: number): Promise<ServiceResult<ShipToAddressResponse>> {
    Logger.debug(LOG_MESSAGES.SHIP_TO.BILLING.REQUEST, {
      customerId
    });

    try {
      const addresses = await this.shipToRepository.findByCustomerId(customerId, 'BILL_TO');

      Logger.info(LOG_MESSAGES.SHIP_TO.BILLING.SUCCESS, {
        customerId,
        addressCount: addresses.length
      });

      return {
        success: true,
        data: {
          addresses: addresses.map(this.mapToSummary)
        }
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.SHIP_TO.BILLING.FAILED, {
        customerId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async createAddress(data: CreateShipToAddressDTO, customerId: number): Promise<ServiceResult<ShipToAddressSummary>> {
    Logger.info(LOG_MESSAGES.SHIP_TO.CREATE.ATTEMPT, {
      customerId,
      addressData: {
        name: data.name,
        city: data.city,
        state: data.state,
        accountType: data.accountType
      }
    });

    const validation = this.validateAddressData(data);
    if (!validation.isValid) {
      Logger.warn(LOG_MESSAGES.SHIP_TO.CREATE.FAILED_VALIDATION, {
        customerId,
        errors: validation.errors
      });

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

      Logger.info(LOG_MESSAGES.SHIP_TO.CREATE.SUCCESS, {
        customerId,
        addressId: address.id,
        addressType: address.accountType
      });

      return {
        success: true,
        data: this.mapToSummary(address)
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.SHIP_TO.CREATE.FAILED, {
        customerId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR
      };
    }
  }

  private validateAddressData(data: CreateShipToAddressDTO) {
    Logger.debug('Validating ship-to address data', {
      name: data.name,
      accountType: data.accountType
    });

    return ValidationService.validate([
      {
        condition: !!data.name,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Name')
      },
      {
        condition: !!data.address,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Address')
      },
      {
        condition: !!data.city,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('City')
      },
      {
        condition: !!data.state,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('State')
      },
      {
        condition: !!data.zipCode,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('ZIP Code')
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