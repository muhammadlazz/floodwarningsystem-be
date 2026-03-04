import { Request, Response } from 'express'
import { FeedbackService } from '../services/FeedbackService'

export class FeedbackController {
  private service = new FeedbackService()

  create = async (req: Request, res: Response) => {
    const result = await this.service.createFeedback(req.body)
    return res.status(result.success ? 201 : 400).json(result)
  }

  getAll = async (req: Request, res: Response) => {
    const result = await this.service.getAllFeedback()
    return res.status(result.success ? 200 : 500).json(result)
  }

  markAsRead = async (req: Request, res: Response) => {
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) return res.status(400).json({ success: false, message: 'Invalid ID' })

    const result = await this.service.markAsRead(parsedId)
    return res.status(result.success ? 200 : 404).json(result)
  }
}