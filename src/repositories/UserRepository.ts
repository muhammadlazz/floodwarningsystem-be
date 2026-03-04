import { prisma } from '../config/database'
import { Agency, Role } from '@prisma/client'

export class UserRepository {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } })
  }

  async findByUsername(username: string) {
    return await prisma.user.findUnique({ where: { username } })
  }

  async findByRoleAndAgency(role: Role, agency: Agency) {
    return await prisma.user.findFirst({
      where: { role, agency },
      select: { id: true, name: true, username: true, email: true, role: true, agency: true },
    })
  }

  async findById(id: number) {
    return await prisma.user.findUnique({ where: { id } })
  }

  async findAll(agencyFilter?: Agency) {
    return await prisma.user.findMany({
      where: agencyFilter ? { agency: agencyFilter } : undefined,
      select: { id: true, name: true, username: true, email: true, role: true, agency: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: { email: string; username: string; password: string; name: string; role: Role; agency?: Agency }) {
    return await prisma.user.create({
      data,
      select: { id: true, name: true, username: true, email: true, role: true, agency: true },
    })
  }

  async update(id: number, data: any) {
    return await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, username: true, email: true, role: true, agency: true },
    })
  }

  async delete(id: number) {
    return await prisma.user.delete({ where: { id } })
  }
}