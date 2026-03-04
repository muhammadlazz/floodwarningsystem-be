import { ActivityLogRepository } from '../repositories/ActivityLogRepository'
import { LogAction } from '@prisma/client'

export class ActivityLogService {
  private repository = new ActivityLogRepository()

  // Fungsi internal yang akan dipanggil oleh Service lain (misal UserService)
  async logAction(userId: number | undefined, action: LogAction, entity: string, description: string) {
    try {
      await this.repository.create({ userId, action, entity, description })
    } catch (error) {
      console.error('Failed to write activity log:', error)
    }
  }

  async getLogs() {
    try {
      const logs = await this.repository.findAll()
      return { success: true, data: logs }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }
}