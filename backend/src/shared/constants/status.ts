// backend/src/shared/constants/status.ts
export const STATUS = {
  ACTIVE: 1,
  INACTIVE: 2,
  DELETED: 3
} as const;

export const ORDER_STATUS = {
  DRAFT: 10,
  SUBMITTED: 11,
  PROCESSING: 12,
  COMPLETED: 13,
  CANCELLED: 14
} as const;