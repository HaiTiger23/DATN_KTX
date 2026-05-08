import Setting from '../models/Setting.js';
import Knowledge from '../models/Knowledge.js';

export const chatWithBot = async (req, res) => {
    try {
        const { message } = req.body;

        const setting = await Setting.findOne();
        if (!setting || !setting.geminiApiKey) {
            return res.status(400).json({ message: 'Chatbot chưa được cấu hình API Key. Vui lòng liên hệ Admin.' });
        }

        // Fetch Knowledge Base
        const knowledgeItems = await Knowledge.find();
        let context = "Dưới đây là thông tin về Ký túc xá (Cơ sở tri thức):\n";
        knowledgeItems.forEach(item => {
            context += `Q: ${item.question}\nA: ${item.answer}\n\n`;
        });

        const prompt = `Bạn là trợ lý ảo hỗ trợ sinh viên tại Ký túc xá.\n${context}\nDựa vào thông tin trên, hãy trả lời câu hỏi của sinh viên một cách ngắn gọn, thân thiện. Nếu câu hỏi không liên quan đến KTX hoặc không có thông tin, hãy bảo sinh viên liên hệ Ban quản lý.\nCâu hỏi của sinh viên: "${message}"`;

        const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${setting.geminiApiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini API Error:', data);
            return res.status(500).json({ message: 'Lỗi từ Gemini API. Kiểm tra lại API Key.' });
        }

        const botReply = data.candidates[0].content.parts[0].text;
        res.json({ reply: botReply });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
