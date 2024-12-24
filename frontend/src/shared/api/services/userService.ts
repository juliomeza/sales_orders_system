// frontend/src/shared/api/services/userService.ts
/**
 * @fileoverview User management service layer
 * Provides comprehensive API integration for managing customer users with
 * data validation, transformation, and error handling capabilities.
 */

import { apiClient } from '../apiClient';
import { User } from '../types/customer.types';

/**
 * Service class for managing customer user operations
 * Implements CRUD operations and password management
 */
class UserService {
  /**
   * Generates the base API path for user endpoints
   * @param {number} customerId - The customer ID for the path
   * @returns {string} The formatted base path
   */
  private readonly getBasePath = (customerId: number) => 
    `/customers/${customerId}/users`;

  /**
   * Fetches all users associated with a customer
   * 
   * @param {number} customerId - The customer whose users to fetch
   * @throws {Error} If the request fails or returns invalid data
   * @returns {Promise<User[]>} List of transformed user data
   */
  public async getCustomerUsers(customerId: number): Promise<User[]> {
    try {
      const response = await apiClient.get<{ users: User[] }>(
        this.getBasePath(customerId)
      );
      return this.transformUsers(response.users);
    } catch (error) {
      throw this.handleError(error, 'Error fetching customer users');
    }
  }

  /**
   * Creates a new user for a customer
   * 
   * @param {number} customerId - The customer to add the user to
   * @param {Omit<User, 'id'>} userData - The user data to create
   * @throws {Error} If validation fails or creation request fails
   * @returns {Promise<User>} The created user
   */
  public async addUser(
    customerId: number,
    userData: Omit<User, 'id'>
  ): Promise<User> {
    try {
      this.validateNewUser(userData);
      const response = await apiClient.post<User>(
        this.getBasePath(customerId),
        userData
      );
      return this.transformUser(response);
    } catch (error) {
      throw this.handleError(error, 'Error adding user');
    }
  }

  /**
   * Updates an existing user's information
   * 
   * @param {number} customerId - The customer owning the user
   * @param {number} userId - The user to update
   * @param {Partial<User>} userData - The fields to update
   * @throws {Error} If validation fails or update fails
   * @returns {Promise<User>} The updated user
   */
  public async updateUser(
    customerId: number,
    userId: number,
    userData: Partial<User>
  ): Promise<User> {
    try {
      if (userData.email) {
        this.validateEmail(userData.email);
      }
      const response = await apiClient.put<User>(
        `${this.getBasePath(customerId)}/${userId}`,
        userData
      );
      return this.transformUser(response);
    } catch (error) {
      throw this.handleError(error, 'Error updating user');
    }
  }

  /**
   * Deletes a user from a customer account
   * 
   * @param {number} customerId - The customer owning the user
   * @param {number} userId - The user to delete
   * @throws {Error} If deletion fails
   */
  public async deleteUser(customerId: number, userId: number): Promise<void> {
    try {
      await apiClient.delete(
        `${this.getBasePath(customerId)}/${userId}`
      );
    } catch (error) {
      throw this.handleError(error, 'Error deleting user');
    }
  }

  /**
   * Resets a user's password
   * 
   * @param {number} customerId - The customer owning the user
   * @param {number} userId - The user whose password to reset
   * @param {string} password - The new password
   * @throws {Error} If password validation fails or reset fails
   */
  public async resetPassword(
    customerId: number,
    userId: number,
    password: string
  ): Promise<void> {
    try {
      this.validatePassword(password);
      await apiClient.put(
        `${this.getBasePath(customerId)}/${userId}/reset-password`,
        { password }
      );
    } catch (error) {
      throw this.handleError(error, 'Error resetting password');
    }
  }

  /**
   * Transforms user data to ensure consistent structure
   * Normalizes role and status values
   * 
   * @param {User} user - Raw user data
   * @returns {User} Normalized user data
   * @private
   */
  private transformUser(user: User): User {
    return {
      id: user.id,
      email: user.email,
      role: user.role || 'CLIENT',
      status: user.status || 1
    };
  }

  /**
   * Batch transforms multiple users
   * 
   * @param {User[]} users - Array of raw user data
   * @returns {User[]} Array of normalized users
   * @private
   */
  private transformUsers(users: User[]): User[] {
    return users.map(user => this.transformUser(user));
  }

  /**
   * Validates new user data before creation
   * Checks email, password, role, and status
   * 
   * @param {Omit<User, 'id'>} user - User data to validate
   * @throws {Error} If validation fails
   * @private
   */
  private validateNewUser(user: Omit<User, 'id'>): void {
    this.validateEmail(user.email);
    
    if (user.password) {
      this.validatePassword(user.password);
    }

    if (!['ADMIN', 'CLIENT'].includes(user.role)) {
      throw new Error('Invalid user role');
    }

    if (![1, 2].includes(user.status)) {
      throw new Error('Invalid user status');
    }
  }

  /**
   * Validates email format and length
   * 
   * @param {string} email - Email to validate
   * @throws {Error} If email is invalid or too long
   * @private
   */
  private validateEmail(email: string): void {
    if (!email) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    if (email.length > 100) {
      throw new Error('Email must be 100 characters or less');
    }
  }

  /**
   * Validates password strength and length
   * 
   * @param {string} password - Password to validate
   * @throws {Error} If password doesn't meet requirements
   * @private
   */
  private validatePassword(password: string): void {
    if (!password) {
      throw new Error('Password is required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (password.length > 100) {
      throw new Error('Password must be 100 characters or less');
    }
  }

  /**
   * Handles API errors with context
   * Provides specific error messages for common error cases
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
        return new Error(`${context}: User not found`);
      }
      if (axiosError.response?.status === 403) {
        return new Error(`${context}: Not authorized`);
      }
      if (axiosError.response?.status === 409) {
        return new Error(`${context}: Email already exists`);
      }
      if (axiosError.response?.data?.message) {
        return new Error(`${context}: ${axiosError.response.data.message}`);
      }
    }

    return new Error(context);
  }
}

// Export singleton instance for use across the application
export const userService = new UserService();