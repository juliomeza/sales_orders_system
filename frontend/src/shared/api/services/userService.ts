// frontend/src/shared/api/services/userService.ts
import { apiClient } from '../apiClient';
import { User } from '../types/customer.types';

class UserService {
  private readonly getBasePath = (customerId: number) => 
    `/customers/${customerId}/users`;

  /**
   * Get all users for a customer
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
   * Add a user to a customer
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
   * Update a user
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
   * Delete a user
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
   * Reset user password
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
   * Transform a single user
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
   * Transform multiple users
   */
  private transformUsers(users: User[]): User[] {
    return users.map(user => this.transformUser(user));
  }

  /**
   * Validate new user data
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
   * Validate email format
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
   * Validate password requirements
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

// Export singleton instance
export const userService = new UserService();