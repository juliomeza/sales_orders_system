// frontend/src/shared/api/services/accountsService.ts
import { apiClient } from '../apiClient';
import { 
  ShippingAddress, 
  ShippingAddressResponse 
} from '../types/accounts.types';

class AccountsService {
  private readonly basePath = '/ship-to';

  /**
   * Get all shipping addresses
   */
  public async getShippingAddresses(): Promise<ShippingAddress[]> {
    try {
      const response = await apiClient.get<ShippingAddressResponse>(this.basePath);
      return this.transformAddressesResponse(response);
    } catch (error) {
      throw this.handleError(error, 'Error fetching shipping addresses');
    }
  }

  /**
   * Get shipping address by ID
   */
  public async getShippingAddress(id: string): Promise<ShippingAddress> {
    try {
      const response = await apiClient.get<{ address: ShippingAddress }>(
        `${this.basePath}/${id}`
      );
      return this.validateAddress(response.address);
    } catch (error) {
      throw this.handleError(error, `Error fetching shipping address ${id}`);
    }
  }

  /**
   * Create new shipping address
   */
  public async createShippingAddress(
    address: Omit<ShippingAddress, 'id'>
  ): Promise<ShippingAddress> {
    try {
      this.validateNewAddress(address);
      const response = await apiClient.post<ShippingAddress>(
        this.basePath,
        address
      );
      return this.validateAddress(response);
    } catch (error) {
      throw this.handleError(error, 'Error creating shipping address');
    }
  }

  /**
   * Update shipping address
   */
  public async updateShippingAddress(
    id: string,
    address: Partial<ShippingAddress>
  ): Promise<ShippingAddress> {
    try {
      const response = await apiClient.put<ShippingAddress>(
        `${this.basePath}/${id}`,
        address
      );
      return this.validateAddress(response);
    } catch (error) {
      throw this.handleError(error, `Error updating shipping address ${id}`);
    }
  }

  /**
   * Delete shipping address
   */
  public async deleteShippingAddress(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`);
    } catch (error) {
      throw this.handleError(error, `Error deleting shipping address ${id}`);
    }
  }

  /**
   * Transform addresses response to ensure consistent data structure
   */
  private transformAddressesResponse(
    response: ShippingAddressResponse
  ): ShippingAddress[] {
    return response.addresses.map(address => this.validateAddress(address));
  }

  /**
   * Validate address data structure
   */
  private validateAddress(address: ShippingAddress): ShippingAddress {
    const requiredFields: (keyof ShippingAddress)[] = [
      'id',
      'name',
      'address',
      'city',
      'state',
      'zipCode'
    ];

    for (const field of requiredFields) {
      if (!address[field]) {
        throw new Error(`Invalid address data: missing ${field}`);
      }
    }

    return {
      id: address.id,
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state.toUpperCase(),
      zipCode: address.zipCode
    };
  }

  /**
   * Validate new address data
   */
  private validateNewAddress(address: Omit<ShippingAddress, 'id'>): void {
    const requiredFields: (keyof Omit<ShippingAddress, 'id'>)[] = [
      'name',
      'address',
      'city',
      'state',
      'zipCode'
    ];

    const missingFields = requiredFields.filter(field => !address[field]);

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required fields for new address: ${missingFields.join(', ')}`
      );
    }

    if (address.state.length !== 2) {
      throw new Error('State must be a 2-letter code');
    }
  }

  /**
   * Standardized error handling with context
   */
  private handleError(error: unknown, context: string): Error {
    console.error(`${context}:`, error);

    if (error instanceof Error) {
      error.message = `${context}: ${error.message}`;
      return error;
    }

    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as any;
      if (axiosError.response?.status === 404) {
        return new Error(`${context}: Address not found`);
      }
      if (axiosError.response?.status === 403) {
        return new Error(`${context}: Not authorized`);
      }
      if (axiosError.response?.data?.message) {
        return new Error(`${context}: ${axiosError.response.data.message}`);
      }
    }

    return new Error(context);
  }
}

// Export singleton instance
export const accountsService = new AccountsService();