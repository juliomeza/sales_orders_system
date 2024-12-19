// frontend/src/shared/api/services/customerService.ts
import { apiClient } from '../apiClient';
import { 
  Customer, 
  CreateCustomerData,
  ValidationErrorItem
} from '../types/customer.types';

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
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

      return await apiClient.get(endpoint);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new customer
   */
  public async createCustomer(data: CreateCustomerData): Promise<Customer> {
    try {
        // Log para debugging inicial
        console.log('Starting createCustomer method...');
        console.log('Received data:', JSON.stringify(data, null, 2));

        // Validación básica antes de enviar
        console.log('Validating customer data...');
        const validationErrors = this.validateCustomerData(data);
        if (validationErrors.length > 0) {
            console.warn('Validation errors found:', validationErrors);
            throw new Error('Validation failed: ' + 
                validationErrors.map(e => e.message).join(', '));
        }

        // Log antes de realizar la solicitud
        console.log('Validation passed. Sending request to server with data:', JSON.stringify(data, null, 2));

        const response = await apiClient.post<ServiceResponse<Customer>>(this.basePath, data);

        // Chequeo adicional para respuesta nula
        if (response === null) {
            console.error('Server returned null. Check backend implementation.');
            throw new Error('Unexpected null response from server.');
        }

        // Log de la respuesta completa del servidor
        console.log('Response received from server:', JSON.stringify(response, null, 2));

        // Chequeamos diferentes formatos de respuesta posibles
        if (response && 'success' in response) {
            console.log('Response is of type ServiceResponse<Customer>:');
            const serviceResponse = response as ServiceResponse<Customer>;
            if (!serviceResponse.success) {
                console.error('ServiceResponse indicates failure:', serviceResponse);
                throw new Error(serviceResponse.error || 'Failed to create customer');
            }
            console.log('Returning data from ServiceResponse:', serviceResponse.data);
            return serviceResponse.data!;
        } else if (response && 'id' in response) {
            console.log('Response is a plain Customer object:', response);
            return response as Customer;
        } else if (response && 'customer' in response) {
            console.log('Response is wrapped in a customer object:', response);
            return (response as any).customer;
        }

        // Si no se encuentra un formato válido, lanzar error
        console.error('Invalid response format from server. Response was:', JSON.stringify(response, null, 2));
        throw new Error('Invalid response format from server');
    } catch (error) {
        // Log detallado del error
        console.error('Error during createCustomer method execution:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace available',
        });
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

      // Chequeamos diferentes formatos de respuesta posibles
      if (response && 'success' in response) {
        // Si es una ServiceResponse
        const serviceResponse = response as ServiceResponse<Customer>;
        if (!serviceResponse.success) {
          throw new Error(serviceResponse.error || 'Failed to update customer');
        }
        return serviceResponse.data!;
      } else if (response && 'id' in response) {
        // Si es directamente un Customer
        return response as Customer;
      } else if (response && 'customer' in response) {
        // Si está envuelto en un objeto customer
        return (response as any).customer;
      }

      throw new Error('Invalid response format from server');
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
      await apiClient.delete(`${this.basePath}/${customerId}`);
    } catch (error) {
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
    console.error('Customer service error:', error);

    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as any;
      console.error('Axios error details:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data
      });

      if (axiosError.response?.data?.message) {
        return new Error(axiosError.response.data.message);
      }
      if (axiosError.response?.status === 404) {
        return new Error('Customer not found');
      }
      if (axiosError.response?.status === 403) {
        return new Error('Not authorized to perform this action');
      }
      if (axiosError.response?.status === 400) {
        return new Error(
          axiosError.response.data.message || 
          'Invalid request data. Please check your input.'
        );
      }
    }

    return new Error('An unexpected error occurred while processing the customer operation');
  }
}

// Export singleton instance
export const customerService = new CustomerService();