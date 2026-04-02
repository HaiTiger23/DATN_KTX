import express from 'express';
import { getFeedbacks, replyFeedback } from '../../controllers/admin/feedbackController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getFeedbacks);

router.route('/:id/reply')
  .post(protect, admin, replyFeedback);

export default router;
