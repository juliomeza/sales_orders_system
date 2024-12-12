// backend/src/repositories/userRepository.ts
import { PrismaClient } from '@prisma/client';
import { UserDomain } from '../domain/user';
import { CreateUserDTO } from '../shared/types/auth.types';
import bcrypt from 'bcryptjs';
import Logger from '../config/logger';
import { ERROR_MESSAGES, LOG_MESSAGES } from '../shared/constants';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  private readonly defaultUserInclude = {
    customer: {
      select: {
        id: true,
        name: true
      }
    }
  } as const;

  async findByEmail(email: string): Promise<UserDomain | null> {
    Logger.debug('Repository: Finding user by email', {
      email: email,
      operation: 'findByEmail'
    });

    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: this.defaultUserInclude
      });

      if (user) {
        Logger.debug('Repository: User found by email', {
          userId: user.id,
          email: user.email,
          role: user.role,
          customerId: user.customerId,
          operation: 'findByEmail'
        });
      } else {
        Logger.debug('Repository: User not found by email', {
          email: email,
          operation: 'findByEmail'
        });
      }

      return user as UserDomain | null;
    } catch (error) {
      Logger.error('Repository: Error finding user by email', {
        email: email,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'findByEmail'
      });
      throw error;
    }
  }

  async findById(id: number): Promise<UserDomain | null> {
    Logger.debug('Repository: Finding user by ID', {
      userId: id,
      operation: 'findById'
    });

    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: this.defaultUserInclude
      });

      if (user) {
        Logger.debug('Repository: User found by ID', {
          userId: id,
          email: user.email,
          role: user.role,
          customerId: user.customerId,
          operation: 'findById'
        });
      } else {
        Logger.debug('Repository: User not found by ID', {
          userId: id,
          operation: 'findById'
        });
      }

      return user as UserDomain | null;
    } catch (error) {
      Logger.error('Repository: Error finding user by ID', {
        userId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'findById'
      });
      throw error;
    }
  }

  async findByLookupCode(lookupCode: string): Promise<UserDomain | null> {
    Logger.debug('Repository: Finding user by lookup code', {
      lookupCode,
      operation: 'findByLookupCode'
    });

    try {
      const user = await this.prisma.user.findUnique({
        where: { lookupCode },
        include: this.defaultUserInclude
      });

      if (user) {
        Logger.debug('Repository: User found by lookup code', {
          lookupCode,
          userId: user.id,
          email: user.email,
          role: user.role,
          operation: 'findByLookupCode'
        });
      } else {
        Logger.debug('Repository: User not found by lookup code', {
          lookupCode,
          operation: 'findByLookupCode'
        });
      }

      return user as UserDomain | null;
    } catch (error) {
      Logger.error('Repository: Error finding user by lookup code', {
        lookupCode,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'findByLookupCode'
      });
      throw error;
    }
  }

  async create(data: CreateUserDTO): Promise<UserDomain> {
    Logger.info('Repository: Creating new user', {
      email: data.email,
      role: data.role,
      customerId: data.customerId,
      operation: 'create'
    });

    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const lookupCode = data.email.split('@')[0].toUpperCase();

      Logger.debug('Repository: Generated lookup code for new user', {
        email: data.email,
        lookupCode,
        operation: 'create'
      });

      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          lookupCode,
          password: hashedPassword,
          role: data.role,
          customerId: data.customerId || null,
          status: data.status,
          created_by: null,
          modified_by: null
        },
        include: this.defaultUserInclude
      });

      Logger.info('Repository: Successfully created new user', {
        userId: user.id,
        email: user.email,
        role: user.role,
        customerId: user.customerId,
        operation: 'create'
      });

      return user as UserDomain;
    } catch (error) {
      Logger.error('Repository: Error creating new user', {
        email: data.email,
        role: data.role,
        customerId: data.customerId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'create'
      });
      throw error;
    }
  }

  async update(id: number, data: Partial<CreateUserDTO>): Promise<UserDomain> {
    Logger.info('Repository: Updating user', {
      userId: id,
      hasPasswordUpdate: !!data.password,
      hasRoleUpdate: !!data.role,
      operation: 'update'
    });

    try {
      const updateData: any = {
        ...(data.email && { email: data.email }),
        ...(data.role && { role: data.role }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.customerId !== undefined && { customerId: data.customerId }),
        modified_by: null,
        modified_at: new Date()
      };

      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        updateData.password = hashedPassword;
        
        Logger.debug('Repository: Password hash generated for update', {
          userId: id,
          operation: 'update'
        });
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
        include: this.defaultUserInclude
      });

      Logger.info('Repository: Successfully updated user', {
        userId: id,
        email: user.email,
        role: user.role,
        customerId: user.customerId,
        wasPasswordUpdated: !!data.password,
        operation: 'update'
      });

      return user as UserDomain;
    } catch (error) {
      Logger.error('Repository: Error updating user', {
        userId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'update'
      });
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    Logger.info('Repository: Deleting user', {
      userId: id,
      operation: 'delete'
    });

    try {
      await this.prisma.user.delete({
        where: { id }
      });

      Logger.info('Repository: Successfully deleted user', {
        userId: id,
        operation: 'delete'
      });
    } catch (error) {
      Logger.error('Repository: Error deleting user', {
        userId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'delete'
      });
      throw error;
    }
  }

  async validatePassword(userId: number, password: string): Promise<boolean> {
    Logger.debug('Repository: Validating user password', {
      userId,
      operation: 'validatePassword'
    });

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
      });

      if (!user) {
        Logger.warn('Repository: Password validation failed - User not found', {
          userId,
          operation: 'validatePassword'
        });
        return false;
      }

      const isValid = await bcrypt.compare(password, user.password);

      Logger.debug('Repository: Password validation completed', {
        userId,
        isValid,
        operation: 'validatePassword'
      });

      return isValid;
    } catch (error) {
      Logger.error('Repository: Error validating password', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'validatePassword'
      });
      throw error;
    }
  }
}