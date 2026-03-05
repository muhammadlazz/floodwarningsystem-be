import { prisma } from '../config/database'
import { LogAction, Agency } from '@prisma/client'

export class ActivityLogRepository {
  async create(data: { userId?: number; action: LogAction; entity?: string; description: string }) {
    return await prisma.activityLog.create({ data })
  }

  async findAll(agencyFilter?: Agency) {
    return await prisma.activityLog.findMany({
      where: agencyFilter ? { user: { agency: agencyFilter } } : undefined,
      include: {
        user: { select: { name: true, agency: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}