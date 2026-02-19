import { prisma } from '../config/database'

export class BbwsWaterLevelRepository {
  private stationSelect = {
    id: true,
    code: true,
    name: true,
    riverName: true,
    latitude: true,
    longitude: true,
    isActive: true,
  }

  async create(data: { stationId: number; waterLevel: number; measuredAt: Date; source?: string }) {
    return await prisma.bbwsWaterLevel.create({
      data: {
        stationId: data.stationId,
        waterLevel: data.waterLevel,
        measuredAt: data.measuredAt,
        source: data.source,
      },
    })
  }

  async upsertUnique(data: {
    stationId: number
    measuredAt: Date
    waterLevel: number
    source?: string
  }) {
    return await prisma.bbwsWaterLevel.upsert({
      where: { stationId_measuredAt: { stationId: data.stationId, measuredAt: data.measuredAt } },
      create: {
        stationId: data.stationId,
        measuredAt: data.measuredAt,
        waterLevel: data.waterLevel,
        source: data.source,
      },
      update: {
        waterLevel: data.waterLevel,
        ...(data.source === undefined ? {} : { source: data.source }),
      },
    })
  }

  async findById(id: number) {
    return await prisma.bbwsWaterLevel.findUnique({
      where: { id },
      select: {
        id: true,
        stationId: true,
        waterLevel: true,
        measuredAt: true,
        source: true,
        createdAt: true,
        station: { select: this.stationSelect },
      },
    })
  }

  async findMany(params: {
    stationId?: number
    from?: Date
    to?: Date
    skip?: number
    take?: number
  }) {
    const { stationId, from, to, skip, take } = params

    return await prisma.bbwsWaterLevel.findMany({
      where: {
        ...(stationId === undefined ? {} : { stationId }),
        ...(from || to
          ? {
              measuredAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
      orderBy: [{ measuredAt: 'desc' }],
      select: {
        id: true,
        stationId: true,
        waterLevel: true,
        measuredAt: true,
        source: true,
        createdAt: true,
        station: { select: this.stationSelect },
      },
      skip,
      take,
    })
  }

  async count(params: { stationId?: number; from?: Date; to?: Date }) {
    const { stationId, from, to } = params

    return await prisma.bbwsWaterLevel.count({
      where: {
        ...(stationId === undefined ? {} : { stationId }),
        ...(from || to
          ? {
              measuredAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
    })
  }

  async update(
    id: number,
    data: { stationId?: number; waterLevel?: number; measuredAt?: Date; source?: string }
  ) {
    return await prisma.bbwsWaterLevel.update({
      where: { id },
      data: {
        ...(data.stationId === undefined ? {} : { stationId: data.stationId }),
        ...(data.waterLevel === undefined ? {} : { waterLevel: data.waterLevel }),
        ...(data.measuredAt === undefined ? {} : { measuredAt: data.measuredAt }),
        ...(data.source === undefined ? {} : { source: data.source }),
      },
      select: {
        id: true,
        stationId: true,
        waterLevel: true,
        measuredAt: true,
        source: true,
        createdAt: true,
        station: { select: this.stationSelect },
      },
    })
  }

  async delete(id: number) {
    return await prisma.bbwsWaterLevel.delete({ where: { id } })
  }
}
