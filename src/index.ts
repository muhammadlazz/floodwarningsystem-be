import 'dotenv/config';
import express from 'express';
import { prisma } from './config/database';
import userRoutes from './routes/userRoutes';
import feedbackRoutes from './routes/feedbackRoutes';

const app = express();
const PORT = process.env.PORT || 3000; // Use env port if available

// Middleware
app.use(express.json());

// Routes
// Consider adding a version prefix like '/api'
app.use('/users', userRoutes); 
app.use('/feedback', feedbackRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    // Optional: Check DB connectivity during health check
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});

// Handle Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('HTTP server and Prisma connection closed');
  });
});