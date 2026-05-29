import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoice_code: {
    type: String,
    unique: true,
  },
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  month: {
    type: String,
    required: true, // VD: "05/2026"
  },
  electricity_cost: { type: Number, required: true, default: 0 },
  water_cost:       { type: Number, required: true, default: 0 },
  additional_cost:  { type: Number, default: 0 },
  total_amount:     { type: Number, required: true },

  status: {
    type: String,
    enum: ['Pending', 'Waiting_Approval', 'Paid'],
    default: 'Pending',
  },
  paid_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  // URL ảnh biên lai lưu trên Cloudinary
  payment_proof_url: {
    type: String,
    default: null,
  },
}, { timestamps: true });

// Một phòng chỉ có 1 hóa đơn mỗi tháng
invoiceSchema.index({ room_id: 1, month: 1 }, { unique: true });

export default mongoose.model('Invoice', invoiceSchema);
