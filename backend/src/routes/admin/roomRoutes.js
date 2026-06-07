import express from 'express';
import { getRooms, createRoom, updateRoom, updateRoomStatus, syncRoomOccupancy } from '../../controllers/admin/roomController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';
import { upload } from '../../config/cloudinary.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getRooms)
  .post(protect, admin, upload.array('images', 10), createRoom);

router.route('/sync-occupancy')
  .post(protect, admin, syncRoomOccupancy);

router.route('/:id')
  .put(protect, admin, upload.array('images', 10), updateRoom);

router.route('/:id/status')
  .patch(protect, admin, updateRoomStatus);

export default router;

