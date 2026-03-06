import { prisma } from '../config/database'

export class RegionUpdateRepository {
  async create(data: any) {
    return await prisma.regionUpdate.create({ data })
  }

  async findAll() {
    return await prisma.regionUpdate.findMany({ orderBy: { updatedAt: 'desc' } })
  }

  async findById(id: number) {
    return await prisma.regionUpdate.findUnique({ where: { id } })
  }

  async update(id: number, data: any) {
    return await prisma.regionUpdate.update({ where: { id }, data })
  }

  async delete(id: number) {
    return await prisma.regionUpdate.delete({ where: { id } })
  }
}