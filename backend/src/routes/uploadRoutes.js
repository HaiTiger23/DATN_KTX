import express from 'express';
import { uploadMultiple, uploadSingle } from '../controllers/uploadController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Upload nhiều ảnh (chỉ admin)
router.post('/multiple', protect, admin, upload.array('images', 10), uploadMultiple);

// Upload 1 ảnh (bất kỳ ai login)
router.post('/single', protect, upload.single('image'), uploadSingle);

export default router;
