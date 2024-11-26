// backend/src/controllers/materialsController.ts
import { Request, Response } from 'express';
import { MaterialService } from '../services/materials/materialService';
import { MaterialRepository } from '../repositories/materialRepository';
import prisma from '../config/database';

export class MaterialsController {
  private materialService: MaterialService;

  constructor(materialService?: MaterialService) {
    this.materialService = materialService || new MaterialService(
      new MaterialRepository(prisma)
    );

    // Bind de los métodos para mantener el contexto
    this.list = this.list.bind(this);
    this.search = this.search.bind(this);
    this.getById = this.getById.bind(this);
    this.getUoms = this.getUoms.bind(this);
  }

  async list(req: Request, res: Response) {
    const { 
      search = '', 
      uom,
      status,
      page = '1', 
      limit = '20',
      projectId 
    } = req.query;

    const customerId = req.user?.customerId;
    const isAdmin = req.user?.role === 'ADMIN';

    const filters = {
      search: String(search),
      uom: uom ? String(uom) : undefined,
      status: status ? Number(status) : undefined,
      projectId: projectId ? Number(projectId) : undefined,
      customerId: !isAdmin && customerId ? Number(customerId) : undefined,
      page: Number(page),
      limit: Number(limit)
    };

    const result = await this.materialService.listMaterials(filters);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  }

  async search(req: Request, res: Response) {
    const { 
      query = '',
      uom,
      minQuantity,
      maxQuantity,
      projectId,
      page = '1',
      limit = '20'
    } = req.query;

    const customerId = req.user?.customerId;
    const isAdmin = req.user?.role === 'ADMIN';

    const filters = {
      search: String(query),
      uom: uom ? String(uom) : undefined,
      minQuantity: minQuantity ? Number(minQuantity) : undefined,
      maxQuantity: maxQuantity ? Number(maxQuantity) : undefined,
      projectId: projectId ? Number(projectId) : undefined,
      customerId: !isAdmin && customerId ? Number(customerId) : undefined,
      page: Number(page),
      limit: Number(limit)
    };

    const result = await this.materialService.searchMaterials(filters);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const customerId = req.user?.customerId;
    const isAdmin = req.user?.role === 'ADMIN';

    const result = await this.materialService.getMaterialById(
      Number(id),
      !isAdmin && customerId ? Number(customerId) : undefined
    );

    if (!result.success) {
      if (result.error === 'Material not found') {
        return res.status(404).json({ error: result.error });
      }
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  }

  async getUoms(_req: Request, res: Response) {
    const result = await this.materialService.getUniqueUoms();

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  }
}