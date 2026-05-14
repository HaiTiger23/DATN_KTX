import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  App,
  Avatar,
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  Space,
  Spin,
  Typography,
  Badge,
  Select,
  Modal as AntdModal,
  Upload,
  Row,
  Col,
  Tag,
} from 'antd';
import { LogoutOutlined, ReloadOutlined, PlusOutlined, BellOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useApi } from '../hooks/useApi';
import { formatVndInput, isRichTextEmpty, parseVndInput } from '../api';
import LanguageSwitcher from './LanguageSwitcher';
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
import AdminNotificationsTab from './tabs/AdminNotificationsTab';
import StudentNotificationsTab from './tabs/StudentNotificationsTab';
import AdminInvoicesTab from './tabs/AdminInvoicesTab';
import StudentInvoicesTab from './tabs/StudentInvoicesTab';
import ProfileTab from './tabs/ProfileTab';
import RichTextEditor from './RichTextEditor';

const { Header, Sider, Content } = Layout;

const ADMIN_TARGETS = [
  'rooms',
  'students',
  'requests',
  'contracts',
  'invoices',
  'feedbacks',
  'admin_knowledge',
  'admin_notifications',
  'admin_settings',
  'profile',
];

const STUDENT_TARGETS = [
  'student_rooms',
  'student_requests',
  'student_contracts',
  'student_invoices',
  'student_feedbacks',
  'student_chatbot',
  'profile',
];

export default function Dashboard() {
  const { modal } = App.useApp();
  const { user, logout, token, updateUserLocal } = useAuth();
  const { t } = useLanguage();
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
  const [roomForm, setRoomForm] = useState({ 
    room_code: '', building: '', floor: 1, capacity: 4, price: 1200000,
    description: '', images: [], amenities: [], roomType: 'Standard'
  });
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
  const [notificationForm, setNotificationForm] = useState({ title: '', content: '' });
  const [invoiceForm, setInvoiceForm] = useState({ room_id: '', month: '', electricity_cost: 0, water_cost: 0, additional_cost: 0 });
  const [geminiKey, setGeminiKey] = useState('');
  const [agentSettings, setAgentSettings] = useState({
    agentAllowCheckRoom: true,

    agentAllowCheckContract: true,
    aiSystemPrompt: '',
    allowedEmailDomains: [],
  });
  const [profileForm, setProfileForm] = useState({
    fullname: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });
  const [roomFiles, setRoomFiles] = useState([]); // Array of { uid, name, status, url }

  const [allNotifs, setAllNotifs] = useState([]);
  const [unreadList, setUnreadList] = useState([]);
  const [showUnreadModal, setShowUnreadModal] = useState(false);
  const [showAllNotifsModal, setShowAllNotifsModal] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [allRooms, setAllRooms] = useState([]);

  const [roomFilters, setRoomFilters] = useState({ search: '', floor: '', roomType: '', sort: 'default' });
  
  // Read initial state from URL
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get('search') || '',
      status: params.get('status') || '',
      type:   params.get('type') || '',
      month:  params.get('month') || '',
      sort:   params.get('sort') || '',
      room_id: params.get('room_id') || ''
    };
  });

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('tab', currentTab);
    params.set('page', page);
    params.set('limit', limit);
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.type)   params.set('type',   filters.type);
    if (filters.month)  params.set('month',  filters.month);
    if (filters.sort)   params.set('sort',   filters.sort);
    if (filters.room_id) params.set('room_id', filters.room_id);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [currentTab, page, limit, filters]);

  useEffect(() => {
    // Only reset filters if they weren't just set by navigateToTab
    // To handle simple tab clicks from the sidebar
    if (!window.location.search.includes('room_id=')) {
        setPage(1);
        setFilters({ search: '', status: '', type: '', month: '', sort: '', room_id: '' });
    }
  }, [currentTab]);

  useEffect(() => {
    // Fetch all rooms for filter dropdown
    const fetchRoomsForFilter = async () => {
      try {
        const d = await api('/admin/rooms?limit=1000');
        if (d?.data) {
          setAllRooms(d.data.map(r => ({ label: `${r.building} - ${r.room_code}`, value: r._id })));
        }
      } catch (err) {
        console.error('Fetch rooms error:', err);
      }
    };
    if (user?.role === 'Admin' && token) fetchRoomsForFilter();
  }, [token, user?.role, api]);

  const navigateToTab = (tab, initialFilters = {}) => {
    setCurrentTab(tab);
    setPage(1);
    setFilters({ search: '', status: '', type: '', month: '', sort: '', room_id: '', ...initialFilters });
  };



  const navItems = useMemo(() => {
    const targets = user?.role === 'Admin' ? ADMIN_TARGETS : STUDENT_TARGETS;
    return targets.map((target) => ({ target, label: t(`nav.${target}`) }));
  }, [user?.role, t]);

  const menuItems = useMemo(
    () =>
      navItems.map(({ target, label }) => ({
        key: target,
        label,
      })),
    [navItems],
  );

  const loadTab = useCallback(async () => {
    const tab = currentTab;
    setLoading(true);
    setData({});
    try {
      let q = `?page=${page}&limit=${limit}`;
      if (filters.search) q += `&search=${encodeURIComponent(filters.search)}`;
      if (filters.status) q += `&status=${encodeURIComponent(filters.status)}`;
      if (filters.type) q += `&type=${encodeURIComponent(filters.type)}`;
      if (filters.month) q += `&month=${encodeURIComponent(filters.month)}`;
      if (filters.sort) q += `&sort=${encodeURIComponent(filters.sort)}`;
      if (filters.room_id) q += `&room_id=${encodeURIComponent(filters.room_id)}`;

      switch (tab) {
        case 'rooms': {
          const res = await api(`/admin/rooms${q}`);
          setData({ rooms: res.data });
          setTotal(res.pagination?.total || 0);
          break;
        }
        case 'students': {
          const res = await api(`/admin/students${q}`);
          setData({ students: res.data });
          setTotal(res.pagination.total);
          break;
        }
        case 'requests': {
          const res = await api(`/admin/requests${q}`);
          setData({ requests: res.data });
          setTotal(res.pagination.total);
          break;
        }
        case 'contracts': {
          const res = await api(`/admin/contracts${q}`);
          setData({ contracts: res.data });
          setTotal(res.pagination.total);
          break;
        }
        case 'feedbacks': {
          const res = await api(`/admin/feedbacks${q}`);
          setData({ feedbacks: res.data });
          setTotal(res.pagination.total);
          break;
        }
        case 'admin_knowledge': {
          const res = await api(`/admin/knowledge${q}`);
          setData({ knowledge: res.data });
          setTotal(res.pagination.total);
          break;
        }
        case 'admin_notifications': {
          const res = await api(`/admin/notifications${q}`);
          setData({ notifications: res.data });
          setTotal(res.pagination.total);
          break;
        }
        case 'admin_settings': {
          const settings = await api('/admin/settings');
          setGeminiKey(settings.geminiApiKey || '');
          setAgentSettings({
            agentAllowCheckRoom: settings.agentAllowCheckRoom ?? true,

            agentAllowCheckContract: settings.agentAllowCheckContract ?? true,
            aiSystemPrompt: settings.aiSystemPrompt || '',
            allowedEmailDomains: settings.allowedEmailDomains || [],
          });
          setData({ settings });
          break;
        }
        case 'student_rooms': {
          let extraQuery = '';
          if (roomFilters.search) extraQuery += `&search=${encodeURIComponent(roomFilters.search)}`;
          if (roomFilters.floor) extraQuery += `&floor=${encodeURIComponent(roomFilters.floor)}`;
          if (roomFilters.roomType) extraQuery += `&roomType=${encodeURIComponent(roomFilters.roomType)}`;
          if (roomFilters.sort) extraQuery += `&sort=${encodeURIComponent(roomFilters.sort)}`;

          // Pass limit=100 for contracts and requests to ensure we get active ones
          const [roomsRes, studentContractsRes, studentRequestsRes] = await Promise.all([
            api(`/student/rooms${q}${extraQuery}`),
            api('/student/contracts?limit=100'),
            api('/student/requests?limit=100'),
          ]);
          setData({ 
            rooms: roomsRes.data, 
            studentContracts: studentContractsRes.data, 
            studentRequests: studentRequestsRes.data 
          });
          setTotal(roomsRes.pagination?.total || 0);
          break;
        }
        case 'student_requests': {
          const res = await api(`/student/requests${q}`);
          setData({ requests: res.data });
          setTotal(res.pagination?.total || 0);
          break;
        }
        case 'student_contracts': {
          const res = await api(`/student/contracts${q}`);
          setData({ contracts: res.data });
          setTotal(res.pagination?.total || 0);
          break;
        }
        case 'student_feedbacks': {
          const res = await api(`/student/feedbacks${q}`);
          setData({ feedbacks: res.data });
          setTotal(res.pagination.total);
          break;
        }
        case 'student_invoices': {
          const res = await api(`/student/invoices${q}`);
          setData({ invoiceRoom: res.room, invoices: res.data });
          setTotal(res.pagination?.total || 0);
          break;
        }
        case 'student_chatbot':
          setData({});
          break;
        case 'invoices': {
          const [res, roomsRes] = await Promise.all([
            api(`/admin/invoices${q}`),
            api('/admin/rooms?limit=1000'), // fetch all rooms for modal dropdown
          ]);
          setData({ invoices: res.data, adminRoomsForInvoice: roomsRes.data });
          setTotal(res.pagination?.total || 0);
          break;
        }
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
  }, [currentTab, api, page, limit, roomFilters, filters]);

  useEffect(() => {
    loadTab();
  }, [loadTab]);

  useEffect(() => {
    if (user?.role === 'Student') {
      api('/student/notifications?limit=100').then((res) => {
        setAllNotifs(res.data || []);
        const unread = (res.data || []).filter((n) => !n.isRead);
        if (unread.length > 0) {
          setUnreadList(unread);
          setShowUnreadModal(true);
        }
      }).catch(() => {});
    }
  }, [user, api]);

  /** Làm mới danh sách phòng khi quay lại tab/cửa sổ (sau khi admin duyệt, số chỗ trên server đã đổi). */
  useEffect(() => {
    if (currentTab !== 'student_rooms') return undefined;
    let timeoutId;
    const scheduleRefresh = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        loadTab();
      }, 250);
    };
    const onFocus = () => scheduleRefresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') scheduleRefresh();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [currentTab, loadTab]);

  const openModal = (type, id = null) => {
    setModalType(type);
    setModalId(id);
    setModalOpen(true);
    if (type === 'reply_feedback') setReplyContent('');
    if (type === 'add_room') {
      setRoomForm({ 
        room_code: '', building: '', floor: 1, capacity: 4, price: 1200000,
        description: '', images: [], amenities: [], roomType: 'Standard'
      });
      setRoomFiles([]);
    }
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
    if (type === 'add_notification') setNotificationForm({ title: '', content: '' });
    if (type === 'add_invoice') {
      const now = new Date();
      const month = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      setInvoiceForm({ room_id: '', month, electricity_cost: 0, water_cost: 0, additional_cost: 0 });
    }
    if (type === 'edit_room' && id) {
      const r = data.rooms?.find((x) => x._id === id);
      if (r) {
        setRoomForm({ 
          room_code: r.room_code, 
          building: r.building, 
          floor: r.floor || 1,
          capacity: r.capacity, 
          price: r.price,
          description: r.description || '',
          images: r.images || [],
          amenities: r.amenities || [],
          roomType: r.roomType || 'Standard'
        });
        setRoomFiles((r.images || []).map((url, i) => ({
          uid: `-${i}`,
          name: `image-${i}`,
          status: 'done',
          url: url,
        })));
      }
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
    if (modalType === 'reply_feedback') {
      if (!replyContent.trim()) {
        showToast(t('toast.replyRequired'), 'error');
        throw new Error('validation');
      }
      await api(`/admin/feedbacks/${modalId}/reply`, 'POST', { reply_content: replyContent });
      showToast(t('toast.replySent'));
      closeModal();
      loadTab();
      return;
    }
    if (modalType === 'add_room' || modalType === 'edit_room') {
      // 1. Upload new files if any
      const newFiles = roomFiles.filter(f => f.originFileObj);
      let finalImages = roomFiles.filter(f => f.url).map(f => f.url);

      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach(f => formData.append('images', f.originFileObj));
        
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/upload/multiple`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Lỗi upload ảnh');
        finalImages = [...finalImages, ...json.urls];
      }

      const body = {
        room_code: roomForm.room_code,
        building: roomForm.building,
        floor: Number(roomForm.floor),
        capacity: Number(roomForm.capacity),
        price: Number(roomForm.price),
        description: roomForm.description,
        images: finalImages,
        amenities: roomForm.amenities,
        roomType: roomForm.roomType,
      };

      if (modalType === 'add_room') {
        if (!body.room_code || !body.building || !body.capacity || !body.price || !body.floor) {
          showToast(t('toast.fillAll'), 'error');
          throw new Error('validation');
        }
        await api('/admin/rooms', 'POST', body);
        showToast(t('toast.roomAdded'));
      } else {
        await api(`/admin/rooms/${modalId}`, 'PUT', body);
        showToast(t('toast.roomUpdated'));
      }

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
      if (!body.fullname || !body.email || !body.password) {
        showToast(t('toast.fillRequired'), 'error');
        throw new Error('validation');
      }
      await api('/admin/students', 'POST', body);
      showToast(t('toast.studentAdded'));
      closeModal();
      loadTab();
      return;
    }
    if (modalType === 'edit_room') {
      const body = {
        building: roomForm.building,
        floor: Number(roomForm.floor),
        capacity: Number(roomForm.capacity),
        price: Number(roomForm.price),
        description: roomForm.description,
        images: roomForm.images,
        amenities: roomForm.amenities,
        roomType: roomForm.roomType,
      };
      await api(`/admin/rooms/${modalId}`, 'PUT', body);
      showToast(t('toast.roomUpdated'));
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
      showToast(t('toast.studentUpdated'));
      closeModal();
      loadTab();
      return;
    }
    if (modalType === 'add_feedback') {
      if (!feedbackForm.title?.trim() || isRichTextEmpty(feedbackForm.description)) {
        showToast(t('toast.feedbackTitleBody'), 'error');
        throw new Error('validation');
      }
      await api('/student/feedbacks', 'POST', feedbackForm);
      showToast(t('toast.feedbackSent'));
      closeModal();
      loadTab();
      return;
    }
    if (modalType === 'add_knowledge') {
      if (!knowledgeForm.question?.trim() || isRichTextEmpty(knowledgeForm.answer)) {
        showToast(t('toast.knowledgeFill'), 'error');
        throw new Error('validation');
      }
      await api('/admin/knowledge', 'POST', knowledgeForm);
      showToast(t('toast.knowledgeAdded'));
      closeModal();
      loadTab();
      return;
    }
    if (modalType === 'add_notification') {
      if (!notificationForm.title?.trim() || isRichTextEmpty(notificationForm.content)) {
        showToast(t('toast.knowledgeFill'), 'error');
        throw new Error('validation');
      }
      await api('/admin/notifications', 'POST', notificationForm);
      showToast(t('toast.notificationAdded'));
      closeModal();
      loadTab();
    }
    if (modalType === 'add_invoice') {
      if (!invoiceForm.room_id || !invoiceForm.month) {
        showToast('Vui lòng chọn phòng và nhập tháng', 'error');
        throw new Error('validation');
      }
      await api('/admin/invoices', 'POST', invoiceForm);
      showToast('Tạo hóa đơn thành công');
      closeModal();
      loadTab();
    }
  };

  const modalTitle = useMemo(() => {
    const keys = {
      reply_feedback: 'modal.reply_feedback',
      edit_room: 'modal.edit_room',
      add_room: 'modal.add_room',
      add_student: 'modal.add_student',
      edit_student: 'modal.edit_student',
      add_feedback: 'modal.add_feedback',
      add_knowledge: 'modal.add_knowledge',
      add_notification: 'modal.add_notification',
      add_invoice: 'Tạo Hóa đơn tháng',
    };
    const key = keys[modalType];
    return key ? t(key) : '';
  }, [modalType, t]);

  const renderModalBody = () => {
    switch (modalType) {
      case 'reply_feedback':
        return (
          <Form layout="vertical">
            <Form.Item label={t('modal.replyContent')} required>
              <Input.TextArea rows={4} value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
            </Form.Item>
          </Form>
        );
      case 'add_invoice':
        return (
          <Form layout="vertical">
            <Form.Item label="Phòng" required>
              <Select
                placeholder="Chọn phòng"
                value={invoiceForm.room_id || undefined}
                onChange={(v) => setInvoiceForm((f) => ({ ...f, room_id: v }))}
                showSearch
                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
              >
                {(data.adminRoomsForInvoice || []).map((r) => (
                  <Select.Option key={r._id} value={r._id}>{r.room_code} – {r.building}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Tháng (VD: 05/2026)" required>
              <Input value={invoiceForm.month} onChange={(e) => setInvoiceForm((f) => ({ ...f, month: e.target.value }))} />
            </Form.Item>
            <Form.Item label="Tiền điện (VND)" required>
              <InputNumber className="ktx-input-block" min={0} step={1000} value={invoiceForm.electricity_cost} formatter={formatVndInput} parser={parseVndInput} onChange={(v) => setInvoiceForm((f) => ({ ...f, electricity_cost: v || 0 }))} />
            </Form.Item>
            <Form.Item label="Tiền nước (VND)" required>
              <InputNumber className="ktx-input-block" min={0} step={1000} value={invoiceForm.water_cost} formatter={formatVndInput} parser={parseVndInput} onChange={(v) => setInvoiceForm((f) => ({ ...f, water_cost: v || 0 }))} />
            </Form.Item>
            <Form.Item label="Phụ phí (VND)">
              <InputNumber className="ktx-input-block" min={0} step={1000} value={invoiceForm.additional_cost} formatter={formatVndInput} parser={parseVndInput} onChange={(v) => setInvoiceForm((f) => ({ ...f, additional_cost: v || 0 }))} />
            </Form.Item>
          </Form>
        );
      case 'add_room':
      case 'edit_room':
        return (
          <Form layout="vertical">
            <Form.Item label={t('modal.roomCode')}>
              <Input
                value={roomForm.room_code}
                onChange={(e) => setRoomForm((f) => ({ ...f, room_code: e.target.value }))}
                disabled={modalType === 'edit_room'}
              />
            </Form.Item>
            <Form.Item label={t('modal.building')} required>
              <Input value={roomForm.building} onChange={(e) => setRoomForm((f) => ({ ...f, building: e.target.value }))} />
            </Form.Item>
            <Form.Item label={t('modal.floor')} required>
              <InputNumber
                className="ktx-input-block"
                min={1}
                value={roomForm.floor}
                onChange={(v) => setRoomForm((f) => ({ ...f, floor: v }))}
              />
            </Form.Item>
            <Form.Item label={t('modal.roomType')}>
              <Select value={roomForm.roomType} onChange={(v) => setRoomForm((f) => ({ ...f, roomType: v }))}>
                <Select.Option value="Standard">Tiêu chuẩn</Select.Option>
                <Select.Option value="Service">Dịch vụ</Select.Option>
                <Select.Option value="VIP">VIP</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label={t('modal.capacity')} required>
              <InputNumber
                className="ktx-input-block"
                min={1}
                value={roomForm.capacity}
                onChange={(v) => setRoomForm((f) => ({ ...f, capacity: v }))}
              />
            </Form.Item>
            <Form.Item label={t('modal.priceMonth')} required>
              <InputNumber
                className="ktx-input-block"
                min={0}
                step={1000}
                value={roomForm.price}
                formatter={formatVndInput}
                parser={parseVndInput}
                onChange={(v) => setRoomForm((f) => ({ ...f, price: v }))}
              />
            </Form.Item>
            <Form.Item label={t('modal.description')}>
              <Input.TextArea value={roomForm.description} onChange={(e) => setRoomForm((f) => ({ ...f, description: e.target.value }))} />
            </Form.Item>
            <Form.Item label={t('modal.amenities')}>
              <Select 
                mode="tags" 
                placeholder="Nhập và nhấn Enter (VD: Điều hòa, Máy giặt)" 
                value={roomForm.amenities} 
                onChange={(v) => setRoomForm((f) => ({ ...f, amenities: v }))} 
              />
            </Form.Item>
            <Form.Item label={t('modal.images')}>
              <Upload
                listType="picture-card"
                fileList={roomFiles}
                onPreview={(file) => {
                  AntdModal.info({
                    title: 'Xem ảnh',
                    content: <img src={file.url || file.preview} style={{ width: '100%' }} />,
                    footer: null,
                    maskClosable: true,
                  });
                }}
                onChange={({ fileList }) => setRoomFiles(fileList)}
                beforeUpload={() => false}
                multiple
              >
                {roomFiles.length >= 10 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Form>
        );
      case 'add_student':
      case 'edit_student':
        return (
          <Form layout="vertical">
            <Form.Item label={t('modal.fullname')} required>
              <Input value={studentForm.fullname} onChange={(e) => setStudentForm((f) => ({ ...f, fullname: e.target.value }))} />
            </Form.Item>
            <Form.Item label={t('modal.email')} required>
              <Input type="email" value={studentForm.email} onChange={(e) => setStudentForm((f) => ({ ...f, email: e.target.value }))} />
            </Form.Item>
            <Form.Item label={modalType === 'add_student' ? t('modal.passwordRequired') : t('modal.passwordNewOptional')}>
              <Input.Password
                value={studentForm.password}
                onChange={(e) => setStudentForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={modalType === 'edit_student' ? t('modal.placeholderNewPass') : undefined}
              />
            </Form.Item>
            {modalType === 'add_student' ? (
              <>
                <Form.Item label={t('modal.mssv')}>
                  <Input value={studentForm.mssv} onChange={(e) => setStudentForm((f) => ({ ...f, mssv: e.target.value }))} />
                </Form.Item>
                <Form.Item label={t('modal.cccd')}>
                  <Input value={studentForm.cccd} onChange={(e) => setStudentForm((f) => ({ ...f, cccd: e.target.value }))} />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item label={t('modal.phone')}>
                  <Input value={studentForm.phone} onChange={(e) => setStudentForm((f) => ({ ...f, phone: e.target.value }))} />
                </Form.Item>
                <Form.Item label={t('modal.address')}>
                  <Input value={studentForm.address} onChange={(e) => setStudentForm((f) => ({ ...f, address: e.target.value }))} />
                </Form.Item>
              </>
            )}
          </Form>
        );
      case 'add_feedback':
        return (
          <Form layout="vertical">
            <Form.Item label={t('modal.feedbackTitle')} required>
              <Input value={feedbackForm.title} onChange={(e) => setFeedbackForm((f) => ({ ...f, title: e.target.value }))} />
            </Form.Item>
            <Form.Item label={t('modal.feedbackDesc')} required>
              <RichTextEditor
                value={feedbackForm.description}
                onChange={(html) => setFeedbackForm((f) => ({ ...f, description: html }))}
                placeholder={t('modal.feedbackDescPlaceholder')}
              />
            </Form.Item>
          </Form>
        );
      case 'add_knowledge':
        return (
          <Form layout="vertical">
            <Form.Item label={t('modal.question')} required>
              <Input value={knowledgeForm.question} onChange={(e) => setKnowledgeForm((f) => ({ ...f, question: e.target.value }))} />
            </Form.Item>
            <Form.Item label={t('modal.answer')} required>
              <RichTextEditor
                value={knowledgeForm.answer}
                onChange={(html) => setKnowledgeForm((f) => ({ ...f, answer: html }))}
                placeholder={t('modal.knowledgeAnswerPlaceholder')}
              />
            </Form.Item>
          </Form>
        );
      case 'add_notification':
        return (
          <Form layout="vertical">
            <Form.Item label={t('modal.notificationTitle')} required>
              <Input value={notificationForm.title} onChange={(e) => setNotificationForm((f) => ({ ...f, title: e.target.value }))} />
            </Form.Item>
            <Form.Item label={t('modal.notificationContent')} required>
              <RichTextEditor
                value={notificationForm.content}
                onChange={(html) => setNotificationForm((f) => ({ ...f, content: html }))}
              />
            </Form.Item>
          </Form>
        );
      default:
        return null;
    }
  };

  const pageTitle = t(`tab.${currentTab}`);

  const showSync = currentTab === 'rooms';
  const showAdd = ['rooms', 'students', 'invoices', 'student_feedbacks', 'admin_knowledge', 'admin_notifications'].includes(currentTab);
  let addLabel = t('dashboard.addNew');
  if (currentTab === 'student_feedbacks') addLabel = t('dashboard.addFeedback');
  if (currentTab === 'admin_knowledge') addLabel = t('dashboard.addKnowledge');
  if (currentTab === 'admin_notifications') addLabel = t('modal.add_notification');
  if (currentTab === 'invoices') addLabel = '+ Tạo hóa đơn';

  const handleAddClick = () => {
    if (currentTab === 'rooms') openModal('add_room');
    else if (currentTab === 'students') openModal('add_student');
    else if (currentTab === 'student_feedbacks') openModal('add_feedback');
    else if (currentTab === 'admin_knowledge') openModal('add_knowledge');
    else if (currentTab === 'admin_notifications') openModal('add_notification');
    else if (currentTab === 'invoices') openModal('add_invoice');
  };

  const handleSync = async () => {
    try {
      const res = await api('/admin/rooms/sync-occupancy', 'POST');
      showToast(res.message || t('common.syncSuccess'));
      loadTab();
    } catch {
      /* handled */
    }
  };

  const toggleRoomStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Available' ? 'Maintenance' : 'Available';
    modal.confirm({
      title: t('confirm.toggleRoom'),
      onOk: async () => {
        await api(`/admin/rooms/${id}/status`, 'PATCH', { status: newStatus });
        showToast(t('toast.roomStatus'));
        loadTab();
      },
    });
  };

  const deleteStudent = (id) => {
    modal.confirm({
      title: t('confirm.deleteStudent'),
      okType: 'danger',
      onOk: async () => {
        await api(`/admin/students/${id}`, 'DELETE');
        showToast(t('toast.studentDeleted'));
        loadTab();
      },
    });
  };

  const resetStudentPassword = (id) => {
    modal.confirm({
      title: 'Xác nhận reset mật khẩu?',
      content: 'Mật khẩu của sinh viên sẽ được đặt lại thành 123456.',
      onOk: async () => {
        const res = await api(`/admin/students/${id}/reset-password`, 'POST');
        showToast(res.message || 'Đã đặt lại mật khẩu thành 123456');
      },
    });
  };

  const handleRequest = (id, action) => {
    const msg = action === 'approve' ? t('confirm.approveRequest') : t('confirm.rejectRequest');
    modal.confirm({
      title: msg,
      okType: action === 'reject' ? 'danger' : 'primary',
      onOk: async () => {
        await api(`/admin/requests/${id}/${action}`, 'POST');
        showToast(t('toast.requestHandled'));
        loadTab();
      },
    });
  };

  const endContract = (id) => {
    modal.confirm({
      title: t('confirm.endContract'),
      okType: 'danger',
      onOk: async () => {
        await api(`/admin/contracts/${id}/status`, 'PATCH');
        showToast(t('toast.contractEnded'));
        loadTab();
      },
    });
  };

  const registerRoom = (roomId) => {
    let monthsNum = 6;
    modal.confirm({
      title: t('prompt.rentMonths'),
      icon: null,
      content: (
        <InputNumber
          min={1}
          className="ktx-modal-months-input"
          defaultValue={6}
          onChange={(v) => {
            monthsNum = typeof v === 'number' ? v : Number(v) || 1;
          }}
        />
      ),
      onOk: () => {
        if (Number.isNaN(monthsNum) || monthsNum <= 0) {
          showToast(t('toast.monthsInvalid'), 'error');
          return Promise.reject(new Error('validation'));
        }
        return new Promise((resolve, reject) => {
          modal.confirm({
            title: t('confirm.registerRoom', { months: monthsNum }),
            onOk: async () => {
              try {
                await api('/student/requests', 'POST', { room_id: roomId, months: monthsNum });
                showToast(t('toast.requestSubmitted'));
                setCurrentTab('student_requests');
                resolve();
              } catch {
                reject(new Error('api'));
              }
            },
            onCancel: () => reject(new Error('cancel')),
          });
        });
      },
    });
  };

  const cancelStudentContract = (id) => {
    modal.confirm({
      title: t('confirm.cancelContract'),
      okType: 'danger',
      onOk: async () => {
        const res = await api(`/student/contracts/${id}/cancel`, 'POST');
        showToast(res.message || t('toast.cancelContractSent'));
        setCurrentTab('student_requests');
      },
    });
  };

  const deleteKnowledge = (id) => {
    modal.confirm({
      title: t('confirm.deleteKnowledge'),
      okType: 'danger',
      onOk: async () => {
        await api(`/admin/knowledge/${id}`, 'DELETE');
        showToast(t('toast.knowledgeDeleted'));
        loadTab();
      },
    });
  };

  const deleteNotification = (id) => {
    modal.confirm({
      title: t('confirm.deleteNotification'),
      okType: 'danger',
      onOk: async () => {
        await api(`/admin/notifications/${id}`, 'DELETE');
        showToast(t('toast.notificationDeleted'));
        loadTab();
      },
    });
  };

  const readNotification = async (id) => {
    try {
      await api(`/student/notifications/${id}/read`, 'POST');
      setAllNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {
      // ignore
    }
  };

  const handleMarkAsReadSeq = async () => {
    if (unreadList.length === 0) return;
    const current = unreadList[0];
    try {
      await api(`/student/notifications/${current._id}/read`, 'POST');
      setAllNotifs(prev => prev.map(n => n._id === current._id ? { ...n, isRead: true } : n));
      const nextList = unreadList.slice(1);
      if (nextList.length > 0) {
        setUnreadList(nextList);
      } else {
        setShowUnreadModal(false);
        setUnreadList([]);
      }
    } catch {
      // ignore
    }
  };

  const saveSettings = async () => {
    try {
      await api('/admin/settings', 'POST', { 
        geminiApiKey: geminiKey,
        ...agentSettings
      });
      showToast(t('toast.settingsSaved'));
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
      showToast(t('toast.profileSaved'));
      updateUserLocal({ fullname: res.fullname });
      setProfileForm((f) => ({ ...f, password: '' }));
    } catch {
      /* handled */
    }
  };

  const sendChatMessage = (msg, history) => api('/student/chat', 'POST', { message: msg, history });

  const renderFilterBar = () => {
    const tabsWithFilters = [
      'rooms', 'students', 'requests', 'contracts', 'invoices', 'feedbacks', 
      'admin_knowledge', 'admin_notifications', 'student_invoices',
      'student_contracts', 'student_requests', 'student_notifications', 'student_feedbacks'
    ];

    if (!tabsWithFilters.includes(currentTab)) return null;

    const showSearch = true;
    const showStatus = ['rooms', 'students', 'requests', 'contracts', 'invoices', 'feedbacks', 'student_requests', 'student_contracts', 'student_feedbacks', 'student_invoices'].includes(currentTab);
    const showType = ['requests', 'student_requests'].includes(currentTab);
    const showMonth = ['invoices', 'student_invoices'].includes(currentTab);
    const showSort = ['rooms', 'students', 'requests', 'contracts', 'invoices', 'feedbacks', 'student_rooms'].includes(currentTab);

    // Dynamic Options
    let statusOptions = [];
    if (currentTab === 'rooms') statusOptions = [{ label: 'Trống', value: 'Available' }, { label: 'Bảo trì', value: 'Maintenance' }];
    if (currentTab === 'students') statusOptions = [{ label: 'Hoạt động', value: 'Active' }, { label: 'Khóa', value: 'Inactive' }];
    if (['requests', 'student_requests'].includes(currentTab)) statusOptions = [{ label: 'Chờ duyệt', value: 'Pending' }, { label: 'Đã duyệt', value: 'Approved' }, { label: 'Từ chối', value: 'Rejected' }];
    if (['invoices', 'student_invoices'].includes(currentTab)) statusOptions = [{ label: 'Chưa thanh toán', value: 'Pending' }, { label: 'Chờ duyệt', value: 'Waiting_Approval' }, { label: 'Đã thanh toán', value: 'Paid' }];
    if (['contracts', 'student_contracts'].includes(currentTab)) statusOptions = [{ label: 'Hiệu lực', value: 'Active' }, { label: 'Kết thúc', value: 'Ended' }];
    if (['feedbacks', 'student_feedbacks'].includes(currentTab)) statusOptions = [{ label: 'Chưa trả lời', value: 'Pending' }, { label: 'Đã trả lời', value: 'Answered' }];

    let sortOptions = [
      { label: 'Mới nhất', value: '' },
      { label: 'Cũ nhất', value: 'oldest' }
    ];
    if (currentTab === 'rooms' || currentTab === 'student_rooms') {
      sortOptions = [
        { label: 'Mới nhất', value: '' },
        { label: 'Giá tăng dần', value: 'price_asc' },
        { label: 'Giá giảm dần', value: 'price_desc' },
        { label: 'Mã phòng', value: 'room_code' }
      ];
    }
    if (currentTab === 'students') {
      sortOptions = [
        { label: 'Mới nhất', value: '' },
        { label: 'Tên A-Z', value: 'name_asc' },
        { label: 'Tên Z-A', value: 'name_desc' }
      ];
    }
    if (currentTab === 'invoices' || currentTab === 'student_invoices') {
      sortOptions = [
        { label: 'Mới nhất', value: '' },
        { label: 'Tháng giảm dần', value: 'month_desc' },
        { label: 'Tháng tăng dần', value: 'month_asc' },
        { label: 'Số tiền tăng dần', value: 'amount_asc' },
        { label: 'Số tiền giảm dần', value: 'amount_desc' }
      ];
    }

    return (
      <div className="ktx-filter-bar" style={{ 
        marginBottom: 24, 
        background: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(10px)',
        padding: '20px', 
        borderRadius: '12px', 
        border: '1px solid rgba(0, 0, 0, 0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)' 
      }}>
        <Row gutter={[16, 16]} align="middle">
          {showSearch && (
            <Col xs={24} md={6}>
              <Input 
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                placeholder={currentTab.includes('rooms') || currentTab.includes('invoice') || currentTab.includes('contract') ? "Tìm theo mã phòng..." : "Tìm kiếm..."}
                allowClear
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                style={{ borderRadius: '8px' }}
              />
            </Col>
          )}
          {(currentTab === 'students' || currentTab === 'invoices' || currentTab === 'contracts') && (
            <Col xs={12} md={4}>
              <Select 
                showSearch
                style={{ width: '100%', borderRadius: '8px' }}
                placeholder="Chọn phòng"
                allowClear
                value={filters.room_id || undefined}
                onChange={v => setFilters(prev => ({ ...prev, room_id: v || '' }))}
                options={allRooms}
                optionFilterProp="label"
              />
            </Col>
          )}
          {showStatus && (
            <Col xs={12} md={4}>
              <Select 
                style={{ width: '100%', borderRadius: '8px' }}
                placeholder="Trạng thái"
                allowClear
                value={filters.status || undefined}
                onChange={v => setFilters(prev => ({ ...prev, status: v || '' }))}
                options={statusOptions}
              />
            </Col>
          )}
          {showType && (
            <Col xs={12} md={4}>
              <Select 
                style={{ width: '100%', borderRadius: '8px' }}
                placeholder="Loại đơn"
                allowClear
                value={filters.type || undefined}
                onChange={v => setFilters(prev => ({ ...prev, type: v || '' }))}
                options={[
                  { label: 'Đăng ký', value: 'Registration' },
                  { label: 'Hủy phòng', value: 'Cancellation' }
                ]}
              />
            </Col>
          )}
          {showMonth && (
            <Col xs={12} md={4}>
              <Input 
                placeholder="Tháng (YYYY-MM)" 
                value={filters.month}
                onChange={e => setFilters(prev => ({ ...prev, month: e.target.value }))}
                style={{ borderRadius: '8px' }}
              />
            </Col>
          )}
          {showSort && (
            <Col xs={12} md={4}>
              <Select 
                style={{ width: '100%', borderRadius: '8px' }}
                placeholder="Sắp xếp"
                value={filters.sort || ''}
                onChange={v => setFilters(prev => ({ ...prev, sort: v }))}
                options={sortOptions}
              />
            </Col>
          )}
          {filters.room_id && (currentTab === 'students' || currentTab === 'invoices' || currentTab === 'contracts') && (
            <Col xs={24} md={24}>
              <Tag 
                color="blue" 
                closable 
                onClose={() => setFilters(prev => ({ ...prev, room_id: '' }))}
                style={{ padding: '4px 12px', fontSize: 13, borderRadius: '6px' }}
              >
                Đang lọc theo phòng: {allRooms.find(r => r.value === filters.room_id)?.label || filters.room_id}
              </Tag>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  const renderContent = () => {
    if (data.error) {
      return (
        <Empty
          description={<Typography.Text type="danger">{t('dashboard.loadError')}</Typography.Text>}
          className="ktx-empty-state"
        />
      );
    }

    return (
      <div className="ktx-dashboard-content">
        {renderFilterBar()}
        <div style={{ position: 'relative', minHeight: '200px' }}>
          {loading && (
            <div className="ktx-dashboard-spin-overlay" style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.6)',
              zIndex: 10,
              borderRadius: '12px'
            }}>
              <Spin size="large" />
            </div>
          )}
          {renderContentBody()}
        </div>
      </div>
    );
  };

  const renderContentBody = () => {
    const paginationProps = {
      current: page,
      pageSize: limit,
      total,
      onChange: (p, s) => {
        setPage(p);
        setLimit(s);
      },
      showSizeChanger: true,
    };

    switch (currentTab) {
      case 'rooms':
        return (
          <AdminRoomsTab
            rooms={data.rooms || []}
            onToggleStatus={toggleRoomStatus}
            onEdit={(r) => openModal('edit_room', r._id)}
            onNavigate={navigateToTab}
            pagination={paginationProps}
          />
        );
      case 'students':
        return (
          <AdminStudentsTab
            students={data.students || []}
            onEdit={(s) => openModal('edit_student', s._id)}
            onDelete={deleteStudent}
            onResetPassword={resetStudentPassword}
            onNavigate={navigateToTab}
            pagination={paginationProps}
          />
        );
      case 'requests':
        return <AdminRequestsTab requests={data.requests || []} onHandle={handleRequest} pagination={paginationProps} />;
      case 'contracts':
        return <AdminContractsTab contracts={data.contracts || []} onEndContract={endContract} pagination={paginationProps} />;
      case 'invoices':
        return (
          <AdminInvoicesTab
            invoices={data.invoices || []}
            pagination={paginationProps}
            onConfirm={(id) => {
              modal.confirm({
                title: 'Xác nhận đã nhận được tiền?',
                onOk: async () => {
                  await api(`/admin/invoices/${id}/confirm`, 'PUT');
                  showToast('Đã xác nhận thanh toán');
                  loadTab();
                },
              });
            }}
            onReject={(id) => {
              modal.confirm({
                title: 'Từ chối biên lai này? Hóa đơn sẽ mở lại để sinh viên khác thanh toán.',
                okType: 'danger',
                onOk: async () => {
                  await api(`/admin/invoices/${id}/reject`, 'PUT');
                  showToast('Đã từ chối biên lai');
                  loadTab();
                },
              });
            }}
          />
        );
      case 'feedbacks':
        return <AdminFeedbacksTab feedbacks={data.feedbacks || []} onReply={(id) => openModal('reply_feedback', id)} pagination={paginationProps} />;
      case 'admin_knowledge':
        return <AdminKnowledgeTab items={data.knowledge || []} onDelete={deleteKnowledge} pagination={paginationProps} />;
      case 'admin_notifications':
        return <AdminNotificationsTab notifications={data.notifications || []} onDelete={deleteNotification} pagination={paginationProps} />;
      case 'admin_settings':
        return <AdminSettingsTab geminiKey={geminiKey} setGeminiKey={setGeminiKey} agentSettings={agentSettings} setAgentSettings={setAgentSettings} onSave={saveSettings} />;
      case 'student_rooms': {
        const contracts = data.studentContracts || [];
        const requests = data.studentRequests || [];
        const active = contracts.find((c) => c.status === 'Active');
        const activeRoomId = active ? String(active.room_id?._id ?? active.room_id) : null;
        const pendingReg = requests.find((r) => r.status === 'Pending' && r.type === 'Registration');
        const pendingRoomId = pendingReg ? String(pendingReg.room_id?._id ?? pendingReg.room_id) : null;
        return (
          <StudentRoomsTab
            rooms={data.rooms || []}
            activeRoomId={activeRoomId}
            pendingRoomId={pendingRoomId}
            onRegister={registerRoom}
            pagination={paginationProps}
            filters={roomFilters}
            onFiltersChange={(newFilters) => {
              setRoomFilters(prev => ({ ...prev, ...newFilters }));
              setPage(1); // Reset page on filter change
            }}
          />
        );
      }
      case 'student_requests':
        return <StudentRequestsTab requests={data.requests || []} pagination={paginationProps} />;
      case 'student_contracts':
        return <StudentContractsTab contracts={data.contracts || []} onCancelContract={cancelStudentContract} pagination={paginationProps} />;
      case 'student_feedbacks':
        return <StudentFeedbacksTab feedbacks={data.feedbacks || []} pagination={paginationProps} />;
      case 'student_invoices':
        return (
          <StudentInvoicesTab
            room={data.invoiceRoom}
            invoices={data.invoices || []}
            pagination={paginationProps}
            onPay={async (invId, file) => {
              const formData = new FormData();
              formData.append('receipt', file);
              const token = localStorage.getItem('token');
              try {
                const res = await fetch(
                  `${import.meta.env.VITE_API_URL}/student/invoices/${invId}/pay`,
                  { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData }
                );
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || 'Lỗi');
                showToast('Gửi biên lai thành công!');
                loadTab();
              } catch (err) {
                showToast(err.message, 'error');
                loadTab();
              }
            }}
          />
        );
      case 'student_chatbot':
        return <StudentChatbotTab sendMessage={sendChatMessage} />;
      case 'profile':
        return <ProfileTab user={user} form={profileForm} setForm={setProfileForm} onSave={saveProfile} />;
      default:
        return null;
    }
  };

  const sidebarTitle = user?.role === 'Admin' ? t('dashboard.sidebarAdmin') : t('dashboard.sidebarStudent');
  const roleLabel = user?.role === 'Admin' ? t('dashboard.roleAdmin') : t('dashboard.roleStudent');

  return (
    <>
      <Layout className="ktx-dashboard-layout">
        <Sider
          theme="light"
          width={260}
          breakpoint="lg"
          collapsedWidth={0}
          className="ktx-dashboard-sider"
        >
          <div className="ktx-dashboard-sider-brand">
            <Typography.Title level={5} className="ktx-dashboard-sider-title">
              🏢 {sidebarTitle}
            </Typography.Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[currentTab]}
            items={menuItems}
            onClick={({ key }) => setCurrentTab(key)}
            className="ktx-dashboard-menu"
          />
          <div className="ktx-dashboard-user-footer">
            <Space align="center" className="ktx-dashboard-user-row">
              <Space>
                <Avatar className="ktx-avatar-brand">{(user?.fullname || 'U').charAt(0).toUpperCase()}</Avatar>
                <div className="ktx-dashboard-user-name-container">
                  <Typography.Text strong ellipsis className="ktx-dashboard-user-name">
                    {user?.fullname || 'User'}
                  </Typography.Text>
                  <Typography.Text type="secondary" className="ktx-dashboard-user-role">
                    {roleLabel}
                  </Typography.Text>
                </div>
              </Space>
              <Button type="text" icon={<LogoutOutlined />} aria-label={t('dashboard.logoutTitle')} onClick={logout} />
            </Space>
          </div>
        </Sider>

        <Layout className="ktx-dashboard-main">
          <Header className="ktx-dashboard-header">
            <Typography.Title level={4} className="ktx-dashboard-page-title">
              {pageTitle}
            </Typography.Title>
            <Space wrap>
              {user?.role === 'Student' && (
                <Badge count={unreadList.length} overflowCount={99}>
                  <Button icon={<BellOutlined />} onClick={() => setShowAllNotifsModal(true)} />
                </Badge>
              )}
              {showSync ? (
                <Button onClick={handleSync}>
                  {t('dashboard.sync')}
                </Button>
              ) : null}
              {showAdd ? (
                <Button type="primary" onClick={handleAddClick}>
                  {addLabel}
                </Button>
              ) : null}
              <LanguageSwitcher />
            </Space>
          </Header>

          <Content className="ktx-dashboard-content">{renderContent()}</Content>
        </Layout>
      </Layout>

      <Modal
        open={modalOpen}
        title={modalTitle}
        onClose={closeModal}
        onSave={handleModalSave}
        cancelLabel={t('common.cancel')}
        saveLabel={t('common.save')}
      >
        {renderModalBody()}
      </Modal>

      {/* MODAL 1: Auto Popup Unread Notifications */}
      <AntdModal
        title={unreadList.length > 0 ? unreadList[0].title : ''}
        open={showUnreadModal}
        onCancel={() => setShowUnreadModal(false)}
        onOk={handleMarkAsReadSeq}
        okText={t('notifications.read')}
        cancelText={t('common.cancel')}
        width={600}
        closable={false}
        mask={{ closable: false }}
      >
        {unreadList.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              {t('notifications.date')}: {new Date(unreadList[0].createdAt).toLocaleString()}
            </Typography.Text>
            <div
              className="ql-editor"
              style={{ padding: 0 }}
              dangerouslySetInnerHTML={{ __html: unreadList[0].content || '' }}
            />
          </div>
        )}
      </AntdModal>

      {/* MODAL 2: All Notifications Archive */}
      <AntdModal
        title={t('tab.student_notifications')}
        open={showAllNotifsModal}
        onCancel={() => setShowAllNotifsModal(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <StudentNotificationsTab notifications={allNotifs} onRead={readNotification} />
        </div>
      </AntdModal>
    </>
  );
}
