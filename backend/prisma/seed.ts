/// <reference types="node" />
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
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        lookupCode: 'Coronado',
        name: 'Coronado Aesthetics, LLC',
        address: '14841 Dallas Parkway',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75254',
        phone: '999-999-9999',
        email: 'coronado@example.com',
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
    }),
    prisma.customer.create({
      data: {
        lookupCode: 'TriMed',
        name: 'Tri-Med Distributors Pty Ltd.',
        address: '1999 Harrison Street',
        city: 'Oakland',
        state: 'CA',
        zipCode: '94612',
        phone: '555-555-5555',
        email: 'contact@trimed.com',
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
    })
  ]);

  // Create client user
  const hashedClientPassword = await bcrypt.hash('Client123!', 10);
  const clientUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'client1@example.com',
        lookupCode: 'CLIENT1',
        password: hashedClientPassword,
        role: 'CLIENT',
        customerId: customers[0].id,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
    }),
    prisma.user.create({
      data: {
        email: 'client2@example.com',
        lookupCode: 'CLIENT2',
        password: hashedClientPassword,
        role: 'CLIENT',
        customerId: customers[1].id,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
    })
  ]);

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
        customerId: customers[0].id,
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
        customerId: customers[0].id,
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
        customerId: customers[1].id,
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
        customerId: customers[1].id,
        accountType: 'BILL_TO',
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      }
    ]
  });

  // Create carriers
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

  // Create carrier services for both carriers
  const services = await Promise.all([
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

  // Create test warehouses
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

  // Create warehouse assignments for customer
  const warehouseAssignments = await prisma.customerWarehouse.createMany({
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

  // Create default project for customer
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

  // Create additional test project
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

  // Create test materials
  const materials = await prisma.material.createMany({
    data: [
      // Materials for Customer 1 (Coronado)
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
      // Materials for Customer 2 (TriMed)
      {
        lookupCode: 'TRAY-S',
        code: 'MAT003',
        description: 'Medical Tray - Small',
        uom: 'EA',
        availableQuantity: 150,
        projectId: secondProject.id,
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
        projectId: secondProject.id,
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      },
    ],
  });

  console.log({
    statuses,
    adminUser,
    clientUsers,
    customers,
    orderTypes,
    accounts,
    carriers,
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