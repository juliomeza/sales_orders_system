// backend/src/shared/types/dto/responses/customer.ts
import { Customer } from '../../models/customer';
import { ApiResponse } from '../../base';

export interface CustomerResponse extends ApiResponse<Customer> {}

export interface CustomerListResponse extends ApiResponse<Customer[]> {}