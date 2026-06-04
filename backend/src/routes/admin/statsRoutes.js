import express from 'express';
import { getBuildingStats } from '../../controllers/admin/statsController.js';

const router = express.Router();

router.get('/buildings', getBuildingStats);

export default router;
