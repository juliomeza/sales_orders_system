// backend/prisma/seed/data/customerWarehouses.ts
import { PrismaClient } from '@prisma/client';
import { User, Customer } from '../index';

export async function seedCustomerWarehouses(prisma: PrismaClient, adminUser: User, { customers }: { customers: Customer[] }) {
  return await prisma.customerWarehouse.createMany({
    data: [
      {
        customerId: customers[0].id,
        warehouseId: 1, // First warehouse
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        customerId: customers[0].id,
        warehouseId: 2, // Second warehouse
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        customerId: customers[1].id,
        warehouseId: 1, // First warehouse
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      }
    ]
  });
}