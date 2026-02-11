import { Request, Response } from 'express';
import { FeedbackService } from '../services/FeedbackService';

export class FeedbackController {
  private feedbackService: FeedbackService;

  constructor() {
    this.feedbackService = new FeedbackService();
  }

  // POST /feedback
  submit = async (req: Request, res: Response) => {
    try {
      const { name, email, description, whatsapp } = req.body;

      const feedback = await this.feedbackService.submitFeedback({
        name,
        email,
        description, // Maps to "Deskripsi"
        whatsapp,
      });

      res.status(201).json({
        success: true,
        message: "Feedback submitted successfully",
        data: feedback
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to submit feedback"
      });
    }
  };

  // GET /feedback
  getAll = async (req: Request, res: Response) => {
    try {
      const feedbacks = await this.feedbackService.getAllFeedbacks();
      
      res.status(200).json({
        success: true,
        data: feedbacks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };
}