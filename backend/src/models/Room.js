import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  room_code: {
    type: String,
    required: true,
    unique: true,
  },
  building: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  current_people: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Available', 'Maintenance'],
    default: 'Available',
  }
}, {
  timestamps: true,
});

const Room = mongoose.model('Room', roomSchema);

export default Room;
