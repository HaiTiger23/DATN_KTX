# PROJECT REQUIREMENTS DOCUMENT (PRD)
**Project Name:** Hệ thống Quản lý Ký túc xá thông minh (Backend + Admin Dashboard)
**Tech Stack:** MERN Stack (MongoDB, Express.js, React.js, Node.js)
**Scope:** Xây dựng toàn bộ Backend API và giao diện Web Frontend dành riêng cho Admin (Bỏ qua giao diện của Sinh viên).

## 1. DATABASE MODELS (MongoDB / Mongoose)
1. **Users (`users`):** `email`, `password`, `role` (['Admin', 'Student']), `mssv`, `fullname`, `cccd`, `phone`, `address`, `status`.
2. **Rooms (`rooms`):** `room_code`, `building`, `capacity`, `current_people`, `price`, `status` (['Available', 'Maintenance']).
3. **Requests (`requests`):** `student_id` (ref User), `room_id` (ref Room), `status` (['Pending', 'Approved', 'Rejected']).
4. **Contracts (`contracts`):** `student_id` (ref User), `room_id` (ref Room), `status` (['Active', 'Ended']), `start_date`, `end_date`.
5. **Feedbacks (`feedbacks`):** `student_id` (ref User), `title`, `description`, `reply_content`, `status` (['Pending', 'Answered']).

---

## 2. BACKEND API SPECIFICATIONS (Node.js / Express.js)

### 2.1. Authentication
- `[POST] /api/auth/login`: Xác thực Admin/Student. Trả về `token` (JWT) và `user_info`.

### 2.2. Admin APIs (Middleware: Verify JWT & Role = 'Admin')
- **Students:**
  - `[GET] /api/admin/students`: Lấy danh sách sinh viên.
  - `[POST] /api/admin/students`: Thêm sinh viên (Hash password, check trùng mssv/cccd).
  - `[PUT] /api/admin/students/:id`: Sửa thông tin.
  - `[DELETE] /api/admin/students/:id`: Xóa sinh viên (Chặn nếu có Contract `Active`).
- **Rooms:**
  - `[GET] /api/admin/rooms`: Lấy danh sách phòng.
  - `[POST] /api/admin/rooms`: Thêm phòng.
  - `[PUT] /api/admin/rooms/:id`: Sửa giá, sức chứa.
  - `[PATCH] /api/admin/rooms/:id/status`: Đổi trạng thái (Chặn Maintenance nếu đang có người ở).
- **Requests (Đăng ký ở):**
  - `[GET] /api/admin/requests`: Danh sách đơn `Pending` (Populate student & room).
  - `[POST] /api/admin/requests/:id/approve`: Duyệt đơn (Check sức chứa phòng -> Update status -> Tăng current_people -> Create Contract).
  - `[POST] /api/admin/requests/:id/reject`: Từ chối đơn.
- **Contracts & Feedbacks:**
  - `[GET] /api/admin/contracts`: Danh sách hợp đồng.
  - `[PATCH] /api/admin/contracts/:id/status`: Cập nhật trạng thái `Ended` (Giảm current_people của phòng đi 1).
  - `[GET] /api/admin/feedbacks`: Danh sách phản ánh.
  - `[POST] /api/admin/feedbacks/:id/reply`: Gửi câu trả lời phản ánh.

*(Ghi chú: Giữ lại các API của Student & Chatbot ở backend nếu cần thiết cho tương lai, nhưng không làm UI cho chúng).*

---

## 3. FRONTEND ADMIN DASHBOARD (React.js)

### 3.1. Cấu trúc Layout (Admin Layout)
Sử dụng thư viện UI (Material-UI, Ant Design hoặc Tailwind + Shadcn) để dựng Layout chuẩn Admin:
- **Sidebar (Menu bên trái):** Chứa các liên kết điều hướng (Tổng quan, QL Sinh viên, QL Phòng, Duyệt đơn, QL Hợp đồng, QL Phản ánh).
- **Header (Thanh trên cùng):** Hiển thị tên Admin đang đăng nhập, nút Đăng xuất.
- **Main Content:** Vùng hiển thị nội dung của từng trang.

### 3.2. Cấu trúc Trang & Tuyến đường (Routes)
**1. Auth Page (`/login`)**
- Form đăng nhập (Email, Password).
- Lưu JWT Token vào `localStorage`. Redirect sang `/admin/dashboard` nếu role là Admin. Chặn nếu là Student.

**2. Dashboard Page (`/admin/dashboard`)**
- Hiển thị các thẻ thống kê (Cards): Tổng số phòng trống, Số đơn chờ duyệt, Số phản ánh chưa xử lý.

**3. Quản lý Sinh viên (`/admin/students`)**
- Hiển thị bảng (Table) danh sách sinh viên.
- Nút "Thêm mới" -> Mở Modal chứa Form điền thông tin.
- Cột Hành động (Action): Nút "Sửa" (Mở modal nạp thông tin cũ) và nút "Xóa" (Mở popup Confirm).

**4. Quản lý Phòng ở (`/admin/rooms`)**
- Bảng danh sách phòng kèm trạng thái (Dùng thẻ Tag/Badge màu sắc phân biệt Available/Maintenance).
- Nút "Thêm phòng" -> Mở Modal form.
- Action: Nút "Sửa thông tin" và nút "Đổi trạng thái".

**5. Duyệt đơn đăng ký (`/admin/requests`)**
- Bảng danh sách đơn đăng ký đang chờ duyệt (Hiển thị Tên sinh viên, Mã phòng xin vào).
- Action: Nút "Chấp nhận" (Màu xanh) và "Từ chối" (Màu đỏ kèm modal nhập lý do).

**6. Quản lý Hợp đồng (`/admin/contracts`)**
- Bảng danh sách hợp đồng (Tên SV, Phòng, Ngày bắt đầu, Trạng thái).
- Action: Nút "Kết thúc hợp đồng" (Dành cho các hợp đồng đang Active).

**7. Quản lý Phản ánh (`/admin/feedbacks`)**
- Bảng danh sách phản ánh từ sinh viên.
- Action: Nút "Trả lời" -> Mở Modal hiển thị chi tiết nội dung sự cố -> Form nhập câu trả lời -> Nút "Gửi phản hồi".

### 3.3. Technical Logic (React)
- **State Management:** Dùng React Context hoặc Redux Toolkit để quản lý Global State (ví dụ: thông tin User đang đăng nhập).
- **API Fetching:** Dùng `Axios` tạo một instance có chứa Interceptor. Interceptor này sẽ tự động gắn Bearer Token từ `localStorage` vào Header của mọi request.
- **Route Protection:** Bọc các route `/admin/*` bằng component `<ProtectedRoute />`, nếu chưa có token hoặc role không phải Admin thì tự động đá văng ra trang `/login`.