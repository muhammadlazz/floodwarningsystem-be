import { Router } from 'express'
import { FeedbackController } from '../controllers/FeedbackController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
const controller = new FeedbackController()

router.post('/feedback', controller.create)
router.get('/feedback', authMiddleware, controller.getAll)
router.put('/feedback/:id/read', authMiddleware, controller.markAsRead)

export default router