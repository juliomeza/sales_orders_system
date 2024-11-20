// backend/src/controllers/__tests__/authController.test.ts
import request from 'supertest';
import { Express } from 'express';
import { createServer } from '../../server';
import { createTestUser, createTestCustomer } from './setup';
import prisma from '../../config/database';

let app: Express;

beforeAll(async () => {
  app = await createServer();
});

describe('AuthController', () => {
  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      await createTestUser();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user data', async () => {
      const user = await createTestUser();
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', user.id);
      expect(response.body).toHaveProperty('email', user.email);
    });

    it('should reject unauthorized requests', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should allow admin to create new users', async () => {
      const admin = await createTestUser('admin@example.com', 'ADMIN');
      const customer = await createTestCustomer();
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123'
        });

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .send({
          email: 'newuser@example.com',
          password: 'newpassword123',
          role: 'CLIENT',
          customerId: customer.id
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('email', 'newuser@example.com');
    });

    it('should prevent non-admin users from creating users', async () => {
      const user = await createTestUser();
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .send({
          email: 'another@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(403);
    });
  });
});