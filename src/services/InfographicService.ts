import { Role, UserPayload, ApiResponse, InfographicCreateRequest, InfographicUpdateRequest } from '../types'
import { InfographicRepository } from '../repositories/InfographicRepository'
import { appCache } from '../utils/ttlCache'

const isValidUrl = (value: string) => {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

const parseOptionalDate = (value: string | null | undefined) => {
  if (value === undefined) return undefined
  if (value === null) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return undefined
  return d
}

export class InfographicService {
  private infographicRepository = new InfographicRepository()

  private canWrite(user: UserPayload) {
    return user.role === Role.SUPER_ADMIN || user.role === Role.MASTER_ADMIN
  }

  async createInfographic(
    data: InfographicCreateRequest,
    requestor: UserPayload
  ): Promise<ApiResponse<any>> {
    try {
      if (!this.canWrite(requestor)) {
        return { success: false, message: 'Anda tidak memiliki akses untuk membuat infografis' }
      }

      if (!data.title || !data.imageUrl) {
        return { success: false, message: 'title dan imageUrl wajib diisi' }
      }

      if (data.title.trim().length < 3) {
        return { success: false, message: 'title minimal 3 karakter' }
      }

      if (!isValidUrl(data.imageUrl)) {
        return { success: false, message: 'imageUrl harus berupa URL yang valid' }
      }

      if (data.linkUrl && !isValidUrl(data.linkUrl)) {
        return { success: false, message: 'linkUrl harus berupa URL yang valid' }
      }

      const startAt = parseOptionalDate(data.startAt)
      if (data.startAt !== undefined && startAt === undefined) {
        return { success: false, message: 'startAt tidak valid (ISO date string)' }
      }
      const endAt = parseOptionalDate(data.endAt)
      if (data.endAt !== undefined && endAt === undefined) {
        return { success: false, message: 'endAt tidak valid (ISO date string)' }
      }

      if (startAt && endAt && startAt > endAt) {
        return { success: false, message: 'startAt tidak boleh melebihi endAt' }
      }

      const created = await this.infographicRepository.create({
        title: data.title.trim(),
        description: data.description?.trim() || null,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl?.trim() || null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        startAt: startAt ?? null,
        endAt: endAt ?? null,
      })

      appCache.deleteByPrefix('infographics:list:')
      appCache.delete(`infographics:id:active:${created.id}`)

      return { success: true, message: 'Infografis berhasil dibuat', data: created }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async getInfographicById(
    id: number,
    options: { includeInactive?: boolean }
  ): Promise<ApiResponse<any>> {
    try {
      if (!options.includeInactive) {
        const cached = appCache.get<any>(`infographics:id:active:${id}`)
        if (cached) return { success: true, message: 'OK', data: cached }
      }

      const item = await this.infographicRepository.findById(id)
      if (!item) return { success: false, message: 'Infografis tidak ditemukan' }

      if (!options.includeInactive && !item.isActive) {
        return { success: false, message: 'Infografis tidak ditemukan' }
      }

      if (!options.includeInactive) {
        appCache.set(`infographics:id:active:${id}`, item, 60_000)
      }

      return { success: true, message: 'OK', data: item }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async listInfographics(params: {
    page: number
    limit: number
    includeInactive?: boolean
  }): Promise<ApiResponse<{ items: any[]; page: number; limit: number; total: number }>> {
    try {
      const page = Number.isFinite(params.page) && params.page > 0 ? params.page : 1
      const limit =
        Number.isFinite(params.limit) && params.limit > 0 && params.limit <= 100 ? params.limit : 20

      const includeInactive = !!params.includeInactive
      const key = `infographics:list:${includeInactive ? 'all' : 'active'}:${page}:${limit}`

      const data = await appCache.getOrSet(key, 30_000, async () => {
        const isActive = includeInactive ? undefined : true
        const skip = (page - 1) * limit

        const [items, total] = await Promise.all([
          this.infographicRepository.findMany({ isActive, skip, take: limit }),
          this.infographicRepository.count({ isActive }),
        ])

        return { items, page, limit, total }
      })

      return { success: true, message: 'OK', data }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async updateInfographic(
    id: number,
    data: InfographicUpdateRequest,
    requestor: UserPayload
  ): Promise<ApiResponse<any>> {
    try {
      if (!this.canWrite(requestor)) {
        return { success: false, message: 'Anda tidak memiliki akses untuk mengubah infografis' }
      }

      const existing = await this.infographicRepository.findById(id)
      if (!existing) return { success: false, message: 'Infografis tidak ditemukan' }

      if (data.title !== undefined) {
        if (!data.title || data.title.trim().length < 3) {
          return { success: false, message: 'title minimal 3 karakter' }
        }
      }

      if (data.imageUrl !== undefined) {
        if (!data.imageUrl || !isValidUrl(data.imageUrl)) {
          return { success: false, message: 'imageUrl harus berupa URL yang valid' }
        }
      }

      if (data.linkUrl !== undefined && data.linkUrl !== null && data.linkUrl !== '') {
        if (!isValidUrl(data.linkUrl)) {
          return { success: false, message: 'linkUrl harus berupa URL yang valid' }
        }
      }

      const startAt = parseOptionalDate(data.startAt)
      if (data.startAt !== undefined && startAt === undefined) {
        return { success: false, message: 'startAt tidak valid (ISO date string)' }
      }
      const endAt = parseOptionalDate(data.endAt)
      if (data.endAt !== undefined && endAt === undefined) {
        return { success: false, message: 'endAt tidak valid (ISO date string)' }
      }

      const nextStart = startAt === undefined ? existing.startAt : startAt
      const nextEnd = endAt === undefined ? existing.endAt : endAt
      if (nextStart && nextEnd && nextStart > nextEnd) {
        return { success: false, message: 'startAt tidak boleh melebihi endAt' }
      }

      const updated = await this.infographicRepository.update(id, {
        title: data.title === undefined ? undefined : data.title.trim(),
        description:
          data.description === undefined ? undefined : data.description ? data.description.trim() : null,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl === undefined ? undefined : data.linkUrl ? data.linkUrl.trim() : null,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        startAt,
        endAt,
      })

      appCache.deleteByPrefix('infographics:list:')
      appCache.delete(`infographics:id:active:${id}`)

      return { success: true, message: 'Infografis berhasil diubah', data: updated }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async deleteInfographic(id: number, requestor: UserPayload): Promise<ApiResponse<null>> {
    try {
      if (!this.canWrite(requestor)) {
        return { success: false, message: 'Anda tidak memiliki akses untuk menghapus infografis' }
      }

      const existing = await this.infographicRepository.findById(id)
      if (!existing) return { success: false, message: 'Infografis tidak ditemukan' }

      await this.infographicRepository.delete(id)
      appCache.deleteByPrefix('infographics:list:')
      appCache.delete(`infographics:id:active:${id}`)
      return { success: true, message: 'Infografis berhasil dihapus', data: null }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }
}
