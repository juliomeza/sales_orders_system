// backend/src/routes/orderRoutes.ts
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { orderListController } from '../controllers/orders/order-list.controller';
import { orderCreateController } from '../controllers/orders/order-create.controller';
import { orderUpdateController } from '../controllers/orders/order-update.controller';
import { orderDeleteController } from '../controllers/orders/order-delete.controller';
import { orderStatsController } from '../controllers/orders/order-stats.controller';
import { ordersController } from '../controllers/orders/order.controller';

const router = express.Router();

const requireClient = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.user?.role !== 'CLIENT') {
    return res.status(403).json({ error: 'Access denied. Client access only.' });
  }
  next();
};

// Protect all routes
router.use(authenticateToken);
router.use(requireClient);

// CRUD routes
router.post('/', orderCreateController.create);
router.get('/', orderListController.list);
router.get('/stats', orderStatsController.getStats);
router.get('/:id', ordersController.getById);
router.put('/:id', orderUpdateController.update);
router.delete('/:id', orderDeleteController.delete);

export default router;