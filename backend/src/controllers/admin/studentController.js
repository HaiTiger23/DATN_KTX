import User from '../../models/User.js';
import Contract from '../../models/Contract.js';

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  const students = await User.find({ role: 'Student' });
  res.json(students);
};

// @desc    Create student
// @route   POST /api/admin/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  const { email, password, mssv, fullname, cccd, phone, address } = req.body;

  const userExists = await User.findOne({ $or: [{ email }, { mssv }, { cccd }] });

  if (userExists) {
    res.status(400).json({ message: 'User with this email, mssv, or cccd already exists' });
    return;
  }

  const student = await User.create({
    email,
    password,
    role: 'Student',
    mssv,
    fullname,
    cccd,
    phone,
    address,
  });

  if (student) {
    res.status(201).json(student);
  } else {
    res.status(400).json({ message: 'Invalid student data' });
  }
};

// @desc    Update student
// @route   PUT /api/admin/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
  const student = await User.findById(req.params.id);

  if (student) {
    student.fullname = req.body.fullname || student.fullname;
    student.email = req.body.email || student.email;
    student.phone = req.body.phone || student.phone;
    student.address = req.body.address || student.address;
    student.status = req.body.status || student.status;

    if (req.body.password) {
      student.password = req.body.password;
    }

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } else {
    res.status(404).json({ message: 'Student not found' });
  }
};

// @desc    Delete student
// @route   DELETE /api/admin/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  const student = await User.findById(req.params.id);

  if (student) {
    // Check for active contracts
    const activeContract = await Contract.findOne({
      student_id: student._id,
      status: 'Active'
    });

    if (activeContract) {
      res.status(400).json({ message: 'Cannot delete student with an active contract' });
      return;
    }

    await student.deleteOne();
    res.json({ message: 'Student removed' });
  } else {
    res.status(404).json({ message: 'Student not found' });
  }
};

export { getStudents, createStudent, updateStudent, deleteStudent };
