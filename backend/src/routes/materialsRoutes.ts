// backend/src/routes/materialsRoutes.ts
import express from 'express';
import { MaterialsController } from '../controllers/materialsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const materialsController = new MaterialsController();

// Protect all routes with authentication
router.use(authenticateToken);

// Routes
router.get('/', materialsController.list.bind(materialsController));
router.get('/search', materialsController.search.bind(materialsController));
router.get('/uoms', materialsController.getUoms.bind(materialsController));
router.get('/:id', materialsController.getById.bind(materialsController));

export default router;
