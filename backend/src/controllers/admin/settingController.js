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
        if (req.body.geminiApiKey !== undefined) setting.geminiApiKey = req.body.geminiApiKey;
        if (req.body.agentAllowCheckRoom !== undefined) setting.agentAllowCheckRoom = req.body.agentAllowCheckRoom;
        if (req.body.agentAllowCreateMaintenance !== undefined) setting.agentAllowCreateMaintenance = req.body.agentAllowCreateMaintenance;
        if (req.body.agentAllowCheckContract !== undefined) setting.agentAllowCheckContract = req.body.agentAllowCheckContract;
        
        await setting.save();
        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
