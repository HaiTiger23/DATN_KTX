import Request from '../../models/Request.js';
import Room from '../../models/Room.js';
import Contract from '../../models/Contract.js';

// @desc    Get all pending requests
// @route   GET /api/admin/requests
// @access  Private/Admin
const getRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'Pending' })
      .populate('student_id', 'fullname email mssv')
      .populate('room_id', 'room_code building current_people capacity');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve request
// @route   POST /api/admin/requests/:id/approve
// @access  Private/Admin
const approveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đăng ký' });
    }

    // BUG FIX: Chặn duyệt đơn đã được xử lý rồi
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: `Đơn này đã được xử lý (${request.status})` });
    }

    // FLOW FIX: Chặn duyệt nếu sinh viên đã có hợp đồng Active (1 SV chỉ ở 1 phòng)
    const existingContract = await Contract.findOne({
      student_id: request.student_id,
      status: 'Active',
    });
    if (existingContract) {
      return res.status(400).json({
        message: 'Sinh viên này đang có hợp đồng phòng khác còn hiệu lực. Cần kết thúc hợp đồng cũ trước.'
      });
    }

    // BUG FIX: Dùng findOneAndUpdate với điều kiện atomic để tránh race condition
    // Tăng current_people CHỈ KHI current_people < capacity (atomic operation)
    const room = await Room.findOneAndUpdate(
      {
        _id: request.room_id,
        status: 'Available',
        $expr: { $lt: ['$current_people', '$capacity'] }, // atomic check
      },
      { $inc: { current_people: 1 } },
      { new: true }
    );

    if (!room) {
      // Kiểm tra nguyên nhân từ chối để trả thông báo rõ ràng
      const roomCheck = await Room.findById(request.room_id);
      if (!roomCheck) {
        return res.status(404).json({ message: 'Không tìm thấy phòng' });
      }
      if (roomCheck.status !== 'Available') {
        return res.status(400).json({ message: 'Phòng hiện đang bảo trì, không thể duyệt' });
      }
      return res.status(400).json({ message: 'Phòng đã đạt sức chứa tối đa' });
    }

    // Cập nhật trạng thái đơn
    request.status = 'Approved';
    await request.save();

    // BUG FIX: Nhận start_date/end_date từ body nếu có, không hardcode 6 tháng
    const startDate = req.body.start_date ? new Date(req.body.start_date) : new Date();
    const endDate = req.body.end_date
      ? new Date(req.body.end_date)
      : new Date(new Date().setMonth(new Date().getMonth() + 6));

    if (endDate <= startDate) {
      // Rollback: giảm lại current_people nếu date không hợp lệ
      await Room.findByIdAndUpdate(room._id, { $inc: { current_people: -1 } });
      request.status = 'Pending';
      await request.save();
      return res.status(400).json({ message: 'Ngày kết thúc phải sau ngày bắt đầu' });
    }

    const contract = await Contract.create({
      student_id: request.student_id,
      room_id: request.room_id,
      status: 'Active',
      start_date: startDate,
      end_date: endDate,
    });

    res.json({ message: 'Đã duyệt đơn và tạo hợp đồng thành công', contract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject request
// @route   POST /api/admin/requests/:id/reject
// @access  Private/Admin
const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đăng ký' });
    }

    // BUG FIX: Chặn từ chối đơn đã được xử lý
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: `Đơn này đã được xử lý (${request.status})` });
    }

    request.status = 'Rejected';
    await request.save();
    res.json({ message: 'Đã từ chối đơn đăng ký' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getRequests, approveRequest, rejectRequest };
