import { Router } from 'express'
import { UserController } from '../controllers/UserController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
const userController = new UserController()

// Public routes
router.post('/auth/register', (req, res) => userController.register(req, res))
router.post('/auth/login', (req, res) => userController.login(req, res))

// Protected routes
router.get('/users', authMiddleware, (req, res) =>
  userController.getAllUsers(req, res)
)
router.get('/users/:id', authMiddleware, (req, res) =>
  userController.getUserById(req, res)
)

export default router