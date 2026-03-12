import { Router } from 'express'
import { BmkgController } from '../controllers/BmkgController'
import { UserController } from '../controllers/UserController'
import { ActivityLogController } from '../controllers/ActivityLogController'
import { authMiddleware } from '../middlewares/authMiddleware'
import { optionalAuthMiddleware } from '../middlewares/optionalAuthMiddleware'

const router = Router()
const bmkgController = new BmkgController()
const userController = new UserController()
const logController = new ActivityLogController()

// monitoring
router.get('/bmkg/stats', optionalAuthMiddleware, bmkgController.getStats)
router.get('/bmkg/precipitation-trend', optionalAuthMiddleware, bmkgController.getPrecipitationTrend)
router.get('/bmkg/temperature-fluctuation', optionalAuthMiddleware, bmkgController.getTemperatureFluctuation)

// update weathers data
router.post('/bmkg/weather', authMiddleware, bmkgController.createWeather)
router.post('/bmkg/rainfall', authMiddleware, bmkgController.createRainfall)
router.get('/bmkg/rainfall-history', optionalAuthMiddleware, bmkgController.getRainfallHistory)

// management users
router.get('/bmkg/users', authMiddleware, userController.getAllUsers)
router.post('/bmkg/users', authMiddleware, userController.createUser)
router.delete('/bmkg/users/:id', authMiddleware, userController.deleteUser)
router.patch('/bmkg/profile', authMiddleware, userController.updateUser)
router.patch('/bmkg/password', authMiddleware, userController.updateUser)
router.get('/bmkg/logs', authMiddleware, logController.getLogs)
router.get('/bmkg/logs/export', authMiddleware, logController.exportLogs)

export default router