import { ActivityLogRepository } from '../repositories/ActivityLogRepository'
import { LogAction } from '@prisma/client'
import { UserPayload, Role } from '../types'

export class ActivityLogService {
  private repository = new ActivityLogRepository()

  async logAction(userId: number | undefined, action: LogAction, entity: string, description: string) {
    try {
      await this.repository.create({ userId, action, entity, description })
    } catch (error) {
      console.error('Failed to write activity log:', error)
    }
  }

  async getLogs(requestor: UserPayload) {
    try {
      // MASTER_ADMIN hanya melihat log dari instansinya sendiri
      const agencyFilter = requestor.role === Role.MASTER_ADMIN ? requestor.agency! : undefined
      const logs = await this.repository.findAll(agencyFilter)
      return { success: true, data: logs }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }
}