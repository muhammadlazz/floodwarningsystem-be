import { Router } from 'express'
import { ActivityLogController } from '../controllers/ActivityLogController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
const controller = new ActivityLogController()

router.get('/logs', authMiddleware, controller.getLogs)

export default router