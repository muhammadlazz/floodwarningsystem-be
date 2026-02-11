import { prisma } from '../config/database'
import { Role, Agency } from '../types'

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

  // Find user by Role and Agency
  async findByRoleAndAgency(role: Role, agency: Agency) {
    // @ts-ignore: Prisma client might not be generated yet
    return await prisma.user.findFirst({
      where: {
        role,
        agency
      }
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
        agency: true,
        createdAt: true,
      },
    })
  }

  // Create user
  async create(email: string, password: string, name: string, role: Role, agency?: Agency) {
    // @ts-ignore: Prisma client might not be generated yet
    return await prisma.user.create({
      data: {
        email,
        password,
        name,
        role,
        agency,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        agency: true,
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
        agency: true,
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