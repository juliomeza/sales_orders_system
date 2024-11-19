// backend/prisma/seed/data/carriers.ts
import { PrismaClient } from '@prisma/client';
import { User } from '../index';

export async function seedCarriers(prisma: PrismaClient, adminUser: User) {
  const carriers = await Promise.all([
    prisma.carrier.create({
      data: {
        lookupCode: 'UPS',
        name: 'United Parcel Service',
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      }
    }),
    prisma.carrier.create({
      data: {
        lookupCode: 'FEDEX',
        name: 'Federal Express',
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      }
    })
  ]);

  // Create carrier services
  await Promise.all([
    // UPS Services
    prisma.carrierService.createMany({
      data: [
        {
          lookupCode: 'UPS-GND',
          name: 'Ground',
          description: '3-5 business days',
          carrierId: carriers[0].id,
          status: 1,
          created_by: adminUser.id,
          modified_by: adminUser.id
        },
        {
          lookupCode: 'UPS-3DS',
          name: '3 Day Select',
          description: '3 business days',
          carrierId: carriers[0].id,
          status: 1,
          created_by: adminUser.id,
          modified_by: adminUser.id
        },
        {
          lookupCode: 'UPS-2DA',
          name: '2nd Day Air',
          description: '2 business days',
          carrierId: carriers[0].id,
          status: 1,
          created_by: adminUser.id,
          modified_by: adminUser.id
        }
      ]
    }),
    // FedEx Services
    prisma.carrierService.createMany({
      data: [
        {
          lookupCode: 'FEDEX-GND',
          name: 'Ground',
          description: '1-5 business days',
          carrierId: carriers[1].id,
          status: 1,
          created_by: adminUser.id,
          modified_by: adminUser.id
        },
        {
          lookupCode: 'FEDEX-2DA',
          name: '2Day',
          description: '2 business days',
          carrierId: carriers[1].id,
          status: 1,
          created_by: adminUser.id,
          modified_by: adminUser.id
        },
        {
          lookupCode: 'FEDEX-PRI',
          name: 'Priority Overnight',
          description: 'Next business day morning',
          carrierId: carriers[1].id,
          status: 1,
          created_by: adminUser.id,
          modified_by: adminUser.id
        }
      ]
    })
  ]);

  return carriers;
}