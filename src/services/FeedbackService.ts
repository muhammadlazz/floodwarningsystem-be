import { FeedbackRepository } from '../repositories/FeedbackRepository';
import { validateEmail } from '../utils/validators';

export class FeedbackService {
  private feedbackRepo: FeedbackRepository;

  constructor() {
    this.feedbackRepo = new FeedbackRepository();
  }

  async submitFeedback(data: { name: string; email: string; description: string; whatsapp: string }) {
    // Basic validation
    if (!data.name || !data.email || !data.description || !data.whatsapp) {
      throw new Error('Semua field (Name, Email, Deskripsi, Whatsapp) wajib diisi');
    }

    // Email format validation
    if (!validateEmail(data.email)) {
      throw new Error('Format email tidak valid');
    }

    // Whatsapp format validation (digits only, 10-15 chars)
    const cleanWhatsapp = data.whatsapp.replace(/[\s\-\+]/g, '');
    if (cleanWhatsapp.length < 10 || cleanWhatsapp.length > 15 || !/^\d+$/.test(cleanWhatsapp)) {
      throw new Error('Format nomor WhatsApp tidak valid (10-15 digit)');
    }

    return await this.feedbackRepo.create(data);
  }

  async getAllFeedbacks(params: { page: number; limit: number }) {
    const page = Number.isFinite(params.page) && params.page > 0 ? params.page : 1;
    const limit = Number.isFinite(params.limit) && params.limit > 0 && params.limit <= 100 ? params.limit : 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.feedbackRepo.findAll({ skip, take: limit }),
      this.feedbackRepo.count(),
    ]);

    return { items, page, limit, total };
  }
}