import { Request, Response } from 'express'
import { ActivityLogService } from '../services/ActivityLogService'
import { Role } from '../types'

export class ActivityLogController {
  private service = new ActivityLogService()

  getLogs = async (req: Request, res: Response) => {
    const requestor = req.user!
    // Asumsi hanya admin level atas yang boleh lihat log
    if (requestor.role !== Role.SUPER_ADMIN && requestor.role !== Role.MASTER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' })
    }

    const result = await this.service.getLogs()
    return res.status(result.success ? 200 : 500).json(result)
  }
}