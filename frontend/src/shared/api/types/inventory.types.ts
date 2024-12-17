// frontend/src/shared/api/types/inventory.types.ts
export interface MaterialResponse {
    materials: Array<{
      id: string;
      code: string;
      description: string;
      uom: string;
      availableQuantity: number;
    }>;
    total: number;
    page?: number;
    limit?: number;
  }
  
  export interface MaterialQueryParams {
    query?: string;
    page?: number;
    limit?: number;
  }