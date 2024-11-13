// backend/src/routes/shipToRoutes.ts
import express from 'express';
import { shipToController } from '../controllers/shipToController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes with authentication
router.use(authenticateToken);

// Routes
router.get('/', shipToController.list);
router.get('/billing', shipToController.getBillingAddresses);
router.post('/', shipToController.create);

export default router;