import { Request, Response } from 'express'
import { RegionUpdateService } from '../services/RegionUpdateService'

export class RegionUpdateController {
  private service = new RegionUpdateService()

  create = async (req: Request, res: Response) => {
    // FIX: Cast req to any for Render build compatibility
    const result = await this.service.createRegionUpdate(req.body, (req as any).user!)
    return res.status(result.success ? 201 : 400).json(result)
  }

  getAll = async (req: Request, res: Response) => {
    const result = await this.service.getAllRegionUpdates()
    return res.status(result.success ? 200 : 500).json(result)
  }

  update = async (req: Request, res: Response) => {
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) return res.status(400).json({ success: false, message: 'Invalid ID' })

    // FIX: Cast req to any to access user property
    const result = await this.service.updateRegionUpdate(parsedId, req.body, (req as any).user!)
    return res.status(result.success ? 200 : 400).json(result)
  }

  delete = async (req: Request, res: Response) => {
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) return res.status(400).json({ success: false, message: 'Invalid ID' })

    // FIX: Cast req to any to access user property
    const result = await this.service.deleteRegionUpdate(parsedId, (req as any).user!)
    return res.status(result.success ? 200 : 400).json(result)
  }
}