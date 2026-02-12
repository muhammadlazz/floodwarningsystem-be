import { prisma } from '../config/database';

export class FeedbackRepository {
  // Create new feedback
  async create(data: { name: string; email: string; description: string; whatsapp: string }) {
    return await prisma.feedback.create({
      data,
    });
  }

  // Get all feedbacks (Latest first)
  async findAll() {
    return await prisma.feedback.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}