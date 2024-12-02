// backend/src/services/auth/authService.ts
import { UserRepository } from '../../repositories/userRepository';
import { ServiceResult } from '../../shared/types/common';
import { ValidationService } from '../shared/validationService';
import { LoginDTO, RegisterDTO, AuthResponse, CreateUserDTO } from './types';
import { UserDomain, UserTokenData } from '../../domain/user';
import { ERROR_MESSAGES, ROLES, STATUS } from '../../shared/constants';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtSecret: string,
    private tokenExpiration: string = '30m'
  ) {}

  private generateToken(user: UserDomain): string {
    const payload: UserTokenData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      customerId: user.customerId,
      lookupCode: user.lookupCode,
      status: user.status
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.tokenExpiration });
  }

  private excludePassword<T extends { password: string }>(user: T): Omit<T, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private validateRegisterData(data: RegisterDTO) {
    return ValidationService.validate([
      {
        condition: !!data.email,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD
      },
      {
        condition: !!data.password,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD
      },
      {
        condition: data.password?.length >= 8,
        message: ERROR_MESSAGES.VALIDATION.INVALID_PASSWORD
      },
      {
        condition: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email),
        message: ERROR_MESSAGES.VALIDATION.INVALID_EMAIL
      }
    ]);
  }

  async login(data: LoginDTO): Promise<ServiceResult<AuthResponse>> {
    try {
      const user = await this.userRepository.findByEmail(data.email);

      if (!user) {
        return {
          success: false,
          error: ERROR_MESSAGES.AUTHENTICATION.INVALID_CREDENTIALS
        };
      }

      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) {
        return {
          success: false,
          error: ERROR_MESSAGES.AUTHENTICATION.INVALID_CREDENTIALS
        };
      }

      if (user.status !== STATUS.ACTIVE) {
        return {
          success: false,
          error: ERROR_MESSAGES.AUTHENTICATION.ACCOUNT_INACTIVE
        };
      }

      const token = this.generateToken(user);

      return {
        success: true,
        data: {
          token,
          user: this.excludePassword(user)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LOGIN_ERROR
      };
    }
  }

  async register(data: RegisterDTO): Promise<ServiceResult<AuthResponse>> {
    const validation = this.validateRegisterData(data);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        return {
          success: false,
          error: ERROR_MESSAGES.AUTHENTICATION.USER_EXISTS
        };
      }

      const user = await this.userRepository.create({
        email: data.email,
        password: data.password,
        role: data.role || ROLES.CLIENT,
        customerId: data.customerId,
        status: STATUS.ACTIVE
      } as CreateUserDTO); 

      const token = this.generateToken(user);

      return {
        success: true,
        data: {
          token,
          user: this.excludePassword(user)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR
      };
    }
  }

  async getCurrentUser(userId: number): Promise<ServiceResult<Omit<UserDomain, 'password'>>> {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.USER
        };
      }

      if (user.status !== STATUS.ACTIVE) {
        return {
          success: false,
          error: ERROR_MESSAGES.AUTHENTICATION.ACCOUNT_INACTIVE
        };
      }

      return {
        success: true,
        data: this.excludePassword(user)
      };
    } catch (error) {
      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async refreshToken(userId: number): Promise<ServiceResult<string>> {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.USER
        };
      }

      if (user.status !== STATUS.ACTIVE) {
        return {
          success: false,
          error: ERROR_MESSAGES.AUTHENTICATION.ACCOUNT_INACTIVE
        };
      }

      const token = this.generateToken(user);

      return {
        success: true,
        data: token
      };
    } catch (error) {
      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.TOKEN_REFRESH_ERROR
      };
    }
  }
}