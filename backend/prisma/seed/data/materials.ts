// backend/prisma/seed/data/materials.ts
import { PrismaClient } from '@prisma/client';
import { User } from '../index';

interface Projects {
  defaultProject: {
    id: number;
  };
  secondProject: {
    id: number;
  };
}

export async function seedMaterials(prisma: PrismaClient, adminUser: User, projects: Projects) {
  return await prisma.material.createMany({
    data: [
      // Materials for Customer 1 (Coronado)
      {
        lookupCode: 'BOX-S',
        code: 'MAT001',
        description: 'Standard Box - Small',
        uom: 'EA',
        availableQuantity: 100,
        projectId: projects.defaultProject.id,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        lookupCode: 'BOX-M',
        code: 'MAT002',
        description: 'Standard Box - Medium',
        uom: 'EA',
        availableQuantity: 75,
        projectId: projects.defaultProject.id,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      // Materials for Customer 2 (TriMed)
      {
        lookupCode: 'TRAY-S',
        code: 'MAT003',
        description: 'Medical Tray - Small',
        uom: 'EA',
        availableQuantity: 150,
        projectId: projects.secondProject.id,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        lookupCode: 'TRAY-L',
        code: 'MAT004',
        description: 'Medical Tray - Large',
        uom: 'EA',
        availableQuantity: 100,
        projectId: projects.secondProject.id,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
    ],
  });
}