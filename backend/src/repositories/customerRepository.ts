// backend/src/repositories/customerRepository.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { CustomerDomain, ProjectDomain, UserDomain } from '../domain/customer';

export class CustomerRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.customer.findMany({
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
  }

  async findById(id: number) {
    return this.prisma.customer.findUnique({
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
  }

  async create(data: CustomerDomain, projects: ProjectDomain[], users: UserDomain[]) {
    return this.prisma.$transaction(async (tx) => {
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
      }

      return this.findById(customer.id);
    });
  }

  async update(id: number, data: Partial<CustomerDomain>, projects?: ProjectDomain[], users?: UserDomain[]) {
    return this.prisma.$transaction(async (tx) => {
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

      // Actualizar proyectos si se proporcionaron
      if (projects !== undefined) {
        await tx.project.deleteMany({
          where: { customerId: id }
        });

        if (projects.length > 0) {
          await tx.project.createMany({
            data: projects.map(project => ({
              lookupCode: project.lookupCode,
              name: project.name,
              description: project.description || null,
              isDefault: project.isDefault,
              status: 1,
              customerId: id,
              created_by: null,
              modified_by: null
            }))
          });
        }
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
      }

      return this.findById(id);
    });
  }

  async delete(id: number) {
    return this.prisma.$transaction(async (tx) => {
      await tx.project.deleteMany({
        where: { customerId: id }
      });
      
      await tx.user.deleteMany({
        where: { customerId: id }
      });

      await tx.customer.delete({
        where: { id }
      });
    });
  }
}