import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  type: {
    type: String,
    enum: ['Registration', 'Cancellation', 'Maintenance'],
    default: 'Registration',
  },
  description: {
    type: String,
    default: '',
  },
  months: {
    type: Number,
    default: 6,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  }
}, {
  timestamps: true,
});

const Request = mongoose.model('Request', requestSchema);

export default Request;
