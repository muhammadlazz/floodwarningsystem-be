import {
  ApiResponse,
  BbwsStationCreateRequest,
  BbwsStationUpdateRequest,
  BbwsWaterLevelCreateRequest,
  BbwsWaterLevelUpdateRequest,
  Role,
  UserPayload,
} from '../types'
import { BbwsStationRepository } from '../repositories/BbwsStationRepository'
import { BbwsWaterLevelRepository } from '../repositories/BbwsWaterLevelRepository'
import { appCache } from '../utils/ttlCache'

const parseDate = (value: string) => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export class BbwsService {
  private stationRepository = new BbwsStationRepository()
  private waterLevelRepository = new BbwsWaterLevelRepository()

  private canWrite(user: UserPayload) {
    return user.role === Role.SUPER_ADMIN || user.role === Role.MASTER_ADMIN
  }

  async createStation(
    data: BbwsStationCreateRequest,
    requestor: UserPayload
  ): Promise<ApiResponse<any>> {
    try {
      if (!this.canWrite(requestor)) {
        return { success: false, message: 'Anda tidak memiliki akses untuk membuat station BBWS' }
      }

      if (!data.code || !data.name) {
        return { success: false, message: 'code dan name wajib diisi' }
      }

      const code = data.code.trim()
      const name = data.name.trim()
      if (code.length < 2) return { success: false, message: 'code minimal 2 karakter' }
      if (name.length < 2) return { success: false, message: 'name minimal 2 karakter' }

      if (data.latitude !== undefined && !Number.isFinite(data.latitude)) {
        return { success: false, message: 'latitude harus berupa angka' }
      }
      if (data.longitude !== undefined && !Number.isFinite(data.longitude)) {
        return { success: false, message: 'longitude harus berupa angka' }
      }

      const existing = await this.stationRepository.findByCode(code)
      if (existing) return { success: false, message: 'code station sudah terdaftar' }

      const created = await this.stationRepository.create({
        code,
        name,
        riverName: data.riverName?.trim() || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        isActive: data.isActive ?? true,
      })

      appCache.deleteByPrefix('bbws:stations:list:')

      return { success: true, message: 'Station BBWS berhasil dibuat', data: created }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async listStations(params: {
    page: number
    limit: number
    includeInactive?: boolean
  }): Promise<ApiResponse<{ items: any[]; page: number; limit: number; total: number }>> {
    try {
      const page = Number.isFinite(params.page) && params.page > 0 ? params.page : 1
      const limit =
        Number.isFinite(params.limit) && params.limit > 0 && params.limit <= 100 ? params.limit : 20
      const includeInactive = !!params.includeInactive
      const key = `bbws:stations:list:${includeInactive ? 'all' : 'active'}:${page}:${limit}`

      const data = await appCache.getOrSet(key, 60_000, async () => {
        const skip = (page - 1) * limit
        const isActive = includeInactive ? undefined : true

        const [items, total] = await Promise.all([
          this.stationRepository.findMany({ isActive, skip, take: limit }),
          this.stationRepository.count({ isActive }),
        ])

        return { items, page, limit, total }
      })

      return { success: true, message: 'OK', data }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async getStationById(id: number, options: { includeInactive?: boolean }): Promise<ApiResponse<any>> {
    try {
      const station = await this.stationRepository.findById(id)
      if (!station) return { success: false, message: 'Station BBWS tidak ditemukan' }
      if (!options.includeInactive && !station.isActive) {
        return { success: false, message: 'Station BBWS tidak ditemukan' }
      }
      return { success: true, message: 'OK', data: station }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async updateStation(
    id: number,
    data: BbwsStationUpdateRequest,
    requestor: UserPayload
  ): Promise<ApiResponse<any>> {
    try {
      if (!this.canWrite(requestor)) {
        return { success: false, message: 'Anda tidak memiliki akses untuk mengubah station BBWS' }
      }

      const existing = await this.stationRepository.findById(id)
      if (!existing) return { success: false, message: 'Station BBWS tidak ditemukan' }

      if (data.code !== undefined) {
        if (!data.code || data.code.trim().length < 2) {
          return { success: false, message: 'code minimal 2 karakter' }
        }
      }
      if (data.name !== undefined) {
        if (!data.name || data.name.trim().length < 2) {
          return { success: false, message: 'name minimal 2 karakter' }
        }
      }
      if (data.latitude !== undefined && data.latitude !== null && !Number.isFinite(data.latitude)) {
        return { success: false, message: 'latitude harus berupa angka' }
      }
      if (data.longitude !== undefined && data.longitude !== null && !Number.isFinite(data.longitude)) {
        return { success: false, message: 'longitude harus berupa angka' }
      }

      if (data.code) {
        const code = data.code.trim()
        const other = await this.stationRepository.findByCode(code)
        if (other && other.id !== id) return { success: false, message: 'code station sudah terdaftar' }
      }

      const updated = await this.stationRepository.update(id, {
        ...(data.code === undefined ? {} : { code: data.code.trim() }),
        ...(data.name === undefined ? {} : { name: data.name.trim() }),
        ...(data.riverName === undefined
          ? {}
          : { riverName: data.riverName ? data.riverName.trim() : null }),
        ...(data.latitude === undefined ? {} : { latitude: data.latitude }),
        ...(data.longitude === undefined ? {} : { longitude: data.longitude }),
        ...(data.isActive === undefined ? {} : { isActive: data.isActive }),
      })

      appCache.deleteByPrefix('bbws:stations:list:')

      return { success: true, message: 'Station BBWS berhasil diubah', data: updated }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async deleteStation(id: number, requestor: UserPayload): Promise<ApiResponse<null>> {
    try {
      if (!this.canWrite(requestor)) {
        return { success: false, message: 'Anda tidak memiliki akses untuk menghapus station BBWS' }
      }

      const existing = await this.stationRepository.findById(id)
      if (!existing) return { success: false, message: 'Station BBWS tidak ditemukan' }

      await this.stationRepository.delete(id)
      appCache.deleteByPrefix('bbws:stations:list:')
      return { success: true, message: 'Station BBWS berhasil dihapus', data: null }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async createWaterLevel(
    data: BbwsWaterLevelCreateRequest,
    requestor: UserPayload
  ): Promise<ApiResponse<any>> {
    try {
      if (!this.canWrite(requestor)) {
        return { success: false, message: 'Anda tidak memiliki akses untuk membuat data ketinggian sungai' }
      }

      if (!Number.isFinite(data.stationId) || !Number.isFinite(data.waterLevel) || !data.measuredAt) {
        return { success: false, message: 'stationId, waterLevel, dan measuredAt wajib diisi' }
      }

      const station = await this.stationRepository.findById(data.stationId)
      if (!station) return { success: false, message: 'Station BBWS tidak ditemukan' }

      const measuredAt = parseDate(data.measuredAt)
      if (!measuredAt) return { success: false, message: 'measuredAt tidak valid (ISO date string)' }

      const created = await this.waterLevelRepository.create({
        stationId: data.stationId,
        waterLevel: data.waterLevel,
        measuredAt,
        source: data.source,
      })

      appCache.deleteByPrefix('bbws:water-levels:list:')

      const full = await this.waterLevelRepository.findById(created.id)
      return { success: true, message: 'Data ketinggian sungai berhasil dibuat', data: full }
    } catch (error) {
      const msg = (error as Error).message
      if (msg.toLowerCase().includes('unique constraint') || msg.toLowerCase().includes('unique')) {
        return { success: false, message: 'Data dengan stationId dan measuredAt yang sama sudah ada' }
      }
      return { success: false, message: msg }
    }
  }

  async listWaterLevels(params: {
    page: number
    limit: number
    stationId?: number
    from?: string
    to?: string
  }): Promise<ApiResponse<{ items: any[]; page: number; limit: number; total: number }>> {
    try {
      const page = Number.isFinite(params.page) && params.page > 0 ? params.page : 1
      const limit =
        Number.isFinite(params.limit) && params.limit > 0 && params.limit <= 200 ? params.limit : 50
      const skip = (page - 1) * limit

      let from: Date | undefined
      if (params.from) {
        const parsed = parseDate(params.from)
        if (!parsed) return { success: false, message: 'from tidak valid (ISO date string)' }
        from = parsed
      }

      let to: Date | undefined
      if (params.to) {
        const parsed = parseDate(params.to)
        if (!parsed) return { success: false, message: 'to tidak valid (ISO date string)' }
        to = parsed
      }

      const stationId =
        params.stationId !== undefined && Number.isFinite(params.stationId) ? params.stationId : undefined

      const canCache = page === 1 && !from && !to
      if (canCache) {
        const key = `bbws:water-levels:list:${stationId ?? 'all'}:${limit}`
        const data = await appCache.getOrSet(key, 10_000, async () => {
          const [items, total] = await Promise.all([
            this.waterLevelRepository.findMany({ stationId, from, to, skip, take: limit }),
            this.waterLevelRepository.count({ stationId, from, to }),
          ])
          return { items, page, limit, total }
        })
        return { success: true, message: 'OK', data }
      }

      const [items, total] = await Promise.all([
        this.waterLevelRepository.findMany({ stationId, from, to, skip, take: limit }),
        this.waterLevelRepository.count({ stationId, from, to }),
      ])

      return { success: true, message: 'OK', data: { items, page, limit, total } }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async getWaterLevelById(id: number): Promise<ApiResponse<any>> {
    try {
      const item = await this.waterLevelRepository.findById(id)
      if (!item) return { success: false, message: 'Data ketinggian sungai tidak ditemukan' }
      if (!item.station.isActive) {
        return { success: false, message: 'Data ketinggian sungai tidak ditemukan' }
      }
      return { success: true, message: 'OK', data: item }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async updateWaterLevel(
    id: number,
    data: BbwsWaterLevelUpdateRequest,
    requestor: UserPayload
  ): Promise<ApiResponse<any>> {
    try {
      if (!this.canWrite(requestor)) {
        return { success: false, message: 'Anda tidak memiliki akses untuk mengubah data ketinggian sungai' }
      }

      const existing = await this.waterLevelRepository.findById(id)
      if (!existing) return { success: false, message: 'Data ketinggian sungai tidak ditemukan' }

      let measuredAt: Date | undefined
      if (data.measuredAt !== undefined) {
        const parsed = parseDate(data.measuredAt)
        if (!parsed) return { success: false, message: 'measuredAt tidak valid (ISO date string)' }
        measuredAt = parsed
      }

      if (data.stationId !== undefined) {
        if (!Number.isFinite(data.stationId)) {
          return { success: false, message: 'stationId harus berupa angka' }
        }
        const station = await this.stationRepository.findById(data.stationId)
        if (!station) return { success: false, message: 'Station BBWS tidak ditemukan' }
      }

      if (data.waterLevel !== undefined && !Number.isFinite(data.waterLevel)) {
        return { success: false, message: 'waterLevel harus berupa angka' }
      }

      const updated = await this.waterLevelRepository.update(id, {
        ...(data.stationId === undefined ? {} : { stationId: data.stationId }),
        ...(data.waterLevel === undefined ? {} : { waterLevel: data.waterLevel }),
        ...(measuredAt === undefined ? {} : { measuredAt }),
        ...(data.source === undefined ? {} : { source: data.source }),
      })

      appCache.deleteByPrefix('bbws:water-levels:list:')

      return { success: true, message: 'Data ketinggian sungai berhasil diubah', data: updated }
    } catch (error) {
      const msg = (error as Error).message
      if (msg.toLowerCase().includes('unique constraint') || msg.toLowerCase().includes('unique')) {
        return { success: false, message: 'Data dengan stationId dan measuredAt yang sama sudah ada' }
      }
      return { success: false, message: msg }
    }
  }

  async deleteWaterLevel(id: number, requestor: UserPayload): Promise<ApiResponse<null>> {
    try {
      if (!this.canWrite(requestor)) {
        return { success: false, message: 'Anda tidak memiliki akses untuk menghapus data ketinggian sungai' }
      }

      const existing = await this.waterLevelRepository.findById(id)
      if (!existing) return { success: false, message: 'Data ketinggian sungai tidak ditemukan' }

      await this.waterLevelRepository.delete(id)
      appCache.deleteByPrefix('bbws:water-levels:list:')
      return { success: true, message: 'Data ketinggian sungai berhasil dihapus', data: null }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }
}
