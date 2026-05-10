import Setting from '../models/Setting.js';
import Knowledge from '../models/Knowledge.js';
import Room from '../models/Room.js';
import Contract from '../models/Contract.js';
import Request from '../models/Request.js';
import Feedback from '../models/Feedback.js';

function knowledgeAnswerAsPlainText(html) {
    if (!html || typeof html !== 'string') return '';
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export const chatWithBot = async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        const studentId = req.user._id;

        const setting = await Setting.findOne();
        if (!setting || !setting.geminiApiKey) {
            return res.status(400).json({ message: 'Chatbot chưa được cấu hình API Key. Vui lòng liên hệ Admin.' });
        }

        // Fetch Knowledge Base
        const knowledgeItems = await Knowledge.find();
        let context = "Dưới đây là thông tin nội quy và kiến thức về Ký túc xá:\n";
        knowledgeItems.forEach(item => {
            const answerPlain = knowledgeAnswerAsPlainText(item.answer);
            context += `Q: ${item.question}\nA: ${answerPlain}\n\n`;
        });

        // Define Tools based on permissions
        const functionDeclarations = [];
        
        if (setting.agentAllowCheckRoom) {
            functionDeclarations.push({
                name: "checkRoomAvailability",
                description: "Kiểm tra danh sách phòng trống trong KTX. Có thể lọc theo tầng (floor) và loại phòng (roomType: 'Standard', 'Service', 'VIP').",
                parameters: {
                    type: "object",
                    properties: {
                        floor: { type: "integer", description: "Số tầng (ví dụ: 1, 2, 3)" },
                        roomType: { type: "string", description: "Loại phòng ('Standard', 'Service', 'VIP')" }
                    }
                }
            });
        }
        
        if (setting.agentAllowCheckContract) {
            functionDeclarations.push({
                name: "checkContractStatus",
                description: "Kiểm tra thông tin hợp đồng phòng KTX hiện tại của sinh viên đang hỏi.",
                parameters: {
                    type: "object",
                    properties: {} // No params needed
                }
            });
        }
        
        if (setting.agentAllowCreateMaintenance) {
            functionDeclarations.push({
                name: "createMaintenanceRequest",
                description: "Tạo đơn yêu cầu báo hỏng cơ sở vật chất hoặc sửa chữa phòng. Bạn phải hỏi rõ sinh viên mô tả hư hỏng và mã phòng trước khi gọi hàm này.",
                parameters: {
                    type: "object",
                    properties: {
                        room_id: { type: "string", description: "ID hoặc mã phòng cần sửa chữa" },
                        description: { type: "string", description: "Mô tả chi tiết vật dụng bị hỏng cần sửa" }
                    },
                    required: ["room_id", "description"]
                }
            });
        }

        const tools = functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined;

        const systemInstruction = `Bạn là trợ lý ảo AI Agent hỗ trợ sinh viên tại Ký túc xá.
QUY TẮC QUAN TRỌNG:
1. Bạn CÓ THỂ sử dụng các công cụ (tools) được cung cấp để tra cứu hoặc thay đổi dữ liệu thực tế.
2. Nếu sinh viên yêu cầu kiểm tra phòng, kiểm tra hợp đồng hoặc tạo đơn báo hỏng, bạn BẮT BUỘC phải gọi tool tương ứng. KHÔNG ĐƯỢC tự bịa ra thông tin hoặc nói rằng đã làm xong mà không gọi tool.
3. Chỉ khi tool trả về kết quả, bạn mới dùng kết quả đó để trả lời sinh viên.

Bối cảnh kiến thức:
${context}

Dựa vào thông tin trên và kết quả thực tế từ các công cụ, hãy trả lời sinh viên một cách ngắn gọn, chuyên nghiệp và thân thiện.`;

        const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${setting.geminiApiKey}`;

        // Step 1: Initial request to Gemini
        let contents = [];
        
        // Push historical messages
        history.forEach((h) => {
            const role = h.role === 'bot' ? 'model' : 'user';
            contents.push({ role, parts: [{ text: h.text }] });
        });
        
        // Push current message
        contents.push({ role: "user", parts: [{ text: message }] });

        let response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents, 
                tools 
            })
        });
        let data = await response.json();

        if (!response.ok) {
            console.error('Gemini API Error:', data);
            return res.status(500).json({ message: 'Lỗi từ Gemini API. Kiểm tra lại API Key.' });
        }

        let responsePart = data.candidates[0].content.parts[0];
        
        let actions = [];

        // Step 2: Handle Function Call loop
        if (responsePart.functionCall) {
            const { name, args } = responsePart.functionCall;
            actions.push(name);
            
            let functionResponseData = {};

            try {
                if (name === 'checkRoomAvailability' && setting.agentAllowCheckRoom) {
                    const filter = { status: 'Available' };
                    if (args.floor) filter.floor = args.floor;
                    if (args.roomType) filter.roomType = args.roomType;
                    const rooms = await Room.find(filter).limit(5).select('room_code floor roomType price capacity members');
                    functionResponseData = { rooms };
                } 
                else if (name === 'checkContractStatus' && setting.agentAllowCheckContract) {
                    const contract = await Contract.findOne({ student_id: studentId, status: 'Active' }).populate('room_id', 'room_code');
                    functionResponseData = contract ? { 
                        status: 'Active', 
                        room: contract.room_id.room_code, 
                        startDate: contract.start_date, 
                        endDate: contract.end_date, 
                        price: contract.price 
                    } : { message: 'Sinh viên chưa có hợp đồng nào đang có hiệu lực.' };
                }
                else if (name === 'createMaintenanceRequest' && setting.agentAllowCreateMaintenance) {
                    const newFeedback = await Feedback.create({
                        student_id: studentId,
                        title: `Yêu cầu sửa chữa phòng ${args.room_id}`,
                        description: args.description,
                        status: 'Pending'
                    });
                    functionResponseData = { success: true, request_id: newFeedback._id, message: 'Đã tạo yêu cầu sửa chữa (phản hồi) thành công.' };
                } else {
                    functionResponseData = { error: 'Function not allowed or not found' };
                }
            } catch (err) {
                functionResponseData = { error: err.message };
            }

            // Append model's functionCall to history
            contents.push(data.candidates[0].content);
            // Append our functionResponse
            contents.push({
                role: "function",
                parts: [{
                    functionResponse: {
                        name: name,
                        response: { name: name, content: functionResponseData }
                    }
                }]
            });

            // Make the second call to Gemini with the function results
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    system_instruction: { parts: [{ text: systemInstruction }] },
                    contents, 
                    tools 
                })
            });
            data = await response.json();
            
            if (!response.ok) {
                console.error('Gemini API Error (after function call):', data);
                return res.status(500).json({ message: 'Lỗi sinh phản hồi sau khi gọi hàm.' });
            }
            
            responsePart = data.candidates[0].content.parts[0];
        }

        const botReply = responsePart.text;
        res.json({ reply: botReply, actions });
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ message: error.message });
    }
};
