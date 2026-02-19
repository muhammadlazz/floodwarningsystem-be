import { Request, Response } from 'express'
import { InfographicService } from '../services/InfographicService'
import { InfographicCreateRequest, InfographicUpdateRequest, Role } from '../types'

export class InfographicController {
  private infographicService = new InfographicService()

  list = async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1
    const limit = req.query.limit ? Number(req.query.limit) : 20

    const includeInactiveRequested = String(req.query.includeInactive) === 'true'

    const includeInactive =
      includeInactiveRequested &&
      !!req.user &&
      (req.user.role === Role.SUPER_ADMIN || req.user.role === Role.MASTER_ADMIN)

    const result = await this.infographicService.listInfographics({ page, limit, includeInactive })

    if (result.success) return res.status(200).json(result)
    return res.status(500).json(result)
  }

  getById = async (req: Request, res: Response) => {
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' })
    }

    const includeInactiveRequested = String(req.query.includeInactive) === 'true'

    const includeInactive =
      includeInactiveRequested &&
      !!req.user &&
      (req.user.role === Role.SUPER_ADMIN || req.user.role === Role.MASTER_ADMIN)

    const result = await this.infographicService.getInfographicById(parsedId, { includeInactive })

    if (result.success) return res.status(200).json(result)
    return res.status(404).json(result)
  }

  create = async (req: Request, res: Response) => {
    const requestor = req.user
    const data: InfographicCreateRequest = req.body
    const result = await this.infographicService.createInfographic(data, requestor!)

    if (result.success) return res.status(201).json(result)
    return res.status(403).json(result)
  }

  update = async (req: Request, res: Response) => {
    const requestor = req.user
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' })
    }

    const data: InfographicUpdateRequest = req.body
    const result = await this.infographicService.updateInfographic(parsedId, data, requestor!)

    if (result.success) return res.status(200).json(result)
    if (result.message === 'Infografis tidak ditemukan') return res.status(404).json(result)
    return res.status(403).json(result)
  }

  delete = async (req: Request, res: Response) => {
    const requestor = req.user
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' })
    }

    const result = await this.infographicService.deleteInfographic(parsedId, requestor!)

    if (result.success) return res.status(200).json(result)
    if (result.message === 'Infografis tidak ditemukan') return res.status(404).json(result)
    return res.status(403).json(result)
  }
}
