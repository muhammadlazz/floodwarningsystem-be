import { Router } from 'express'
import { BbwsController } from '../controllers/BbwsController'
import { UserController } from '../controllers/UserController'
import { ActivityLogController } from '../controllers/ActivityLogController'
import { authMiddleware } from '../middlewares/authMiddleware'
import { optionalAuthMiddleware } from '../middlewares/optionalAuthMiddleware'

const router = Router()
const bbwsController = new BbwsController()
const userController = new UserController()
const logController = new ActivityLogController()

// update and transactions
router.get('/bbws/locations', optionalAuthMiddleware, bbwsController.listStations) 
router.post('/bbws/tma', authMiddleware, bbwsController.createWaterLevel) 
router.post('/bbws/debit', authMiddleware, bbwsController.createDebit)
router.post('/bbws/rainfall', authMiddleware, bbwsController.createRainfall)
router.get('/bbws/history-live', optionalAuthMiddleware, bbwsController.getHistoryLive)

// monitoring
router.get('/bbws/stats', optionalAuthMiddleware, bbwsController.getStats)
router.get('/bbws/tma-trend', optionalAuthMiddleware, bbwsController.getTmaTrend)
router.get('/bbws/rainfall-trend', optionalAuthMiddleware, bbwsController.getRainfallTrend)

router.get('/bbws/stations/:id', optionalAuthMiddleware, bbwsController.getStationById)
router.post('/bbws/stations', authMiddleware, bbwsController.createStation)
router.put('/bbws/stations/:id', authMiddleware, bbwsController.updateStation)
router.delete('/bbws/stations/:id', authMiddleware, bbwsController.deleteStation)
router.get('/bbws/water-levels', bbwsController.listWaterLevels)
router.get('/bbws/water-levels/:id', bbwsController.getWaterLevelById)
router.put('/bbws/water-levels/:id', authMiddleware, bbwsController.updateWaterLevel)
router.delete('/bbws/water-levels/:id', authMiddleware, bbwsController.deleteWaterLevel)
router.post('/bbws/sync', authMiddleware, bbwsController.syncNow)

// management users
router.get('/bbws/users', authMiddleware, userController.getAllUsers)
router.post('/bbws/users', authMiddleware, userController.createUser)
router.delete('/bbws/users/:id', authMiddleware, userController.deleteUser)
router.patch('/bbws/profile', authMiddleware, userController.updateUser)
router.patch('/bbws/password', authMiddleware, userController.updateUser)
router.get('/bbws/logs', authMiddleware, logController.getLogs)
router.get('/bbws/logs/export', authMiddleware, logController.exportLogs)

export default router