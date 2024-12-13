// backend/src/shared/types/models/user.ts
import { BaseEntity, Status, Role } from '../base/common';

export interface User extends BaseEntity {
  email: string;
  role: Role;
  customerId: number | null;
  status: Status;
  customer?: {
    id: number;
    name: string;
  } | null;
}