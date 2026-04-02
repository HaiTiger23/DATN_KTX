import express from 'express';
import { getRooms, createRoom, updateRoom, updateRoomStatus } from '../../controllers/admin/roomController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getRooms)
  .post(protect, admin, createRoom);

router.route('/:id')
  .put(protect, admin, updateRoom);

router.route('/:id/status')
  .patch(protect, admin, updateRoomStatus);

export default router;
