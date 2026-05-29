import Feedback from '../../models/Feedback.js';

// @desc    Get all feedback
// @route   GET /api/admin/feedbacks
// @access  Private/Admin
const getFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, status, sort } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const feedbacks = await Feedback.find(query)
      .populate('student_id', 'fullname mssv email')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);
    const total = await Feedback.countDocuments(query);

    res.json({
      data: feedbacks,
      pagination: { current: page, pageSize: limit, total }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to feedback
// @route   POST /api/admin/feedbacks/:id/reply
// @access  Private/Admin
const replyFeedback = async (req, res) => {
  try {
    const { reply_content } = req.body;

    if (!reply_content || !reply_content.trim()) {
      return res.status(400).json({ message: 'Nội dung phản hồi không được để trống' });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Không tìm thấy phản ánh' });
    }

    // BUG FIX: Chặn reply đã trả lời rồi (tùy yêu cầu có thể bỏ) - Đã bỏ vì yêu cầu chat nhiều lần
    
    feedback.replies.push({
      user_id: req.user._id,
      role: 'Admin',
      content: reply_content.trim()
    });
    feedback.status = 'Answered';

    const updatedFeedback = await feedback.save();
    res.json(updatedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/admin/feedbacks/:id
// @access  Private/Admin
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Không tìm thấy phản ánh' });
    }

    await Feedback.deleteOne({ _id: feedback._id });
    res.json({ message: 'Đã xóa phản ánh thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFeedbackReply = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Không tìm thấy phản ánh' });
    }

    const replyId = req.params.replyId;
    feedback.replies = feedback.replies.filter(r => r._id.toString() !== replyId);
    
    if (feedback.replies.length === 0) {
      feedback.status = 'Pending';
    }

    await feedback.save();
    res.json({ message: 'Đã xóa phản hồi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getFeedbacks, replyFeedback, deleteFeedback };
