import express from 'express';
import { protect, admin } from '../../middleware/authMiddleware.js';
import { getKnowledge, createKnowledge, deleteKnowledge } from '../../controllers/admin/knowledgeController.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getKnowledge)
  .post(protect, admin, createKnowledge);

router.route('/:id')
  .delete(protect, admin, deleteKnowledge);

export default router;
