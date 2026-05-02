import { Router } from 'express'
import { UserController } from '../controllers/UserController'
import { ActivityLogController } from '../controllers/ActivityLogController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
const userController = new UserController()
const logController = new ActivityLogController()

// Management Users
router.get('/bpbd-jabar/users', authMiddleware, userController.getAllUsers)
router.post('/bpbd-jabar/users', authMiddleware, userController.createUser)
router.delete('/bpbd-jabar/users/:id', authMiddleware, userController.deleteUser)

// DIPISAH: method spesifik untuk profile dan password
router.patch('/bpbd-jabar/profile', authMiddleware, userController.updateProfile)
router.patch('/bpbd-jabar/password', authMiddleware, userController.updatePassword)

// Logs (Sudah Sempurna)
router.get('/bpbd-jabar/logs', authMiddleware, logController.getLogs)
router.get('/bpbd-jabar/logs/export', authMiddleware, logController.exportLogs)

export default router