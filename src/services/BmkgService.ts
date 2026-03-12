import { prisma } from '../config/database'

export class BmkgService {
  async createWeather(stationId: number, temperature: number, windSpeed: number, forecast: string, notes?: string) {
    return await prisma.bmkgWeather.create({
      data: {
        stationId,
        temperature,
        windSpeed,
        forecast,
        notes,
        measuredAt: new Date(),
      },
      include: { station: true }
    })
  }

  async createRainfall(stationId: number, rainfall: number) {
    return await prisma.bmkgRainfall.create({
      data: {
        stationId,
        rainfall,
        measuredAt: new Date(),
      },
      include: { station: true }
    })
  }

  async getRainfallHistory(limit: number = 5) {
    return await prisma.bmkgRainfall.findMany({
      take: limit,
      orderBy: { measuredAt: 'desc' },
      include: { station: { select: { name: true, code: true } } }
    })
  }

  // Placeholder untuk modul monitoring (stats & trend)
  async getStats() { return {} }
  async getPrecipitationTrend() { return [] }
  async getTemperatureFluctuation() { return [] }
}