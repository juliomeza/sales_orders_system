// backend/src/routes/warehousesRoutes.ts
import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

import { warehousesController } from '../controllers/warehouses/warehouse.controller';
import { warehouseListController } from '../controllers/warehouses/warehouse-list.controller';
import { warehouseCreateController } from '../controllers/warehouses/warehouse-create.controller';
import { warehouseUpdateController } from '../controllers/warehouses/warehouse-update.controller';
import { warehouseDeleteController } from '../controllers/warehouses/warehouse-delete.controller';
import { warehouseStatsController } from '../controllers/warehouses/warehouse-stats.controller';

const router = express.Router();

// Protect all routes with authentication
router.use(authenticateToken);

// Public routes (authenticated users)
router.get('/', warehouseListController.list);
router.get('/stats', warehouseStatsController.getStats);
router.get('/:id', warehousesController.getById);

// Admin only routes
router.post('/', requireAdmin, warehouseCreateController.create);
router.put('/:id', requireAdmin, warehouseUpdateController.update);
router.delete('/:id', requireAdmin, warehouseDeleteController.delete);

export default router;