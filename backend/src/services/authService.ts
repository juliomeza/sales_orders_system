// backend/src/services/authService.ts
import { UserRepository } from '../repositories/userRepository';
import { ValidationService } from '../shared/validations';
import { LoginDTO, RegisterDTO, CreateUserDTO, AuthResponse, ServiceResult } from '../shared/types';
import { UserDomain, UserTokenData } from '../domain/user';
import { ERROR_MESSAGES, STATUS, ROLES, AUTH_CONSTANTS, LOG_MESSAGES } from '../shared/constants';
import Logger from '../config/logger';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtSecret: string,
    private tokenExpiration: string = '30m'
  ) {}

  private generateToken(user: UserDomain): string {
    Logger.debug('Generating JWT token', { userId: user.id });

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
    Logger.debug('Validating registration data', { email: data.email });

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
    Logger.info(LOG_MESSAGES.AUTH.LOGIN.ATTEMPT, {
      email: data.email
    });

    try {
      const user = await this.userRepository.findByEmail(data.email);

      if (!user) {
        Logger.warn(LOG_MESSAGES.AUTH.LOGIN.FAILED, {
          email: data.email,
          reason: 'User not found'
        });

        return {
          success: false,
          error: ERROR_MESSAGES.AUTHENTICATION.INVALID_CREDENTIALS
        };
      }

      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) {
        Logger.warn(LOG_MESSAGES.AUTH.LOGIN.FAILED, {
          email: data.email,
          reason: 'Invalid password'
        });

        return {
          success: false,
          error: ERROR_MESSAGES.AUTHENTICATION.INVALID_CREDENTIALS
        };
      }

      if (user.status !== STATUS.ACTIVE) {
        Logger.warn(LOG_MESSAGES.AUTH.LOGIN.FAILED, {
          email: data.email,
          status: user.status,
          reason: 'Account inactive'
        });

        return {
          success: false,
          error: ERROR_MESSAGES.AUTHENTICATION.ACCOUNT_INACTIVE
        };
      }

      const token = this.generateToken(user);

      Logger.info(LOG_MESSAGES.AUTH.LOGIN.SUCCESS, {
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        data: {
          token,
          user: this.excludePassword(user)
        }
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.AUTH.LOGIN.FAILED, {
        email: data.email,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LOGIN_ERROR
      };
    }
  }

  async register(data: RegisterDTO): Promise<ServiceResult<AuthResponse>> {
    Logger.info(LOG_MESSAGES.AUTH.REGISTRATION.ATTEMPT, {
      email: data.email,
      role: data.role
    });

    const validation = this.validateRegisterData(data);
    if (!validation.isValid) {
      Logger.warn(LOG_MESSAGES.AUTH.REGISTRATION.FAILED_VALIDATION, {
        email: data.email,
        errors: validation.errors
      });

      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        Logger.warn(LOG_MESSAGES.AUTH.REGISTRATION.FAILED_USER_EXISTS, {
          email: data.email
        });

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

      Logger.info(LOG_MESSAGES.AUTH.REGISTRATION.SUCCESS, {
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        data: {
          token,
          user: this.excludePassword(user)
        }
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.AUTH.REGISTRATION.FAILED_INTERNAL, {
        email: data.email,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR
      };
    }
  }

  async getCurrentUser(userId: number): Promise<ServiceResult<Omit<UserDomain, 'password'>>> {
    Logger.debug(LOG_MESSAGES.AUTH.CURRENT_USER.REQUEST, { userId });

    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        Logger.warn(LOG_MESSAGES.AUTH.CURRENT_USER.FAILED_NOT_FOUND, { userId });
        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.USER
        };
      }

      if (user.status !== STATUS.ACTIVE) {
        Logger.warn(LOG_MESSAGES.AUTH.CURRENT_USER.FAILED_INACTIVE, {
          userId,
          status: user.status
        });

        return {
          success: false,
          error: ERROR_MESSAGES.AUTHENTICATION.ACCOUNT_INACTIVE
        };
      }

      Logger.info(LOG_MESSAGES.AUTH.CURRENT_USER.SUCCESS, {
        userId,
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        data: this.excludePassword(user)
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.AUTH.CURRENT_USER.FAILED_INTERNAL, {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async refreshToken(userId: number): Promise<ServiceResult<string>> {
    Logger.debug(LOG_MESSAGES.AUTH.TOKEN.REQUEST, { userId });

    try {
      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        Logger.warn(LOG_MESSAGES.AUTH.TOKEN.FAILED, {
          userId,
          reason: 'User not found'
        });

        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.USER
        };
      }

      if (user.status !== STATUS.ACTIVE) {
        Logger.warn(LOG_MESSAGES.AUTH.TOKEN.FAILED, {
          userId,
          status: user.status,
          reason: 'Account inactive'
        });

        return {
          success: false,
          error: ERROR_MESSAGES.AUTHENTICATION.ACCOUNT_INACTIVE
        };
      }

      const token = this.generateToken(user);

      Logger.info(LOG_MESSAGES.AUTH.TOKEN.SUCCESS, { userId });

      return {
        success: true,
        data: token
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.AUTH.TOKEN.FAILED, {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.TOKEN_REFRESH_ERROR
      };
    }
  }
}