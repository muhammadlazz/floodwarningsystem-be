import { Request, Response } from 'express'
import { BbwsService } from '../services/BbwsService'
import { runBbwsSyncOnce } from '../jobs/bbwsSyncJob'
import {
  BbwsStationCreateRequest,
  BbwsStationUpdateRequest,
  BbwsWaterLevelCreateRequest,
  BbwsWaterLevelUpdateRequest,
  Role,
} from '../types'

export class BbwsController {
  private bbwsService = new BbwsService()

  listStations = async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1
    const limit = req.query.limit ? Number(req.query.limit) : 20

    const includeInactiveRequested = String(req.query.includeInactive) === 'true'
    const includeInactive =
      includeInactiveRequested &&
      !!req.user &&
      (req.user.role === Role.SUPER_ADMIN || req.user.role === Role.MASTER_ADMIN)

    const result = await this.bbwsService.listStations({ page, limit, includeInactive })
    if (result.success) return res.status(200).json(result)
    return res.status(500).json(result)
  }

  getStationById = async (req: Request, res: Response) => {
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' })
    }

    const includeInactiveRequested = String(req.query.includeInactive) === 'true'
    const includeInactive =
      includeInactiveRequested &&
      !!req.user &&
      (req.user.role === Role.SUPER_ADMIN || req.user.role === Role.MASTER_ADMIN)

    const result = await this.bbwsService.getStationById(parsedId, { includeInactive })
    if (result.success) return res.status(200).json(result)
    return res.status(404).json(result)
  }

  createStation = async (req: Request, res: Response) => {
    const requestor = req.user
    const data: BbwsStationCreateRequest = req.body
    const result = await this.bbwsService.createStation(data, requestor!)

    if (result.success) return res.status(201).json(result)
    return res.status(403).json(result)
  }

  updateStation = async (req: Request, res: Response) => {
    const requestor = req.user
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' })
    }

    const data: BbwsStationUpdateRequest = req.body
    const result = await this.bbwsService.updateStation(parsedId, data, requestor!)

    if (result.success) return res.status(200).json(result)
    if (result.message === 'Station BBWS tidak ditemukan') return res.status(404).json(result)
    return res.status(403).json(result)
  }

  deleteStation = async (req: Request, res: Response) => {
    const requestor = req.user
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' })
    }

    const result = await this.bbwsService.deleteStation(parsedId, requestor!)
    if (result.success) return res.status(200).json(result)
    if (result.message === 'Station BBWS tidak ditemukan') return res.status(404).json(result)
    return res.status(403).json(result)
  }

  listWaterLevels = async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1
    const limit = req.query.limit ? Number(req.query.limit) : 50
    const stationId = req.query.stationId ? Number(req.query.stationId) : undefined
    const from = req.query.from ? String(req.query.from) : undefined
    const to = req.query.to ? String(req.query.to) : undefined

    const result = await this.bbwsService.listWaterLevels({ page, limit, stationId, from, to })
    if (result.success) return res.status(200).json(result)
    return res.status(400).json(result)
  }

  getWaterLevelById = async (req: Request, res: Response) => {
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' })
    }

    const result = await this.bbwsService.getWaterLevelById(parsedId)
    if (result.success) return res.status(200).json(result)
    return res.status(404).json(result)
  }

  createWaterLevel = async (req: Request, res: Response) => {
    const requestor = req.user
    const data: BbwsWaterLevelCreateRequest = req.body
    const result = await this.bbwsService.createWaterLevel(data, requestor!)

    if (result.success) return res.status(201).json(result)
    if (result.message === 'Station BBWS tidak ditemukan') return res.status(404).json(result)
    return res.status(403).json(result)
  }

  updateWaterLevel = async (req: Request, res: Response) => {
    const requestor = req.user
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' })
    }

    const data: BbwsWaterLevelUpdateRequest = req.body
    const result = await this.bbwsService.updateWaterLevel(parsedId, data, requestor!)

    if (result.success) return res.status(200).json(result)
    if (result.message === 'Data ketinggian sungai tidak ditemukan') return res.status(404).json(result)
    if (result.message === 'Station BBWS tidak ditemukan') return res.status(404).json(result)
    return res.status(403).json(result)
  }

  deleteWaterLevel = async (req: Request, res: Response) => {
    const requestor = req.user
    const parsedId = parseInt(req.params.id)
    if (isNaN(parsedId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' })
    }

    const result = await this.bbwsService.deleteWaterLevel(parsedId, requestor!)
    if (result.success) return res.status(200).json(result)
    if (result.message === 'Data ketinggian sungai tidak ditemukan') return res.status(404).json(result)
    return res.status(403).json(result)
  }

  syncNow = async (req: Request, res: Response) => {
    const user = req.user!
    if (!(user.role === Role.SUPER_ADMIN || user.role === Role.MASTER_ADMIN)) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses untuk menjalankan sync' })
    }

    try {
      const result = await runBbwsSyncOnce()
      if (result.success) return res.status(200).json(result)
      return res.status(400).json(result)
    } catch (error) {
      return res.status(500).json({ success: false, message: (error as Error).message })
    }
  }
}
