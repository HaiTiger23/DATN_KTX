import express from 'express';
import { getContracts, endContract, createContract, updateContract, deleteContract } from '../../controllers/admin/contractController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getContracts)
  .post(protect, admin, createContract);

router.route('/:id')
  .put(protect, admin, updateContract)
  .delete(protect, admin, deleteContract);

router.route('/:id/status')
  .patch(protect, admin, endContract);

export default router;
