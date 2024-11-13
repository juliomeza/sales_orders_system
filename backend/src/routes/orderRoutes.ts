// backend/src/routes/orderRoutes.ts
import express from 'express';
import { ordersController } from '../controllers/ordersController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Middleware para verificar que sea un cliente
const requireClient = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('🔒 Checking client access. User role:', req.user?.role);
  
  if (req.user?.role !== 'CLIENT') {
    console.log('⛔ Access denied. User is not a client');
    return res.status(403).json({ error: 'Access denied. Client access only.' });
  }
  
  console.log('✅ Client access granted');
  next();
};

// Protect all routes with authentication and client role
router.use(authenticateToken);
router.use(requireClient);

// CRUD routes
router.post('/', ordersController.create);
router.get('/', ordersController.list);
router.get('/:id', ordersController.getById);
router.put('/:id', ordersController.update);
router.delete('/:id', ordersController.delete);

export default router;