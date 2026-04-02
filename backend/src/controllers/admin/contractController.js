import Contract from '../../models/Contract.js';
import Room from '../../models/Room.js';

// @desc    Get all contracts
// @route   GET /api/admin/contracts
// @access  Private/Admin
const getContracts = async (req, res) => {
  const contracts = await Contract.find({})
    .populate('student_id', 'fullname email mssv')
    .populate('room_id', 'room_code building');
  res.json(contracts);
};

// @desc    End contract
// @route   PATCH /api/admin/contracts/:id/status
// @access  Private/Admin
const endContract = async (req, res) => {
  const contract = await Contract.findById(req.params.id);

  if (contract) {
    if (contract.status === 'Ended') {
      res.status(400).json({ message: 'Contract already ended' });
      return;
    }

    contract.status = 'Ended';
    const updatedContract = await contract.save();

    // Decrease room occupancy
    const room = await Room.findById(contract.room_id);
    if (room && room.current_people > 0) {
      room.current_people -= 1;
      await room.save();
    }

    res.json(updatedContract);
  } else {
    res.status(404).json({ message: 'Contract not found' });
  }
};

export { getContracts, endContract };
