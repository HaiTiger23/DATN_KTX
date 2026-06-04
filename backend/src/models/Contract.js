import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  contract_code: {
    type: String,
    unique: true,
  },
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
  status: {
    type: String,
    enum: ['Active', 'Ended'],
    default: 'Active',
  },
  start_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  end_date: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
  }
}, {
  timestamps: true,
});

const Contract = mongoose.model('Contract', contractSchema);

export default Contract;
