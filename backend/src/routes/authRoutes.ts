import express from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', authController.login);

// Protected routes (authentication required)
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/refresh', authenticateToken, authController.refreshToken);

// Admin only routes
router.post('/register', authenticateToken, requireAdmin, authController.register);

export default router;