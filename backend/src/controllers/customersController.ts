// backend/src/controllers/customersController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface Project {
  lookupCode: string;
  name: string;
  description?: string;
  isDefault: boolean;
}

interface User {
  email: string;
  status: number;
  id?: number;
}

interface CustomerInput {
  lookupCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  status: number;
}

interface CustomerCreateInput {
  customer: CustomerInput;
  projects: Project[];
  users: User[];
}

const generateUserLookupCode = (email: string): string => {
  return email.split('@')[0].toUpperCase();
};

export const customersController = {
  list: async (req: Request, res: Response) => {
    try {
      const { search = '' } = req.query;

      const customers = await prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: String(search), mode: 'insensitive' } },
            { lookupCode: { contains: String(search), mode: 'insensitive' } },
            { city: { contains: String(search), mode: 'insensitive' } }
          ]
        },
        include: {
          projects: {
            select: {
              id: true,
              name: true,
              isDefault: true
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

      res.json({ customers });
    } catch (error) {
      console.error('List customers error:', error);
      res.status(500).json({ error: 'Error listing customers' });
    }
  },

  create: async (req: Request<{}, {}, CustomerCreateInput>, res: Response) => {
    try {
      const { customer, projects, users } = req.body;

      const newCustomer = await prisma.$transaction(async (tx) => {
        // Create customer
        const createdCustomer = await tx.customer.create({
          data: {
            ...customer,
            created_by: req.user?.userId,
            modified_by: req.user?.userId
          }
        });

        // Create projects
        if (projects?.length > 0) {
          await tx.project.createMany({
            data: projects.map((project: Project) => ({
              ...project,
              customerId: createdCustomer.id,
              created_by: req.user?.userId,
              modified_by: req.user?.userId
            }))
          });
        }

        // Create users
        if (users?.length > 0) {
          const hashedPassword = await bcrypt.hash('ChangeMe123!', 10);
          await tx.user.createMany({
            data: users.map((user: User) => ({
              email: user.email,
              status: user.status,
              lookupCode: generateUserLookupCode(user.email),
              password: hashedPassword,
              customerId: createdCustomer.id,
              role: 'CLIENT',
              created_by: req.user?.userId,
              modified_by: req.user?.userId
            }))
          });
        }

        return createdCustomer;
      });

      res.status(201).json(newCustomer);
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({ error: 'Error creating customer' });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const customer = await prisma.customer.findUnique({
        where: { id: Number(id) },
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

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json(customer);
    } catch (error) {
      console.error('Get customer error:', error);
      res.status(500).json({ error: 'Error retrieving customer' });
    }
  },

  update: async (req: Request<{id: string}, {}, CustomerCreateInput>, res: Response) => {
    try {
      const { id } = req.params;
      const { customer, projects, users } = req.body;

      const updatedCustomer = await prisma.$transaction(async (tx) => {
        // Update customer
        const updated = await tx.customer.update({
          where: { id: Number(id) },
          data: {
            ...customer,
            modified_by: req.user?.userId
          }
        });

        // Update projects
        if (projects) {
          await tx.project.deleteMany({
            where: { customerId: Number(id) }
          });

          if (projects.length > 0) {
            await tx.project.createMany({
              data: projects.map((project: Project) => ({
                ...project,
                customerId: Number(id),
                created_by: req.user?.userId,
                modified_by: req.user?.userId
              }))
            });
          }
        }

        // Update users
        if (users) {
          // Only update user status, don't delete/recreate
          for (const user of users) {
            if (user.id) {
              await tx.user.update({
                where: { id: user.id },
                data: {
                  status: user.status,
                  modified_by: req.user?.userId
                }
              });
            } else {
              const hashedPassword = await bcrypt.hash('ChangeMe123!', 10);
              await tx.user.create({
                data: {
                  email: user.email,
                  status: user.status,
                  lookupCode: generateUserLookupCode(user.email),
                  password: hashedPassword,
                  customerId: Number(id),
                  role: 'CLIENT',
                  created_by: req.user?.userId,
                  modified_by: req.user?.userId
                }
              });
            }
          }
        }

        return updated;
      });

      res.json(updatedCustomer);
    } catch (error) {
      console.error('Update customer error:', error);
      res.status(500).json({ error: 'Error updating customer' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.$transaction(async (tx) => {
        // Delete related records first
        await tx.project.deleteMany({
          where: { customerId: Number(id) }
        });
        
        await tx.user.deleteMany({
          where: { customerId: Number(id) }
        });

        // Delete customer
        await tx.customer.delete({
          where: { id: Number(id) }
        });
      });

      res.status(204).send();
    } catch (error) {
      console.error('Delete customer error:', error);
      res.status(500).json({ error: 'Error deleting customer' });
    }
  }
};