// backend/src/routes/shipToRoutes.ts
import express from 'express';
import { ShipToController } from '../controllers/shipToController';
import { ShipToService } from '../services/shipTo/shipToService';
import { ShipToRepository } from '../repositories/shipToRepository';
import { authenticateToken } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// Initialize dependencies
const shipToRepository = new ShipToRepository(prisma);
const shipToService = new ShipToService(shipToRepository);
const shipToController = new ShipToController(shipToService);

// Protect all routes with authentication
router.use(authenticateToken);

// Routes
router.get('/', shipToController.list);
router.get('/billing', shipToController.getBillingAddresses);
router.post('/', shipToController.create);

export default router;