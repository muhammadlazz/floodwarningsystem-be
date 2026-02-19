import { prisma } from '../config/database'

export class BbwsStationRepository {
  async create(data: {
    code: string
    name: string
    riverName?: string | null
    latitude?: number | null
    longitude?: number | null
    isActive?: boolean
  }) {
    return await prisma.bbwsStation.create({ data })
  }

  async upsertByCode(
    code: string,
    data: {
      name?: string
      riverName?: string | null
      latitude?: number | null
      longitude?: number | null
      isActive?: boolean
    }
  ) {
    return await prisma.bbwsStation.upsert({
      where: { code },
      create: {
        code,
        name: data.name || code,
        riverName: data.riverName ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        isActive: data.isActive ?? true,
      },
      update: {
        ...(data.name === undefined ? {} : { name: data.name }),
        ...(data.riverName === undefined ? {} : { riverName: data.riverName }),
        ...(data.latitude === undefined ? {} : { latitude: data.latitude }),
        ...(data.longitude === undefined ? {} : { longitude: data.longitude }),
        ...(data.isActive === undefined ? {} : { isActive: data.isActive }),
      },
    })
  }

  async findById(id: number) {
    return await prisma.bbwsStation.findUnique({ where: { id } })
  }

  async findByCode(code: string) {
    return await prisma.bbwsStation.findUnique({ where: { code } })
  }

  async findMany(params: { isActive?: boolean; skip?: number; take?: number }) {
    const { isActive, skip, take } = params
    return await prisma.bbwsStation.findMany({
      where: isActive === undefined ? undefined : { isActive },
      orderBy: [{ name: 'asc' }],
      skip,
      take,
    })
  }

  async count(params: { isActive?: boolean }) {
    const { isActive } = params
    return await prisma.bbwsStation.count({
      where: isActive === undefined ? undefined : { isActive },
    })
  }

  async update(
    id: number,
    data: {
      code?: string
      name?: string
      riverName?: string | null
      latitude?: number | null
      longitude?: number | null
      isActive?: boolean
    }
  ) {
    return await prisma.bbwsStation.update({ where: { id }, data })
  }

  async delete(id: number) {
    return await prisma.bbwsStation.delete({ where: { id } })
  }
}

