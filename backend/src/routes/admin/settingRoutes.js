import express from 'express';
import { protect, admin } from '../../middleware/authMiddleware.js';
import { getSettings, updateSettings } from '../../controllers/admin/settingController.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getSettings)
  .post(protect, admin, updateSettings);

export default router;
