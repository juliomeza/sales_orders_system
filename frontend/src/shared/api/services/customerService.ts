// frontend/src/shared/api/services/customerService.ts
import { apiClient } from '../apiClient';
import { 
  Customer, 
  CreateCustomerData,
  ValidationErrorItem,
  ServiceResult
} from '../types/customer.types';

interface ServiceResponse<T> {
  success: boolean;
  data?: { customers?: Customer[] } | Customer | T;
  error?: string;
  errors?: string[];
}

class CustomerService {
  private readonly basePath = '/customers';

  /**
   * Get all customers with optional filtering
   */
  public async getCustomers(filters?: {
    status?: number;
    search?: string;
  }): Promise<{ customers: Customer[] }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.status) {
        queryParams.append('status', filters.status.toString());
      }
      if (filters?.search) {
        queryParams.append('search', filters.search);
      }

      const endpoint = queryParams.toString() 
        ? `${this.basePath}?${queryParams.toString()}`
        : this.basePath;

      const response = await apiClient.get<{
        success: boolean;
        data: { customers: Customer[] };
        error?: string;
      }>(endpoint);

      // Verificar la respuesta
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch customers');
      }

      // Asegurarse de que tenemos los datos
      if (!response.data || !response.data.customers) {
        throw new Error('Invalid response format: missing customers data');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new customer
   */
  public async createCustomer(data: CreateCustomerData): Promise<void> { // Cambiar return type a void
    try {
      const response = await apiClient.post<ServiceResponse<void>>(
        this.basePath, 
        data
      );
  
      // Solo verificamos el success
      if (!response.success) {
        const errorMessage = response.errors 
          ? `Validation failed: ${response.errors.join(', ')}` 
          : response.error 
          || 'Failed to create customer';
        throw new Error(errorMessage);
      }
  
      // Si success es true, todo está bien
      return;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing customer
   */
  public async updateCustomer(
    customerId: number, 
    data: Partial<CreateCustomerData>
  ): Promise<Customer> {
    try {
      console.log('Updating customer with data:', JSON.stringify(data, null, 2));

      const response = await apiClient.put<ServiceResponse<Customer>>(
        `${this.basePath}/${customerId}`, 
        data
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to update customer');
      }

      if (!response.data) {
        throw new Error('Server response is missing customer data');
      }

      return response.data as Customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a customer
   */
  public async deleteCustomer(customerId: number): Promise<void> {
    try {
      const response = await apiClient.delete<ServiceResponse<void>>(
        `${this.basePath}/${customerId}`
      );
  
      // Para respuestas normales, verificar success
      if (!response?.success) {
        throw new Error(response?.error || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      
      // Si el error es de tipo axios y el status es 204, considerarlo como éxito
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as any;
        if (axiosError?.response?.status === 204) {
          return;
        }
      }
      
      throw this.handleError(error);
    }
  }

  /**
   * Basic validation for required customer fields
   */
  private validateCustomerData(
    data: CreateCustomerData, 
    isPartial: boolean = false
  ): ValidationErrorItem[] {
    const errors: ValidationErrorItem[] = [];
    const { customer } = data;

    // Solo validar si existe el objeto customer
    if (!customer) {
      errors.push({ field: 'customer', message: 'Customer data is required' });
      return errors;
    }

    // Validaciones solo si no es una actualización parcial
    if (!isPartial) {
      if (!customer.lookupCode) {
        errors.push({ field: 'lookupCode', message: 'Customer code is required' });
      }
      if (!customer.name) {
        errors.push({ field: 'name', message: 'Customer name is required' });
      }
      if (!customer.address) {
        errors.push({ field: 'address', message: 'Address is required' });
      }
      if (!customer.city) {
        errors.push({ field: 'city', message: 'City is required' });
      }
      if (!customer.state) {
        errors.push({ field: 'state', message: 'State is required' });
      }
      if (!customer.zipCode) {
        errors.push({ field: 'zipCode', message: 'ZIP code is required' });
      }
    }

    return errors;
  }

  /**
   * Standardized error handling
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as any;
      console.error('Axios error details:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data
      });

      if (axiosError.response?.data?.error) {
        return new Error(axiosError.response.data.error);
      }
      if (axiosError.response?.data?.errors) {
        return new Error(axiosError.response.data.errors.join(', '));
      }
      if (axiosError.response?.status === 404) {
        return new Error('Customer not found');
      }
      if (axiosError.response?.status === 403) {
        return new Error('Not authorized to perform this action');
      }
      if (axiosError.response?.status === 400) {
        return new Error('Invalid request data. Please check your input.');
      }
    }

    return new Error('An unexpected error occurred while processing the customer operation');
  }
}

// Export singleton instance
export const customerService = new CustomerService();