import { Request, Response } from 'express'
import { ActivityLogService } from '../services/ActivityLogService'
import { Role } from '../types'

export class ActivityLogController {
  private service = new ActivityLogService()

  getLogs = async (req: Request, res: Response) => {
    const requestor = (req as any).user
    
    // Safety check in case the middleware didn't attach the user
    if (!requestor || (requestor.role !== Role.SUPER_ADMIN && requestor.role !== Role.MASTER_ADMIN)) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' })
    }

    // Pass requestor ke service untuk filter data
    const result = await this.service.getLogs(requestor)
    return res.status(result.success ? 200 : 500).json(result)
  }
}