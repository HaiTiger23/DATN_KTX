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

    const { status, search, sort, room_id } = req.query;
    const query = {};
    if (status) query.status = status;
    if (room_id) query.room_id = room_id;
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
      .populate('student_id', 'fullname email mssv cccd phone address')
      .populate('room_id', 'room_code building price')
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
    if (req.body.reason) {
      contract.reason = req.body.reason;
    }
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

// @desc    Create contract
// @route   POST /api/admin/contracts
// @access  Private/Admin
const createContract = async (req, res) => {
  try {
    const { student_id, room_id, start_date, end_date } = req.body;

    if (!student_id || !room_id || !start_date || !end_date) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin' });
    }

    // Check if student already has active contract
    const activeContract = await Contract.findOne({ student_id, status: 'Active' });
    if (activeContract) {
      return res.status(400).json({ message: 'Sinh viên đã có hợp đồng đang hoạt động' });
    }

    // Check if room has available spots
    const room = await Room.findById(room_id);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }
    if (room.current_people >= room.capacity) {
      return res.status(400).json({ message: 'Phòng đã đủ số lượng người' });
    }

    const contract_code = 'HĐ-' + Date.now().toString().slice(-6);

    const contract = await Contract.create({
      contract_code,
      student_id,
      room_id,
      start_date,
      end_date,
      status: 'Active'
    });

    // Tăng số người phòng
    await Room.findByIdAndUpdate(room_id, { $inc: { current_people: 1 } });

    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update contract
// @route   PUT /api/admin/contracts/:id
// @access  Private/Admin
const updateContract = async (req, res) => {
  try {
    const { start_date, end_date } = req.body;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    }

    if (start_date) contract.start_date = start_date;
    if (end_date) contract.end_date = end_date;

    const updatedContract = await contract.save();
    res.json(updatedContract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getContracts, endContract, createContract, updateContract };
