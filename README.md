# Hệ thống Quản lý Ký túc xá thông minh

Dự án Backend API + Admin Dashboard cho hệ thống quản lý ký túc xá, xây dựng theo kiến trúc MERN Stack.

## 🚀 Công nghệ sử dụng

| Layer | Công nghệ |
|-------|-----------|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js v5 |
| Database | MongoDB (Mongoose v9) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Middleware | CORS, dotenv, nodemon |

## 📂 Cấu trúc thư mục

```text
DATN_KTX/
├── backend/
│   └── src/
│       ├── config/
│       │   └── db.js                    # Kết nối MongoDB
│       ├── controllers/
│       │   ├── authController.js        # Xác thực
│       │   └── admin/
│       │       ├── studentController.js
│       │       ├── roomController.js
│       │       ├── requestController.js
│       │       ├── contractController.js
│       │       └── feedbackController.js
│       ├── middleware/
│       │   └── authMiddleware.js        # JWT guard + Role guard
│       ├── models/
│       │   ├── User.js
│       │   ├── Room.js
│       │   ├── Request.js
│       │   ├── Contract.js
│       │   └── Feedback.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   └── admin/                   # 5 route files
│       ├── server.js
│       └── seed.js                      # Tạo tài khoản Admin mặc định
├── code/
│   ├── requirement.md                   # PRD đầy đủ
│   └── frontend_guide.md               # Hướng dẫn dev Frontend
└── ktx_postman_collection.json          # Postman collection (v2, auto-save token)
```

## 🛠 Cài đặt & Chạy

**1. Cài dependencies:**
```bash
cd backend
npm install
```

**2. Cấu hình môi trường** — tạo file `.env` từ `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ktx_db
JWT_SECRET=your_strong_secret_key
NODE_ENV=development
```

**3. Tạo tài khoản Admin mặc định:**
```bash
node src/seed.js
# Tài khoản: admin@dorm.com / admin123
```

**4. Chạy server (development):**
```bash
npm run dev   # nodemon — tự reload khi sửa code
```

Server chạy tại: `http://localhost:5000`

## 📖 API Endpoints

> **Lưu ý:** Tất cả `/api/admin/*` yêu cầu header `Authorization: Bearer <token>` với role `Admin`.

### 1. Xác thực

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập (Admin hoặc Student), trả về JWT token |

### 2. Quản lý Sinh viên

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/students` | Danh sách sinh viên (không trả về password) |
| POST | `/api/admin/students` | Thêm sinh viên (check trùng email/mssv/cccd, tự hash password) |
| PUT | `/api/admin/students/:id` | Cập nhật thông tin |
| DELETE | `/api/admin/students/:id` | Xóa sinh viên (chặn nếu còn contract Active; tự xóa Pending requests) |

### 3. Quản lý Phòng

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/rooms` | Danh sách phòng |
| POST | `/api/admin/rooms` | Tạo phòng mới |
| PUT | `/api/admin/rooms/:id` | Sửa giá, sức chứa (chặn nếu capacity < current_people) |
| PATCH | `/api/admin/rooms/:id/status` | Đổi trạng thái `Available`/`Maintenance` (chặn Maintenance nếu đang có người) |
| POST | `/api/admin/rooms/sync-occupancy` | Đồng bộ lại `current_people` từ contract thực tế |

### 4. Duyệt đơn đăng ký

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/requests` | Danh sách đơn đang `Pending` (có populate student & room) |
| POST | `/api/admin/requests/:id/approve` | Duyệt đơn (atomic tăng current_people, chặn trùng contract, tạo hợp đồng) |
| POST | `/api/admin/requests/:id/reject` | Từ chối đơn |

**Body approve (optional):**
```json
{ "start_date": "2025-09-01", "end_date": "2026-03-01" }
```
Nếu không gửi: mặc định hôm nay + 6 tháng.

### 5. Quản lý Hợp đồng

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/contracts` | Danh sách tất cả hợp đồng (populate student & room) |
| PATCH | `/api/admin/contracts/:id/status` | Kết thúc hợp đồng (atomic giảm current_people, không xuống dưới 0) |

### 6. Quản lý Phản ánh

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/feedbacks` | Danh sách phản ánh (populate student) |
| POST | `/api/admin/feedbacks/:id/reply` | Trả lời phản ánh (chặn reply đơn đã Answered) |

## 🧪 Test với Postman

Import file `ktx_postman_collection.json` vào Postman.

- **Bước 1:** Gọi request `🔐 Auth > Login` — token JWT tự động lưu vào biến `admin_token`
- **Bước 2:** Tất cả folder Admin đã cấu hình Bearer token tự động — dùng ngay không cần cấu hình thêm

## 🗄 Database Models

| Model | Các trường chính |
|-------|-----------------|
| `User` | email, password (hashed), role (`Admin`/`Student`), mssv, fullname, cccd, phone, address, status |
| `Room` | room_code, building, capacity, current_people, price, status (`Available`/`Maintenance`) |
| `Request` | student_id, room_id, status (`Pending`/`Approved`/`Rejected`) |
| `Contract` | student_id, room_id, status (`Active`/`Ended`), start_date, end_date |
| `Feedback` | student_id, title, description, reply_content, status (`Pending`/`Answered`) |

## 📁 Tài liệu bổ sung

- **[`code/frontend_guide.md`](code/frontend_guide.md)** — Hướng dẫn cho Frontend Developer: Axios instance, Auth Context, Protected Route, API calls cho từng màn hình
- **[`code/requirement.md`](code/requirement.md)** — PRD đầy đủ (yêu cầu Backend + Frontend)
