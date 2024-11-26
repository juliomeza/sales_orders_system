// backend/src/routes/customersRoutes.ts
import express from 'express';
import { CustomersController } from '../controllers/customersController';
import { CustomerService } from '../services/customers/customerService';
import { CustomerRepository } from '../repositories/customerRepository';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import prisma from '../config/database';

const router = express.Router();

// Inicializar dependencias
const customerRepository = new CustomerRepository(prisma);
const customerService = new CustomerService(customerRepository);
const customersController = new CustomersController(customerService);

// All routes require authentication and admin access
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', customersController.list);
router.post('/', customersController.create);
router.get('/:id', customersController.getById);
router.put('/:id', customersController.update);
router.delete('/:id', customersController.delete);

export default router;