// backend/src/services/auth/authService.ts
import { UserRepository } from '../../repositories/userRepository';
import { ServiceResult } from '../shared/types';
import { ValidationService } from '../shared/validationService';
import { LoginDTO, RegisterDTO, AuthResponse } from './types';
import { UserDomain, UserTokenData } from '../../domain/user';
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
        message: 'Email is required'
      },
      {
        condition: !!data.password,
        message: 'Password is required'
      },
      {
        condition: data.password?.length >= 8,
        message: 'Password must be at least 8 characters long'
      },
      {
        condition: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email),
        message: 'Invalid email format'
      }
    ]);
  }

  async login(data: LoginDTO): Promise<ServiceResult<AuthResponse>> {
    try {
      const user = await this.userRepository.findByEmail(data.email);

      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid credentials'
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
        error: 'Login error'
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
          error: 'User already exists'
        };
      }

      const user = await this.userRepository.create({
        email: data.email,
        password: data.password,
        role: data.role || 'CLIENT',
        customerId: data.customerId
      });

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
        error: 'Registration error'
      };
    }
  }

  async getCurrentUser(userId: number): Promise<ServiceResult<Omit<UserDomain, 'password'>>> {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: this.excludePassword(user)
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error retrieving user'
      };
    }
  }

  async refreshToken(userId: number): Promise<ServiceResult<string>> {
    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found'
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
        error: 'Error refreshing token'
      };
    }
  }
}