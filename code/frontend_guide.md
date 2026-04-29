# 🖥️ Frontend Developer Guide — KTX Admin Dashboard

**Dành cho:** Frontend Developer xây dựng Admin Dashboard bằng React.js  
**Backend base URL:** `http://localhost:5000`

---

## 1. Khởi tạo dự án

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install axios react-router-dom dayjs
npm install antd @ant-design/icons   # hoặc @mui/material
```

---

## 2. Cấu trúc thư mục đề xuất

```
frontend/src/
├── api/
│   └── axiosInstance.js     # Axios config + interceptor
├── context/
│   └── AuthContext.jsx      # Global auth state
├── components/
│   └── ProtectedRoute.jsx   # Route guard
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── StudentsPage.jsx
│   ├── RoomsPage.jsx
│   ├── RequestsPage.jsx
│   ├── ContractsPage.jsx
│   └── FeedbacksPage.jsx
└── App.jsx
```

---

## 3. Axios Instance + Interceptor

```js
// src/api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Tự động gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tự động logout khi token hết hạn (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 4. Auth Context

```jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## 5. Protected Route

```jsx
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'Admin') return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
```

---

## 6. App Router

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
// ...import pages

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <Routes>
                <Route path="dashboard"  element={<DashboardPage />} />
                <Route path="students"   element={<StudentsPage />} />
                <Route path="rooms"      element={<RoomsPage />} />
                <Route path="requests"   element={<RequestsPage />} />
                <Route path="contracts"  element={<ContractsPage />} />
                <Route path="feedbacks"  element={<FeedbacksPage />} />
              </Routes>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

## 7. API Calls — Từng màn hình

### 7.1 Login

```js
// POST /api/auth/login
const { data } = await api.post('/auth/login', { email, password });
// data = { _id, fullname, email, role, token }

if (data.role !== 'Admin') {
  // Chặn Student đăng nhập vào trang Admin
  throw new Error('Không có quyền truy cập');
}
login(data);  // Lưu Context + localStorage
navigate('/admin/dashboard');
```

---

### 7.2 Dashboard — Gọi song song

```js
const [rooms, requests, feedbacks] = await Promise.all([
  api.get('/admin/rooms'),
  api.get('/admin/requests'),
  api.get('/admin/feedbacks'),
]);

const stats = {
  availableRooms: rooms.data.filter(
    r => r.status === 'Available' && r.current_people < r.capacity
  ).length,
  pendingRequests: requests.data.length,          // API đã lọc Pending sẵn
  pendingFeedbacks: feedbacks.data.filter(f => f.status === 'Pending').length,
};
```

---

### 7.3 Quản lý sinh viên

```js
// Lấy danh sách (không có password trong response)
await api.get('/admin/students');

// Thêm mới — Required: email, password, fullname
await api.post('/admin/students', {
  email, password, fullname,
  mssv, cccd, phone, address   // optional
});

// Sửa — Chỉ gửi field cần thay đổi
await api.put(`/admin/students/${id}`, { fullname, phone, address, status });

// Xóa — Lỗi 400 nếu còn hợp đồng Active
await api.delete(`/admin/students/${id}`);
// Tự động xóa Pending requests của SV đó
```

---

### 7.4 Quản lý phòng

```js
// Lấy danh sách
await api.get('/admin/rooms');

// Tạo phòng — Required: room_code, building, capacity, price
await api.post('/admin/rooms', { room_code, building, capacity, price });

// Sửa thông tin — Lỗi 400 nếu capacity < current_people
await api.put(`/admin/rooms/${id}`, { price, capacity, building });

// Đổi trạng thái — 'Available' | 'Maintenance'
// Lỗi 400 nếu Maintenance khi đang có người ở
await api.patch(`/admin/rooms/${id}/status`, { status });

// Tính chỗ trống
const slots = room.capacity - room.current_people;
```

---

### 7.5 Duyệt đơn đăng ký

```js
// Lấy đơn Pending (API đã lọc sẵn)
await api.get('/admin/requests');

// Duyệt — body optional, mặc định hôm nay + 6 tháng
await api.post(`/admin/requests/${id}/approve`, {
  start_date: '2025-09-01',   // optional
  end_date: '2026-03-01',     // optional
});

// Từ chối — không cần body
await api.post(`/admin/requests/${id}/reject`);
```

> **Quan trọng:** `student_id` và `room_id` trong response là **object đã populate**, không phải ID string:
> ```js
> request.student_id.fullname   // ✅
> request.room_id.room_code     // ✅
> request.room_id.current_people >= request.room_id.capacity  // check đầy phòng
> ```

---

### 7.6 Quản lý hợp đồng

```js
// Lấy tất cả (cả Active lẫn Ended)
await api.get('/admin/contracts');

// Kết thúc — không cần body, tự động giảm current_people của phòng
await api.patch(`/admin/contracts/${id}/status`);
```

```jsx
{/* Chỉ hiện nút khi Active */}
{contract.status === 'Active' && (
  <Button danger onClick={() => handleEnd(contract._id)}>
    Kết thúc hợp đồng
  </Button>
)}
```

---

### 7.7 Quản lý phản ánh

```js
// Lấy tất cả (Pending + Answered)
await api.get('/admin/feedbacks');

// Trả lời — Required: reply_content
// Lỗi 400 nếu đã Answered rồi
await api.post(`/admin/feedbacks/${id}/reply`, { reply_content: '...' });
```

---

## 8. Bảng Populate Fields

| API | Field | Giá trị trả về |
|-----|-------|----------------|
| GET `/requests` | `student_id` | `{ _id, fullname, email, mssv }` |
| GET `/requests` | `room_id` | `{ _id, room_code, building, current_people, capacity }` |
| GET `/contracts` | `student_id` | `{ _id, fullname, email, mssv }` |
| GET `/contracts` | `room_id` | `{ _id, room_code, building }` |
| GET `/feedbacks` | `student_id` | `{ _id, fullname, mssv, email }` |

---

## 9. HTTP Status Codes

| Code | Ý nghĩa | Xử lý |
|------|---------|-------|
| `200` | OK | Cập nhật state |
| `201` | Tạo thành công | Thêm vào list |
| `400` | Lỗi nghiệp vụ | Hiện `error.response.data.message` |
| `401` | Token hết hạn | Interceptor tự redirect `/login` |
| `403` | Không phải Admin | Redirect `/login` |
| `404` | Không tìm thấy | Hiện "Không tìm thấy" |
| `500` | Lỗi server | Hiện "Lỗi hệ thống, thử lại sau" |

**Tất cả lỗi đều có format:**
```json
{ "message": "Nội dung lỗi tiếng Việt" }
```

---

## 10. Checklist trước release

- [ ] `logout()` gọi đúng → xóa `token` + `user` khỏi localStorage
- [ ] ProtectedRoute check cả token lẫn `role === 'Admin'`
- [ ] Interceptor 401 → redirect `/login`
- [ ] Không hardcode URL — dùng `baseURL` trong axiosInstance
- [ ] Disable nút sau khi click (tránh double submit)
- [ ] Confirm dialog trước khi Xóa / Kết thúc hợp đồng
- [ ] Loading state khi đang fetch
- [ ] Hiện lỗi từ `error.response?.data?.message`
