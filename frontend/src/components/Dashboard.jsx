import { useCallback, useEffect, useMemo, useState } from 'react';
import { TAB_TITLES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useApi } from '../hooks/useApi';
import Modal from './Modal';
import AdminRoomsTab from './tabs/AdminRoomsTab';
import AdminStudentsTab from './tabs/AdminStudentsTab';
import AdminRequestsTab from './tabs/AdminRequestsTab';
import AdminContractsTab from './tabs/AdminContractsTab';
import AdminFeedbacksTab from './tabs/AdminFeedbacksTab';
import AdminKnowledgeTab from './tabs/AdminKnowledgeTab';
import AdminSettingsTab from './tabs/AdminSettingsTab';
import StudentRoomsTab from './tabs/StudentRoomsTab';
import StudentRequestsTab from './tabs/StudentRequestsTab';
import StudentContractsTab from './tabs/StudentContractsTab';
import StudentFeedbacksTab from './tabs/StudentFeedbacksTab';
import StudentChatbotTab from './tabs/StudentChatbotTab';
import ProfileTab from './tabs/ProfileTab';

const ADMIN_NAV = [
  { target: 'rooms', label: '🛏️ Quản lý Phòng' },
  { target: 'students', label: '👨‍🎓 Sinh viên' },
  { target: 'requests', label: '📋 Đơn chờ duyệt' },
  { target: 'contracts', label: '📄 Hợp đồng' },
  { target: 'feedbacks', label: '💬 Phản ánh' },
  { target: 'admin_knowledge', label: '📚 Tri thức (RAG)' },
  { target: 'admin_settings', label: '⚙️ Cài đặt' },
  { target: 'profile', label: '👤 Thông tin cá nhân' },
];

const STUDENT_NAV = [
  { target: 'student_rooms', label: '🛏️ Đăng ký phòng' },
  { target: 'student_requests', label: '📋 Đơn của tôi' },
  { target: 'student_contracts', label: '📄 Hợp đồng của tôi' },
  { target: 'student_feedbacks', label: '💬 Phản hồi của tôi' },
  { target: 'student_chatbot', label: '🤖 Trợ lý AI' },
  { target: 'profile', label: '👤 Thông tin cá nhân' },
];

export default function Dashboard() {
  const { user, logout, updateUserLocal } = useAuth();
  const { showToast } = useToast();
  const api = useApi();

  const defaultTab = user?.role === 'Admin' ? 'rooms' : 'student_rooms';
  const [currentTab, setCurrentTab] = useState(defaultTab);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalId, setModalId] = useState(null);

  const [replyContent, setReplyContent] = useState('');
  const [roomForm, setRoomForm] = useState({ room_code: '', building: '', capacity: 4, price: 1200000 });
  const [studentForm, setStudentForm] = useState({
    fullname: '',
    email: '',
    password: '',
    mssv: '',
    cccd: '',
    phone: '',
    address: '',
  });
  const [feedbackForm, setFeedbackForm] = useState({ title: '', description: '' });
  const [knowledgeForm, setKnowledgeForm] = useState({ question: '', answer: '' });
  const [geminiKey, setGeminiKey] = useState('');
  const [profileForm, setProfileForm] = useState({
    fullname: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });

  const navItems = user?.role === 'Admin' ? ADMIN_NAV : STUDENT_NAV;

  const loadTab = useCallback(async () => {
    const tab = currentTab;
    setLoading(true);
    setData({});
    try {
      switch (tab) {
        case 'rooms':
          setData({ rooms: await api('/admin/rooms') });
          break;
        case 'students':
          setData({ students: await api('/admin/students') });
          break;
        case 'requests':
          setData({ requests: await api('/admin/requests') });
          break;
        case 'contracts':
          setData({ contracts: await api('/admin/contracts') });
          break;
        case 'feedbacks':
          setData({ feedbacks: await api('/admin/feedbacks') });
          break;
        case 'admin_knowledge':
          setData({ knowledge: await api('/admin/knowledge') });
          break;
        case 'admin_settings': {
          const settings = await api('/admin/settings');
          setGeminiKey(settings.geminiApiKey || '');
          setData({ settings });
          break;
        }
        case 'student_rooms':
          setData({ rooms: await api('/student/rooms') });
          break;
        case 'student_requests':
          setData({ requests: await api('/student/requests') });
          break;
        case 'student_contracts':
          setData({ contracts: await api('/student/contracts') });
          break;
        case 'student_feedbacks':
          setData({ feedbacks: await api('/student/feedbacks') });
          break;
        case 'student_chatbot':
          setData({});
          break;
        case 'profile': {
          const prof = await api('/auth/profile');
          setProfileForm({
            fullname: prof.fullname || '',
            email: prof.email || '',
            phone: prof.phone || '',
            address: prof.address || '',
            password: '',
          });
          setData({ profile: prof });
          break;
        }
        default:
          break;
      }
    } catch {
      setData({ error: true });
    } finally {
      setLoading(false);
    }
  }, [currentTab, api]);

  useEffect(() => {
    loadTab();
  }, [loadTab]);

  const openModal = (type, id = null) => {
    setModalType(type);
    setModalId(id);
    setModalOpen(true);
    if (type === 'reply_feedback') setReplyContent('');
    if (type === 'add_room') setRoomForm({ room_code: '', building: '', capacity: 4, price: 1200000 });
    if (type === 'add_student')
      setStudentForm({
        fullname: '',
        email: '',
        password: '123456',
        mssv: '',
        cccd: '',
        phone: '',
        address: '',
      });
    if (type === 'add_feedback') setFeedbackForm({ title: '', description: '' });
    if (type === 'add_knowledge') setKnowledgeForm({ question: '', answer: '' });
    if (type === 'edit_room' && id) {
      const r = data.rooms?.find((x) => x._id === id);
      if (r) setRoomForm({ room_code: r.room_code, building: r.building, capacity: r.capacity, price: r.price });
    }
    if (type === 'edit_student' && id) {
      const s = data.students?.find((x) => x._id === id);
      if (s)
        setStudentForm({
          fullname: s.fullname,
          email: s.email,
          password: '',
          mssv: s.mssv || '',
          cccd: s.cccd || '',
          phone: s.phone || '',
          address: s.address || '',
        });
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setModalId(null);
  };

  const handleModalSave = async () => {
    try {
      if (modalType === 'reply_feedback') {
        if (!replyContent.trim()) return showToast('Vui lòng nhập nội dung', 'error');
        await api(`/admin/feedbacks/${modalId}/reply`, 'POST', { reply_content: replyContent });
        showToast('Đã gửi trả lời');
        closeModal();
        loadTab();
        return;
      }
      if (modalType === 'add_room') {
        const body = {
          room_code: roomForm.room_code,
          building: roomForm.building,
          capacity: Number(roomForm.capacity),
          price: Number(roomForm.price),
        };
        if (!body.room_code || !body.building || !body.capacity || !body.price) return showToast('Điền đủ thông tin', 'error');
        await api('/admin/rooms', 'POST', body);
        showToast('Thêm phòng thành công');
        closeModal();
        loadTab();
        return;
      }
      if (modalType === 'add_student') {
        const body = {
          fullname: studentForm.fullname,
          email: studentForm.email,
          password: studentForm.password,
          mssv: studentForm.mssv,
          cccd: studentForm.cccd,
        };
        if (!body.fullname || !body.email || !body.password) return showToast('Điền đủ thông tin bắt buộc', 'error');
        await api('/admin/students', 'POST', body);
        showToast('Thêm sinh viên thành công');
        closeModal();
        loadTab();
        return;
      }
      if (modalType === 'edit_room') {
        const body = {
          building: roomForm.building,
          capacity: Number(roomForm.capacity),
          price: Number(roomForm.price),
        };
        await api(`/admin/rooms/${modalId}`, 'PUT', body);
        showToast('Cập nhật phòng thành công');
        closeModal();
        loadTab();
        return;
      }
      if (modalType === 'edit_student') {
        const body = {
          fullname: studentForm.fullname,
          email: studentForm.email,
          phone: studentForm.phone,
          address: studentForm.address,
        };
        if (studentForm.password) body.password = studentForm.password;
        await api(`/admin/students/${modalId}`, 'PUT', body);
        showToast('Cập nhật sinh viên thành công');
        closeModal();
        loadTab();
        return;
      }
      if (modalType === 'add_feedback') {
        if (!feedbackForm.title || !feedbackForm.description) return showToast('Điền đủ tiêu đề và nội dung', 'error');
        await api('/student/feedbacks', 'POST', feedbackForm);
        showToast('Đã gửi phản hồi');
        closeModal();
        loadTab();
        return;
      }
      if (modalType === 'add_knowledge') {
        if (!knowledgeForm.question || !knowledgeForm.answer) return showToast('Vui lòng điền đủ câu hỏi và trả lời', 'error');
        await api('/admin/knowledge', 'POST', knowledgeForm);
        showToast('Thêm tri thức thành công');
        closeModal();
        loadTab();
      }
    } catch {
      /* toast via api */
    }
  };

  const modalTitle = useMemo(() => {
    const titles = {
      reply_feedback: 'Trả lời phản ánh',
      edit_room: 'Sửa thông tin phòng',
      add_room: 'Thêm phòng mới',
      add_student: 'Thêm sinh viên mới',
      edit_student: 'Sửa thông tin sinh viên',
      add_feedback: 'Gửi phản hồi cho Ban quản lý',
      add_knowledge: 'Thêm Tri thức (Q&A)',
    };
    return titles[modalType] || '';
  }, [modalType]);

  const renderModalBody = () => {
    switch (modalType) {
      case 'reply_feedback':
        return (
          <div className="form-group">
            <label>Nội dung trả lời</label>
            <textarea rows={4} required value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
          </div>
        );
      case 'add_room':
      case 'edit_room':
        return (
          <>
            <div className="form-group">
              <label>Mã phòng</label>
              <input
                type="text"
                value={roomForm.room_code}
                onChange={(e) => setRoomForm((f) => ({ ...f, room_code: e.target.value }))}
                disabled={modalType === 'edit_room'}
                style={modalType === 'edit_room' ? { background: '#eee' } : undefined}
              />
            </div>
            <div className="form-group">
              <label>Tòa nhà</label>
              <input type="text" value={roomForm.building} onChange={(e) => setRoomForm((f) => ({ ...f, building: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Sức chứa</label>
              <input
                type="number"
                value={roomForm.capacity}
                onChange={(e) => setRoomForm((f) => ({ ...f, capacity: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Giá/tháng</label>
              <input type="number" value={roomForm.price} onChange={(e) => setRoomForm((f) => ({ ...f, price: e.target.value }))} />
            </div>
          </>
        );
      case 'add_student':
      case 'edit_student':
        return (
          <>
            <div className="form-group">
              <label>Họ tên (*)</label>
              <input type="text" value={studentForm.fullname} onChange={(e) => setStudentForm((f) => ({ ...f, fullname: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Email (*)</label>
              <input type="email" value={studentForm.email} onChange={(e) => setStudentForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>{modalType === 'add_student' ? 'Mật khẩu (*)' : 'Mật khẩu mới (Bỏ trống nếu không đổi)'}</label>
              <input
                type="text"
                value={studentForm.password}
                onChange={(e) => setStudentForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={modalType === 'edit_student' ? 'Nhập pass mới...' : undefined}
              />
            </div>
            {modalType === 'add_student' ? (
              <>
                <div className="form-group">
                  <label>MSSV</label>
                  <input type="text" value={studentForm.mssv} onChange={(e) => setStudentForm((f) => ({ ...f, mssv: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>CCCD</label>
                  <input type="text" value={studentForm.cccd} onChange={(e) => setStudentForm((f) => ({ ...f, cccd: e.target.value }))} />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>SĐT</label>
                  <input type="text" value={studentForm.phone} onChange={(e) => setStudentForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input type="text" value={studentForm.address} onChange={(e) => setStudentForm((f) => ({ ...f, address: e.target.value }))} />
                </div>
              </>
            )}
          </>
        );
      case 'add_feedback':
        return (
          <>
            <div className="form-group">
              <label>Tiêu đề</label>
              <input type="text" value={feedbackForm.title} onChange={(e) => setFeedbackForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Nội dung</label>
              <textarea rows={4} value={feedbackForm.description} onChange={(e) => setFeedbackForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </>
        );
      case 'add_knowledge':
        return (
          <>
            <div className="form-group">
              <label>Câu hỏi</label>
              <input type="text" value={knowledgeForm.question} onChange={(e) => setKnowledgeForm((f) => ({ ...f, question: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Trả lời</label>
              <textarea rows={4} value={knowledgeForm.answer} onChange={(e) => setKnowledgeForm((f) => ({ ...f, answer: e.target.value }))} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const pageTitle = TAB_TITLES[currentTab] || '';

  const showSync = currentTab === 'rooms';
  const showAdd = ['rooms', 'students', 'student_feedbacks', 'admin_knowledge'].includes(currentTab);
  let addLabel = '+ Thêm mới';
  if (currentTab === 'student_feedbacks') addLabel = '+ Tạo phản hồi mới';
  if (currentTab === 'admin_knowledge') addLabel = '+ Thêm Tri thức';

  const handleAddClick = () => {
    if (currentTab === 'rooms') openModal('add_room');
    else if (currentTab === 'students') openModal('add_student');
    else if (currentTab === 'student_feedbacks') openModal('add_feedback');
    else if (currentTab === 'admin_knowledge') openModal('add_knowledge');
  };

  const handleSync = async () => {
    try {
      const res = await api('/admin/rooms/sync-occupancy', 'POST');
      showToast(res.message || 'Đồng bộ thành công');
      loadTab();
    } catch {
      /* handled */
    }
  };

  const toggleRoomStatus = async (id, currentStatus) => {
    if (!window.confirm('Xác nhận đổi trạng thái phòng này?')) return;
    const newStatus = currentStatus === 'Available' ? 'Maintenance' : 'Available';
    try {
      await api(`/admin/rooms/${id}/status`, 'PATCH', { status: newStatus });
      showToast('Đã đổi trạng thái phòng');
      loadTab();
    } catch {
      /* handled */
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm('Xác nhận xóa sinh viên này?')) return;
    try {
      await api(`/admin/students/${id}`, 'DELETE');
      showToast('Xóa sinh viên thành công');
      loadTab();
    } catch {
      /* handled */
    }
  };

  const handleRequest = async (id, action) => {
    if (!window.confirm(`Xác nhận ${action === 'approve' ? 'duyệt' : 'từ chối'} đơn này?`)) return;
    try {
      await api(`/admin/requests/${id}/${action}`, 'POST');
      showToast('Xử lý đơn thành công');
      loadTab();
    } catch {
      /* handled */
    }
  };

  const endContract = async (id) => {
    if (!window.confirm('Kết thúc hợp đồng này?')) return;
    try {
      await api(`/admin/contracts/${id}/status`, 'PATCH');
      showToast('Đã kết thúc hợp đồng');
      loadTab();
    } catch {
      /* handled */
    }
  };

  const registerRoom = async (roomId) => {
    const monthsStr = window.prompt('Nhập số tháng thuê bạn muốn (VD: 6, 12):', '6');
    if (monthsStr === null) return;
    const monthsNum = parseInt(monthsStr, 10);
    if (Number.isNaN(monthsNum) || monthsNum <= 0) return showToast('Số tháng không hợp lệ', 'error');
    if (!window.confirm(`Bạn có chắc chắn muốn đăng ký phòng này trong ${monthsNum} tháng?`)) return;
    try {
      await api('/student/requests', 'POST', { room_id: roomId, months: monthsNum });
      showToast('Đã gửi đơn đăng ký. Vui lòng chờ admin duyệt.');
      setCurrentTab('student_requests');
    } catch {
      /* handled */
    }
  };

  const cancelStudentContract = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn gửi yêu cầu hủy hợp đồng này?')) return;
    try {
      const res = await api(`/student/contracts/${id}/cancel`, 'POST');
      showToast(res.message || 'Đã gửi yêu cầu hủy hợp đồng');
      setCurrentTab('student_requests');
    } catch {
      /* handled */
    }
  };

  const deleteKnowledge = async (id) => {
    if (!window.confirm('Xác nhận xóa?')) return;
    try {
      await api(`/admin/knowledge/${id}`, 'DELETE');
      showToast('Đã xóa tri thức');
      loadTab();
    } catch {
      /* handled */
    }
  };

  const saveSettings = async () => {
    try {
      await api('/admin/settings', 'POST', { geminiApiKey: geminiKey });
      showToast('Đã lưu cài đặt');
    } catch {
      /* handled */
    }
  };

  const saveProfile = async () => {
    try {
      const body = {
        fullname: profileForm.fullname,
        email: profileForm.email,
        phone: profileForm.phone,
        address: profileForm.address,
      };
      if (profileForm.password) body.password = profileForm.password;
      const res = await api('/auth/profile', 'PUT', body);
      showToast('Cập nhật hồ sơ thành công');
      updateUserLocal({ fullname: res.fullname });
      setProfileForm((f) => ({ ...f, password: '' }));
    } catch {
      /* handled */
    }
  };

  const sendChatMessage = (msg) => api('/student/chat', 'POST', { message: msg });

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="loader" style={{ borderTopColor: 'var(--primary)', width: 32, height: 32 }} />
        </div>
      );
    }
    if (data.error) {
      return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>Lỗi tải dữ liệu</div>;
    }

    switch (currentTab) {
      case 'rooms':
        return (
          <AdminRoomsTab
            rooms={data.rooms || []}
            onToggleStatus={toggleRoomStatus}
            onEdit={(r) => openModal('edit_room', r._id)}
          />
        );
      case 'students':
        return (
          <AdminStudentsTab
            students={data.students || []}
            onEdit={(s) => openModal('edit_student', s._id)}
            onDelete={deleteStudent}
          />
        );
      case 'requests':
        return <AdminRequestsTab requests={data.requests || []} onHandle={handleRequest} />;
      case 'contracts':
        return <AdminContractsTab contracts={data.contracts || []} onEndContract={endContract} />;
      case 'feedbacks':
        return <AdminFeedbacksTab feedbacks={data.feedbacks || []} onReply={(id) => openModal('reply_feedback', id)} />;
      case 'admin_knowledge':
        return <AdminKnowledgeTab items={data.knowledge || []} onDelete={deleteKnowledge} />;
      case 'admin_settings':
        return <AdminSettingsTab geminiKey={geminiKey} setGeminiKey={setGeminiKey} onSave={saveSettings} />;
      case 'student_rooms':
        return <StudentRoomsTab rooms={data.rooms || []} onRegister={registerRoom} />;
      case 'student_requests':
        return <StudentRequestsTab requests={data.requests || []} />;
      case 'student_contracts':
        return <StudentContractsTab contracts={data.contracts || []} onCancelContract={cancelStudentContract} />;
      case 'student_feedbacks':
        return <StudentFeedbacksTab feedbacks={data.feedbacks || []} />;
      case 'student_chatbot':
        return <StudentChatbotTab sendMessage={sendChatMessage} />;
      case 'profile':
        return <ProfileTab user={user} form={profileForm} setForm={setProfileForm} onSave={saveProfile} />;
      default:
        return null;
    }
  };

  const sidebarTitle = user?.role === 'Admin' ? 'KTX Admin' : 'Cổng Sinh viên';
  const roleLabel = user?.role === 'Admin' ? 'Quản trị viên' : 'Sinh viên';

  return (
    <>
      <div id="dashboard-screen" className="screen active">
        <aside className="sidebar glass">
          <div className="sidebar-header">
            <div className="icon">🏢</div>
            <h2>{sidebarTitle}</h2>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <a
                key={item.target}
                href="#"
                className={`nav-item ${currentTab === item.target ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentTab(item.target);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="avatar">{(user?.fullname || 'U').charAt(0).toUpperCase()}</div>
              <div>
                <p className="name">{user?.fullname || 'User'}</p>
                <p className="role">{roleLabel}</p>
              </div>
            </div>
            <button type="button" id="logout-btn" className="btn btn-icon" title="Đăng xuất" onClick={logout}>
              🚪
            </button>
          </div>
        </aside>

        <main className="main-content">
          <header className="top-header glass">
            <h1 id="page-title">{pageTitle}</h1>
            <div className="header-actions">
              {showSync ? (
                <button type="button" className="btn btn-outline" id="sync-btn" onClick={handleSync}>
                  🔄 Đồng bộ
                </button>
              ) : null}
              {showAdd ? (
                <button type="button" className="btn btn-primary" id="add-btn" onClick={handleAddClick}>
                  {addLabel}
                </button>
              ) : null}
            </div>
          </header>

          <div className="content-area" id="content-area">
            {renderContent()}
          </div>
        </main>
      </div>

      <Modal open={modalOpen} title={modalTitle} onClose={closeModal} onSave={handleModalSave}>
        {renderModalBody()}
      </Modal>
    </>
  );
}
