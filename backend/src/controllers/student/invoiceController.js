import Invoice from '../../models/Invoice.js';
import Contract from '../../models/Contract.js';
import { uploadToCloudinary } from '../../config/cloudinary.js';

// GET /api/student/invoices
export const getMyRoomInvoices = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    // Tìm hợp đồng đang hoạt động
    const contract = await Contract.findOne({
      student_id: req.user._id,
      status: 'Active',
    }).populate('room_id', 'room_code building');

    if (!contract) {
      return res.json({ room: null, data: [], pagination: { total: 0, page, limit } });
    }

    const [data, total] = await Promise.all([
      Invoice.find({ room_id: contract.room_id._id })
        .populate('paid_by', 'fullname mssv')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments({ room_id: contract.room_id._id }),
    ]);

    res.json({ room: contract.room_id, data, pagination: { total, page, limit } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/student/invoices/:id/pay  (multipart/form-data, field: receipt)
export const payInvoice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng đính kèm ảnh biên lai chuyển khoản' });
    }

    // Upload ảnh lên Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'ktx/receipts');

    // Atomic update: chỉ khóa được nếu status vẫn là Pending
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, status: 'Pending' },
      { status: 'Waiting_Approval', paid_by: req.user._id, payment_proof_url: imageUrl },
      { new: true }
    );

    if (!invoice) {
      // Kiểm tra xem đã bị người khác khóa chưa
      const existing = await Invoice.findById(req.params.id).populate('paid_by', 'fullname');
      if (existing && existing.status !== 'Pending') {
        return res.status(409).json({
          message: `Hóa đơn đang được xử lý bởi ${existing.paid_by?.fullname || 'người khác'}`,
        });
      }
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
