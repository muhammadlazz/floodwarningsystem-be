import { Request, Response } from 'express'
import { ReportService } from '../services/ReportService'

export class ReportController {
  private service = new ReportService()

  create = async (req: Request, res: Response) => {
    // FIX: Cast req to any to allow access to user property for Render build
    const result = await this.service.createReport(req.body, (req as any).user!)
    return res.status(result.success ? 201 : 400).json(result)
  }

  getAll = async (req: Request, res: Response) => {
    const result = await this.service.getAllReports()
    return res.status(result.success ? 200 : 500).json(result)
  }

  update = async (req: Request, res: Response) => {
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) return res.status(400).json({ success: false, message: 'Invalid ID' })

    // FIX: Cast req to any to satisfy TypeScript compiler on Render
    const result = await this.service.updateReport(parsedId, req.body, (req as any).user!)
    return res.status(result.success ? 200 : 400).json(result)
  }

  delete = async (req: Request, res: Response) => {
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) return res.status(400).json({ success: false, message: 'Invalid ID' })

    // FIX: Cast req to any to avoid TS2339 build error
    const result = await this.service.deleteReport(parsedId, (req as any).user!)
    return res.status(result.success ? 200 : 400).json(result)
  }
}