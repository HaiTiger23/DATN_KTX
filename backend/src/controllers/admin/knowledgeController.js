import Knowledge from '../../models/Knowledge.js';

export const getKnowledge = async (req, res) => {
    try {
        const data = await Knowledge.find().sort('-createdAt');
        res.json(data);
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
