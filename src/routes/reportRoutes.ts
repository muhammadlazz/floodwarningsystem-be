import { Router } from 'express'
import { ReportController } from '../controllers/ReportController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
const controller = new ReportController()

router.post('/reports', authMiddleware, controller.create)
router.get('/reports', authMiddleware, controller.getAll)
router.put('/reports/:id', authMiddleware, controller.update)
router.delete('/reports/:id', authMiddleware, controller.delete)

export default router