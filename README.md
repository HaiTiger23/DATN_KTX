# Hệ thống Quản lý Ký túc xá thông minh (Backend)

Dự án này là phần Backend cho hệ thống quản lý ký túc xá, được xây dựng theo kiến trúc MERN Stack (Node.js, Express, MongoDB).

## 🚀 Công nghệ sử dụng
- **Ngôn ngữ:** JavaScript (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JSON Web Token (JWT) & bcryptjs
- **Middleware:** CORS, dotenv

## 📂 Cấu trúc thư mục (Backend)
```text
backend/
├── src/
│   ├── config/          # Cấu hình kết nối Database
│   ├── controllers/     # Xử lý logic nghiệp vụ (Admin & Auth)
│   ├── middleware/      # Middleware xác thực JWT & Phân quyền
│   ├── models/          # Định nghĩa Schema dữ liệu (Schema Mongoose)
│   ├── routes/          # Các endpoint API theo từng module
│   ├── server.js        # File khởi tạo server
│   └── seed.js          # Script tạo tài khoản Admin mẫu
├── .env                 # Biến môi trường (URI DB, JWT Secret,...)
└── package.json         # Quản lý dependencies
```

## 🛠 Hướng dẫn cài đặt & Chạy dự án

1. **Cài đặt dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Cấu hình môi trường:**
   Tạo file `.env` (dựa trên `.env.example`) và điền các thông tin:
   - `PORT=5000`
   - `MONGODB_URI=...` (Chuỗi kết nối MongoDB của bạn)
   - `JWT_SECRET=...` (Mã bí mật để mã hóa Token)

3. **Khởi tạo dữ liệu (Seed Admin):**
   ```bash
   node src/seed.js
   ```
   *Tài khoản mặc định:* `admin@dorm.com` / `admin123`

4. **Chạy dự án (Chế độ Development):**
   ```bash
   npm run dev
   ```

## 📖 Danh sách API (API Endpoints)

### 1. Xác thực (Authentication)
- `[POST] /api/auth/login`: Đăng nhập và nhận JWT Token.

### 2. Quản lý Sinh viên (Admin)
- `[GET] /api/admin/students`: Lấy danh sách tất cả sinh viên.
- `[POST] /api/admin/students`: Thêm sinh viên mới.
- `[PUT] /api/admin/students/:id`: Cập nhật thông tin sinh viên.
- `[DELETE] /api/admin/students/:id`: Xóa sinh viên (Nếu không có hợp đồng đang hoạt động).

### 3. Quản lý Phòng (Admin)
- `[GET] /api/admin/rooms`: Lấy danh sách phòng.
- `[POST] /api/admin/rooms`: Tạo phòng mới.
- `[PUT] /api/admin/rooms/:id`: Sửa thông tin (Giá, Sức chứa).
- `[PATCH] /api/admin/rooms/:id/status`: Đổi trạng thái phòng (Available/Maintenance).

### 4. Quản lý Đơn đăng ký & Hợp đồng
- `[GET] /api/admin/requests`: Danh sách đơn chờ duyệt.
- `[POST] /api/admin/requests/:id/approve`: Duyệt đơn (Tự động tăng số người ở & tạo Hợp đồng).
- `[POST] /api/admin/requests/:id/reject`: Từ chối đơn.
- `[GET] /api/admin/contracts`: Xem danh sách tất cả hợp đồng.
- `[PATCH] /api/admin/contracts/:id/status`: Kết thúc hợp đồng (Tự động giảm số người ở).

### 5. Phản ánh (Feedbacks)
- `[GET] /api/admin/feedbacks`: Xem danh sách phản ánh.
- `[POST] /api/admin/feedbacks/:id/reply`: Phản hồi ý kiến sinh viên.

---
*Ghi chú: Mọi API trong /api/admin/* đều yêu cầu Header Authorization: Bearer <token> và Role của User phải là 'Admin'.*
