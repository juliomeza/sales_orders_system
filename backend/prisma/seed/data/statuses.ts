// backend/prisma/seed/data/statuses.ts
import { PrismaClient } from '@prisma/client';

export async function seedStatuses(prisma: PrismaClient) {
  return await prisma.status.createMany({
    data: [
      {
        code: 1,
        name: 'Active',
        description: 'Entity is active and can be used',
        entity: 'all'
      },
      {
        code: 2,
        name: 'Inactive',
        description: 'Entity is inactive and cannot be used',
        entity: 'all'
      },
      {
        code: 10,
        name: 'Draft',
        description: 'Order is in draft state',
        entity: 'order'
      },
      {
        code: 11,
        name: 'Submitted',
        description: 'Order has been submitted',
        entity: 'order'
      },
      {
        code: 12,
        name: 'Processing',
        description: 'Order is being processed',
        entity: 'order'
      },
      {
        code: 13,
        name: 'Completed',
        description: 'Order has been completed',
        entity: 'order'
      }
    ]
  });
}