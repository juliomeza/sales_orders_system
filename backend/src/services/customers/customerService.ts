// backend/src/services/customers/customerService.ts
import { CustomerRepository } from '../../repositories/customerRepository';
import { ValidationService } from '../../shared/validations';
import { ServiceResult } from '../../shared/types';
import { CreateCustomerDTO, UpdateCustomerDTO } from './types';
import { CustomerDomain } from '../../domain/customer';
import { ERROR_MESSAGES, STATUS, ROLES, AUTH_CONSTANTS, LOG_MESSAGES } from '../../shared/constants';
import Logger from '../../config/logger';
import bcrypt from 'bcryptjs';

export class CustomerService {
  constructor(private customerRepository: CustomerRepository) {}

  async getAllCustomers(): Promise<ServiceResult<CustomerDomain[]>> {
    Logger.debug(LOG_MESSAGES.CUSTOMERS.LIST.REQUEST);

    try {
      const customers = await this.customerRepository.findAll();
      
      Logger.info(LOG_MESSAGES.CUSTOMERS.LIST.SUCCESS, {
        count: customers?.length || 0
      });

      return {
        success: true,
        data: customers as CustomerDomain[]
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.CUSTOMERS.LIST.FAILED, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async getCustomerById(id: number): Promise<ServiceResult<CustomerDomain>> {
    Logger.debug(LOG_MESSAGES.CUSTOMERS.GET.REQUEST, {
      customerId: id
    });

    try {
      const customer = await this.customerRepository.findById(id);
      
      if (!customer) {
        Logger.warn(LOG_MESSAGES.CUSTOMERS.GET.FAILED_NOT_FOUND, {
          customerId: id
        });

        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.CUSTOMER
        };
      }

      Logger.info(LOG_MESSAGES.CUSTOMERS.GET.SUCCESS, {
        customerId: id,
        lookupCode: customer.lookupCode
      });

      return {
        success: true,
        data: customer as CustomerDomain
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.CUSTOMERS.GET.FAILED, {
        customerId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async createCustomer(data: CreateCustomerDTO): Promise<ServiceResult<CustomerDomain>> {
    Logger.info(LOG_MESSAGES.CUSTOMERS.CREATE.ATTEMPT, {
      lookupCode: data.customer.lookupCode,
      name: data.customer.name,
      projectsCount: data.projects.length,
      usersCount: data.users.length
    });

    const validation = this.validateCustomerData(data);
    if (!validation.isValid) {
      Logger.warn(LOG_MESSAGES.CUSTOMERS.CREATE.FAILED_VALIDATION, {
        lookupCode: data.customer.lookupCode,
        errors: validation.errors
      });

      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      const usersWithHashedPasswords = await Promise.all(
        data.users.map(async user => ({
          ...user,
          password: await bcrypt.hash(user.password || AUTH_CONSTANTS.DEFAULT_PASSWORD, 10),
          status: STATUS.ACTIVE,
          role: user.role || ROLES.CLIENT
        }))
      );

      const customer = await this.customerRepository.create(
        {
          ...data.customer,
          id: 0,
          status: STATUS.ACTIVE,
          phone: data.customer.phone || null,
          email: data.customer.email || null
        },
        data.projects.map(project => ({
          ...project,
          status: STATUS.ACTIVE
        })),
        usersWithHashedPasswords
      );

      Logger.info(LOG_MESSAGES.CUSTOMERS.CREATE.SUCCESS, {
        customerId: customer?.id,
        lookupCode: customer?.lookupCode,
        projectsCount: customer?.projects?.length || 0,
        usersCount: customer?.users?.length || 0
      });

      return {
        success: true,
        data: customer as CustomerDomain
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.CUSTOMERS.CREATE.FAILED, {
        lookupCode: data.customer.lookupCode,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR
      };
    }
  }

  async updateCustomer(id: number, data: UpdateCustomerDTO): Promise<ServiceResult<CustomerDomain>> {
    Logger.info(LOG_MESSAGES.CUSTOMERS.UPDATE.ATTEMPT, {
      customerId: id,
      hasCustomerData: !!data.customer,
      hasProjects: !!data.projects,
      hasUsers: !!data.users
    });

    const validation = this.validateUpdateData(data);
    if (!validation.isValid) {
      Logger.warn(LOG_MESSAGES.CUSTOMERS.UPDATE.FAILED_VALIDATION, {
        customerId: id,
        errors: validation.errors
      });

      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      const existingCustomer = await this.customerRepository.findById(id);
      if (!existingCustomer) {
        Logger.warn(LOG_MESSAGES.CUSTOMERS.UPDATE.FAILED_NOT_FOUND, {
          customerId: id
        });

        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.CUSTOMER
        };
      }

      let usersWithHashedPasswords;
      if (data.users) {
        usersWithHashedPasswords = await Promise.all(
          data.users.map(async user => ({
            ...user,
            password: await bcrypt.hash(user.password || AUTH_CONSTANTS.DEFAULT_PASSWORD, 10),
            status: STATUS.ACTIVE,
            role: user.role || ROLES.CLIENT
          }))
        );
      }

      const customerData = data.customer ? {
        ...data.customer,
        phone: data.customer.phone || null,
        email: data.customer.email || null,
        status: data.customer.status || STATUS.ACTIVE
      } : {};

      const customer = await this.customerRepository.update(
        id,
        customerData,
        data.projects?.map(project => ({
          ...project,
          status: STATUS.ACTIVE
        })),
        usersWithHashedPasswords
      );

      Logger.info(LOG_MESSAGES.CUSTOMERS.UPDATE.SUCCESS, {
        customerId: id,
        lookupCode: customer?.lookupCode,
        projectsUpdated: !!data.projects,
        usersUpdated: !!data.users
      });

      return {
        success: true,
        data: customer as CustomerDomain
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.CUSTOMERS.UPDATE.FAILED, {
        customerId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR
      };
    }
  }

  async deleteCustomer(id: number): Promise<ServiceResult<void>> {
    Logger.info(LOG_MESSAGES.CUSTOMERS.DELETE.ATTEMPT, {
      customerId: id
    });

    try {
      const existingCustomer = await this.customerRepository.findById(id);
      if (!existingCustomer) {
        Logger.warn(LOG_MESSAGES.CUSTOMERS.DELETE.FAILED_NOT_FOUND, {
          customerId: id
        });

        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.CUSTOMER
        };
      }

      await this.customerRepository.delete(id);

      Logger.info(LOG_MESSAGES.CUSTOMERS.DELETE.SUCCESS, {
        customerId: id,
        lookupCode: existingCustomer.lookupCode
      });

      return {
        success: true
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.CUSTOMERS.DELETE.FAILED, {
        customerId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.DELETE_ERROR
      };
    }
  }

  private validateCustomerData(data: CreateCustomerDTO) {
    Logger.debug('Validating customer data', {
      lookupCode: data.customer.lookupCode,
      projectsCount: data.projects.length,
      usersCount: data.users.length
    });

    return ValidationService.validate([
      {
        condition: !!data.customer.lookupCode,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Customer Code')
      },
      {
        condition: !!data.customer.name,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Customer Name')
      },
      {
        condition: !!data.customer.address,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Address')
      },
      {
        condition: !!data.customer.city,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('City')
      },
      {
        condition: !!data.customer.state,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('State')
      },
      {
        condition: !!data.customer.zipCode,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('ZIP Code')
      },
      {
        condition: data.projects.length > 0,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Projects')
      },
      {
        condition: data.projects.some(p => p.isDefault),
        message: ERROR_MESSAGES.CUSTOMER.DEFAULT_PROJECT_REQUIRED
      },
      {
        condition: data.users.length > 0,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Users')
      }
    ]);
  }

  private validateUpdateData(data: UpdateCustomerDTO) {
    Logger.debug('Validating customer update data', {
      hasCustomerData: !!data.customer,
      hasProjects: !!data.projects,
      hasUsers: !!data.users
    });

    const rules = [];

    if (data.customer) {
      if (data.customer.lookupCode !== undefined) {
        rules.push({
          condition: !!data.customer.lookupCode,
          message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Customer Code')
        });
      }
      if (data.customer.name !== undefined) {
        rules.push({
          condition: !!data.customer.name,
          message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Customer Name')
        });
      }
      if (data.customer.status !== undefined) {
        rules.push({
          condition: Object.values(STATUS).includes(data.customer.status),
          message: ERROR_MESSAGES.VALIDATION.INVALID_STATUS
        });
      }
    }

    if (data.projects) {
      rules.push({
        condition: data.projects.length > 0,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Projects')
      });
      rules.push({
        condition: data.projects.some(p => p.isDefault),
        message: ERROR_MESSAGES.CUSTOMER.DEFAULT_PROJECT_REQUIRED
      });
    }

    if (data.users) {
      rules.push({
        condition: data.users.length > 0,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Users')
      });
      rules.push({
        condition: data.users.every(user => 
          !user.role || Object.values(ROLES).includes(user.role as keyof typeof ROLES)
        ),
        message: ERROR_MESSAGES.VALIDATION.INVALID_ROLE
      });
    }

    return ValidationService.validate(rules);
  }
}