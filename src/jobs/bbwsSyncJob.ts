import http from 'http'
import https from 'https'
import { BbwsStationRepository } from '../repositories/BbwsStationRepository'
import { BbwsWaterLevelRepository } from '../repositories/BbwsWaterLevelRepository'
import { appCache } from '../utils/ttlCache'

type BbwsSyncItem = {
  stationCode: string
  stationName?: string
  riverName?: string
  latitude?: number
  longitude?: number
  waterLevel: number
  measuredAt: string
  source?: string
}

const fetchJson = async (url: string, timeoutMs: number) => {
  return await new Promise<any>((resolve, reject) => {
    const parsed = new URL(url)
    const client = parsed.protocol === 'http:' ? http : https

    const req = client.get(parsed, { timeout: timeoutMs }, (res) => {
      const status = res.statusCode || 0
      const chunks: Buffer[] = []
      res.on('data', (d) => chunks.push(Buffer.from(d)))
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8')
        if (status < 200 || status >= 300) {
          return reject(new Error(`BBWS sync HTTP ${status}: ${raw.slice(0, 500)}`))
        }
        try {
          resolve(JSON.parse(raw))
        } catch {
          reject(new Error('BBWS sync response bukan JSON valid'))
        }
      })
    })

    req.on('timeout', () => {
      req.destroy(new Error('BBWS sync timeout'))
    })
    req.on('error', (err) => reject(err))
  })
}

export const runBbwsSyncOnce = async () => {
  const url = process.env.BBWS_SYNC_URL
  if (!url) {
    return { success: false, message: 'BBWS_SYNC_URL belum diisi', data: null }
  }

  const timeoutMs = process.env.BBWS_SYNC_TIMEOUT_MS
    ? Number(process.env.BBWS_SYNC_TIMEOUT_MS)
    : 15000

  const stationRepo = new BbwsStationRepository()
  const waterLevelRepo = new BbwsWaterLevelRepository()

  const payload = await fetchJson(url, Number.isFinite(timeoutMs) ? timeoutMs : 15000)
  const items: BbwsSyncItem[] = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : []

  let stationsUpserted = 0
  let readingsUpserted = 0
  let skipped = 0

  for (const item of items) {
    const code = typeof item.stationCode === 'string' ? item.stationCode.trim() : ''
    if (!code) {
      skipped++
      continue
    }

    if (typeof item.waterLevel !== 'number' || !Number.isFinite(item.waterLevel)) {
      skipped++
      continue
    }

    const measuredAt = new Date(item.measuredAt)
    if (Number.isNaN(measuredAt.getTime())) {
      skipped++
      continue
    }

    const station = await stationRepo.upsertByCode(code, {
      name: item.stationName?.trim() || undefined,
      riverName: item.riverName?.trim() || undefined,
      latitude: item.latitude === undefined ? undefined : item.latitude,
      longitude: item.longitude === undefined ? undefined : item.longitude,
      isActive: true,
    })
    stationsUpserted++

    await waterLevelRepo.upsertUnique({
      stationId: station.id,
      measuredAt,
      waterLevel: item.waterLevel,
      source: item.source || 'BBWS',
    })
    readingsUpserted++
  }

  if (stationsUpserted > 0) appCache.deleteByPrefix('bbws:stations:list:')
  if (readingsUpserted > 0) appCache.deleteByPrefix('bbws:water-levels:list:')

  return {
    success: true,
    message: 'BBWS sync selesai',
    data: { stationsUpserted, readingsUpserted, skipped, total: items.length },
  }
}

export const startBbwsSyncJob = () => {
  const enabled = process.env.BBWS_SYNC_ENABLED === 'true'
  if (!enabled) return { stop: () => undefined }

  const intervalMs = process.env.BBWS_SYNC_INTERVAL_MS
    ? Number(process.env.BBWS_SYNC_INTERVAL_MS)
    : 5 * 60 * 1000

  const interval = Number.isFinite(intervalMs) && intervalMs > 30_000 ? intervalMs : 5 * 60 * 1000

  let running = false

  const tick = async () => {
    if (running) return
    running = true
    try {
      await runBbwsSyncOnce()
    } finally {
      running = false
    }
  }

  void tick()
  const handle = setInterval(() => void tick(), interval)

  return {
    stop: () => clearInterval(handle),
  }
}
