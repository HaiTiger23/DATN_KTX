import Contract from '../../models/Contract.js';
import Room from '../../models/Room.js';
import User from '../../models/User.js';

// @desc    Get all contracts
// @route   GET /api/admin/contracts
// @access  Private/Admin
const getContracts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { status, search, sort } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      const [rooms, students] = await Promise.all([
        Room.find({ room_code: { $regex: search, $options: 'i' } }).select('_id'),
        User.find({ 
          $or: [
            { fullname: { $regex: search, $options: 'i' } },
            { mssv: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }).select('_id')
      ]);

      query.$or = [
        { room_id: { $in: rooms.map(r => r._id) } },
        { student_id: { $in: students.map(s => s._id) } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'start_asc') sortOption = { start_date: 1 };
    else if (sort === 'start_desc') sortOption = { start_date: -1 };

    const contracts = await Contract.find(query)
      .populate('student_id', 'fullname email mssv')
      .populate('room_id', 'room_code building')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    const total = await Contract.countDocuments(query);

    res.json({
      data: contracts,
      pagination: { current: page, pageSize: limit, total }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    End contract
// @route   PATCH /api/admin/contracts/:id/status
// @access  Private/Admin
const endContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    }

    if (contract.status === 'Ended') {
      return res.status(400).json({ message: 'Hợp đồng này đã kết thúc rồi' });
    }

    contract.status = 'Ended';
    const updatedContract = await contract.save();

    // BUG FIX: Dùng $inc atomic thay vì read-modify-write để tránh race condition
    // Đảm bảo current_people không xuống dưới 0
    await Room.findOneAndUpdate(
      { _id: contract.room_id, current_people: { $gt: 0 } },
      { $inc: { current_people: -1 } }
    );

    res.json(updatedContract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getContracts, endContract };
