// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { Prisma } from '@prisma/client';

export const authController = {
  // Login user
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await prisma.user.findUnique({ 
        where: { email },
        include: {
          customer: true
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Register new user (admin only)
  register: async (req: Request, res: Response) => {
    try {
      const { email, password, role, customerId } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const lookupCode = email.split('@')[0].toUpperCase();
      const hashedPassword = await bcrypt.hash(password, 10);

      const userData: Prisma.UserCreateInput = {
        email,
        lookupCode,
        password: hashedPassword,
        role: role || 'CLIENT',
        status: 1,
        customer: customerId ? {
          connect: { id: customerId }
        } : undefined,
        creator: req.user?.userId ? {
          connect: { id: req.user.userId }
        } : undefined,
        modifier: req.user?.userId ? {
          connect: { id: req.user.userId }
        } : undefined
      };

      const user = await prisma.user.create({
        data: userData,
        include: {
          customer: true
        }
      });

      // Remove sensitive data before sending response
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Refresh token
  refreshToken: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          customer: true
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      const token = generateToken(user);
      res.json({ token });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get current user info
  getCurrentUser: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          customer: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};