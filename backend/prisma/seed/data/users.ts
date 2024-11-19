// backend/prisma/seed/data/users.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { User } from '../index';

export async function seedUsers(prisma: PrismaClient): Promise<User> {
  const hashedAdminPassword = await bcrypt.hash('Password123!', 10);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      lookupCode: 'ADMIN',
      password: hashedAdminPassword,
      role: 'ADMIN',
      status: 1
    }
  });

  return adminUser;
}