import Room from '../../models/Room.js';
import Contract from '../../models/Contract.js';

// @desc    Get all rooms
// @route   GET /api/admin/rooms
// @access  Private/Admin
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create room
// @route   POST /api/admin/rooms
// @access  Private/Admin
const createRoom = async (req, res) => {
  try {
    const { room_code, building, capacity, price } = req.body;

    if (!room_code || !building || !capacity || !price) {
      return res.status(400).json({ message: 'room_code, building, capacity và price là bắt buộc' });
    }

    const roomExists = await Room.findOne({ room_code });
    if (roomExists) {
      return res.status(400).json({ message: 'Mã phòng đã tồn tại' });
    }

    const room = await Room.create({ room_code, building, capacity, price });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update room details
// @route   PUT /api/admin/rooms/:id
// @access  Private/Admin
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    room.price = req.body.price ?? room.price;
    room.capacity = req.body.capacity ?? room.capacity;
    room.building = req.body.building ?? room.building;

    if (room.capacity < room.current_people) {
      return res.status(400).json({
        message: `Sức chứa mới (${room.capacity}) không thể nhỏ hơn số người đang ở (${room.current_people})`
      });
    }

    const updatedRoom = await room.save();
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update room status
// @route   PATCH /api/admin/rooms/:id/status
// @access  Private/Admin
const updateRoomStatus = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng' });
    }

    const newStatus = req.body.status;
    const validStatuses = ['Available', 'Maintenance'];
    if (!newStatus || !validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: `Status không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}` });
    }

    if (newStatus === 'Maintenance' && room.current_people > 0) {
      return res.status(400).json({ message: 'Không thể chuyển sang bảo trì khi phòng đang có người ở' });
    }

    room.status = newStatus;
    const updatedRoom = await room.save();
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Đồng bộ lại current_people của TẤT CẢ phòng từ contract thực tế
// @route   POST /api/admin/rooms/sync-occupancy
// @access  Private/Admin
// Dùng khi nghi data bị lệch (ví dụ do lỗi server giữa chừng)
const syncRoomOccupancy = async (req, res) => {
  try {
    const rooms = await Room.find({});
    let updatedCount = 0;

    for (const room of rooms) {
      // Đếm số contract Active thực tế của phòng này
      const activeCount = await Contract.countDocuments({
        room_id: room._id,
        status: 'Active',
      });

      if (room.current_people !== activeCount) {
        room.current_people = activeCount;
        await room.save();
        updatedCount++;
      }
    }

    res.json({ message: `Đã đồng bộ xong. Số phòng được cập nhật: ${updatedCount}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getRooms, createRoom, updateRoom, updateRoomStatus, syncRoomOccupancy };

