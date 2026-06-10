import Room from '../models/Room.js';
import Request from '../models/Request.js';
import Contract from '../models/Contract.js';
import Feedback from '../models/Feedback.js';

// @desc Get available rooms
// @route GET /api/student/rooms
export const getAvailableRooms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { status: 'Available' };
    
    if (req.query.search) {
      query.$or = [
        { room_code: { $regex: req.query.search, $options: 'i' } },
        { building: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.floor && req.query.floor !== '') {
      const f = parseInt(req.query.floor);
      if (!isNaN(f)) query.floor = f;
    }
    if (req.query.roomType && req.query.roomType !== '') {
      query.roomType = req.query.roomType;
    }

    const sortConfig = {};
    if (req.query.sort === 'price_asc') sortConfig.price = 1;
    else if (req.query.sort === 'price_desc') sortConfig.price = -1;
    else sortConfig.createdAt = -1;

    const rooms = await Room.find(query).sort(sortConfig).skip(skip).limit(limit);
    const total = await Room.countDocuments(query);

    res.json({
      data: rooms,
      pagination: { current: page, pageSize: limit, total }
    });
  } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get my current room
// @route GET /api/student/my-room
export const getMyCurrentRoom = async (req, res) => {
    try {
        const activeContract = await Contract.findOne({ student_id: req.user._id, status: 'Active' })
            .populate('room_id');
        
        if (!activeContract || !activeContract.room_id) {
            return res.json({ data: null });
        }

        const room = activeContract.room_id;
        
        const roommateContracts = await Contract.find({ 
            room_id: room._id, 
            status: 'Active',
            student_id: { $ne: req.user._id }
        }).populate('student_id', 'fullname email phone mssv');

        const roommates = roommateContracts.map(c => c.student_id);

        res.json({
            data: {
                room,
                contract: activeContract,
                roommates
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Submit a room request
// @route POST /api/student/requests
export const submitRequest = async (req, res) => {
    try {
        const { room_id, months } = req.body;
        
        // Check if student already has active contract
        const activeContract = await Contract.findOne({ student_id: req.user._id, status: 'Active' });
        if (activeContract) {
            return res.status(400).json({ message: 'Bạn đang có hợp đồng phòng ở hiện tại' });
        }

        // Check if student already has pending registration request
        const pendingRequest = await Request.findOne({ student_id: req.user._id, status: 'Pending', type: 'Registration' });
        if (pendingRequest) {
            return res.status(400).json({ message: 'Bạn đã có đơn đăng ký đang chờ duyệt' });
        }

        const request = await Request.create({
            student_id: req.user._id,
            room_id,
            months: months || 6,
            type: 'Registration'
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get my requests
// @route GET /api/student/requests
export const getMyRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { status, type, sort, search } = req.query;
    const query = { student_id: req.user._id };
    if (status) query.status = status;
    if (type) query.type = type;

    if (search) {
      const rooms = await Room.find({ 
        $or: [
          { room_code: { $regex: search, $options: 'i' } },
          { building: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      query.room_id = { $in: rooms.map(r => r._id) };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const requests = await Request.find(query).populate('room_id').sort(sortOption).skip(skip).limit(limit);
    const total = await Request.countDocuments(query);

    res.json({
      data: requests,
      pagination: { current: page, pageSize: limit, total }
    });
  } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get my contract
// @route GET /api/student/contracts
export const getMyContracts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { status, sort, search } = req.query;
    const query = { student_id: req.user._id };
    if (status) query.status = status;

    if (search) {
      const rooms = await Room.find({ 
        $or: [
          { room_code: { $regex: search, $options: 'i' } },
          { building: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      query.room_id = { $in: rooms.map(r => r._id) };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const contracts = await Contract.find(query).populate('room_id').sort(sortOption).skip(skip).limit(limit);
    const total = await Contract.countDocuments(query);

    res.json({
      data: contracts,
      pagination: { current: page, pageSize: limit, total }
    });
  } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Submit contract cancellation request
// @route POST /api/student/contracts/:id/cancel
export const cancelContract = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id);
        if (!contract || contract.student_id.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
        }
        if (contract.status !== 'Active') {
            return res.status(400).json({ message: 'Hợp đồng này không còn hiệu lực' });
        }

        const pendingCancel = await Request.findOne({
            student_id: req.user._id,
            room_id: contract.room_id,
            status: 'Pending',
            type: 'Cancellation'
        });

        if (pendingCancel) {
            return res.status(400).json({ message: 'Bạn đã gửi đơn hủy hợp đồng rồi' });
        }

        const request = await Request.create({
            student_id: req.user._id,
            room_id: contract.room_id,
            type: 'Cancellation'
        });

        res.status(201).json({ message: 'Đã gửi yêu cầu hủy hợp đồng', request });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get my feedbacks
// @route GET /api/student/feedbacks
export const getMyFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { status, search, sort } = req.query;
    const query = { student_id: req.user._id };
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const feedbacks = await Feedback.find(query).sort(sortOption).skip(skip).limit(limit);
    const total = await Feedback.countDocuments(query);

    res.json({
      data: feedbacks,
      pagination: { current: page, pageSize: limit, total }
    });
  } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Submit feedback
// @route POST /api/student/feedbacks
export const submitFeedback = async (req, res) => {
    try {
        const { title, description } = req.body;
        const feedback = await Feedback.create({
            student_id: req.user._id,
            title,
            description,
            replies: []
        });
        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Reply to feedback
// @route POST /api/student/feedbacks/:id/reply
export const replyToFeedback = async (req, res) => {
    try {
        const { reply_content } = req.body;
        if (!reply_content || !reply_content.trim()) {
            return res.status(400).json({ message: 'Nội dung phản hồi không được để trống' });
        }

        const feedback = await Feedback.findOne({ _id: req.params.id, student_id: req.user._id });
        if (!feedback) {
            return res.status(404).json({ message: 'Không tìm thấy phản ánh' });
        }

        feedback.replies.push({
            user_id: req.user._id,
            role: 'Student',
            content: reply_content.trim()
        });

        await feedback.save();
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete student's own reply
// @route DELETE /api/student/feedbacks/:id/reply/:replyId
export const deleteFeedbackReply = async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ _id: req.params.id, student_id: req.user._id });
        if (!feedback) {
            return res.status(404).json({ message: 'Không tìm thấy phản ánh' });
        }

        const replyId = req.params.replyId;
        const reply = feedback.replies.find(r => r._id.toString() === replyId);
        
        if (!reply) {
            return res.status(404).json({ message: 'Không tìm thấy phản hồi' });
        }
        
        if (reply.role !== 'Student') {
            return res.status(403).json({ message: 'Không có quyền xóa phản hồi của người khác' });
        }

        feedback.replies = feedback.replies.filter(r => r._id.toString() !== replyId);
        await feedback.save();
        res.json({ message: 'Đã xóa phản hồi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

import Notification from '../models/Notification.js';

// @desc Get my notifications
// @route GET /api/student/notifications
export const getMyNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { search } = req.query;
        const query = {};
        if (search) query.title = { $regex: search, $options: 'i' };

        const notifications = await Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Notification.countDocuments(query);
        
        // Map to include an isRead flag
        const mappedNotifications = notifications.map(notif => {
            const isRead = notif.readBy.some(id => id.toString() === req.user._id.toString());
            return {
                ...notif._doc,
                isRead
            };
        });

        res.json({
          data: mappedNotifications,
          pagination: { current: page, pageSize: limit, total }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Mark notification as read
// @route POST /api/student/notifications/:id/read
export const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (!notification.readBy.some(id => id.toString() === req.user._id.toString())) {
            notification.readBy.push(req.user._id);
            await notification.save();
        }

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
