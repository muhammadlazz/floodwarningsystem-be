import { prisma } from '../config/database'

export class UserRepository {
  // Find user by email
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    })
  }

  // Find user by ID
  async findById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
    })
  }

  // Get all users
  async findAll() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })
  }

  // Create user
  async create(email: string, password: string, name: string) {
    return await prisma.user.create({
      data: {
        email,
        password,
        name,
        role: 'user',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })
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
      },
    })
  }

  // Delete user
  async delete(id: number) {
    return await prisma.user.delete({
      where: { id },
    })
  }
}