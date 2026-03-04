import { prisma } from '../config/database'

export class FeedbackRepository {
  async create(data: { name: string; email: string; whatsapp: string; description: string }) {
    return await prisma.feedback.create({ data })
  }

  async findAll() {
    return await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async findById(id: number) {
    return await prisma.feedback.findUnique({ where: { id } })
  }

  async markAsRead(id: number) {
    return await prisma.feedback.update({
      where: { id },
      data: { isRead: true },
    })
  }
}