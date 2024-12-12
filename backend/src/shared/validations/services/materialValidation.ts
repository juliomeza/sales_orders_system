// backend/src/shared/validations/services/materialValidation.ts
import { ValidationService } from '../validationService';
import { MaterialFilters, MaterialSearchFilters }  from '../../../domain/material';

export class MaterialValidation {
  static validateFilters(filters: MaterialFilters) {
    return ValidationService.validate([
      {
        condition: typeof filters.search === 'string',
        message: 'Search term must be a string'
      },
      {
        condition: !filters.page || (Number.isInteger(filters.page) && filters.page > 0),
        message: 'Page must be a positive integer'
      },
      {
        condition: !filters.limit || (Number.isInteger(filters.limit) && filters.limit > 0),
        message: 'Limit must be a positive integer'
      }
    ]);
  }

  static validateSearchFilters(filters: MaterialSearchFilters) {
    return ValidationService.validate([
      {
        condition: typeof filters.search === 'string',
        message: 'Search term must be a string'
      },
      {
        condition: !filters.minQuantity || Number.isInteger(filters.minQuantity),
        message: 'Minimum quantity must be an integer'
      },
      {
        condition: !filters.maxQuantity || Number.isInteger(filters.maxQuantity),
        message: 'Maximum quantity must be an integer'
      },
      {
        condition: !filters.minQuantity || !filters.maxQuantity || filters.minQuantity <= filters.maxQuantity,
        message: 'Minimum quantity must be less than or equal to maximum quantity'
      }
    ]);
  }
}