import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  geminiApiKey: {
    type: String,
    default: '',
  },
  agentAllowCheckRoom: {
    type: Boolean,
    default: true
  },

  agentAllowCheckContract: {
    type: Boolean,
    default: true
  },
  aiSystemPrompt: {
    type: String,
    default: 'Bạn là một trợ lý ảo của Ký túc xá. Hãy hỗ trợ sinh viên dựa trên thông tin được cung cấp.'
  },
  allowedEmailDomains: {
    type: [String],
    default: [] // Empty means all domains allowed
  },
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 587 },
  smtpUser: { type: String, default: '' },
  smtpPass: { type: String, default: '' },
  contractBqlName: { type: String, default: '' },
  contractRepName: { type: String, default: '' },
  contractRepRole: { type: String, default: '' },
  contractRepPhone: { type: String, default: '' },
  contractTerms: { type: String, default: '' },
  generalRules: { type: String, default: '' }
}, {
  timestamps: true,
});

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;
