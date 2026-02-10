import { FeedbackRepository } from '../repositories/FeedbackRepository';

export class FeedbackService {
  private feedbackRepo: FeedbackRepository;

  constructor() {
    this.feedbackRepo = new FeedbackRepository();
  }

  async submitFeedback(data: { name: string; email: string; description: string; whatsapp: string }) {
    // Basic validation
    if (!data.name || !data.email || !data.description || !data.whatsapp) {
      throw new Error('All fields (Name, Email, Deskripsi, Whatsapp) are required');
    }

    // You could add email format validation here if needed
    
    return await this.feedbackRepo.create(data);
  }

  async getAllFeedbacks() {
    return await this.feedbackRepo.findAll();
  }
}