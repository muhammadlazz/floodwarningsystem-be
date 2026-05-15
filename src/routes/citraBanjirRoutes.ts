import { Router } from 'express'
import { ActivityLogController } from '../controllers/ActivityLogController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
const logController = new ActivityLogController()

// Log Citra Banjir
router.get('/citra-banjir/logs', authMiddleware, logController.getLogs)
router.get('/citra-banjir/logs/export', authMiddleware, logController.exportLogs)

export default router