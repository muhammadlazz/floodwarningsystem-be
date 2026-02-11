import { Router } from 'express';
import { FeedbackController } from '../controllers/FeedbackController';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../middlewares/authMiddleware'; // Assuming you have this

const router = Router();
const feedbackController = new FeedbackController();

// --- SECURITY CONFIGURATION ---

// Rate Limiter: Allow only 5 requests per 15 minutes from the same IP
const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many feedback submissions from this IP, please try again after 15 minutes."
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// --- ROUTES ---

// 1. PUBLIC POST (Protected by Rate Limiter)
router.post('/', feedbackLimiter, feedbackController.submit);

// 2. PRIVATE GET (Protected by Bearer Token)
router.get('/', authMiddleware, feedbackController.getAll);

export default router;