import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  geminiApiKey: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;
