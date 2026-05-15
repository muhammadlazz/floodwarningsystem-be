import { Router } from 'express'
import { UserController } from '../controllers/UserController'
import { ActivityLogController } from '../controllers/ActivityLogController'
import { authMiddleware } from '../middlewares/authMiddleware'

const router = Router()
const userController = new UserController()
const logController = new ActivityLogController()

// prefix
const bpbdPrefixes = ['/bpbd-jabar', '/bpbd-kab']

bpbdPrefixes.forEach((prefix) => {
  // management users
  router.get(`${prefix}/users`, authMiddleware, userController.getAllUsers)
  router.post(`${prefix}/users`, authMiddleware, userController.createUser)
  router.delete(`${prefix}/users/:id`, authMiddleware, userController.deleteUser)
  router.patch(`${prefix}/profile`, authMiddleware, userController.updateProfile)
  router.patch(`${prefix}/password`, authMiddleware, userController.updatePassword)

  // logs
  router.get(`${prefix}/logs`, authMiddleware, logController.getLogs)
  router.get(`${prefix}/logs/export`, authMiddleware, logController.exportLogs)
})

export default router