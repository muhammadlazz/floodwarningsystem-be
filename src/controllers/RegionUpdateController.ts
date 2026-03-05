import { Request, Response } from 'express'
import { RegionUpdateService } from '../services/RegionUpdateService'

export class RegionUpdateController {
  private service = new RegionUpdateService()

  create = async (req: Request, res: Response) => {
    const result = await this.service.createRegionUpdate(req.body, req.user!)
    return res.status(result.success ? 201 : 400).json(result)
  }

  getAll = async (req: Request, res: Response) => {
    const result = await this.service.getAllRegionUpdates()
    return res.status(result.success ? 200 : 500).json(result)
  }

  update = async (req: Request, res: Response) => {
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) return res.status(400).json({ success: false, message: 'Invalid ID' })

    const result = await this.service.updateRegionUpdate(parsedId, req.body, req.user!)
    return res.status(result.success ? 200 : 400).json(result)
  }

  delete = async (req: Request, res: Response) => {
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) return res.status(400).json({ success: false, message: 'Invalid ID' })

    const result = await this.service.deleteRegionUpdate(parsedId, req.user!)
    return res.status(result.success ? 200 : 400).json(result)
  }
}