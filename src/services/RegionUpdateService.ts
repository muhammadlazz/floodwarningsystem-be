import { RegionUpdateRepository } from '../repositories/RegionUpdateRepository'
import { RegionUpdateCreateRequest, RegionUpdateUpdateRequest } from '../types'

export class RegionUpdateService {
  private repository = new RegionUpdateRepository()

  async createRegionUpdate(data: RegionUpdateCreateRequest) {
    try {
      if (!data.regionName) {
        return { success: false, message: 'Nama wilayah wajib diisi' }
      }
      const regionUpdate = await this.repository.create(data)
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

  async updateRegionUpdate(id: number, data: RegionUpdateUpdateRequest) {
    try {
      const existing = await this.repository.findById(id)
      if (!existing) return { success: false, message: 'Data wilayah tidak ditemukan' }

      const updated = await this.repository.update(id, data)
      return { success: true, message: 'Data wilayah berhasil diupdate', data: updated }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async deleteRegionUpdate(id: number) {
    try {
      const existing = await this.repository.findById(id)
      if (!existing) return { success: false, message: 'Data wilayah tidak ditemukan' }

      await this.repository.delete(id)
      return { success: true, message: 'Data wilayah berhasil dihapus' }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }
}