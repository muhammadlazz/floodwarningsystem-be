import { ReportRepository } from '../repositories/ReportRepository'
import { ActivityLogService } from './ActivityLogService'
import { ReportCreateRequest, ReportUpdateRequest, UserPayload } from '../types'
import { LogAction } from '@prisma/client'

export class ReportService {
  private repository = new ReportRepository()
  private logService = new ActivityLogService()

  async createReport(data: ReportCreateRequest, requestor: UserPayload) {
    try {
      if (!data.reporterName || !data.location || !data.impact) {
        return { success: false, message: 'Nama pelapor, lokasi, dan dampak wajib diisi' }
      }
      const report = await this.repository.create(data)

      this.logService.logAction(requestor.id, LogAction.CREATE, 'Report', `Menambahkan laporan dari ${data.reporterName} di ${data.location}`)

      return { success: true, message: 'Laporan berhasil dibuat', data: report }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async getAllReports() {
    try {
      const reports = await this.repository.findAll()
      return { success: true, data: reports }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async updateReport(id: number, data: ReportUpdateRequest, requestor: UserPayload) {
    try {
      const existing = await this.repository.findById(id)
      if (!existing) return { success: false, message: 'Laporan tidak ditemukan' }

      const updated = await this.repository.update(id, data)

      this.logService.logAction(requestor.id, LogAction.UPDATE, 'Report', `Mengubah status/data laporan ID: ${id}`)

      return { success: true, message: 'Laporan berhasil diupdate', data: updated }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async deleteReport(id: number, requestor: UserPayload) {
    try {
      const existing = await this.repository.findById(id)
      if (!existing) return { success: false, message: 'Laporan tidak ditemukan' }

      await this.repository.delete(id)

      this.logService.logAction(requestor.id, LogAction.DELETE, 'Report', `Menghapus laporan ID: ${id}`)

      return { success: true, message: 'Laporan berhasil dihapus' }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }
}