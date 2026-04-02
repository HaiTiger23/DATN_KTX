import Feedback from '../../models/Feedback.js';

// @desc    Get all feedback
// @route   GET /api/admin/feedbacks
// @access  Private/Admin
const getFeedbacks = async (req, res) => {
  const feedbacks = await Feedback.find({})
    .populate('student_id', 'fullname mssv email');
  res.json(feedbacks);
};

// @desc    Reply to feedback
// @route   POST /api/admin/feedbacks/:id/reply
// @access  Private/Admin
const replyFeedback = async (req, res) => {
  const { reply_content } = req.body;

  if (!reply_content) {
    res.status(400).json({ message: 'Reply content is required' });
    return;
  }

  const feedback = await Feedback.findById(req.params.id);

  if (feedback) {
    feedback.reply_content = reply_content;
    feedback.status = 'Answered';

    const updatedFeedback = await feedback.save();
    res.json(updatedFeedback);
  } else {
    res.status(404).json({ message: 'Feedback not found' });
  }
};

export { getFeedbacks, replyFeedback };
