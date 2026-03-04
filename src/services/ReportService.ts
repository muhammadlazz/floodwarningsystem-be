import { ReportRepository } from '../repositories/ReportRepository'
import { ReportCreateRequest, ReportUpdateRequest } from '../types'

export class ReportService {
  private repository = new ReportRepository()

  async createReport(data: ReportCreateRequest) {
    try {
      if (!data.reporterName || !data.location || !data.impact) {
        return { success: false, message: 'Nama pelapor, lokasi, dan dampak wajib diisi' }
      }
      const report = await this.repository.create(data)
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

  async updateReport(id: number, data: ReportUpdateRequest) {
    try {
      const existing = await this.repository.findById(id)
      if (!existing) return { success: false, message: 'Laporan tidak ditemukan' }

      const updated = await this.repository.update(id, data)
      return { success: true, message: 'Laporan berhasil diupdate', data: updated }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async deleteReport(id: number) {
    try {
      const existing = await this.repository.findById(id)
      if (!existing) return { success: false, message: 'Laporan tidak ditemukan' }

      await this.repository.delete(id)
      return { success: true, message: 'Laporan berhasil dihapus' }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }
}