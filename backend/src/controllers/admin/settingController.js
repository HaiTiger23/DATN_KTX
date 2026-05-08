import Setting from '../../models/Setting.js';

export const getSettings = async (req, res) => {
    try {
        let setting = await Setting.findOne();
        if (!setting) {
            setting = await Setting.create({});
        }
        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        let setting = await Setting.findOne();
        if (!setting) {
            setting = await Setting.create({});
        }
        setting.geminiApiKey = req.body.geminiApiKey || setting.geminiApiKey;
        await setting.save();
        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
