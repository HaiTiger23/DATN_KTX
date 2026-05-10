import express from 'express';
import { getStudents, createStudent, updateStudent, deleteStudent, resetStudentPassword } from '../../controllers/admin/studentController.js';
import { protect, admin } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getStudents)
  .post(protect, admin, createStudent);

router.route('/:id')
  .put(protect, admin, updateStudent)
  .delete(protect, admin, deleteStudent);

router.post('/:id/reset-password', protect, admin, resetStudentPassword);

export default router;
