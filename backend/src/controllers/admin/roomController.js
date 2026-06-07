import Room from '../../models/Room.js';
import Contract from '../../models/Contract.js';
import User from '../../models/User.js';
import { uploadToCloudinary } from '../../config/cloudinary.js';

// @desc    Get all rooms
// @route   GET /api/admin/rooms
// @access  Private/Admin
const getRooms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, status, floor, roomType, sort } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { room_code: { $regex: search, $options: 'i' } },
        { building: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      if (status === 'Maintenance') {
        query.status = 'Maintenance';
      } else if (status === 'Full') {
        query.status = { $ne: 'Maintenance' };
        query.$expr = { $gte: ["$current_people", "$capacity"] };
      } else if (status === 'Available') {
        query.status = { $ne: 'Maintenance' };
        query.$expr = { $lt: ["$current_people", "$capacity"] };
      } else {
        query.status = status;
      }
    }
    if (floor) query.floor = parseInt(floor);
    if (roomType) query.roomType = roomType;

    let sortOption = { createdAt: -1 };
    if (sort) {
      if (sort === 'price_asc') sortOption = { price: 1 };
      else if (sort === 'price_desc') sortOption = { price: -1 };
      else if (sort === 'room_code') sortOption = { room_code: 1 };
    }

    const rooms = await Room.find(query).sort(sortOption).skip(skip).limit(limit).lean();
    const total = await Room.countDocuments(query);

    // Fetch residents for each room
    const roomsWithResidents = await Promise.all(rooms.map(async (room) => {
        const activeContracts = await Contract.find({ room_id: room._id, status: 'Active' })
            .populate('student_id', 'fullname email phone mssv');
        return {
            ...room,
            residents: activeContracts.map(c => c.student_id).filter(s => s !== null)
        };
    }));

    res.json({
      data: roomsWithResidents,
      pagination: { current: page, pageSize: limit, total }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create room
// @route   POST /api/admin/rooms
// @access  Private/Admin
const createRoom = async (req, res) => {
  try {
    const { room_code, building, floor, capacity, price, description, detailed_description, roomType } = req.body;
    let amenities = req.body.amenities || [];
    if (!Array.isArray(amenities)) amenities = [amenities];

    if (!room_code || !building || floor === undefined || !capacity || !price) {
      return res.status(400).json({ message: 'room_code, building, floor, capacity và price là bắt buộc' });
    }

    const roomExists = await Room.findOne({ room_code });
    if (roomExists) {
      return res.status(400).json({ message: 'Mã phòng đã tồn tại' });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, 'ktx/rooms');
        imageUrls.push(url);
      }
    }

    const room = await Room.create({ 
      room_code, building, floor, capacity, price, 
      description: description || '',
      detailed_description: detailed_description || '',
      images: imageUrls,
      amenities: amenities,
      roomType: roomType || 'Standard'
    });
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

    let amenities = req.body.amenities || [];
    if (req.body.amenities && !Array.isArray(req.body.amenities)) amenities = [req.body.amenities];

    let imageUrls = [];
    if (req.body.existingImages) {
        if (Array.isArray(req.body.existingImages)) {
            imageUrls.push(...req.body.existingImages);
        } else {
            imageUrls.push(req.body.existingImages);
        }
    }
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, 'ktx/rooms');
        imageUrls.push(url);
      }
    }

    room.price = req.body.price ?? room.price;
    room.capacity = req.body.capacity ?? room.capacity;
    room.building = req.body.building ?? room.building;
    room.floor = req.body.floor ?? room.floor;
    room.description = req.body.description ?? room.description;
    room.detailed_description = req.body.detailed_description ?? room.detailed_description;
    room.images = imageUrls;
    room.amenities = req.body.amenities ? amenities : room.amenities;
    room.roomType = req.body.roomType ?? room.roomType;

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

