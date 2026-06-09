import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Setting from '../models/Setting.js';
import Otp from '../models/Otp.js';
import { sendEmail } from '../utils/mailer.js';

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

// @desc    Send OTP for registration
// @route   POST /api/auth/send-otp-register
// @access  Public
const sendRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng cung cấp email' });

    // Kiểm tra tên miền email được phép
    const settings = await Setting.findOne();
    if (settings && settings.allowedEmailDomains && settings.allowedEmailDomains.length > 0) {
      const emailDomain = email.split('@')[1];
      if (!settings.allowedEmailDomains.includes(emailDomain)) {
        return res.status(400).json({ 
          message: `Chỉ chấp nhận đăng ký từ các tên miền email: ${settings.allowedEmailDomains.join(', ')}` 
        });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email đã được sử dụng' });

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

    // Xóa mã cũ nếu có
    await Otp.deleteMany({ email, type: 'Register' });

    await Otp.create({ email, code, type: 'Register' });

    await sendEmail(
      email,
      'Mã xác nhận đăng ký tài khoản KTX',
      `<p>Mã xác nhận của bạn là: <strong>${code}</strong></p><p>Mã này sẽ hết hạn sau 5 phút.</p>`
    );

    res.json({ message: 'Mã xác nhận đã được gửi đến email của bạn' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { fullname, email, password, mssv, cccd, otp } = req.body;

    if (!fullname || !email || !password || !otp) {
      return res.status(400).json({ message: 'Vui lòng điền đủ họ tên, email, mật khẩu và mã OTP' });
    }

    // Kiểm tra tên miền email được phép
    const settings = await Setting.findOne();
    if (settings && settings.allowedEmailDomains && settings.allowedEmailDomains.length > 0) {
      const emailDomain = email.split('@')[1];
      if (!settings.allowedEmailDomains.includes(emailDomain)) {
        return res.status(400).json({ 
          message: `Chỉ chấp nhận đăng ký từ các tên miền email: ${settings.allowedEmailDomains.join(', ')}` 
        });
      }
    }

    const validOtp = await Otp.findOne({ email, code: otp, type: 'Register' });
    if (!validOtp) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
    }

    let cleanMssv = mssv?.trim() || undefined;
    let cleanCccd = cccd?.trim() || undefined;

    const orConditions = [{ email }];
    if (cleanMssv) orConditions.push({ mssv: cleanMssv });
    if (cleanCccd) orConditions.push({ cccd: cleanCccd });

    const userExists = await User.findOne({ $or: orConditions });
    if (userExists) {
      if (userExists.email === email) return res.status(400).json({ message: 'Email đã được sử dụng' });
      if (cleanMssv && userExists.mssv === cleanMssv) return res.status(400).json({ message: 'MSSV này đã tồn tại trong hệ thống' });
      if (cleanCccd && userExists.cccd === cleanCccd) return res.status(400).json({ message: 'CCCD này đã tồn tại trong hệ thống' });
      return res.status(400).json({ message: 'Tài khoản đã tồn tại' });
    }

    const user = await User.create({
      fullname,
      email,
      password,
      mssv: cleanMssv,
      cccd: cleanCccd,
      role: 'Student'
    });

    await Otp.deleteOne({ _id: validOtp._id });

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

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.fullname = req.body.fullname || user.fullname;
    user.email = req.body.email || user.email;
    if (user.role === 'Student') {
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.address = req.body.address !== undefined ? req.body.address : user.address;
      
      // Update new fields
      if (req.body.mssv && req.body.mssv !== user.mssv) {
        const mssvExists = await User.findOne({ mssv: req.body.mssv });
        if (mssvExists) return res.status(400).json({ message: 'MSSV này đã được sử dụng bởi sinh viên khác' });
        user.mssv = req.body.mssv;
      }
      
      if (req.body.cccd && req.body.cccd !== user.cccd) {
        const cccdExists = await User.findOne({ cccd: req.body.cccd });
        if (cccdExists) return res.status(400).json({ message: 'Số CCCD này đã được đăng ký' });
        user.cccd = req.body.cccd;
      }
      
      user.cccd_date = req.body.cccd_date !== undefined ? req.body.cccd_date : user.cccd_date;
      user.cccd_place = req.body.cccd_place !== undefined ? req.body.cccd_place : user.cccd_place;
    }
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      fullname: updatedUser.fullname,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng cung cấp email' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email, type: 'ResetPassword' });
    await Otp.create({ email, code, type: 'ResetPassword' });

    await sendEmail(
      email,
      'Khôi phục mật khẩu tài khoản KTX',
      `<p>Mã xác nhận để khôi phục mật khẩu của bạn là: <strong>${code}</strong></p><p>Mã này sẽ hết hạn sau 5 phút.</p>`
    );

    res.json({ message: 'Mã khôi phục đã được gửi đến email của bạn' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin' });

    const validOtp = await Otp.findOne({ email, code: otp, type: 'ResetPassword' });
    if (!validOtp) return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

    user.password = newPassword;
    await user.save();

    await Otp.deleteOne({ _id: validOtp._id });

    res.json({ message: 'Mật khẩu đã được khôi phục thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { authUser, registerUser, sendRegisterOtp, getUserProfile, updateUserProfile, forgotPassword, resetPassword };
