import { FeedbackRepository } from '../repositories/FeedbackRepository'
import { validateEmail } from '../utils/validators'

export class FeedbackService {
  private repository = new FeedbackRepository()

  async createFeedback(data: { name: string; email: string; whatsapp: string; description: string }) {
    try {
      if (!data.name || !data.email || !data.whatsapp || !data.description) {
        return { success: false, message: 'Semua field wajib diisi' }
      }
      if (!validateEmail(data.email)) return { success: false, message: 'Format email tidak valid' }

      const feedback = await this.repository.create(data)
      return { success: true, message: 'Feedback berhasil dikirim', data: feedback }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async getAllFeedback() {
    try {
      const feedback = await this.repository.findAll()
      return { success: true, data: feedback }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }

  async markAsRead(id: number) {
    try {
      const feedback = await this.repository.findById(id)
      if (!feedback) return { success: false, message: 'Feedback tidak ditemukan' }

      const updated = await this.repository.markAsRead(id)
      return { success: true, message: 'Feedback ditandai terbaca', data: updated }
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  }
}