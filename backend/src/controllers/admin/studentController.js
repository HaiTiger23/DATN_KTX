import User from '../../models/User.js';
import Contract from '../../models/Contract.js';
import Request from '../../models/Request.js';

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { role: 'Student' };
    const students = await User.find(filter).select('-password').skip(skip).limit(limit);
    const total = await User.countDocuments(filter);

    res.json({
      data: students,
      pagination: { current: page, pageSize: limit, total }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create student
// @route   POST /api/admin/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  try {
    const { email, password, mssv, fullname, cccd, phone, address } = req.body;

    // BUG FIX: Validate các field bắt buộc trước
    if (!email || !password || !fullname) {
      return res.status(400).json({ message: 'Email, password và fullname là bắt buộc' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { mssv }, { cccd }] });

    if (userExists) {
      return res.status(400).json({ message: 'Sinh viên với email, mssv hoặc cccd này đã tồn tại' });
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

    // BUG FIX: Không trả về password trong response
    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.status(201).json(studentResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/admin/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    // BUG FIX: Không cho phép thay đổi role qua update
    student.fullname = req.body.fullname || student.fullname;
    student.email = req.body.email || student.email;
    student.phone = req.body.phone || student.phone;
    student.address = req.body.address || student.address;
    student.status = req.body.status || student.status;

    if (req.body.password) {
      student.password = req.body.password;
    }

    await student.save();

    // BUG FIX: Không trả về password trong response
    const updatedStudent = student.toObject();
    delete updatedStudent.password;

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset student password
// @route   POST /api/admin/students/:id/reset-password
// @access  Private/Admin
const resetStudentPassword = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'Student') {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    student.password = '123456';
    await student.save();

    res.json({ message: 'Mật khẩu đã được đặt lại thành 123456' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/admin/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    // Chặn xóa nếu đang có hợp đồng Active
    const activeContract = await Contract.findOne({
      student_id: student._id,
      status: 'Active'
    });

    if (activeContract) {
      return res.status(400).json({ message: 'Không thể xóa sinh viên đang có hợp đồng hoạt động' });
    }

    // FLOW FIX: Xóa toàn bộ Pending requests của SV để tránh orphaned data
    // (nếu để lại, admin vào /requests sẽ thấy đơn có student_id = null → frontend crash)
    await Request.deleteMany({ student_id: student._id, status: 'Pending' });

    await student.deleteOne();
    res.json({ message: 'Đã xóa sinh viên thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getStudents, createStudent, updateStudent, resetStudentPassword, deleteStudent };
