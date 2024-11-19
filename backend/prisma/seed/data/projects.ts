// backend/prisma/seed/data/projects.ts
import { PrismaClient } from '@prisma/client';
import { User, Customer } from '../index';

export async function seedProjects(prisma: PrismaClient, adminUser: User, { customers }: { customers: Customer[] }) {
  const defaultProject = await prisma.project.create({
    data: {
      lookupCode: 'Project1',
      name: 'Default Project',
      description: 'Default project for Acme Corporation',
      customerId: customers[0].id,
      isDefault: true,
      status: 1,
      created_by: adminUser.id,
      modified_by: adminUser.id
    }
  });

  const secondProject = await prisma.project.create({
    data: {
      lookupCode: 'Project2',
      name: 'Secondary Project',
      description: 'Secondary project for Acme Corporation',
      customerId: customers[1].id,
      isDefault: false,
      status: 1,
      created_by: adminUser.id,
      modified_by: adminUser.id
    }
  });

  return { defaultProject, secondProject };
}