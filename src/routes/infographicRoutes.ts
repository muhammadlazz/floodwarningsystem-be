import { Router } from 'express'
import { InfographicController } from '../controllers/InfographicController'
import { authMiddleware } from '../middlewares/authMiddleware'
import { optionalAuthMiddleware } from '../middlewares/optionalAuthMiddleware'

const router = Router()
const infographicController = new InfographicController()

router.get('/infographics', optionalAuthMiddleware, infographicController.list)
router.get('/infographics/:id', optionalAuthMiddleware, infographicController.getById)
router.post('/infographics', authMiddleware, infographicController.create)
router.put('/infographics/:id', authMiddleware, infographicController.update)
router.delete('/infographics/:id', authMiddleware, infographicController.delete)

export default router

