/**
 * Base URL for API. In dev, Vite proxies `/api` → backend (see vite.config.js).
 */
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'https://datn-ktx.onrender.com/api' : 'https://datn-ktx.onrender.com/api');

export const TAB_TITLES = {
  rooms: 'Quản lý Phòng ở',
  students: 'Danh sách Sinh viên',
  requests: 'Đơn đăng ký chờ duyệt',
  contracts: 'Hợp đồng Hệ thống',
  feedbacks: 'Phản ánh của Sinh viên',
  admin_knowledge: 'Quản lý Cơ sở tri thức (RAG)',
  admin_settings: 'Cài đặt hệ thống',
  student_rooms: 'Đăng ký phòng ở',
  student_requests: 'Đơn đăng ký của tôi',
  student_contracts: 'Hợp đồng của tôi',
  student_feedbacks: 'Gửi phản hồi cho BQL',
  student_chatbot: 'Trợ lý Ảo AI (Gemini)',
  profile: 'Thông tin cá nhân',
};
