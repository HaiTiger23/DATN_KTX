import Knowledge from '../../models/Knowledge.js';

export const getKnowledge = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const data = await Knowledge.find({}).sort('-createdAt').skip(skip).limit(limit);
    const total = await Knowledge.countDocuments({});

    res.json({
      data: data,
      pagination: { current: page, pageSize: limit, total }
    });
  } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createKnowledge = async (req, res) => {
    try {
        const { question, answer } = req.body;
        const data = await Knowledge.create({ question, answer });
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteKnowledge = async (req, res) => {
    try {
        await Knowledge.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
