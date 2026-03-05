import { Request, Response } from 'express'
import { ReportService } from '../services/ReportService'

export class ReportController {
  private service = new ReportService()

  create = async (req: Request, res: Response) => {
    const result = await this.service.createReport(req.body, req.user!)
    return res.status(result.success ? 201 : 400).json(result)
  }

  getAll = async (req: Request, res: Response) => {
    const result = await this.service.getAllReports()
    return res.status(result.success ? 200 : 500).json(result)
  }

  update = async (req: Request, res: Response) => {
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) return res.status(400).json({ success: false, message: 'Invalid ID' })

    const result = await this.service.updateReport(parsedId, req.body, req.user!)
    return res.status(result.success ? 200 : 400).json(result)
  }

  delete = async (req: Request, res: Response) => {
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) return res.status(400).json({ success: false, message: 'Invalid ID' })

    const result = await this.service.deleteReport(parsedId, req.user!)
    return res.status(result.success ? 200 : 400).json(result)
  }
}