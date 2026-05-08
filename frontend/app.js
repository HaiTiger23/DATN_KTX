const API_URL = 'http://localhost:5556/api';
let state = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    currentTab: ''
};
let adminRooms = [];
let adminStudents = [];
let studentRooms = [];

// DOM Elements
const screens = {
    login: document.getElementById('login-screen'),
    dashboard: document.getElementById('dashboard-screen')
};
const contentArea = document.getElementById('content-area');
const pageTitle = document.getElementById('page-title');
const sidebarNav = document.getElementById('sidebar-nav');
const toastContainer = document.getElementById('toast-container');
const modal = document.getElementById('modal');

// Init
function init() {
    if (state.token && state.user) {
        showScreen('dashboard');
        document.getElementById('user-name').textContent = state.user?.fullname || 'User';
        document.querySelector('.sidebar-footer .role').textContent = state.user?.role || 'Sinh viên';
        document.querySelector('.sidebar-header h2').textContent = state.user?.role === 'Admin' ? 'KTX Admin' : 'Cổng Sinh viên';

        generateSidebar();

        if (!state.currentTab) {
            state.currentTab = state.user.role === 'Admin' ? 'rooms' : 'student_rooms';
        }

        // Setup nav events
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                item.classList.add('active');
                state.currentTab = item.dataset.target;
                loadTab(state.currentTab);
            });
        });

        loadTab(state.currentTab);
    } else {
        showScreen('login');
    }
}

function generateSidebar() {
    if (state.user.role === 'Admin') {
        sidebarNav.innerHTML = `
            <a href="#" class="nav-item ${state.currentTab === 'rooms' ? 'active' : ''}" data-target="rooms">🛏️ Quản lý Phòng</a>
            <a href="#" class="nav-item ${state.currentTab === 'students' ? 'active' : ''}" data-target="students">👨‍🎓 Sinh viên</a>
            <a href="#" class="nav-item ${state.currentTab === 'requests' ? 'active' : ''}" data-target="requests">📋 Đơn chờ duyệt</a>
            <a href="#" class="nav-item ${state.currentTab === 'contracts' ? 'active' : ''}" data-target="contracts">📄 Hợp đồng</a>
            <a href="#" class="nav-item ${state.currentTab === 'feedbacks' ? 'active' : ''}" data-target="feedbacks">💬 Phản ánh</a>
            <a href="#" class="nav-item ${state.currentTab === 'admin_knowledge' ? 'active' : ''}" data-target="admin_knowledge">📚 Tri thức (RAG)</a>
            <a href="#" class="nav-item ${state.currentTab === 'admin_settings' ? 'active' : ''}" data-target="admin_settings">⚙️ Cài đặt</a>
            <a href="#" class="nav-item ${state.currentTab === 'profile' ? 'active' : ''}" data-target="profile">👤 Thông tin cá nhân</a>
        `;
    } else {
        sidebarNav.innerHTML = `
            <a href="#" class="nav-item ${state.currentTab === 'student_rooms' ? 'active' : ''}" data-target="student_rooms">🛏️ Đăng ký phòng</a>
            <a href="#" class="nav-item ${state.currentTab === 'student_requests' ? 'active' : ''}" data-target="student_requests">📋 Đơn của tôi</a>
            <a href="#" class="nav-item ${state.currentTab === 'student_contracts' ? 'active' : ''}" data-target="student_contracts">📄 Hợp đồng của tôi</a>
            <a href="#" class="nav-item ${state.currentTab === 'student_feedbacks' ? 'active' : ''}" data-target="student_feedbacks">💬 Phản hồi của tôi</a>
            <a href="#" class="nav-item ${state.currentTab === 'student_chatbot' ? 'active' : ''}" data-target="student_chatbot">🤖 Trợ lý AI</a>
            <a href="#" class="nav-item ${state.currentTab === 'profile' ? 'active' : ''}" data-target="profile">👤 Thông tin cá nhân</a>
        `;
    }
}

// Utils
function showScreen(screenId) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenId].classList.add('active');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : '❌'}</span>
        <p style="font-weight:500;font-size:0.9rem;margin:0;">${message}</p>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
}

// API Fetcher
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Có lỗi xảy ra');
        return data;
    } catch (err) {
        showToast(err.message, 'error');
        if (err.message.includes('token') || err.message.includes('Auth') || err.message.includes('xác thực')) {
            logout();
        }
        throw err;
    }
}

// Auth
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const loader = btn.querySelector('.loader');
    btn.querySelector('span').classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        const data = await fetchAPI('/auth/login', 'POST', {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        });
        state.token = data.token;
        state.user = data;
        state.currentTab = '';
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        init();
        showToast('Đăng nhập thành công');
    } catch (err) {
        console.error(err);
    } finally {
        btn.querySelector('span').classList.remove('hidden');
        loader.classList.add('hidden');
    }
});

// Toggle login/register
document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.querySelector('.login-card p.subtitle').textContent = 'Tạo tài khoản sinh viên';
});
document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.querySelector('.login-card p.subtitle').textContent = 'Đăng nhập hệ thống quản lý';
});

// Register
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('register-btn');
    const loader = btn.querySelector('.loader');
    btn.querySelector('span').classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        const data = await fetchAPI('/auth/register', 'POST', {
            fullname: document.getElementById('reg-fullname').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            mssv: document.getElementById('reg-mssv').value
        });
        state.token = data.token;
        state.user = data;
        state.currentTab = '';
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        init();
        showToast('Đăng ký thành công');
    } catch (err) {
        console.error(err);
    } finally {
        btn.querySelector('span').classList.remove('hidden');
        loader.classList.add('hidden');
    }
});

document.getElementById('logout-btn').addEventListener('click', logout);
function logout() {
    state.token = null; state.user = null; state.currentTab = '';
    localStorage.removeItem('token'); localStorage.removeItem('user');
    init();
}

async function loadTab(tab) {
    contentArea.innerHTML = '<div style="display:flex;justify-content:center;padding:3rem;"><div class="loader" style="border-top-color:var(--primary);width:32px;height:32px;"></div></div>';

    const titles = {
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
        profile: 'Thông tin cá nhân'
    };
    pageTitle.textContent = titles[tab];

    document.getElementById('sync-btn').style.display = tab === 'rooms' ? 'flex' : 'none';
    document.getElementById('add-btn').style.display = ['rooms', 'students', 'student_feedbacks', 'admin_knowledge'].includes(tab) ? 'flex' : 'none';
    if (tab === 'student_feedbacks') document.getElementById('add-btn').textContent = '+ Tạo phản hồi mới';
    else if (tab === 'admin_knowledge') document.getElementById('add-btn').textContent = '+ Thêm Tri thức';
    else document.getElementById('add-btn').textContent = '+ Thêm mới';

    try {
        if (tab === 'rooms') await renderRooms();
        if (tab === 'students') await renderStudents();
        if (tab === 'requests') await renderRequests();
        if (tab === 'contracts') await renderContracts();
        if (tab === 'feedbacks') await renderFeedbacks();
        if (tab === 'admin_knowledge') await renderAdminKnowledge();
        if (tab === 'admin_settings') await renderAdminSettings();

        if (tab === 'student_rooms') await renderStudentRooms();
        if (tab === 'student_requests') await renderStudentRequests();
        if (tab === 'student_contracts') await renderStudentContracts();
        if (tab === 'student_feedbacks') await renderStudentFeedbacks();
        if (tab === 'student_chatbot') await renderStudentChatbot();
        
        if (tab === 'profile') await renderProfile();
    } catch (err) {
        contentArea.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--danger)">Lỗi tải dữ liệu</div>`;
    }
}

// --- Admin Functions ---
async function renderRooms() {
    adminRooms = await fetchAPI('/admin/rooms');
    const rooms = adminRooms;
    let html = '<div class="grid-cards">';
    rooms.forEach(r => {
        const available = r.capacity - r.current_people;
        html += `
        <div class="card">
            <div class="card-header">
                <div class="card-title">Phòng ${r.room_code}</div>
                <span class="badge badge-${r.status}">${r.status === 'Available' ? 'Khả dụng' : 'Bảo trì'}</span>
            </div>
            <div class="card-body">
                <div>🏢 Tòa nhà: <strong>${r.building}</strong></div>
                <div>👥 Chỗ trống: <strong>${available}/${r.capacity}</strong></div>
                <div>💰 Giá: <strong>${formatMoney(r.price)}/tháng</strong></div>
            </div>
            <div class="card-footer" style="display:flex;gap:0.5rem;flex-wrap:wrap">
                <button class="btn btn-outline" style="padding:0.5rem 1rem;font-size:0.85rem" onclick="toggleRoomStatus('${r._id}', '${r.status}')">
                    Đổi trạng thái
                </button>
                <button class="btn btn-outline" style="padding:0.5rem 1rem;font-size:0.85rem" onclick="openEditRoomModal('${r._id}')">
                    Sửa
                </button>
            </div>
        </div>`;
    });
    html += '</div>';
    contentArea.innerHTML = html;
}

window.toggleRoomStatus = async function (id, currentStatus) {
    if (!confirm('Xác nhận đổi trạng thái phòng này?')) return;
    const newStatus = currentStatus === 'Available' ? 'Maintenance' : 'Available';
    try {
        await fetchAPI(`/admin/rooms/${id}/status`, 'PATCH', { status: newStatus });
        showToast('Đã đổi trạng thái phòng');
        loadTab('rooms');
    } catch (err) { }
};

async function renderStudents() {
    adminStudents = await fetchAPI('/admin/students');
    const students = adminStudents;
    let html = `
    <div class="table-container">
        <table>
            <thead><tr><th>MSSV</th><th>Họ Tên</th><th>Email</th><th>SĐT</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
    `;
    students.forEach(s => {
        html += `
            <tr>
                <td><strong>${s.mssv || 'N/A'}</strong></td>
                <td>${s.fullname}</td>
                <td>${s.email}</td>
                <td>${s.phone || 'N/A'}</td>
                <td><span class="badge badge-${s.status}">${s.status}</span></td>
                <td class="actions" style="display:flex;gap:0.5rem;">
                    <button class="btn btn-outline" style="padding:0.4rem 0.8rem;font-size:0.8rem" onclick="openEditStudentModal('${s._id}')">Sửa</button>
                    <button class="btn btn-outline" style="padding:0.4rem 0.8rem;font-size:0.8rem;color:var(--danger)" onclick="deleteStudent('${s._id}')">Xóa</button>
                </td>
            </tr>
        `;
    });
    html += '</tbody></table></div>';
    contentArea.innerHTML = html;
}

window.deleteStudent = async function (id) {
    if (!confirm('Xác nhận xóa sinh viên này?')) return;
    try {
        await fetchAPI(`/admin/students/${id}`, 'DELETE');
        showToast('Xóa sinh viên thành công');
        loadTab('students');
    } catch (err) { }
};

async function renderRequests() {
    const requests = await fetchAPI('/admin/requests');
    if (requests.length === 0) return contentArea.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-light)">Không có đơn đăng ký chờ duyệt</p>';

    let html = '<div class="grid-cards">';
    requests.forEach(r => {
        html += `
        <div class="card">
            <div class="card-header">
                <div class="card-title">${r.type === 'Cancellation' ? 'Yêu cầu Hủy Hợp đồng' : 'Đơn đăng ký phòng'}</div>
                <span class="badge badge-Pending">Chờ duyệt</span>
            </div>
            <div class="card-body">
                <div>👨‍🎓 SV: <strong>${r.student_id?.fullname || 'N/A'} (${r.student_id?.mssv || 'N/A'})</strong></div>
                <div>🛏️ Phòng: <strong>${r.room_id?.room_code || 'N/A'} - ${r.room_id?.building || 'N/A'}</strong></div>
                ${r.type !== 'Cancellation' ? `<div>⏳ Thời hạn: <strong>${r.months || 6} tháng</strong></div>` : ''}
                <div>📅 Ngày gửi: <strong>${formatDate(r.createdAt)}</strong></div>
            </div>
            <div class="card-footer">
                <button class="btn btn-outline" style="padding:0.5rem;font-size:0.85rem;color:var(--danger)" onclick="handleRequest('${r._id}', 'reject')">Từ chối</button>
                <button class="btn btn-primary" style="padding:0.5rem 1rem;font-size:0.85rem" onclick="handleRequest('${r._id}', 'approve')">Duyệt</button>
            </div>
        </div>`;
    });
    html += '</div>';
    contentArea.innerHTML = html;
}

window.handleRequest = async function (id, action) {
    if (!confirm(`Xác nhận ${action === 'approve' ? 'duyệt' : 'từ chối'} đơn này?`)) return;
    try {
        await fetchAPI(`/admin/requests/${id}/${action}`, 'POST');
        showToast('Xử lý đơn thành công');
        loadTab('requests');
    } catch (err) { }
};

async function renderContracts() {
    const contracts = await fetchAPI('/admin/contracts');
    let html = `
    <div class="table-container">
        <table>
            <thead><tr><th>Sinh viên</th><th>Phòng</th><th>Từ ngày</th><th>Đến ngày</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
    `;
    contracts.forEach(c => {
        html += `
            <tr>
                <td><strong>${c.student_id?.fullname || 'N/A'}</strong><br><small>${c.student_id?.mssv || ''}</small></td>
                <td><strong>${c.room_id?.room_code || 'N/A'}</strong></td>
                <td>${formatDate(c.start_date)}</td>
                <td>${formatDate(c.end_date)}</td>
                <td><span class="badge badge-${c.status}">${c.status}</span></td>
                <td class="actions">
                    ${c.status === 'Active' ? `<button class="btn btn-outline" style="padding:0.4rem 0.8rem;font-size:0.8rem;color:var(--danger)" onclick="endContract('${c._id}')">Kết thúc</button>` : ''}
                </td>
            </tr>
        `;
    });
    html += '</tbody></table></div>';
    contentArea.innerHTML = html;
}

window.endContract = async function (id) {
    if (!confirm('Kết thúc hợp đồng này?')) return;
    try {
        await fetchAPI(`/admin/contracts/${id}/status`, 'PATCH');
        showToast('Đã kết thúc hợp đồng');
        loadTab('contracts');
    } catch (err) { }
};

async function renderFeedbacks() {
    const feedbacks = await fetchAPI('/admin/feedbacks');
    let html = '<div class="grid-cards">';
    feedbacks.forEach(f => {
        html += `
        <div class="card">
            <div class="card-header">
                <div class="card-title" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${f.title}">${f.title}</div>
                <span class="badge badge-${f.status}">${f.status === 'Pending' ? 'Chờ xử lý' : 'Đã phản hồi'}</span>
            </div>
            <div class="card-body">
                <div>👨‍🎓 Từ: <strong>${f.student_id?.fullname || 'N/A'}</strong></div>
                <div style="margin-top:0.5rem;background:rgba(0,0,0,0.02);padding:0.5rem;border-radius:4px;font-size:0.85rem;">${f.description}</div>
                ${f.reply_content ? `<div style="margin-top:0.5rem;background:rgba(79,70,229,0.05);color:var(--primary);padding:0.5rem;border-radius:4px;font-size:0.85rem;"><strong>Admin:</strong> ${f.reply_content}</div>` : ''}
            </div>
            ${f.status === 'Pending' ? `
            <div class="card-footer">
                <button class="btn btn-primary" style="padding:0.5rem 1rem;font-size:0.85rem" onclick="openReplyModal('${f._id}')">Trả lời</button>
            </div>` : ''}
        </div>`;
    });
    html += '</div>';
    contentArea.innerHTML = html;
}

// --- Student Functions ---
async function renderStudentRooms() {
    studentRooms = await fetchAPI('/student/rooms');
    let html = `
        <div style="display:flex; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap;">
            <input type="text" id="room-search" placeholder="🔍 Tìm kiếm mã phòng, tòa nhà..." style="flex:1; min-width:200px; padding:0.6rem 1rem; border-radius:8px; border:1px solid rgba(0,0,0,0.1); outline:none;">
            <select id="room-sort" style="padding:0.6rem 1rem; border-radius:8px; border:1px solid rgba(0,0,0,0.1); outline:none; background:white;">
                <option value="default">Sắp xếp mặc định</option>
                <option value="price_asc">Giá: Thấp đến cao</option>
                <option value="price_desc">Giá: Cao đến thấp</option>
            </select>
        </div>
        <div id="room-grid-container"></div>
    `;
    contentArea.innerHTML = html;
    
    document.getElementById('room-search').addEventListener('input', updateStudentRoomGrid);
    document.getElementById('room-sort').addEventListener('change', updateStudentRoomGrid);
    
    updateStudentRoomGrid();
}

window.updateStudentRoomGrid = function() {
    const search = document.getElementById('room-search').value.toLowerCase();
    const sort = document.getElementById('room-sort').value;
    
    let filtered = studentRooms.filter(r => {
        const available = r.capacity - r.current_people;
        if (available <= 0) return false;
        return r.room_code.toLowerCase().includes(search) || r.building.toLowerCase().includes(search);
    });
    
    if (sort === 'price_asc') filtered.sort((a,b) => a.price - b.price);
    else if (sort === 'price_desc') filtered.sort((a,b) => b.price - a.price);

    let html = '<div class="grid-cards">';
    filtered.forEach(r => {
        const available = r.capacity - r.current_people;
        html += `
        <div class="card">
            <div class="card-header">
                <div class="card-title">Phòng ${r.room_code}</div>
                <span class="badge badge-Available">Khả dụng</span>
            </div>
            <div class="card-body">
                <div>🏢 Tòa nhà: <strong>${r.building}</strong></div>
                <div>👥 Chỗ trống: <strong style="color:var(--success)">${available}/${r.capacity}</strong></div>
                <div>💰 Giá: <strong>${formatMoney(r.price)}/tháng</strong></div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary" style="padding:0.5rem 1rem;font-size:0.85rem;width:100%" onclick="registerRoom('${r._id}')">
                    Đăng ký ngay
                </button>
            </div>
        </div>`;
    });
    html += '</div>';
    if (filtered.length === 0) html = '<p style="text-align:center;padding:2rem;">Không tìm thấy phòng phù hợp</p>';
    
    document.getElementById('room-grid-container').innerHTML = html;
}

window.registerRoom = async function (roomId) {
    const months = prompt('Nhập số tháng thuê bạn muốn (VD: 6, 12):', '6');
    if (months === null) return; // Cancelled
    const monthsNum = parseInt(months);
    if (isNaN(monthsNum) || monthsNum <= 0) return showToast('Số tháng không hợp lệ', 'error');

    if (!confirm(`Bạn có chắc chắn muốn đăng ký phòng này trong ${monthsNum} tháng?`)) return;
    try {
        await fetchAPI('/student/requests', 'POST', { room_id: roomId, months: monthsNum });
        showToast('Đã gửi đơn đăng ký. Vui lòng chờ admin duyệt.');
        document.querySelector('.nav-item[data-target="student_requests"]').click();
    } catch (err) { }
};

async function renderStudentRequests() {
    const requests = await fetchAPI('/student/requests');
    if (requests.length === 0) return contentArea.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-light)">Bạn chưa có đơn đăng ký nào</p>';

    let html = `
    <div class="table-container">
        <table>
            <thead><tr><th>Mã phòng</th><th>Tòa nhà</th><th>Loại đơn</th><th>Ngày gửi</th><th>Trạng thái</th></tr></thead>
            <tbody>
    `;
    requests.forEach(r => {
        html += `
            <tr>
                <td><strong>${r.room_id?.room_code || 'N/A'}</strong></td>
                <td>${r.room_id?.building || 'N/A'}</td>
                <td>${r.type === 'Cancellation' ? 'Hủy hợp đồng' : 'Đăng ký phòng'}</td>
                <td>${formatDate(r.createdAt)}</td>
                <td><span class="badge badge-${r.status}">${r.status}</span></td>
            </tr>
        `;
    });
    html += '</tbody></table></div>';
    contentArea.innerHTML = html;
}

async function renderStudentContracts() {
    const contracts = await fetchAPI('/student/contracts');
    if (contracts.length === 0) return contentArea.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-light)">Bạn chưa có hợp đồng nào</p>';

    let html = `
    <div class="table-container">
        <table>
            <thead><tr><th>Mã phòng</th><th>Tòa nhà</th><th>Từ ngày</th><th>Đến ngày</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
    `;
    contracts.forEach(c => {
        html += `
            <tr>
                <td><strong>${c.room_id?.room_code || 'N/A'}</strong></td>
                <td>${c.room_id?.building || 'N/A'}</td>
                <td>${formatDate(c.start_date)}</td>
                <td>${formatDate(c.end_date)}</td>
                <td><span class="badge badge-${c.status}">${c.status}</span></td>
                <td class="actions">
                    ${c.status === 'Active' ? `<button class="btn btn-outline" style="padding:0.4rem 0.8rem;font-size:0.8rem;color:var(--danger)" onclick="cancelStudentContract('${c._id}')">Yêu cầu Hủy</button>` : ''}
                </td>
            </tr>
        `;
    });
    html += '</tbody></table></div>';
    contentArea.innerHTML = html;
}

window.cancelStudentContract = async function (id) {
    if (!confirm('Bạn có chắc chắn muốn gửi yêu cầu hủy hợp đồng này?')) return;
    try {
        const res = await fetchAPI(`/student/contracts/${id}/cancel`, 'POST');
        showToast(res.message || 'Đã gửi yêu cầu hủy hợp đồng');
        document.querySelector('.nav-item[data-target="student_requests"]').click();
    } catch (err) { }
};

async function renderStudentFeedbacks() {
    const feedbacks = await fetchAPI('/student/feedbacks');
    let html = '<div class="grid-cards">';
    feedbacks.forEach(f => {
        html += `
        <div class="card">
            <div class="card-header">
                <div class="card-title" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${f.title}">${f.title}</div>
                <span class="badge badge-${f.status}">${f.status === 'Pending' ? 'Chờ xử lý' : 'Đã phản hồi'}</span>
            </div>
            <div class="card-body">
                <div style="margin-top:0.5rem;background:rgba(0,0,0,0.02);padding:0.5rem;border-radius:4px;font-size:0.85rem;">${f.description}</div>
                ${f.reply_content ? `<div style="margin-top:0.5rem;background:rgba(79,70,229,0.05);color:var(--primary);padding:0.5rem;border-radius:4px;font-size:0.85rem;"><strong>Admin:</strong> ${f.reply_content}</div>` : ''}
            </div>
        </div>`;
    });
    html += '</div>';
    if (html === '<div class="grid-cards"></div>') html = '<p style="text-align:center;padding:2rem;">Bạn chưa gửi phản hồi nào</p>';
    contentArea.innerHTML = html;
}

// Sync Rooms (Admin Only)
document.getElementById('sync-btn').addEventListener('click', async () => {
    try {
        const res = await fetchAPI('/admin/rooms/sync-occupancy', 'POST');
        showToast(res.message || 'Đồng bộ thành công');
        loadTab('rooms');
    } catch (err) { }
});

// Modals
const closeBtns = document.querySelectorAll('.close-modal');
closeBtns.forEach(btn => btn.addEventListener('click', () => modal.classList.add('hidden')));

let currentModalAction = null;
let currentModalId = null;

window.openReplyModal = function (feedbackId) {
    currentModalAction = 'reply_feedback';
    currentModalId = feedbackId;
    document.getElementById('modal-title').textContent = 'Trả lời phản ánh';
    document.getElementById('modal-body').innerHTML = `
        <div class="form-group">
            <label>Nội dung trả lời</label>
            <textarea id="reply-content" rows="4" required></textarea>
        </div>
    `;
    modal.classList.remove('hidden');
};

window.openEditRoomModal = function (id) {
    const room = adminRooms.find(r => r._id === id);
    if (!room) return;
    currentModalAction = 'edit_room';
    currentModalId = id;
    document.getElementById('modal-title').textContent = 'Sửa thông tin phòng';
    document.getElementById('modal-body').innerHTML = `
        <div class="form-group"><label>Mã phòng</label><input type="text" id="room_code" value="${room.room_code}" disabled style="background:#eee"></div>
        <div class="form-group"><label>Tòa nhà</label><input type="text" id="building" value="${room.building}"></div>
        <div class="form-group"><label>Sức chứa</label><input type="number" id="capacity" value="${room.capacity}"></div>
        <div class="form-group"><label>Giá/tháng</label><input type="number" id="price" value="${room.price}"></div>
    `;
    modal.classList.remove('hidden');
};

window.openEditStudentModal = function (id) {
    const student = adminStudents.find(s => s._id === id);
    if (!student) return;
    currentModalAction = 'edit_student';
    currentModalId = id;
    document.getElementById('modal-title').textContent = 'Sửa thông tin sinh viên';
    document.getElementById('modal-body').innerHTML = `
        <div class="form-group"><label>Họ tên (*)</label><input type="text" id="fullname" value="${student.fullname}"></div>
        <div class="form-group"><label>Email (*)</label><input type="email" id="email_add" value="${student.email}"></div>
        <div class="form-group"><label>Mật khẩu mới (Bỏ trống nếu không đổi)</label><input type="text" id="password_add" placeholder="Nhập pass mới..."></div>
        <div class="form-group"><label>SĐT</label><input type="text" id="phone" value="${student.phone || ''}"></div>
        <div class="form-group"><label>Địa chỉ</label><input type="text" id="address" value="${student.address || ''}"></div>
    `;
    modal.classList.remove('hidden');
};

document.getElementById('add-btn').addEventListener('click', () => {
    if (state.currentTab === 'rooms') {
        currentModalAction = 'add_room';
        document.getElementById('modal-title').textContent = 'Thêm phòng mới';
        document.getElementById('modal-body').innerHTML = `
            <div class="form-group"><label>Mã phòng</label><input type="text" id="room_code"></div>
            <div class="form-group"><label>Tòa nhà</label><input type="text" id="building"></div>
            <div class="form-group"><label>Sức chứa</label><input type="number" id="capacity" value="4"></div>
            <div class="form-group"><label>Giá/tháng</label><input type="number" id="price" value="1200000"></div>
        `;
        document.getElementById('room_code').value = '';
        document.getElementById('building').value = '';
        document.getElementById('capacity').value = '4';
        document.getElementById('price').value = '1200000';
        modal.classList.remove('hidden');
    } else if (state.currentTab === 'students') {
        currentModalAction = 'add_student';
        document.getElementById('modal-title').textContent = 'Thêm sinh viên mới';
        document.getElementById('modal-body').innerHTML = `
            <div class="form-group"><label>Họ tên (*)</label><input type="text" id="fullname"></div>
            <div class="form-group"><label>Email (*)</label><input type="email" id="email_add"></div>
            <div class="form-group"><label>Mật khẩu (*)</label><input type="text" id="password_add" value="123456"></div>
            <div class="form-group"><label>MSSV</label><input type="text" id="mssv"></div>
            <div class="form-group"><label>CCCD</label><input type="text" id="cccd"></div>
        `;
        document.getElementById('fullname').value = '';
        document.getElementById('email_add').value = '';
        document.getElementById('password_add').value = '123456';
        document.getElementById('mssv').value = '';
        document.getElementById('cccd').value = '';
        modal.classList.remove('hidden');
    } else if (state.currentTab === 'student_feedbacks') {
        currentModalAction = 'add_feedback';
        document.getElementById('modal-title').textContent = 'Gửi phản hồi cho Ban quản lý';
        document.getElementById('modal-body').innerHTML = `
            <div class="form-group"><label>Tiêu đề</label><input type="text" id="feedback_title"></div>
            <div class="form-group"><label>Nội dung</label><textarea id="feedback_desc" rows="4"></textarea></div>
        `;
        document.getElementById('feedback_title').value = '';
        document.getElementById('feedback_desc').value = '';
        modal.classList.remove('hidden');
    } else if (state.currentTab === 'admin_knowledge') {
        currentModalAction = 'add_knowledge';
        document.getElementById('modal-title').textContent = 'Thêm Tri thức (Q&A)';
        document.getElementById('modal-body').innerHTML = `
            <div class="form-group"><label>Câu hỏi</label><input type="text" id="knowledge_q"></div>
            <div class="form-group"><label>Trả lời</label><textarea id="knowledge_a" rows="4"></textarea></div>
        `;
        document.getElementById('knowledge_q').value = '';
        document.getElementById('knowledge_a').value = '';
        modal.classList.remove('hidden');
    }
});

document.getElementById('modal-save-btn').addEventListener('click', async () => {
    try {
        if (currentModalAction === 'reply_feedback') {
            const content = document.getElementById('reply-content').value;
            if (!content) return showToast('Vui lòng nhập nội dung', 'error');
            await fetchAPI(`/admin/feedbacks/${currentModalId}/reply`, 'POST', { reply_content: content });
            showToast('Đã gửi trả lời');
            modal.classList.add('hidden');
            loadTab('feedbacks');
        }
        else if (currentModalAction === 'add_room') {
            const body = {
                room_code: document.getElementById('room_code').value,
                building: document.getElementById('building').value,
                capacity: Number(document.getElementById('capacity').value),
                price: Number(document.getElementById('price').value)
            };
            if (!body.room_code || !body.building || !body.capacity || !body.price) return showToast('Điền đủ thông tin', 'error');
            await fetchAPI('/admin/rooms', 'POST', body);
            showToast('Thêm phòng thành công');
            modal.classList.add('hidden');
            loadTab('rooms');
        }
        else if (currentModalAction === 'add_student') {
            const body = {
                fullname: document.getElementById('fullname').value,
                email: document.getElementById('email_add').value,
                password: document.getElementById('password_add').value,
                mssv: document.getElementById('mssv').value,
                cccd: document.getElementById('cccd').value
            };
            if (!body.fullname || !body.email || !body.password) return showToast('Điền đủ thông tin bắt buộc', 'error');
            await fetchAPI('/admin/students', 'POST', body);
            showToast('Thêm sinh viên thành công');
            modal.classList.add('hidden');
            loadTab('students');
        }
        else if (currentModalAction === 'edit_room') {
            const body = {
                building: document.getElementById('building').value,
                capacity: Number(document.getElementById('capacity').value),
                price: Number(document.getElementById('price').value)
            };
            await fetchAPI(`/admin/rooms/${currentModalId}`, 'PUT', body);
            showToast('Cập nhật phòng thành công');
            modal.classList.add('hidden');
            loadTab('rooms');
        }
        else if (currentModalAction === 'edit_student') {
            const body = {
                fullname: document.getElementById('fullname').value,
                email: document.getElementById('email_add').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value
            };
            const pass = document.getElementById('password_add').value;
            if (pass) body.password = pass;

            await fetchAPI(`/admin/students/${currentModalId}`, 'PUT', body);
            showToast('Cập nhật sinh viên thành công');
            modal.classList.add('hidden');
            loadTab('students');
        }
        else if (currentModalAction === 'add_feedback') {
            const body = {
                title: document.getElementById('feedback_title').value,
                description: document.getElementById('feedback_desc').value
            };
            if (!body.title || !body.description) return showToast('Điền đủ tiêu đề và nội dung', 'error');
            await fetchAPI('/student/feedbacks', 'POST', body);
            showToast('Đã gửi phản hồi');
            modal.classList.add('hidden');
            loadTab('student_feedbacks');
        }
        else if (currentModalAction === 'add_knowledge') {
            const body = {
                question: document.getElementById('knowledge_q').value,
                answer: document.getElementById('knowledge_a').value
            };
            if (!body.question || !body.answer) return showToast('Vui lòng điền đủ câu hỏi và trả lời', 'error');
            await fetchAPI('/admin/knowledge', 'POST', body);
            showToast('Thêm tri thức thành công');
            modal.classList.add('hidden');
            loadTab('admin_knowledge');
        }
    } catch (err) { }
});

async function renderAdminSettings() {
    const settings = await fetchAPI('/admin/settings');
    contentArea.innerHTML = `
        <div class="card" style="max-width: 600px; margin: 0 auto;">
            <div class="card-header">
                <div class="card-title">Cài đặt API AI</div>
            </div>
            <div class="card-body">
                <div class="form-group">
                    <label>Gemini API Key</label>
                    <input type="password" id="gemini-key" value="${settings.geminiApiKey || ''}" placeholder="Nhập API Key của Google Gemini...">
                </div>
                <button class="btn btn-primary" onclick="saveSettings()">Lưu cài đặt</button>
            </div>
        </div>
    `;
}

window.saveSettings = async function () {
    try {
        const key = document.getElementById('gemini-key').value;
        await fetchAPI('/admin/settings', 'POST', { geminiApiKey: key });
        showToast('Đã lưu cài đặt');
    } catch (err) { }
};

async function renderAdminKnowledge() {
    const data = await fetchAPI('/admin/knowledge');
    let html = `
    <div class="table-container">
        <table>
            <thead><tr><th>Câu hỏi</th><th>Câu trả lời</th><th>Thao tác</th></tr></thead>
            <tbody>
    `;
    if (data.length === 0) html += '<tr><td colspan="3" style="text-align:center">Chưa có dữ liệu</td></tr>';
    data.forEach(item => {
        html += `
            <tr>
                <td style="max-width: 200px;"><strong>${item.question}</strong></td>
                <td style="max-width: 300px;">${item.answer}</td>
                <td class="actions">
                    <button class="btn btn-outline" style="padding:0.4rem 0.8rem;font-size:0.8rem;color:var(--danger)" onclick="deleteKnowledge('${item._id}')">Xóa</button>
                </td>
            </tr>
        `;
    });
    html += '</tbody></table></div>';
    contentArea.innerHTML = html;
}

window.deleteKnowledge = async function (id) {
    if (!confirm('Xác nhận xóa?')) return;
    try {
        await fetchAPI(`/admin/knowledge/${id}`, 'DELETE');
        showToast('Đã xóa tri thức');
        loadTab('admin_knowledge');
    } catch (err) { }
};

async function renderStudentChatbot() {
    contentArea.innerHTML = `
        <div style="display:flex; flex-direction:column; height: 100%; max-width: 800px; margin: 0 auto; background: var(--glass-bg); border-radius: var(--radius); border: 1px solid var(--glass-border); overflow: hidden;">
            <div id="chat-messages" style="flex:1; overflow-y:auto; padding: 1.5rem; display:flex; flex-direction:column; gap:1rem;">
                <div style="background: white; padding: 1rem; border-radius: 8px; align-self: flex-start; max-width: 80%; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    Xin chào! Tôi là trợ lý ảo KTX. Tôi có thể giúp gì cho bạn dựa trên Cơ sở tri thức?
                </div>
            </div>
            <div style="padding: 1rem; border-top: 1px solid rgba(0,0,0,0.05); display:flex; flex-direction:column; gap: 0.5rem; background: rgba(255,255,255,0.5);">
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap; font-size:0.8rem;">
                    <span class="badge badge-Available" style="cursor:pointer; background:rgba(79,70,229,0.1); color:var(--primary);" onclick="document.getElementById('chat-input').value='Ký túc xá có những tiện ích gì?'; sendChatMessage()">Ký túc xá có tiện ích gì?</span>
                    <span class="badge badge-Available" style="cursor:pointer; background:rgba(79,70,229,0.1); color:var(--primary);" onclick="document.getElementById('chat-input').value='Quy định giờ giấc ra vào thế nào?'; sendChatMessage()">Quy định giờ giấc?</span>
                    <span class="badge badge-Available" style="cursor:pointer; background:rgba(79,70,229,0.1); color:var(--primary);" onclick="document.getElementById('chat-input').value='Có được nấu ăn trong phòng không?'; sendChatMessage()">Được nấu ăn không?</span>
                </div>
                <div style="display:flex; gap: 0.5rem;">
                    <input type="text" id="chat-input" placeholder="Nhập câu hỏi của bạn..." style="flex:1; padding: 0.75rem 1rem; border-radius: 99px; border: 1px solid rgba(0,0,0,0.1); outline: none;">
                    <button class="btn btn-primary" style="border-radius: 99px;" onclick="sendChatMessage()">Gửi</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
}

window.sendChatMessage = async function () {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    const messagesDiv = document.getElementById('chat-messages');

    // Add user message
    messagesDiv.innerHTML += `
        <div style="background: var(--primary); color: white; padding: 1rem; border-radius: 8px; align-self: flex-end; max-width: 80%; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            ${msg}
        </div>
    `;
    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Add typing indicator
    const typingId = 'typing-' + Date.now();
    messagesDiv.innerHTML += `
        <div id="${typingId}" style="background: white; padding: 1rem; border-radius: 8px; align-self: flex-start; max-width: 80%; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-style: italic; color: #666;">
            Đang suy nghĩ...
        </div>
    `;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
        const res = await fetchAPI('/student/chat', 'POST', { message: msg });
        document.getElementById(typingId).remove();
        messagesDiv.innerHTML += `
            <div style="background: white; padding: 1rem; border-radius: 8px; align-self: flex-start; max-width: 80%; box-shadow: 0 2px 4px rgba(0,0,0,0.05); white-space: pre-wrap;">
                ${res.reply}
            </div>
        `;
    } catch (err) {
        document.getElementById(typingId).remove();
        messagesDiv.innerHTML += `
            <div style="background: #FEE2E2; color: #991B1B; padding: 1rem; border-radius: 8px; align-self: flex-start; max-width: 80%; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                Lỗi: ${err.message}
            </div>
        `;
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

async function renderProfile() {
    const user = await fetchAPI('/auth/profile');
    contentArea.innerHTML = `
        <div class="card" style="max-width: 600px; margin: 0 auto;">
            <div class="card-header">
                <div class="card-title">Cập nhật hồ sơ</div>
            </div>
            <div class="card-body">
                <div class="form-group"><label>Họ tên</label><input type="text" id="prof_fullname" value="${user.fullname || ''}"></div>
                <div class="form-group"><label>Email</label><input type="email" id="prof_email" value="${user.email || ''}"></div>
                <div class="form-group"><label>SĐT</label><input type="text" id="prof_phone" value="${user.phone || ''}" ${user.role==='Admin'?'disabled':''}></div>
                <div class="form-group"><label>Địa chỉ</label><input type="text" id="prof_address" value="${user.address || ''}" ${user.role==='Admin'?'disabled':''}></div>
                <div class="form-group"><label>Mật khẩu mới (Bỏ trống nếu không đổi)</label><input type="password" id="prof_password" placeholder="Nhập pass mới..."></div>
                <button class="btn btn-primary" onclick="saveProfile()">Lưu thay đổi</button>
            </div>
        </div>
    `;
}

window.saveProfile = async function() {
    try {
        const body = {
            fullname: document.getElementById('prof_fullname').value,
            email: document.getElementById('prof_email').value,
            phone: document.getElementById('prof_phone').value,
            address: document.getElementById('prof_address').value
        };
        const pass = document.getElementById('prof_password').value;
        if (pass) body.password = pass;

        const res = await fetchAPI('/auth/profile', 'PUT', body);
        showToast('Cập nhật hồ sơ thành công');
        
        // Update local state if needed
        state.user.fullname = res.fullname;
        localStorage.setItem('user', JSON.stringify(state.user));
        document.getElementById('user-name').textContent = res.fullname;
        document.getElementById('prof_password').value = '';
    } catch(err){}
};

// Boot
init();
