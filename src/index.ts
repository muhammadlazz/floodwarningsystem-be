import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { prisma } from './config/database';
import userRoutes from './routes/userRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import infographicRoutes from './routes/infographicRoutes';
import bbwsRoutes from './routes/bbwsRoutes';
import activityLogRoutes from './routes/activityLogRoutes';
import reportRoutes from './routes/reportRoutes';
import regionUpdateRoutes from './routes/regionUpdateRoutes';
import bmkgRoutes from './routes/bmkgRoutes';
import bpbdRoutes from './routes/bpbdRoutes';
import citraBanjirRoutes from './routes/citraBanjirRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { startBbwsSyncJob } from './jobs/bbwsSyncJob';

const app = express();
const PORT = process.env.PORT || 3000;

// Global Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi setelah 15 menit'
  }
});

// Security Middleware
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api', userRoutes);
app.use('/api', infographicRoutes);
app.use('/api', bbwsRoutes);
app.use('/api', bmkgRoutes);
app.use('/api', bpbdRoutes);
app.use('/api', citraBanjirRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', activityLogRoutes);
app.use('/api', reportRoutes);
app.use('/api', regionUpdateRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Optional: Check DB connectivity during health check
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Global error handler (must be after all routes)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const bbwsJob = startBbwsSyncJob();

// Handle Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    bbwsJob.stop();
    await prisma.$disconnect();
    console.log('HTTP server and Prisma connection closed');
  });
});
