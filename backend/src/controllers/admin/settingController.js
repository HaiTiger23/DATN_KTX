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
        if (req.body.agentAllowCheckContract !== undefined) setting.agentAllowCheckContract = req.body.agentAllowCheckContract;
        if (req.body.aiSystemPrompt !== undefined) setting.aiSystemPrompt = req.body.aiSystemPrompt;
        if (req.body.allowedEmailDomains !== undefined) setting.allowedEmailDomains = req.body.allowedEmailDomains;
        
        if (req.body.smtpHost !== undefined) setting.smtpHost = req.body.smtpHost;
        if (req.body.smtpPort !== undefined) setting.smtpPort = req.body.smtpPort;
        if (req.body.smtpUser !== undefined) setting.smtpUser = req.body.smtpUser;
        if (req.body.smtpPass !== undefined) setting.smtpPass = req.body.smtpPass;

        const updatedSetting = await setting.save();
        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
