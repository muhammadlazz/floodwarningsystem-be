import { prisma } from '../config/database'
import { LogAction } from '@prisma/client'

export class ActivityLogRepository {
  async create(data: { userId?: number; action: LogAction; entity?: string; description: string }) {
    return await prisma.activityLog.create({ data })
  }

  async findAll() {
    return await prisma.activityLog.findMany({
      include: {
        user: { select: { name: true, agency: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}