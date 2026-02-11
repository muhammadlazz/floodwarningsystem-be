import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import userRoutes from './routes/userRoutes'

const app = express()
const PORT = process.env.PORT || 3000

// CORS middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 requests per windowMs
  message: { success: false, message: 'Terlalu banyak percobaan, coba lagi dalam 15 menit' },
  standardHeaders: true,
  legacyHeaders: false,
})

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // max 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
app.use(express.json())
app.use(generalLimiter)

// Apply stricter rate limit to auth routes
app.use('/auth', authLimiter)

// Routes
app.use('/', userRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err.message)
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`)
})