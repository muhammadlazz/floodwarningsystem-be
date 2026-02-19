import { prisma } from '../config/database'

export interface InfographicListParams {
  isActive?: boolean
  skip?: number
  take?: number
}

export class InfographicRepository {
  async create(data: {
    title: string
    description?: string | null
    imageUrl: string
    linkUrl?: string | null
    isActive?: boolean
    sortOrder?: number
    startAt?: Date | null
    endAt?: Date | null
  }) {
    return await prisma.infographic.create({ data })
  }

  async findById(id: number) {
    return await prisma.infographic.findUnique({ where: { id } })
  }

  async findMany(params: InfographicListParams) {
    const { isActive, skip, take } = params

    return await prisma.infographic.findMany({
      where: isActive === undefined ? undefined : { isActive },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      skip,
      take,
    })
  }

  async count(params: { isActive?: boolean }) {
    const { isActive } = params

    return await prisma.infographic.count({
      where: isActive === undefined ? undefined : { isActive },
    })
  }

  async update(
    id: number,
    data: {
      title?: string
      description?: string | null
      imageUrl?: string
      linkUrl?: string | null
      isActive?: boolean
      sortOrder?: number
      startAt?: Date | null
      endAt?: Date | null
    }
  ) {
    return await prisma.infographic.update({ where: { id }, data })
  }

  async delete(id: number) {
    return await prisma.infographic.delete({ where: { id } })
  }
}

