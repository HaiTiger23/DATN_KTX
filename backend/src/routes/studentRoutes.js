import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getAvailableRooms,
    submitRequest,
    getMyRequests,
    getMyContracts,
    getMyFeedbacks,
    submitFeedback,
    cancelContract,
    getMyNotifications,
    markNotificationAsRead,
    replyToFeedback,
    deleteFeedbackReply
} from '../controllers/studentController.js';
import { chatWithBot } from '../controllers/chatController.js';
import { getMyRoomInvoices, payInvoice } from '../controllers/student/invoiceController.js';
import { upload } from '../config/cloudinary.js';

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
router.route('/feedbacks/:id/reply').post(replyToFeedback);
router.route('/feedbacks/:id/reply/:replyId').delete(deleteFeedbackReply);
router.post('/chat', chatWithBot);

router.get('/notifications', getMyNotifications);
router.post('/notifications/:id/read', markNotificationAsRead);

// Invoices
router.get('/invoices', getMyRoomInvoices);
router.post('/invoices/:id/pay', upload.single('receipt'), payInvoice);

export default router;
