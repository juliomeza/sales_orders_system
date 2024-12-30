// backend/src/controllers/carriersController.ts
import { Request, Response } from 'express';
import { CarrierServiceImpl } from '../services/carrierService';
import { ERROR_MESSAGES } from '../shared/constants';
import { ApiError, ValidationError } from '../shared/errors';
import { handleCommonErrors } from '../shared/errors';
import { ValidationService } from '../shared/validations/validationService';
import Logger from '../config/logger';
import { CarriersListResult } from '../shared/types/dto/responses/carrier';
import { BaseFilters, ServiceResult, Status } from '../shared/types/base/common';
import { createPaginatedResponse } from '../shared/utils/response';

interface CarrierFilters extends BaseFilters {
  name?: string;
  lookupCode?: string;
}

/**
 * Controlador de transportistas
 * Gestiona operaciones relacionadas con carriers siguiendo estándares del backend
 */
export class CarriersController {
  constructor(
    private readonly carrierService: CarrierServiceImpl
  ) {}

  /**
   * Obtiene la lista de transportistas con soporte para filtros y paginación
   * @param req - Request de Express con datos del usuario y parámetros de filtrado
   * @param res - Response de Express para enviar la lista de transportistas
   */
  getCarriers = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }

      Logger.debug('Fetching carriers list', {
        userId: req.user.userId,
        filters: req.query
      });

      // Extraer y validar parámetros de paginación
      const { 
        page = 1, 
        limit = 10, 
        search,
        status,
        name,
        lookupCode,
        ...unknownParams
      } = req.query;

      // Validar que no hay parámetros desconocidos
      if (Object.keys(unknownParams).length > 0) {
        throw new ValidationError(`Invalid filter parameters: ${Object.keys(unknownParams).join(', ')}`);
      }

      // Validar status si existe
      let validatedStatus: Status | undefined;
      if (status) {
        const statusNumber = Number(status) as 1 | 2 | 3;
        ValidationService.validateStatus(statusNumber);
        validatedStatus = statusNumber;
      }

      // Construir filtros tipados
      const filters: CarrierFilters = {
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        status: validatedStatus,
        name: name as string,
        lookupCode: lookupCode as string
      };

      // Obtener carriers con filtros validados
      const result = await this.carrierService.getAllCarriers(filters);

      if (!result.success || !result.data) {
        throw ApiError.internal(ERROR_MESSAGES.OPERATION.LIST_ERROR);
      }

      Logger.info('Carriers list retrieved successfully', {
        userId: req.user.userId,
        count: result.data.carriers.length
      });

      const response = createPaginatedResponse(
        result.data.carriers,
        filters.page || 1,
        filters.limit || 10,
        result.data.total,
        req
      );

      res.json(response);
    } catch (error) {
      handleCommonErrors(res, error, req);
    }
  };
}