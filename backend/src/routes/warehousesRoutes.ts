// backend/src/routes/warehousesRoutes.ts
import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import { warehouseController } from '../controllers/warehouseController';

const router = express.Router();

// Protect all routes with authentication
router.use(authenticateToken);

// Public routes (authenticated users)
router.get('/', warehouseController.list);
router.get('/stats', warehouseController.getStats);
router.get('/:id', warehouseController.getById);

// Admin only routes
router.post('/', requireAdmin, warehouseController.create);
router.put('/:id', requireAdmin, warehouseController.update);
router.delete('/:id', requireAdmin, warehouseController.delete);

export default router;