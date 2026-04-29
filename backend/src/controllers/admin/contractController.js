import Contract from '../../models/Contract.js';
import Room from '../../models/Room.js';

// @desc    Get all contracts
// @route   GET /api/admin/contracts
// @access  Private/Admin
const getContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({})
      .populate('student_id', 'fullname email mssv')
      .populate('room_id', 'room_code building');
    res.json(contracts);
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
