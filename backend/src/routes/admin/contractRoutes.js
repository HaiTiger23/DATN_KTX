import express from 'express';
import { getContracts, endContract } from '../../controllers/admin/contractController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getContracts);

router.route('/:id/status')
  .patch(protect, admin, endContract);

export default router;
