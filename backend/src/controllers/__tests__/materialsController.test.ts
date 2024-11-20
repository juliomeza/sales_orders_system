// backend/src/controllers/__tests__/materialsController.test.ts
import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../../server';
import { createTestUser, createTestCustomer } from './setup';
import prisma from '../../config/database';

let app: Express;

beforeAll(async () => {
  app = await createServer();
});

describe('MaterialsController', () => {
  let authToken: string;
  let customer: any;
  let project: any;

  beforeEach(async () => {
    // Create test data
    customer = await createTestCustomer();
    const user = await createTestUser('test@example.com', 'CLIENT', customer.id);
    
    project = await prisma.project.create({
      data: {
        lookupCode: 'TEST-PROJECT',
        name: 'Test Project',
        customerId: customer.id,
        status: 1,
        isDefault: true
      }
    });

    // Create test materials
    await prisma.material.createMany({
      data: [
        {
          lookupCode: 'MAT-001',
          code: 'TEST001',
          description: 'Test Material 1',
          uom: 'EA',
          availableQuantity: 100,
          projectId: project.id,
          status: 1
        },
        {
          lookupCode: 'MAT-002',
          code: 'TEST002',
          description: 'Test Material 2',
          uom: 'EA',
          availableQuantity: 50,
          projectId: project.id,
          status: 1
        }
      ]
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

  describe('GET /api/materials', () => {
    it('should list materials for authenticated user', async () => {
      const response = await request(app)
        .get('/api/materials')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.materials).toHaveLength(2);
      expect(response.body.materials[0]).toHaveProperty('code');
      expect(response.body.materials[0]).toHaveProperty('description');
    });

    it('should filter materials by search term', async () => {
      const response = await request(app)
        .get('/api/materials?search=TEST001')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.materials).toHaveLength(1);
      expect(response.body.materials[0].code).toBe('TEST001');
    });
  });

  describe('GET /api/materials/search', () => {
    it('should search materials by query', async () => {
      const response = await request(app)
        .get('/api/materials/search?query=Material 1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.materials).toHaveLength(1);
      expect(response.body.materials[0].description).toContain('Material 1');
    });
  });

  describe('GET /api/materials/:id', () => {
    it('should get material details by id', async () => {
      const material = await prisma.material.findFirst({
        where: { code: 'TEST001' }
      });

      const response = await request(app)
        .get(`/api/materials/${material?.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('code', 'TEST001');
      expect(response.body).toHaveProperty('project');
    });

    it('should return 404 for non-existent material', async () => {
      const response = await request(app)
        .get('/api/materials/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});