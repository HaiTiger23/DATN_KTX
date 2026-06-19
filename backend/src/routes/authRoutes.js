import express from 'express';
import { authUser, registerUser, sendRegisterOtp, getUserProfile, updateUserProfile, forgotPassword, resetPassword, getPublicSettings } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser);
router.post('/send-otp-register', sendRegisterOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/public-settings', getPublicSettings);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
