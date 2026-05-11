import Invoice from '../../models/Invoice.js';
import Room from '../../models/Room.js';

// GET /api/admin/invoices?page=1&limit=10
export const getInvoices = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Invoice.find({})
        .populate('room_id', 'room_code building')
        .populate('paid_by', 'fullname mssv')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments({}),
    ]);

    res.json({ data, pagination: { total, page, limit } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/invoices
export const createInvoice = async (req, res) => {
  try {
    const { room_id, month, electricity_cost, water_cost, additional_cost } = req.body;

    if (!room_id || !month || electricity_cost === undefined || water_cost === undefined) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (room_id, month, điện, nước)' });
    }

    const room = await Room.findById(room_id);
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });

    const existing = await Invoice.findOne({ room_id, month });
    if (existing) {
      return res.status(400).json({ message: `Hóa đơn tháng ${month} cho phòng này đã tồn tại` });
    }

    const total_amount =
      Number(electricity_cost) +
      Number(water_cost) +
      Number(additional_cost || 0) +
      Number(room.price);

    const invoice = await Invoice.create({
      room_id, month,
      electricity_cost: Number(electricity_cost),
      water_cost:       Number(water_cost),
      additional_cost:  Number(additional_cost || 0),
      total_amount,
    });

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/invoices/:id/confirm
export const confirmPayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    if (invoice.status === 'Paid') return res.status(400).json({ message: 'Hóa đơn đã được xác nhận rồi' });

    invoice.status = 'Paid';
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/invoices/:id/reject — Mở khóa hóa đơn để sinh viên khác có thể trả
export const rejectPayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    if (invoice.status === 'Paid') return res.status(400).json({ message: 'Hóa đơn đã thanh toán không thể từ chối' });

    invoice.status          = 'Pending';
    invoice.paid_by         = null;
    invoice.payment_proof_url = null;
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
