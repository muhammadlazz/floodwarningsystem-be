import { prisma } from '../config/database'
import { RegionUpdateRepository } from '../repositories/RegionUpdateRepository'
import { ActivityLogService } from './ActivityLogService'
import { RegionUpdateCreateRequest, RegionUpdateUpdateRequest, UserPayload } from '../types'
import { LogAction } from '@prisma/client'

export class RegionUpdateService {
  private repository = new RegionUpdateRepository()
  private logService = new ActivityLogService()

  async createRegionUpdate(data: RegionUpdateCreateRequest, requestor: UserPayload) {
    try {
      if (!data.regionName) {
        return { success: false, message: 'Nama wilayah wajib diisi' }
      }
      
      // Jika frontend mengirim tanggal spesifik, gunakan itu. Jika tidak, gunakan waktu sekarang.
      const recordedAt = data.recordedAt ? new Date(data.recordedAt) : new Date()

      const regionUpdate = await this.repository.create({ ...data, recordedAt })

      this.logService.logAction(requestor.id, LogAction.CREATE, 'RegionUpdate', `Menambahkan pembaruan wilayah: ${data.regionName}`)

      return { success: true, message: 'Update wilayah berhasil ditambahkan', data: regionUpdate }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async getAllRegionUpdates() {
    try {
      const updates = await this.repository.findAll()
      return { success: true, data: updates }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async updateRegionUpdate(id: number, data: RegionUpdateUpdateRequest, requestor: UserPayload) {
    try {
      const existing = await this.repository.findById(id)
      if (!existing) return { success: false, message: 'Data wilayah tidak ditemukan' }

      const updated = await this.repository.update(id, data)

      this.logService.logAction(requestor.id, LogAction.UPDATE, 'RegionUpdate', `Memperbarui data kebencanaan di wilayah: ${existing.regionName}`)

      return { success: true, message: 'Data wilayah berhasil diupdate', data: updated }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async deleteRegionUpdate(id: number, requestor: UserPayload) {
    try {
      const existing = await this.repository.findById(id)
      if (!existing) return { success: false, message: 'Data wilayah tidak ditemukan' }

      await this.repository.delete(id)

      this.logService.logAction(requestor.id, LogAction.DELETE, 'RegionUpdate', `Menghapus data wilayah: ${existing.regionName}`)

      return { success: true, message: 'Data wilayah berhasil dihapus' }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async getMapStats(startDate?: string, endDate?: string) {
    try {
      // Query data berdasarkan rentang waktu jika diberikan parameter
      const dateFilter: any = {}
      if (startDate && endDate) {
        dateFilter.recordedAt = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }

      const updates = await prisma.regionUpdate.findMany({
        where: dateFilter,
        orderBy: { recordedAt: 'desc' }
      })

      return { success: true, data: updates }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }
}