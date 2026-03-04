import { prisma } from '../config/database'
import { ReportStatus } from '@prisma/client'

export class ReportRepository {
  async create(data: any) {
    return await prisma.report.create({ data })
  }

  async findAll() {
    return await prisma.report.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async findById(id: number) {
    return await prisma.report.findUnique({ where: { id } })
  }

  async update(id: number, data: any) {
    return await prisma.report.update({ where: { id }, data })
  }

  async delete(id: number) {
    return await prisma.report.delete({ where: { id } })
  }
}