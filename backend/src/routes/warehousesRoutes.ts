// backend/src/routes/warehousesRoutes.ts
import express from 'express';
import { warehousesController } from '../controllers/warehouses/warehouse.controller';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes with authentication
router.use(authenticateToken);

// Public routes (authenticated users)
router.get('/', warehousesController.list);
router.get('/stats', warehousesController.getStats);
router.get('/:id', warehousesController.getById);

// Admin only routes
router.post('/', requireAdmin, warehousesController.create);
router.put('/:id', requireAdmin, warehousesController.update);
router.delete('/:id', requireAdmin, warehousesController.delete);

export default router;