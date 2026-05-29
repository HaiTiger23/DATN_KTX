import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Admin', 'Student'],
    default: 'Student',
  },
  mssv: {
    type: String,
    unique: true,
    sparse: true, // Only for students
  },
  fullname: {
    type: String,
    required: true,
  },
  cccd: {
    type: String,
    unique: true,
    sparse: true,
  },
  cccd_date: {
    type: String,
  },
  cccd_place: {
    type: String,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  status: {
    type: String,
    default: 'Active',
  }
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
