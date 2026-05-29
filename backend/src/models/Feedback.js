import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  reply_content: {
    type: String,
    default: '',
  },
  replies: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['Admin', 'Student'] },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['Pending', 'Answered'],
    default: 'Pending',
  }
}, {
  timestamps: true,
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
