// backend/prisma/seed/data/accounts.ts
import { PrismaClient } from '@prisma/client';
import { User, Customer } from '../index';

export async function seedAccounts(prisma: PrismaClient, adminUser: User, { customers }: { customers: Customer[] }) {
  return await prisma.account.createMany({
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
        accountType: 'SHIP_TO',
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
        accountType: 'SHIP_TO',
        status: 1,
        created_by: adminUser.id,
        modified_by: adminUser.id
      }
    ]
  });
}