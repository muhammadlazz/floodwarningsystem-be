import { Router } from 'express'
import { BbwsController } from '../controllers/BbwsController'
import { authMiddleware } from '../middlewares/authMiddleware'
import { optionalAuthMiddleware } from '../middlewares/optionalAuthMiddleware'

const router = Router()
const bbwsController = new BbwsController()

router.get('/bbws/stations', optionalAuthMiddleware, bbwsController.listStations)
router.get('/bbws/stations/:id', optionalAuthMiddleware, bbwsController.getStationById)
router.post('/bbws/stations', authMiddleware, bbwsController.createStation)
router.put('/bbws/stations/:id', authMiddleware, bbwsController.updateStation)
router.delete('/bbws/stations/:id', authMiddleware, bbwsController.deleteStation)

router.get('/bbws/water-levels', bbwsController.listWaterLevels)
router.get('/bbws/water-levels/:id', bbwsController.getWaterLevelById)
router.post('/bbws/water-levels', authMiddleware, bbwsController.createWaterLevel)
router.put('/bbws/water-levels/:id', authMiddleware, bbwsController.updateWaterLevel)
router.delete('/bbws/water-levels/:id', authMiddleware, bbwsController.deleteWaterLevel)

router.post('/bbws/sync', authMiddleware, bbwsController.syncNow)

export default router
