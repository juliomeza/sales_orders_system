// src/services/customers/customerService.ts
import { CustomerRepository } from '../../repositories/customerRepository';
import { ValidationService, ValidationRule } from '../shared/validationService';
import { ServiceResult } from '../shared/types';
import { CreateCustomerDTO, UpdateCustomerDTO } from './types';
import { CustomerDomain } from '../../domain/customer';
import bcrypt from 'bcryptjs';

export class CustomerService {
  constructor(private customerRepository: CustomerRepository) {}

  async getAllCustomers(): Promise<ServiceResult<CustomerDomain[]>> {
    try {
      const customers = await this.customerRepository.findAll();
      return {
        success: true,
        data: customers as CustomerDomain[]
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error retrieving customers'
      };
    }
  }

  async getCustomerById(id: number): Promise<ServiceResult<CustomerDomain>> {
    try {
      const customer = await this.customerRepository.findById(id);
      if (!customer) {
        return {
          success: false,
          error: 'Customer not found'
        };
      }
      return {
        success: true,
        data: customer as CustomerDomain
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error retrieving customer'
      };
    }
  }

  async createCustomer(data: CreateCustomerDTO): Promise<ServiceResult<CustomerDomain>> {
    const validation = this.validateCustomerData(data);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      const usersWithHashedPasswords = await Promise.all(
        data.users.map(async user => ({
          ...user,
          password: await bcrypt.hash(user.password || 'ChangeMe123!', 10)
        }))
      );

      const customer = await this.customerRepository.create(
        {
          ...data.customer,
          id: 0, // Será ignorado por Prisma pero satisface el tipo
          phone: data.customer.phone || null,
          email: data.customer.email || null
        },
        data.projects,
        usersWithHashedPasswords
      );

      return {
        success: true,
        data: customer as CustomerDomain
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error creating customer'
      };
    }
  }

  async updateCustomer(id: number, data: UpdateCustomerDTO): Promise<ServiceResult<CustomerDomain>> {
    const validation = this.validateUpdateData(data);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      let usersWithHashedPasswords;
      if (data.users) {
        usersWithHashedPasswords = await Promise.all(
          data.users.map(async user => ({
            ...user,
            password: await bcrypt.hash(user.password || 'ChangeMe123!', 10)
          }))
        );
      }

      const customerData = data.customer ? {
        ...data.customer,
        phone: data.customer.phone || null,
        email: data.customer.email || null
      } : {};

      const customer = await this.customerRepository.update(
        id,
        customerData,
        data.projects,
        usersWithHashedPasswords
      );

      if (!customer) {
        return {
          success: false,
          error: 'Customer not found'
        };
      }

      return {
        success: true,
        data: customer as CustomerDomain
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error updating customer'
      };
    }
  }

  async deleteCustomer(id: number): Promise<ServiceResult<void>> {
    try {
      await this.customerRepository.delete(id);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error deleting customer'
      };
    }
  }

  private validateCustomerData(data: CreateCustomerDTO) {
    return ValidationService.validate([
      {
        condition: !!data.customer.lookupCode,
        message: 'Customer Code is required'
      },
      {
        condition: !!data.customer.name,
        message: 'Customer Name is required'
      },
      {
        condition: !!data.customer.address,
        message: 'Address is required'
      },
      {
        condition: !!data.customer.city,
        message: 'City is required'
      },
      {
        condition: !!data.customer.state,
        message: 'State is required'
      },
      {
        condition: !!data.customer.zipCode,
        message: 'ZIP Code is required'
      },
      {
        condition: data.projects.length > 0,
        message: 'At least one project is required'
      },
      {
        condition: data.projects.some(p => p.isDefault),
        message: 'One project must be set as default'
      },
      {
        condition: data.users.length > 0,
        message: 'At least one user is required'
      }
    ]);
  }

  private validateUpdateData(data: UpdateCustomerDTO) {
    const rules: ValidationRule[] = [];

    if (data.customer) {
      if (data.customer.lookupCode !== undefined) {
        rules.push({
          condition: !!data.customer.lookupCode,
          message: 'Customer Code cannot be empty'
        });
      }
      if (data.customer.name !== undefined) {
        rules.push({
          condition: !!data.customer.name,
          message: 'Customer Name cannot be empty'
        });
      }
    }

    if (data.projects) {
      rules.push({
        condition: data.projects.length > 0,
        message: 'At least one project is required'
      });
      rules.push({
        condition: data.projects.some(p => p.isDefault),
        message: 'One project must be set as default'
      });
    }

    if (data.users) {
      rules.push({
        condition: data.users.length > 0,
        message: 'At least one user is required'
      });
    }

    return ValidationService.validate(rules);
  }
}