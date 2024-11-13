import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  // Create status records
  const statuses = await prisma.status.createMany({
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

  // Create admin user first (we'll need their ID for audit fields)
  const hashedAdminPassword = await bcrypt.hash('Password123!', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      lookupCode: 'ADMIN',
      password: hashedAdminPassword,
      role: 'ADMIN',
      status: 1
    }
  });

  // Create test customer
  const customer = await prisma.customer.create({
    data: {
      lookupCode: 'ACME',
      name: 'Acme Corporation',
      address: '123 Business Ave',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      phone: '312-555-0100',
      email: 'contact@acme.example.com',
      status: 1,
      created_by: adminUser.id,
      modified_by: adminUser.id
    },
  });

  // Create client user
  const hashedClientPassword = await bcrypt.hash('Client123!', 10);
  const clientUser = await prisma.user.create({
    data: {
      email: 'client@example.com',
      lookupCode: 'CLIENT1',
      password: hashedClientPassword,
      role: 'CLIENT',
      customerId: customer.id,
      status: 1,
      created_by: adminUser.id,
      modified_by: adminUser.id
    },
  });

  // Create order types
  const orderTypes = await prisma.orderType.createMany({
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

  // Create test accounts (shipping/billing locations) for customer
  const accounts = await prisma.account.createMany({
    data: [
      {
        lookupCode: 'ACME-HQ',
        name: 'Acme Headquarters',
        address: '123 Business Ave',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        phone: '312-555-0100',
        email: 'hq@acme.example.com',
        contactName: 'John Doe',
        customerId: customer.id,
        accountType: 'BOTH',
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        lookupCode: 'ACME-RETAIL1',
        name: 'Acme Retail Store - Downtown',
        address: '456 Shopping St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60602',
        phone: '312-555-0101',
        email: 'downtown@acme.example.com',
        contactName: 'Jane Smith',
        customerId: customer.id,
        accountType: 'SHIP_TO',
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        lookupCode: 'ACME-RETAIL2',
        name: 'Acme Retail Store - North',
        address: '789 North Ave',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60614',
        phone: '312-555-0102',
        email: 'north@acme.example.com',
        contactName: 'Bob Wilson',
        customerId: customer.id,
        accountType: 'SHIP_TO',
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        lookupCode: 'ACME-FINANCE',
        name: 'Acme Financial Office',
        address: '321 Finance Rd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60603',
        phone: '312-555-0103',
        email: 'accounting@acme.example.com',
        contactName: 'Mary Johnson',
        customerId: customer.id,
        accountType: 'BILL_TO',
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      }
    ]
  });

  // Create test carrier
  const carrier = await prisma.carrier.create({
    data: {
      lookupCode: 'FSTSHP',
      name: 'FastShip Express',
      status: 1,
      created_by: adminUser.id,
      modified_by: adminUser.id
    }
  });

  // Create carrier services
  const services = await prisma.carrierService.createMany({
    data: [
      {
        lookupCode: 'FSTSHP-STD',
        name: 'Standard',
        description: '3-5 business days',
        carrierId: carrier.id,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        lookupCode: 'FSTSHP-EXP',
        name: 'Express',
        description: '1-2 business days',
        carrierId: carrier.id,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        lookupCode: 'FSTSHP-PRO',
        name: 'Priority',
        description: 'Next business day',
        carrierId: carrier.id,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      }
    ]
  });

  // Create test warehouses
  const warehouses = await prisma.warehouse.createMany({
    data: [
      {
        lookupCode: 'WH001',
        name: 'Main Distribution Center',
        address: '789 Warehouse Blvd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60602',
        phone: '312-555-0123',
        email: 'warehouse1@example.com',
        capacity: 10000,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        lookupCode: 'WH002',
        name: 'West Coast Facility',
        address: '456 Dock Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        phone: '213-555-0456',
        email: 'warehouse2@example.com',
        capacity: 8000,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      }
    ]
  });

  // Create warehouse assignments for customer
  const warehouseAssignments = await prisma.customerWarehouse.createMany({
    data: [
      {
        customerId: customer.id,
        warehouseId: 1, // First warehouse
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        customerId: customer.id,
        warehouseId: 2, // Second warehouse
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      }
    ]
  });

  // Create default project for customer
  const defaultProject = await prisma.project.create({
    data: {
      lookupCode: 'ACME-DEF',
      name: 'Default Project',
      description: 'Default project for Acme Corporation',
      customerId: customer.id,
      isDefault: true,
      status: 1,
      created_by: adminUser.id,
      modified_by: adminUser.id
    }
  });

  // Create additional test project
  const secondProject = await prisma.project.create({
    data: {
      lookupCode: 'ACME-PRJ2',
      name: 'Secondary Project',
      description: 'Secondary project for Acme Corporation',
      customerId: customer.id,
      isDefault: false,
      status: 1,
      created_by: adminUser.id,
      modified_by: adminUser.id
    }
  });

  // Create test materials
  const materials = await prisma.material.createMany({
    data: [
      {
        lookupCode: 'BOX-S',
        code: 'MAT001',
        description: 'Standard Box - Small',
        uom: 'EA',
        availableQuantity: 100,
        projectId: defaultProject.id,
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
        projectId: defaultProject.id,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
      {
        lookupCode: 'BOX-L',
        code: 'MAT003',
        description: 'Standard Box - Large',
        uom: 'EA',
        availableQuantity: 50,
        projectId: defaultProject.id,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
    ],
  });

  console.log({
    statuses,
    adminUser,
    clientUser,
    customer,
    orderTypes,
    accounts,
    carrier,
    services,
    warehouses,
    warehouseAssignments,
    defaultProject,
    secondProject,
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