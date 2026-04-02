import Request from '../../models/Request.js';
import Room from '../../models/Room.js';
import Contract from '../../models/Contract.js';

// @desc    Get all pending requests
// @route   GET /api/admin/requests
// @access  Private/Admin
const getRequests = async (req, res) => {
  const requests = await Request.find({ status: 'Pending' })
    .populate('student_id', 'fullname email mssv')
    .populate('room_id', 'room_code building current_people capacity');
  res.json(requests);
};

// @desc    Approve request
// @route   POST /api/admin/requests/:id/approve
// @access  Private/Admin
const approveRequest = async (req, res) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    res.status(404).json({ message: 'Request not found' });
    return;
  }

  const room = await Room.findById(request.room_id);

  if (!room) {
    res.status(404).json({ message: 'Room not found' });
    return;
  }

  if (room.current_people >= room.capacity) {
    res.status(400).json({ message: 'Room is already at full capacity' });
    return;
  }

  if (room.status !== 'Available') {
    res.status(400).json({ message: 'Room is not available' });
    return;
  }

  // Update request status
  request.status = 'Approved';
  await request.save();

  // Increase room occupancy
  room.current_people += 1;
  await room.save();

  // Create contract (assume 6 month duration for now)
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 6);

  const contract = await Contract.create({
    student_id: request.student_id,
    room_id: request.room_id,
    status: 'Active',
    start_date: startDate,
    end_date: endDate,
  });

  res.json({ message: 'Request approved and contract created', contract });
};

// @desc    Reject request
// @route   POST /api/admin/requests/:id/reject
// @access  Private/Admin
const rejectRequest = async (req, res) => {
  const request = await Request.findById(req.params.id);

  if (request) {
    request.status = 'Rejected';
    await request.save();
    res.json({ message: 'Request rejected' });
  } else {
    res.status(404).json({ message: 'Request not found' });
  }
};

export { getRequests, approveRequest, rejectRequest };
