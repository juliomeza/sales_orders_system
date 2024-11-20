// backend/src/controllers/__tests__/orderController.test.ts
import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../../server';
import { createTestUser, createTestCustomer } from './setup';
import prisma from '../../config/database';

let app: Express;

beforeAll(async () => {
  app = await createServer();
});

describe('OrderController', () => {
  let authToken: string;
  let customer: any;
  let project: any;
  let material: any;
  let warehouse: any;
  let carrier: any;
  let carrierService: any;
  let account: any;

  beforeEach(async () => {
    // Create test data
    customer = await createTestCustomer();
    const user = await createTestUser('test@example.com', 'CLIENT', customer.id);
    
    // Create test project
    project = await prisma.project.create({
      data: {
        lookupCode: 'TEST-PROJECT',
        name: 'Test Project',
        customerId: customer.id,
        status: 1,
        isDefault: true
      }
    });

    // Create test material
    material = await prisma.material.create({
      data: {
        lookupCode: 'MAT-001',
        code: 'TEST001',
        description: 'Test Material',
        uom: 'EA',
        availableQuantity: 100,
        projectId: project.id,
        status: 1
      }
    });

    // Create test warehouse
    warehouse = await prisma.warehouse.create({
      data: {
        lookupCode: 'WH-TEST',
        name: 'Test Warehouse',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        capacity: 1000,
        status: 1
      }
    });

    // Create test carrier and service
    carrier = await prisma.carrier.create({
      data: {
        lookupCode: 'TEST-CARRIER',
        name: 'Test Carrier',
        status: 1
      }
    });

    carrierService = await prisma.carrierService.create({
      data: {
        lookupCode: 'TEST-SERVICE',
        name: 'Test Service',
        description: 'Test Service Description',
        carrierId: carrier.id,
        status: 1
      }
    });

    // Create test account
    account = await prisma.account.create({
      data: {
        lookupCode: 'TEST-ACCOUNT',
        name: 'Test Account',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        customerId: customer.id,
        accountType: 'BOTH',
        status: 1
      }
    });

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.token;
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const orderData = {
        orderTypeId: 1,
        customerId: customer.id,
        shipToAccountId: account.id,
        billToAccountId: account.id,
        carrierId: carrier.id,
        carrierServiceId: carrierService.id,
        warehouseId: warehouse.id,
        expectedDeliveryDate: new Date().toISOString(),
        items: [
          {
            materialId: material.id,
            quantity: 5
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('orderNumber');
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].quantity).toBe(5);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/orders', () => {
    beforeEach(async () => {
      // Create test orders
      await prisma.order.createMany({
        data: [
          {
            orderNumber: 'TEST001',
            lookupCode: 'TEST001',
            status: 10,
            orderTypeId: 1,
            customerId: customer.id,
            shipToAccountId: account.id,
            billToAccountId: account.id,
            carrierId: carrier.id,
            carrierServiceId: carrierService.id,
            warehouseId: warehouse.id,
            expectedDeliveryDate: new Date()
          },
          {
            orderNumber: 'TEST002',
            lookupCode: 'TEST002',
            status: 11,
            orderTypeId: 1,
            customerId: customer.id,
            shipToAccountId: account.id,
            billToAccountId: account.id,
            carrierId: carrier.id,
            carrierServiceId: carrierService.id,
            warehouseId: warehouse.id,
            expectedDeliveryDate: new Date()
          }
        ]
      });
    });

    it('should list orders for customer', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.orders).toHaveLength(2);
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/orders?status=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.orders).toHaveLength(1);
      expect(response.body.orders[0].status).toBe(10);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get order details by id', async () => {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'TEST003',
          lookupCode: 'TEST003',
          status: 10,
          orderTypeId: 1,
          customerId: customer.id,
          shipToAccountId: account.id,
          billToAccountId: account.id,
          carrierId: carrier.id,
          carrierServiceId: carrierService.id,
          warehouseId: warehouse.id,
          expectedDeliveryDate: new Date()
        }
      });

      const response = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', order.id);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('should update order details', async () => {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'TEST004',
          lookupCode: 'TEST004',
          status: 10,
          orderTypeId: 1,
          customerId: customer.id,
          shipToAccountId: account.id,
          billToAccountId: account.id,
          carrierId: carrier.id,
          carrierServiceId: carrierService.id,
          warehouseId: warehouse.id,
          expectedDeliveryDate: new Date()
        }
      });

      const response = await request(app)
        .put(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          expectedDeliveryDate: new Date().toISOString(),
          items: [
            {
              materialId: material.id,
              quantity: 10
            }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].quantity).toBe(10);
    });

    it('should only update draft orders', async () => {
      const order = await prisma.order.create({
        data: {
          orderNumber: 'TEST005',
          lookupCode: 'TEST005',
          status: 11, // Submitted status
          orderTypeId: 1,
          customerId: customer.id,
          shipToAccountId: account.id,
          billToAccountId: account.id,
          carrierId: carrier.id,
          carrierServiceId: carrierService.id,
          warehouseId: warehouse.id,
          expectedDeliveryDate: new Date()
        }
      });

      const response = await request(app)
        .put(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          expectedDeliveryDate: new Date().toISOString()
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('draft');
    });
  });
});