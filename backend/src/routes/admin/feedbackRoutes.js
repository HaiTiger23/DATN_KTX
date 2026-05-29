import express from 'express';
import { getFeedbacks, replyFeedback, deleteFeedback, deleteFeedbackReply } from '../../controllers/admin/feedbackController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getFeedbacks);

router.route('/:id/reply')
  .post(protect, admin, replyFeedback);

router.route('/:id/reply/:replyId')
  .delete(protect, admin, deleteFeedbackReply);

router.route('/:id')
  .delete(protect, admin, deleteFeedback);

export default router;
