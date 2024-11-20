import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Use test database URL
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.JWT_SECRET = 'test-secret';

const prisma = new PrismaClient();

// Base seed data
const seedBaseData = async () => {
  try {
    // Limpiar datos existentes
    await prisma.$transaction([
      prisma.status.deleteMany({}),
      prisma.orderType.deleteMany({})
    ]);

    // Create statuses
    await prisma.status.createMany({
      data: [
        { code: 1, name: 'Active', description: 'Entity is active and can be used', entity: 'all' },
        { code: 2, name: 'Inactive', description: 'Entity is inactive and cannot be used', entity: 'all' },
        { code: 10, name: 'Draft', description: 'Order is in draft state', entity: 'order' },
        { code: 11, name: 'Submitted', description: 'Order has been submitted', entity: 'order' },
        { code: 12, name: 'Processing', description: 'Order is being processed', entity: 'order' },
        { code: 13, name: 'Completed', description: 'Order has been completed', entity: 'order' }
      ]
    });

    // Create order types
    await prisma.orderType.createMany({
      data: [
        {
          lookupCode: 'OUTBOUND',
          name: 'Outbound Order',
          description: 'Order for shipping products out',
          status: 1
        },
        {
          lookupCode: 'INBOUND',
          name: 'Inbound Order',
          description: 'Order for receiving products',
          status: 1
        }
      ]
    });
  } catch (error) {
    console.error('Error seeding base data:', error);
    throw error;
  }
};

beforeAll(async () => {
  await prisma.$connect();
  await seedBaseData();
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Clean up test data in correct order to avoid FK constraint issues
  try {
    await prisma.$transaction([
      prisma.$executeRawUnsafe('TRUNCATE TABLE "order_items" CASCADE;'),
      prisma.$executeRawUnsafe('TRUNCATE TABLE "orders" CASCADE;'),
      prisma.$executeRawUnsafe('TRUNCATE TABLE "materials" CASCADE;'),
      prisma.$executeRawUnsafe('TRUNCATE TABLE "projects" CASCADE;'),
      prisma.$executeRawUnsafe('TRUNCATE TABLE "customer_warehouses" CASCADE;'),
      prisma.$executeRawUnsafe('TRUNCATE TABLE "accounts" CASCADE;'),
      prisma.$executeRawUnsafe('TRUNCATE TABLE "carrier_services" CASCADE;'),
      prisma.$executeRawUnsafe('TRUNCATE TABLE "carriers" CASCADE;'),
      prisma.$executeRawUnsafe('TRUNCATE TABLE "users" CASCADE;'),
      prisma.$executeRawUnsafe('TRUNCATE TABLE "customers" CASCADE;'),
      prisma.$executeRawUnsafe('TRUNCATE TABLE "warehouses" CASCADE;')
    ]);
  } catch (error) {
    console.error('Error cleaning up test data:', error);
    throw error;
  }
});

// Helper to create test users
export const createTestUser = async (
  email: string = 'test@example.com', 
  role: 'ADMIN' | 'CLIENT' = 'CLIENT',
  customerId?: number
) => {
  const timestamp = Date.now();
  const hashedPassword = await bcrypt.hash('password123', 10);
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      lookupCode: `TEST_USER_${timestamp}`,
      role,
      status: 1,
      ...(customerId && { customerId })
    }
  });
};

// Helper to create test customer
export const createTestCustomer = async () => {
  const timestamp = Date.now();
  return prisma.customer.create({
    data: {
      lookupCode: `TEST_CUST_${timestamp}`,
      name: 'Test Customer',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      status: 1
    }
  });
};

// Helper to create carrier
export const createTestCarrier = async () => {
  const timestamp = Date.now();
  return prisma.carrier.create({
    data: {
      lookupCode: `TEST_CARR_${timestamp}`,
      name: 'Test Carrier',
      status: 1
    }
  });
};

// Helper to create warehouse
export const createTestWarehouse = async () => {
  const timestamp = Date.now();
  return prisma.warehouse.create({
    data: {
      lookupCode: `TEST_WH_${timestamp}`,
      name: 'Test Warehouse',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      capacity: 1000,
      status: 1
    }
  });
};

// Helper to create project
export const createTestProject = async (customerId: number) => {
  const timestamp = Date.now();
  return prisma.project.create({
    data: {
      lookupCode: `TEST_PROJ_${timestamp}`,
      name: 'Test Project',
      customerId,
      isDefault: true,
      status: 1
    }
  });
};

// Helper to create account
export const createTestAccount = async (
  customerId: number,
  accountType: 'SHIP_TO' | 'BILL_TO' | 'BOTH' = 'BOTH'
) => {
  const timestamp = Date.now();
  return prisma.account.create({
    data: {
      lookupCode: `TEST_ACC_${timestamp}`,
      name: 'Test Account',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      customerId,
      accountType,
      status: 1
    }
  });
};

export default prisma;