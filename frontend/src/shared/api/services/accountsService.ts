/**
 * @fileoverview Service layer for managing shipping addresses
 * Provides a complete API wrapper with data validation, error handling, and response transformation
 */

import { apiClient } from '../apiClient';
import { 
  ShippingAddress, 
  ShippingAddressResponse 
} from '../types/accounts.types';

/**
 * Service class for managing shipping addresses
 * Implements CRUD operations with comprehensive error handling and data validation
 */
class AccountsService {
  private readonly basePath = '/ship-to';

  /**
   * Fetches all shipping addresses for the current account
   * 
   * @throws {Error} If the request fails or returns invalid data
   * @returns {Promise<ShippingAddress[]>} List of validated shipping addresses
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
   * Fetches a specific shipping address by ID
   * 
   * @param {string} id - The ID of the shipping address to fetch
   * @throws {Error} If the address is not found or request fails
   * @returns {Promise<ShippingAddress>} The requested shipping address
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
   * Creates a new shipping address
   * 
   * @param {Omit<ShippingAddress, 'id'>} address - The address data to create
   * @throws {Error} If validation fails or the request errors
   * @returns {Promise<ShippingAddress>} The newly created address with ID
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
   * Updates an existing shipping address
   * 
   * @param {string} id - The ID of the address to update
   * @param {Partial<ShippingAddress>} address - The fields to update
   * @throws {Error} If the address is not found or update fails
   * @returns {Promise<ShippingAddress>} The updated address
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
   * Deletes a shipping address
   * 
   * @param {string} id - The ID of the address to delete
   * @throws {Error} If the address is not found or deletion fails
   */
  public async deleteShippingAddress(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`);
    } catch (error) {
      throw this.handleError(error, `Error deleting shipping address ${id}`);
    }
  }

  /**
   * Transforms API response to ensure consistent data structure
   * Applies validation to each address in the response
   * 
   * @param {ShippingAddressResponse} response - Raw API response
   * @returns {ShippingAddress[]} Validated address list
   * @private
   */
  private transformAddressesResponse(
    response: ShippingAddressResponse
  ): ShippingAddress[] {
    return response.addresses.map(address => this.validateAddress(address));
  }

  /**
   * Validates address data structure and required fields
   * Ensures all required fields are present and properly formatted
   * 
   * @param {ShippingAddress} address - Address to validate
   * @throws {Error} If validation fails
   * @returns {ShippingAddress} Validated and normalized address
   * @private
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
   * Validates new address data before creation
   * Checks required fields and state code format
   * 
   * @param {Omit<ShippingAddress, 'id'>} address - New address data
   * @throws {Error} If validation fails
   * @private
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
   * Transforms API errors into user-friendly messages
   * 
   * @param {unknown} error - The caught error
   * @param {string} context - Description of the operation that failed
   * @returns {Error} Formatted error with context
   * @private
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

// Export singleton instance for use across the application
export const accountsService = new AccountsService();