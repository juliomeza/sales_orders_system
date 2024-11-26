// backend/src/routes/authRoutes.ts
import express from 'express';
import { AuthController } from '../controllers/authController';
import { AuthService } from '../services/auth/authService';
import { UserRepository } from '../repositories/userRepository';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import prisma from '../config/database';

const router = express.Router();

// Inicializar dependencias
const userRepository = new UserRepository(prisma);
const authService = new AuthService(
  userRepository, 
  process.env.JWT_SECRET!
);
const authController = new AuthController(authService);

// Public routes (no authentication required)
router.post('/login', authController.login);

// Protected routes (authentication required)
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/refresh', authenticateToken, authController.refreshToken);

// Admin only routes
router.post('/register', authenticateToken, requireAdmin, authController.register);

export default router;