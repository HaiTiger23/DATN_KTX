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
  agentAllowCreateMaintenance: {
    type: Boolean,
    default: false
  },
  agentAllowCheckContract: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
});

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;
