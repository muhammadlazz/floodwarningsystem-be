import { Router } from 'express'
import { RegionUpdateController } from '../controllers/RegionUpdateController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
const controller = new RegionUpdateController()

router.post('/regions', authMiddleware, controller.create)
router.get('/regions', authMiddleware, controller.getAll)
router.put('/regions/:id', authMiddleware, controller.update)
router.delete('/regions/:id', authMiddleware, controller.delete)

export default router