import express from 'express';
import { getRequests, approveRequest, rejectRequest } from '../../controllers/admin/requestController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getRequests);

router.route('/:id/approve')
  .post(protect, admin, approveRequest);

router.route('/:id/reject')
  .post(protect, admin, rejectRequest);

export default router;
