// backend/src/routes/materialsRoutes.ts
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import prisma from '../config/database';
import { materialListController } from '../controllers/materials/material-list.controller';
import { materialSearchController } from '../controllers/materials/material-search.controller';
import { materialDetailController } from '../controllers/materials/material-detail.controller';

const router = express.Router();

// Protect all routes with authentication
router.use(authenticateToken);

// Routes
router.get('/', materialListController.list);
router.get('/search', materialSearchController.search);
router.get('/uoms', async (_req, res) => {
  try {
    const uoms = await prisma.material.findMany({
      select: { uom: true },
      distinct: ['uom']
    });
    res.json(uoms.map((u: { uom: string }) => u.uom));
  } catch (error) {
    console.error('Get UOMs error:', error);
    res.status(500).json({ error: 'Error retrieving UOMs' });
  }
});
router.get('/:id', materialDetailController.getById);

export default router;