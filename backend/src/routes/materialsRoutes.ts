// backend/src/routes/materialsRoutes.ts
import express from 'express';
import { materialsController } from '../controllers/materialsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes with authentication
router.use(authenticateToken);

// Routes
router.get('/', materialsController.list);
router.get('/search', materialsController.search);
router.get('/uoms', materialsController.getUOMs);
router.get('/:id', materialsController.getById);

export default router;