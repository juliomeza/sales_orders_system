// backend/src/controllers/__tests__/carriersController.test.ts
import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../../server';
import { createTestUser } from './setup';
import prisma from '../../config/database';

let app: Express;

beforeAll(async () => {
  app = await createServer();
});

describe('CarriersController', () => {
  let authToken: string;

  beforeEach(async () => {
    // Create test user and get auth token
    await createTestUser();
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.token;

    // Create test carriers and services
    const carrier1 = await prisma.carrier.create({
      data: {
        lookupCode: 'TEST-CARRIER-1',
        name: 'Test Carrier 1',
        status: 1,
        services: {
          create: [
            {
              lookupCode: 'SVC-1',
              name: 'Service 1',
              description: 'Test Service 1',
              status: 1
            },
            {
              lookupCode: 'SVC-2',
              name: 'Service 2',
              description: 'Test Service 2',
              status: 1
            }
          ]
        }
      }
    });

    await prisma.carrier.create({
      data: {
        lookupCode: 'TEST-CARRIER-2',
        name: 'Test Carrier 2',
        status: 1,
        services: {
          create: [
            {
              lookupCode: 'SVC-3',
              name: 'Service 3',
              description: 'Test Service 3',
              status: 1
            }
          ]
        }
      }
    });
  });

  describe('GET /api/carriers', () => {
    it('should list all active carriers with services', async () => {
      const response = await request(app)
        .get('/api/carriers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.carriers).toHaveLength(2);
      expect(response.body.carriers[0]).toHaveProperty('services');
      expect(response.body.carriers[0].services).toBeInstanceOf(Array);
    });

    it('should only include active carriers', async () => {
      // Create an inactive carrier
      await prisma.carrier.create({
        data: {
          lookupCode: 'INACTIVE',
          name: 'Inactive Carrier',
          status: 2
        }
      });

      const response = await request(app)
        .get('/api/carriers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.carriers).toHaveLength(2);
      expect(response.body.carriers.every((c: any) => c.status === 1)).toBe(true);
    });
  });

  describe('GET /api/carriers/:id/services', () => {
    it('should get carrier services by id', async () => {
      const carrier = await prisma.carrier.findFirst({
        where: { lookupCode: 'TEST-CARRIER-1' }
      });

      const response = await request(app)
        .get(`/api/carriers/${carrier?.id}/services`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveLength(2);
    });

    it('should return 404 for non-existent carrier', async () => {
      const response = await request(app)
        .get('/api/carriers/99999/services')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should only include active services', async () => {
      const carrier = await prisma.carrier.findFirst({
        where: { lookupCode: 'TEST-CARRIER-1' }
      });

      // Create an inactive service
      await prisma.carrierService.create({
        data: {
          lookupCode: 'INACTIVE-SVC',
          name: 'Inactive Service',
          status: 2,
          carrierId: carrier!.id
        }
      });

      const response = await request(app)
        .get(`/api/carriers/${carrier?.id}/services`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.services.every((s: any) => s.status === 1)).toBe(true);
    });
  });
});