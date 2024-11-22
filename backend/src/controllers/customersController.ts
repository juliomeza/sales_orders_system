// backend/src/controllers/customersController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface Project {
  id?: number;
  lookupCode: string;
  name: string;
  description?: string;
  isDefault: boolean;
}

interface User {
  id?: number;
  email: string;
  status: number;
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

interface CustomerUpdateInput {
  customer: CustomerInput;
  projects?: Project[];
  users?: User[];
}

export const customersController = {
  // List customers
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

  // Create customer
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
              lookupCode: project.lookupCode,
              name: project.name,
              description: project.description,
              isDefault: project.isDefault,
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
              lookupCode: user.email.split('@')[0].toUpperCase(),
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

  // Get customer by ID
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

  // Update customer
  update: async (req: Request<{id: string}, {}, CustomerUpdateInput>, res: Response) => {
    try {
      const { id } = req.params;
      const { customer } = req.body;
  
      console.log('Received update data:', { id, customer });
  
      // Verificar que el customer existe
      const existingCustomer = await prisma.customer.findUnique({
        where: { id: Number(id) }
      });
  
      if (!existingCustomer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
  
      // Verificar lookupCode duplicado
      if (customer.lookupCode !== existingCustomer.lookupCode) {
        const duplicateLookupCode = await prisma.customer.findUnique({
          where: { lookupCode: customer.lookupCode }
        });
  
        if (duplicateLookupCode) {
          return res.status(400).json({ 
            error: 'Lookup code already exists',
            field: 'lookupCode'
          });
        }
      }
  
      // Actualizar solo los campos del customer
      const updatedCustomer = await prisma.customer.update({
        where: { id: Number(id) },
        data: {
          lookupCode: customer.lookupCode,
          name: customer.name,
          address: customer.address,
          city: customer.city,
          state: customer.state,
          zipCode: customer.zipCode,
          phone: customer.phone || null,
          email: customer.email || null,
          status: customer.status,
          modified_by: req.user?.userId || null,
          modified_at: new Date()
        },
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
  
      res.json(updatedCustomer);
    } catch (error) {
      console.error('Update customer error:', error);
      res.status(500).json({ 
        error: 'Error updating customer',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Delete customer
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