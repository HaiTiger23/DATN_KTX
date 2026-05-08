import mongoose from 'mongoose';

const knowledgeSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
});

const Knowledge = mongoose.model('Knowledge', knowledgeSchema);

export default Knowledge;
