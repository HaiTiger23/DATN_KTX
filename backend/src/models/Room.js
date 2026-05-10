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
  floor: {
    type: Number,
    required: true,
    default: 1,
  },
  description: {
    type: String,
    default: '',
  },
  images: [{
    type: String,
  }],
  amenities: [{
    type: String,
  }],
  roomType: {
    type: String,
    enum: ['Standard', 'Service', 'VIP'],
    default: 'Standard',
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
