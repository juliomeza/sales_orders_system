// backend/src/routes/carriersRoutes.ts
import express from 'express';
import { carriersController } from '../controllers/carriersController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes with authentication
router.use(authenticateToken);

// Routes
router.get('/', carriersController.list);
router.get('/:id/services', carriersController.getServices);

export default router;