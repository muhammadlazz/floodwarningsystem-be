import { prisma } from '../config/database';

export class FeedbackRepository {
  // Create new feedback
  async create(data: { name: string; email: string; description: string; whatsapp: string }) {
    return await prisma.feedback.create({
      data,
    });
  }

  // Get all feedbacks (Latest first) with optional pagination
  async findAll(params?: { skip?: number; take?: number }) {
    return await prisma.feedback.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      skip: params?.skip,
      take: params?.take,
    });
  }

  // Count total feedbacks
  async count() {
    return await prisma.feedback.count();
  }
}