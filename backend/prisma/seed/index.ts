// backend/prisma/seed/index.ts
/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import { seedStatuses } from './data/statuses';
import { seedUsers } from './data/users';
import { seedCustomers } from './data/customers';
import { seedOrderTypes } from './data/orderTypes';
import { seedAccounts } from './data/accounts';
import { seedCarriers } from './data/carriers';
import { seedWarehouses } from './data/warehouses';
import { seedProjects } from './data/projects';
import { seedMaterials } from './data/materials';

import { seedCustomerWarehouses } from './data/customerWarehouses';

// Types that will be shared across seed files
export interface User {
  id: number;
  email: string;
  lookupCode: string;
  role: string;
  status: number;
}

export interface Customer {
  id: number;
  lookupCode: string;
  name: string;
}

export interface Project {
  id: number;
  lookupCode: string;
  name: string;
}

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    // Seed data in order of dependencies
    const statuses = await seedStatuses(prisma);
    const adminUser = await seedUsers(prisma);
    const customers = await seedCustomers(prisma, adminUser);
    const orderTypes = await seedOrderTypes(prisma, adminUser);
    const accounts = await seedAccounts(prisma, adminUser, customers);
    const carriers = await seedCarriers(prisma, adminUser);
    const warehouses = await seedWarehouses(prisma, adminUser);
    const projects = await seedProjects(prisma, adminUser, customers);
    const materials = await seedMaterials(prisma, adminUser, projects);

    const warehouseAssignments = await seedCustomerWarehouses(prisma, adminUser, customers);

    console.log({
      statuses,
      adminUser,
      customers,
      orderTypes,
      accounts,
      carriers,
      warehouses,
      projects,
      materials,
      warehouseAssignments,
      message: 'Seed data created successfully',
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });