import express from 'express';
import { protect, admin } from '../../middleware/authMiddleware.js';
import { chatWithBot } from '../../controllers/chatController.js';

const router = express.Router();

router.post('/', protect, admin, chatWithBot);

export default router;
