// backend/src/routes/customersRoutes.ts
import express from 'express';
import { customersController } from '../controllers/customersController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication and admin access
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', customersController.list);
router.post('/', customersController.create);
router.get('/:id', customersController.getById);
router.put('/:id', customersController.update);
router.delete('/:id', customersController.delete);

export default router;