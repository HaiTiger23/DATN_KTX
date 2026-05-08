import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getAvailableRooms,
    submitRequest,
    getMyRequests,
    getMyContracts,
    getMyFeedbacks,
    submitFeedback,
    cancelContract
} from '../controllers/studentController.js';
import { chatWithBot } from '../controllers/chatController.js';

const router = express.Router();

router.use(protect); // All student routes require authentication

router.get('/rooms', getAvailableRooms);
router.route('/requests')
    .get(getMyRequests)
    .post(submitRequest);
router.get('/contracts', getMyContracts);
router.post('/contracts/:id/cancel', cancelContract);
router.route('/feedbacks')
    .get(getMyFeedbacks)
    .post(submitFeedback);
router.post('/chat', chatWithBot);

export default router;
