import Room from '../../models/Room.js';
import Contract from '../../models/Contract.js';

// @desc    Get all rooms
// @route   GET /api/admin/rooms
// @access  Private/Admin
const getRooms = async (req, res) => {
  const rooms = await Room.find({});
  res.json(rooms);
};

// @desc    Create room
// @route   POST /api/admin/rooms
// @access  Private/Admin
const createRoom = async (req, res) => {
  const { room_code, building, capacity, price } = req.body;

  const roomExists = await Room.findOne({ room_code });

  if (roomExists) {
    res.status(400).json({ message: 'Room already exists' });
    return;
  }

  const room = await Room.create({
    room_code,
    building,
    capacity,
    price,
  });

  if (room) {
    res.status(201).json(room);
  } else {
    res.status(400).json({ message: 'Invalid room data' });
  }
};

// @desc    Update room details
// @route   PUT /api/admin/rooms/:id
// @access  Private/Admin
const updateRoom = async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (room) {
    room.price = req.body.price || room.price;
    room.capacity = req.body.capacity || room.capacity;
    room.building = req.body.building || room.building;

    const updatedRoom = await room.save();
    res.json(updatedRoom);
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
};

// @desc    Update room status
// @route   PATCH /api/admin/rooms/:id/status
// @access  Private/Admin
const updateRoomStatus = async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (room) {
    if (req.body.status === 'Maintenance' && room.current_people > 0) {
      res.status(400).json({ message: 'Cannot set to maintenance while room is occupied' });
      return;
    }

    room.status = req.body.status || room.status;

    const updatedRoom = await room.save();
    res.json(updatedRoom);
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
};

export { getRooms, createRoom, updateRoom, updateRoomStatus };
