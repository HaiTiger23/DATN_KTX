import Setting from '../models/Setting.js';
import Knowledge from '../models/Knowledge.js';
import Room from '../models/Room.js';
import Contract from '../models/Contract.js';
import Request from '../models/Request.js';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

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
        const isAdmin = req.user.role === 'admin' || req.user.role === 'Admin';

        const setting = await Setting.findOne();
        if (!setting || !setting.geminiApiKey) {
            return res.status(400).json({ message: 'Chatbot chưa được cấu hình API Key. Vui lòng liên hệ Admin.' });
        }

        // Fetch Knowledge Base and Notifications
        const knowledgeItems = await Knowledge.find();
        const latestNotifications = await Notification.find().sort({ createdAt: -1 }).limit(5);

        let context = "Dưới đây là thông tin nội quy và kiến thức về Ký túc xá:\n";
        
        if (latestNotifications.length > 0) {
            context += "\n[THÔNG BÁO MỚI NHẤT TỪ KTX]\n";
            latestNotifications.forEach(notif => {
                const notifPlain = knowledgeAnswerAsPlainText(notif.content);
                context += `- [Ngày ${new Date(notif.createdAt).toLocaleDateString('vi-VN')}] ${notif.title}: ${notifPlain}\n`;
            });
            context += "\n[KIẾN THỨC CHUNG]\n";
        }

        knowledgeItems.forEach(item => {
            const answerPlain = knowledgeAnswerAsPlainText(item.answer);
            context += `Q: ${item.question}\nA: ${answerPlain}\n\n`;
        });

        // Define Tools based on permissions
        const functionDeclarations = [];
        
        if (setting.agentAllowCheckRoom) {
            functionDeclarations.push({
                name: "checkRoomAvailability",
                description: "Tra cứu danh sách phòng trống trong KTX. Dùng hàm này khi sinh viên hỏi về giá phòng, số chỗ ngồi (capacity), tầng, hoặc loại phòng. Có thể lọc theo tầng, loại phòng, hoặc sức chứa.",
                parameters: {
                    type: "object",
                    properties: {
                        floor: { type: "integer", description: "Số tầng (ví dụ: 1, 2, 3)" },
                        roomType: { type: "string", description: "Loại phòng ('Standard', 'Service', 'VIP')" },
                        capacity: { type: "integer", description: "Sức chứa/Số chỗ của phòng (ví dụ: 4, 6, 8, 10)" },
                        maxPrice: { type: "integer", description: "Mức giá tối đa mà sinh viên muốn tìm (ví dụ: 1000000, 2000000)" }
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
        
        if (isAdmin) {
            functionDeclarations.push({
                name: "getSystemStats",
                description: "Thống kê tổng quan hệ thống Ký túc xá bao gồm số phòng trống, số lượng sinh viên đang ở, các đơn yêu cầu đang chờ duyệt, và THỐNG KÊ TỶ LỆ LẤP ĐẦY theo từng khu/tòa nhà.",
                parameters: { type: "object", properties: {} }
            });
            functionDeclarations.push({
                name: "searchStudent",
                description: "Tra cứu thông tin sinh viên theo Tên, MSSV hoặc CCCD.",
                parameters: {
                    type: "object",
                    properties: {
                        keyword: { type: "string", description: "Từ khóa tìm kiếm (Tên, MSSV, hoặc số CCCD)" }
                    },
                    required: ["keyword"]
                }
            });
            functionDeclarations.push({
                name: "getPendingTasks",
                description: "Lấy danh sách các đơn yêu cầu sửa chữa hoặc phản ánh (feedback) đang chờ xử lý.",
                parameters: { type: "object", properties: {} }
            });
        }
        

        const tools = functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined;

        let systemInstruction = '';
        if (isAdmin) {
            systemInstruction = `Bạn là Trợ lý quản lý hệ thống Ký túc xá. Nhiệm vụ của bạn là cung cấp số liệu thống kê, tra cứu sinh viên, và báo cáo tình hình cho Ban quản lý.
Bối cảnh kiến thức và thông báo:
${context}
Khi Admin hỏi về thống kê (ví dụ: Còn bao nhiêu phòng trống? Khu nào đông nhất?), HÃY TỰ ĐỘNG GỌI hàm getSystemStats(). Khi nhận được kết quả, hãy phân tích tỷ lệ lấp đầy của các khu và báo cáo chi tiết. Hãy trả lời Admin một cách chuyên nghiệp.`;
        } else {
            systemInstruction = `${setting.aiSystemPrompt || 'Bạn là trợ lý ảo AI Agent hỗ trợ sinh viên tại Ký túc xá.'}
QUY TẮC QUAN TRỌNG:
1. Bạn CÓ THỂ sử dụng các công cụ (tools) được cung cấp để tra cứu dữ liệu thực tế.
2. ƯU TIÊN THÔNG BÁO MỚI NHẤT: Nếu sinh viên hỏi về các vấn đề như điện, nước, giá cả, tuyển sinh... BẮT BUỘC đối chiếu với mục [THÔNG BÁO MỚI NHẤT TỪ KTX] trong Bối cảnh trước. Nếu có thông tin, hãy trích dẫn: "Theo thông báo mới nhất ngày [Ngày], KTX sẽ...".
3. ĐỀ XUẤT PHÒNG THÔNG MINH: Khi sinh viên hỏi tìm phòng hoặc cung cấp ngân sách, bắt buộc gọi checkRoomAvailability() với maxPrice. ĐÓNG VAI TƯ VẤN VIÊN: Hãy phân tích dựa trên kết quả và CHỦ ĐỘNG ĐỀ XUẤT 1-2 phòng phù hợp nhất (ví dụ phòng có giá rẻ nhất, hoặc phòng đang trống ít người).
4. KHÔNG ĐƯỢC tự bịa ra thông tin. Chỉ trả lời dựa trên context và kết quả từ tool.

Bối cảnh hiện tại:
${context}

Dựa vào thông tin trên, hãy trả lời sinh viên một cách chuyên nghiệp, thông minh và thân thiện.`;
        }

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
                    if (args.capacity) filter.capacity = args.capacity;
                    if (args.maxPrice) filter.price = { $lte: args.maxPrice };
                    
                    // Only find rooms that are not full
                    filter.$expr = { $lt: [ "$current_people", "$capacity" ] };
                    
                    const rooms = await Room.find(filter).limit(15).select('room_code floor roomType price capacity current_people');
                    
                    if (rooms.length === 0 && args.capacity) {
                        const availableCapacities = await Room.distinct('capacity', { status: 'Available', $expr: { $lt: [ "$current_people", "$capacity" ] } });
                        functionResponseData = { 
                            message: `Không tìm thấy phòng trống nào có sức chứa chính xác ${args.capacity} người.`,
                            hint: `Hiện tại KTX đang có các loại phòng trống với sức chứa: ${availableCapacities.join(', ')} người. Hãy gợi ý sinh viên chọn các loại phòng này.`
                        };
                    } else {
                        const formattedRooms = rooms.map(r => ({
                            room_code: r.room_code,
                            floor: r.floor,
                            roomType: r.roomType,
                            price_vnd: r.price,
                            total_capacity: r.capacity,
                            available_spots: r.capacity - (r.current_people || 0)
                        }));
                        functionResponseData = { 
                            message: rooms.length > 0 ? `Tìm thấy ${rooms.length} phòng trống phù hợp.` : 'Không có phòng trống nào phù hợp với yêu cầu.',
                            rooms: formattedRooms 
                        };
                    }
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
                else if (isAdmin && name === 'getSystemStats') {
                    const totalRooms = await Room.countDocuments();
                    const availableRooms = await Room.countDocuments({ $expr: { $lt: [ "$current_people", "$capacity" ] } }); 
                    const totalStudents = await Contract.countDocuments({ status: 'Active' });
                    const pendingRequests = await Request.countDocuments({ status: 'Pending' });
                    const pendingFeedbacks = await Feedback.countDocuments({ status: 'Pending' });
                    
                    const buildingStatsRaw = await Room.aggregate([
                        {
                            $group: {
                                _id: "$building",
                                totalCapacity: { $sum: "$capacity" },
                                totalPeople: { $sum: "$current_people" }
                            }
                        }
                    ]);
                    
                    const buildingStats = buildingStatsRaw.map(b => ({
                        building: b._id,
                        occupancyRate: b.totalCapacity > 0 ? ((b.totalPeople / b.totalCapacity) * 100).toFixed(1) + '%' : '0%'
                    }));

                    functionResponseData = { totalRooms, availableRooms, totalStudents, pendingRequests, pendingFeedbacks, buildingStats };
                }
                else if (isAdmin && name === 'searchStudent') {
                    const { keyword } = functionCall.args;
                    const regex = new RegExp(keyword, 'i');
                    const users = await User.find({ $or: [{ fullname: regex }, { mssv: regex }, { cccd: regex }], role: 'Student' }).select('fullname mssv email phone').limit(5);
                    if (users.length === 0) {
                        functionResponseData = { message: "Không tìm thấy sinh viên nào phù hợp." };
                    } else {
                        const results = [];
                        for (const u of users) {
                            const contract = await Contract.findOne({ student_id: u._id, status: 'Active' }).populate('room_id', 'room_code building');
                            results.push({
                                fullname: u.fullname,
                                mssv: u.mssv,
                                phone: u.phone,
                                room: contract ? `${contract.room_id.room_code} - ${contract.room_id.building}` : "Chưa có phòng"
                            });
                        }
                        functionResponseData = { students: results };
                    }
                }
                else if (isAdmin && name === 'getPendingTasks') {
                    const requests = await Request.find({ status: 'Pending' }).populate('student_id', 'fullname mssv').limit(5);
                    const feedbacks = await Feedback.find({ status: 'Pending' }).populate('student_id', 'fullname mssv').limit(5);
                    
                    const formattedReqs = requests.map(r => ({ id: r._id, type: 'Yêu cầu sửa chữa', title: r.title, student: r.student_id?.fullname }));
                    const formattedFbs = feedbacks.map(f => ({ id: f._id, type: 'Phản ánh', title: f.title, student: f.student_id?.fullname }));
                    
                    functionResponseData = { pending_tasks: [...formattedReqs, ...formattedFbs] };
                }
                else {
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
