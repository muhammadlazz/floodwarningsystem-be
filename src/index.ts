import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { prisma } from './config/database';
import userRoutes from './routes/userRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import infographicRoutes from './routes/infographicRoutes';
import bbwsRoutes from './routes/bbwsRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { startBbwsSyncJob } from './jobs/bbwsSyncJob';

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
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
app.use('/api/feedback', feedbackRoutes);

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
