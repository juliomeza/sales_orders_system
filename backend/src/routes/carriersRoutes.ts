// backend/src/routes/carriersRoutes.ts
import { Router } from 'express';
import prisma from '../config/database';
import { CarrierRepository } from '../repositories/carrierRepository';
import { CarrierServiceImpl } from '../services/carriers/carrierService';
import { CarriersController } from '../controllers/carriersController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const carrierRepository = new CarrierRepository(prisma);
const carrierService = new CarrierServiceImpl(carrierRepository);
const carriersController = new CarriersController(carrierService);

router.get('/', authenticateToken, carriersController.getCarriers);
router.get('/:id', authenticateToken, carriersController.getCarrierById);
router.post('/', authenticateToken, carriersController.createCarrier);
router.put('/:id', authenticateToken, carriersController.updateCarrier);
router.get('/:id/services', authenticateToken, carriersController.getCarrierServices);

export default router;