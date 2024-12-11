// backend/src/repositories/customerRepository.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { CustomerDomain, ProjectDomain, UserDomain } from '../domain/customer';
import Logger from '../config/logger';
import { ERROR_MESSAGES, LOG_MESSAGES } from '../shared/constants';

export class CustomerRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    Logger.debug('Repository: Finding all customers', {
      operation: 'findAll'
    });

    try {
      const customers = await this.prisma.customer.findMany({
        include: {
          projects: true,
          users: {
            select: {
              id: true,
              email: true,
              role: true,
              status: true
            }
          },
          _count: {
            select: {
              users: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      Logger.debug('Repository: Successfully retrieved customers', {
        count: customers.length,
        operation: 'findAll'
      });

      return customers;
    } catch (error) {
      Logger.error('Repository: Error finding customers', {
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'findAll'
      });
      throw error;
    }
  }

  async findById(id: number) {
    Logger.debug('Repository: Finding customer by ID', {
      customerId: id,
      operation: 'findById'
    });

    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id },
        include: {
          projects: true,
          users: {
            select: {
              id: true,
              email: true,
              role: true,
              status: true
            }
          }
        }
      });

      if (customer) {
        Logger.debug('Repository: Customer found', {
          customerId: id,
          lookupCode: customer.lookupCode,
          projectCount: customer.projects.length,
          userCount: customer.users.length,
          operation: 'findById'
        });
      } else {
        Logger.debug('Repository: Customer not found', {
          customerId: id,
          operation: 'findById'
        });
      }

      return customer;
    } catch (error) {
      Logger.error('Repository: Error finding customer by ID', {
        customerId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'findById'
      });
      throw error;
    }
  }

  async create(data: CustomerDomain, projects: ProjectDomain[], users: UserDomain[]) {
    Logger.info('Repository: Creating new customer with related entities', {
      lookupCode: data.lookupCode,
      projectCount: projects.length,
      userCount: users.length,
      operation: 'create'
    });

    return this.prisma.$transaction(async (tx) => {
      try {
        // Crear el customer
        const customer = await tx.customer.create({
          data: {
            lookupCode: data.lookupCode,
            name: data.name,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            phone: data.phone,
            email: data.email,
            status: data.status,
            created_by: null,
            modified_by: null
          }
        });

        Logger.debug('Repository: Customer created, creating related entities', {
          customerId: customer.id,
          lookupCode: customer.lookupCode,
          operation: 'create'
        });

        // Crear los proyectos si existen
        if (projects.length > 0) {
          await tx.project.createMany({
            data: projects.map(project => ({
              lookupCode: project.lookupCode,
              name: project.name,
              description: project.description || null,
              isDefault: project.isDefault,
              status: 1,
              customerId: customer.id,
              created_by: null,
              modified_by: null
            }))
          });

          Logger.debug('Repository: Projects created for customer', {
            customerId: customer.id,
            projectCount: projects.length,
            operation: 'create'
          });
        }

        // Crear los usuarios si existen
        if (users.length > 0) {
          await tx.user.createMany({
            data: users.map(user => ({
              email: user.email,
              lookupCode: user.email.split('@')[0].toUpperCase(),
              password: user.password || '',
              role: user.role,
              status: user.status,
              customerId: customer.id,
              created_by: null,
              modified_by: null
            }))
          });

          Logger.debug('Repository: Users created for customer', {
            customerId: customer.id,
            userCount: users.length,
            operation: 'create'
          });
        }

        const createdCustomer = await this.findById(customer.id);

        Logger.info('Repository: Successfully created customer with all related entities', {
          customerId: customer.id,
          lookupCode: customer.lookupCode,
          projectCount: projects.length,
          userCount: users.length,
          operation: 'create'
        });

        return createdCustomer;
      } catch (error) {
        Logger.error('Repository: Error creating customer with related entities', {
          lookupCode: data.lookupCode,
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'create'
        });
        throw error;
      }
    });
  }

  async update(id: number, data: Partial<CustomerDomain>, projects?: ProjectDomain[], users?: UserDomain[]) {
    Logger.info('Repository: Updating customer and related entities', {
      customerId: id,
      hasCustomerUpdates: Object.keys(data).length > 0,
      hasProjectUpdates: !!projects,
      hasUserUpdates: !!users,
      operation: 'update'
    });

    return this.prisma.$transaction(async (tx) => {
      try {
        // Actualizar el customer
        const customer = await tx.customer.update({
          where: { id },
          data: {
            ...(data.lookupCode && { lookupCode: data.lookupCode }),
            ...(data.name && { name: data.name }),
            ...(data.address && { address: data.address }),
            ...(data.city && { city: data.city }),
            ...(data.state && { state: data.state }),
            ...(data.zipCode && { zipCode: data.zipCode }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.email !== undefined && { email: data.email }),
            ...(data.status !== undefined && { status: data.status }),
            modified_by: null,
            modified_at: new Date()
          }
        });

        Logger.debug('Repository: Customer updated, processing related entities', {
          customerId: id,
          lookupCode: customer.lookupCode,
          operation: 'update'
        });

        // Actualizar proyectos si se proporcionaron
        if (projects !== undefined) {
          await tx.project.updateMany({
            where: { customerId: id },
            data: { 
              isDefault: false,
              modified_at: new Date(),
              modified_by: null
            }
          });

          const defaultProject = projects.find(p => p.isDefault);
          if (defaultProject) {
            await tx.project.updateMany({
              where: { 
                customerId: id,
                lookupCode: defaultProject.lookupCode 
              },
              data: { 
                isDefault: true,
                modified_at: new Date(),
                modified_by: null
              }
            });
          }

          Logger.debug('Repository: Projects updated for customer', {
            customerId: id,
            projectCount: projects.length,
            hasDefaultProject: !!defaultProject,
            operation: 'update'
          });
        }

        // Actualizar usuarios si se proporcionaron
        if (users !== undefined) {
          await tx.user.deleteMany({
            where: { customerId: id }
          });

          if (users.length > 0) {
            await tx.user.createMany({
              data: users.map(user => ({
                email: user.email,
                lookupCode: user.email.split('@')[0].toUpperCase(),
                password: user.password || '',
                role: user.role,
                status: user.status,
                customerId: id,
                created_by: null,
                modified_by: null
              }))
            });
          }

          Logger.debug('Repository: Users updated for customer', {
            customerId: id,
            userCount: users.length,
            operation: 'update'
          });
        }

        const updatedCustomer = await this.findById(id);

        Logger.info('Repository: Successfully updated customer and related entities', {
          customerId: id,
          lookupCode: customer.lookupCode,
          projectsUpdated: !!projects,
          usersUpdated: !!users,
          operation: 'update'
        });

        return updatedCustomer;
      } catch (error) {
        Logger.error('Repository: Error updating customer and related entities', {
          customerId: id,
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'update'
        });
        throw error;
      }
    });
  }

  async delete(id: number) {
    Logger.info('Repository: Deleting customer and related entities', {
      customerId: id,
      operation: 'delete'
    });

    return this.prisma.$transaction(async (tx) => {
      try {
        // Eliminar proyectos
        await tx.project.deleteMany({
          where: { customerId: id }
        });
        
        Logger.debug('Repository: Projects deleted for customer', {
          customerId: id,
          operation: 'delete'
        });
        
        // Eliminar usuarios
        await tx.user.deleteMany({
          where: { customerId: id }
        });

        Logger.debug('Repository: Users deleted for customer', {
          customerId: id,
          operation: 'delete'
        });

        // Eliminar cliente
        await tx.customer.delete({
          where: { id }
        });

        Logger.info('Repository: Successfully deleted customer and all related entities', {
          customerId: id,
          operation: 'delete'
        });
      } catch (error) {
        Logger.error('Repository: Error deleting customer and related entities', {
          customerId: id,
          error: error instanceof Error ? error.message : 'Unknown error',
          operation: 'delete'
        });
        throw error;
      }
    });
  }
}