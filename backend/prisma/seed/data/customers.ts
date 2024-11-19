// backend/prisma/seed/data/customers.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { User } from '../index';

export async function seedCustomers(prisma: PrismaClient, adminUser: User) {
  // Create test customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        lookupCode: 'Coronado',
        name: 'Coronado Aesthetics, LLC',
        address: '14841 Dallas Parkway',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75254',
        phone: '999-999-9999',
        email: 'coronado@example.com',
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
    }),
    prisma.customer.create({
      data: {
        lookupCode: 'TriMed',
        name: 'Tri-Med Distributors Pty Ltd.',
        address: '1999 Harrison Street',
        city: 'Oakland',
        state: 'CA',
        zipCode: '94612',
        phone: '555-555-5555',
        email: 'contact@trimed.com',
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
    })
  ]);

  // Create client users for each customer
  const hashedClientPassword = await bcrypt.hash('Client123!', 10);
  const clientUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'client1@example.com',
        lookupCode: 'CLIENT1',
        password: hashedClientPassword,
        role: 'CLIENT',
        customerId: customers[0].id,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
    }),
    prisma.user.create({
      data: {
        email: 'client2@example.com',
        lookupCode: 'CLIENT2',
        password: hashedClientPassword,
        role: 'CLIENT',
        customerId: customers[1].id,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
    })
  ]);

  return {
    customers,
    clientUsers
  };
}