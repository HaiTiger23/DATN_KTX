import express from 'express';
import { protect, admin } from '../../middleware/authMiddleware.js';
import { getInvoices, createInvoice, confirmPayment, rejectPayment, createBulkInvoices } from '../../controllers/admin/invoiceController.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getInvoices)
  .post(protect, admin, createInvoice);

router.post('/bulk', protect, admin, createBulkInvoices);

router.put('/:id/confirm', protect, admin, confirmPayment);
router.put('/:id/reject',  protect, admin, rejectPayment);

export default router;
