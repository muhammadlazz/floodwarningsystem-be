import { Router } from 'express'
import { UserController } from '../controllers/UserController'
import { authMiddleware } from '../middlewares/authMiddleware'
import rateLimit from 'express-rate-limit' // 1. Import this

const router = Router()
const userController = new UserController()

// --- SECURITY: Rate Limiter ---
// Limit to 5 login/register attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, 
  message: {
    success: false,
    message: "Too many login/register attempts. Please try again later."
  }
})

// --- Public Routes ---
// Apply limiter + Pass method directly (Cleaner syntax)
router.post('/auth/register', authLimiter, userController.register)
router.post('/auth/login', authLimiter, userController.login)

// --- Protected Routes ---
router.get('/users', authMiddleware, userController.getAllUsers)
router.get('/users/:id', authMiddleware, userController.getUserById)
router.post('/users', authMiddleware, userController.createUser)
router.delete('/users/:id', authMiddleware, userController.deleteUser)

export default router