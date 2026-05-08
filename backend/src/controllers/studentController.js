import Room from '../models/Room.js';
import Request from '../models/Request.js';
import Contract from '../models/Contract.js';
import Feedback from '../models/Feedback.js';

// @desc Get available rooms
// @route GET /api/student/rooms
export const getAvailableRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ status: 'Available' });
        res.json(rooms);
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
        const requests = await Request.find({ student_id: req.user._id }).populate('room_id');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get my contract
// @route GET /api/student/contracts
export const getMyContracts = async (req, res) => {
    try {
        const contracts = await Contract.find({ student_id: req.user._id }).populate('room_id');
        res.json(contracts);
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
        const feedbacks = await Feedback.find({ student_id: req.user._id }).sort('-createdAt');
        res.json(feedbacks);
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
            description
        });
        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
