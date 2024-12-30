// backend/src/routes/carriersRoutes.ts
import { Router } from 'express';
import prisma from '../config/database';
import { CarrierRepository } from '../repositories/carrierRepository';
import { CarrierServiceImpl } from '../services/carrierService';
import { CarriersController } from '../controllers/carriersController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Inicialización de dependencias
const carrierRepository = new CarrierRepository(prisma);
const carrierService = new CarrierServiceImpl(carrierRepository);
const carriersController = new CarriersController(carrierService);

// Única ruta para obtener lista de transportistas
router.get('/', authenticateToken, carriersController.getCarriers);

export default router;