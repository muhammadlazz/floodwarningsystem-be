import express from 'express'
import userRoutes from './routes/userRoutes'

const app = express()
const PORT = 3000

// Middleware
app.use(express.json())

// Routes
app.use('/', userRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`)
})