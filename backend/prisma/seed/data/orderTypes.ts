// backend/prisma/seed/data/orderTypes.ts
import { PrismaClient } from '@prisma/client';
import { User } from '../index';

export async function seedOrderTypes(prisma: PrismaClient, adminUser: User) {
  return await prisma.orderType.createMany({
    data: [
      {
        lookupCode: 'OUTBOUND',
        name: 'Outbound Order',
        description: 'Order for shipping products out',
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        lookupCode: 'INBOUND',
        name: 'Inbound Order',
        description: 'Order for receiving products',
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      }
    ]
  });
}