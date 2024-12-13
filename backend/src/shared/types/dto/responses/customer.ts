// backend/src/shared/types/dto/responses/customer.ts
import { Customer } from '../../models/customer';
import { ApiResponse } from '../../base/responses';

export interface CustomerResponse extends ApiResponse<Customer> {}

export interface CustomerListResponse extends ApiResponse<Customer[]> {}