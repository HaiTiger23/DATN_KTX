import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // BUG FIX: Validate input trước khi query DB
    if (!email || !password) {
      return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // BUG FIX: Kiểm tra tài khoản bị khoá
      if (user.status !== 'Active') {
        return res.status(403).json({ message: 'Tài khoản của bạn đã bị vô hiệu hóa' });
      }

      res.json({
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { fullname, email, password, mssv, cccd } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đủ họ tên, email và mật khẩu' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    const user = await User.create({
      fullname,
      email,
      password,
      mssv,
      cccd,
      role: 'Student'
    });

    res.status(201).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { authUser, registerUser };
