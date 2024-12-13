// backend/src/shared/types/dto/responses/auth.ts
import { UserDomain } from '../../../../domain/user';
import { ApiResponse } from '../../base/responses';

export interface AuthResponse {
  token: string;
  user: Omit<UserDomain, 'password'>;
}

export interface AuthSuccessResponse extends ApiResponse<AuthResponse> {}
