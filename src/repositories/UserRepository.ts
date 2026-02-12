import { prisma } from '../config/database';
import { Agency, Role } from '@prisma/client'; 

export class UserRepository {
  
  // Find user by email
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findByRoleAndAgency(role: Role, agency: Agency) {
    return await prisma.user.findFirst({
      where: { role, agency },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        agency: true,
      },
    });
  }

  // Find user by ID
  async findById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  // Get all users
  async findAll() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        agency: true,
        createdAt: true,
      },
    });
  }

  // Create user (Updated to accept 'role' as an argument)
  async create(email: string, hashedPassword: string, name: string, role: Role, agency?: Agency) {
    return await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role, // <--- Now uses the dynamic input
        agency,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        agency: true,
      },
    });
  }

  // Update user
  async update(id: number, data: any) {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        agency: true,
      },
    });
  }

  // Delete user
  async delete(id: number) {
    return await prisma.user.delete({
      where: { id },
    });
  }
}
