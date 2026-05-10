import express from 'express';
import { protect, admin } from '../../middleware/authMiddleware.js';
import {
    getNotifications,
    createNotification,
    deleteNotification
} from '../../controllers/admin/notificationController.js';

const router = express.Router();

router.use(protect, admin);

router.route('/')
    .get(getNotifications)
    .post(createNotification);

router.route('/:id')
    .delete(deleteNotification);

export default router;
