// backend/src/shared/constants/entities.ts
export const ACCOUNT_TYPES = {
    SHIP_TO: 'SHIP_TO',
    BILL_TO: 'BILL_TO',
    BOTH: 'BOTH'
  } as const;
  
  export const UOM_TYPES = {
    EACH: 'EA',
    CASE: 'CS',
    PALLET: 'PL',
    POUND: 'LB',
    KILOGRAM: 'KG'
  } as const;