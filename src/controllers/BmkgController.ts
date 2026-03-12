import { Request, Response } from 'express'
import { BmkgService } from '../services/BmkgService'
import { ActivityLogService } from '../services/ActivityLogService'

export class BmkgController {
  private service = new BmkgService()
  private logService = new ActivityLogService()

  createWeather = async (req: Request, res: Response) => {
    try {
      const { stationId, temperature, windSpeed, forecast, notes } = req.body
      const data = await this.service.createWeather(stationId, temperature, windSpeed, forecast, notes)
      
      // Catat ke log
      await this.logService.logAction(req.user?.id, 'CREATE', 'BmkgWeather', `Input cuaca di ${data.station.name}: ${forecast}, ${temperature}°C`)
      
      return res.status(201).json({ success: true, message: 'Data cuaca berhasil disimpan', data })
    } catch (error) {
      return res.status(500).json({ success: false, message: (error as Error).message })
    }
  }

  createRainfall = async (req: Request, res: Response) => {
    try {
      const { stationId, rainfall } = req.body
      const data = await this.service.createRainfall(stationId, rainfall)
      
      await this.logService.logAction(req.user?.id, 'CREATE', 'BmkgRainfall', `Input curah hujan di ${data.station.name}: ${rainfall} mm`)
      
      return res.status(201).json({ success: true, message: 'Data curah hujan berhasil disimpan', data })
    } catch (error) {
      return res.status(500).json({ success: false, message: (error as Error).message })
    }
  }

  getRainfallHistory = async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit) || 5
      const data = await this.service.getRainfallHistory(limit)
      return res.status(200).json({ success: true, data })
    } catch (error) {
      return res.status(500).json({ success: false, message: (error as Error).message })
    }
  }

  // Tetap biarkan placeholder untuk stats
  getStats = async (req: Request, res: Response) => { res.status(501).json({ success: false, message: 'Belum diimplementasi' }) }
  getPrecipitationTrend = async (req: Request, res: Response) => { res.status(501).json({ success: false, message: 'Belum diimplementasi' }) }
  getTemperatureFluctuation = async (req: Request, res: Response) => { res.status(501).json({ success: false, message: 'Belum diimplementasi' }) }
}