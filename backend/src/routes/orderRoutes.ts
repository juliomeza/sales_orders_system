// backend/src/routes/orderRoutes.ts
import express from 'express';
import { ordersController } from '../controllers/ordersController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Middleware para verificar que el usuario es un cliente
const requireClient = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.user?.role !== 'CLIENT') {
    return res.status(403).json({ error: 'Access denied. Client access only.' });
  }
  next();
};

// Proteger todas las rutas
router.use(authenticateToken);
router.use(requireClient);

// Rutas CRUD
router.post('/', ordersController.create);
router.get('/', ordersController.list);
router.get('/stats', ordersController.getStats);
router.get('/:id', ordersController.getById);
router.put('/:id', ordersController.update);
router.delete('/:id', ordersController.delete);

export default router;