// backend/prisma/seed/data/warehouses.ts
import { PrismaClient } from '@prisma/client';
import { User } from '../index';

export async function seedWarehouses(prisma: PrismaClient, adminUser: User) {
  // Create warehouses
  const warehouses = await prisma.warehouse.createMany({
    data: [
      {
        lookupCode: '10',
        name: 'South East',
        address: '951 Clint Moore Road',
        city: 'Boca Raton',
        state: 'FL',
        zipCode: '33487',
        phone: '561-998-3885',
        email: 'warehouse1@example.com',
        capacity: 10000,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        lookupCode: '15',
        name: 'South Center',
        address: '1113 Gillingham Lane',
        city: 'Sugar Land',
        state: 'TX',
        zipCode: '77478',
        phone: '561-998-3885',
        email: 'warehouse2@example.com',
        capacity: 8000,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        lookupCode: '18',
        name: 'South East',
        address: '751 NW 33rd St',
        city: 'Pompano Beach',
        state: 'FL',
        zipCode: '33064',
        phone: '561-998-3885',
        email: 'warehouse1@example.com',
        capacity: 10000,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        lookupCode: '20',
        name: 'North Center',
        address: '5653 Creekside Parkway',
        city: 'Lockbourne',
        state: 'OH',
        zipCode: '43137',
        phone: '561-998-3885',
        email: 'warehouse1@example.com',
        capacity: 10000,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        lookupCode: '23',
        name: 'North East',
        address: '6 Wheeling Road',
        city: 'Dayton',
        state: 'NJ',
        zipCode: '08810',
        phone: '561-998-3885',
        email: 'warehouse1@example.com',
        capacity: 10000,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      }
    ]
  });

  return warehouses;
}