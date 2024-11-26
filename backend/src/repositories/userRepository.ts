// backend/src/repositories/userRepository.ts
import { PrismaClient } from '@prisma/client';
import { UserDomain } from '../domain/user';
import bcrypt from 'bcryptjs';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<UserDomain | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        customer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return user as UserDomain | null;
  }

  async findById(id: number): Promise<UserDomain | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return user as UserDomain | null;
  }

  async create(data: {
    email: string;
    password: string;
    role: string;
    customerId?: number;
  }): Promise<UserDomain> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const lookupCode = data.email.split('@')[0].toUpperCase();

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        lookupCode,
        password: hashedPassword,
        role: data.role || 'CLIENT',
        customerId: data.customerId || null,
        status: 1,
        created_by: null,
        modified_by: null
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return user as UserDomain;
  }
}