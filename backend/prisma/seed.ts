// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test customer
  const customer = await prisma.customer.create({
    data: {
      name: 'Acme Corporation',
      address: '123 Business Ave',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
    },
  });

  // Create test user
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      customerId: customer.id,
    },
  });

  // Create test carrier
  const carrier = await prisma.carrier.create({
    data: {
      name: 'FastShip Express',
      services: ['Standard', 'Express', 'Priority'],
    },
  });

  // Create test materials
  const materials = await prisma.material.createMany({
    data: [
      {
        code: 'MAT001',
        description: 'Standard Box - Small',
        uom: 'EA',
        availableQuantity: 100,
      },
      {
        code: 'MAT002',
        description: 'Standard Box - Medium',
        uom: 'EA',
        availableQuantity: 75,
      },
      {
        code: 'MAT003',
        description: 'Standard Box - Large',
        uom: 'EA',
        availableQuantity: 50,
      },
    ],
  });

  console.log({
    customer,
    carrier,
    materials,
    message: 'Seed data created successfully',
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });