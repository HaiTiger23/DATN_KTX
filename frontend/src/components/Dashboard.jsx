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
} from 'antd';
import { LogoutOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useApi } from '../hooks/useApi';
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
import ProfileTab from './tabs/ProfileTab';

const { Header, Sider, Content } = Layout;

const ADMIN_TARGETS = [
  'rooms',
  'students',
  'requests',
  'contracts',
  'feedbacks',
  'admin_knowledge',
  'admin_settings',
  'profile',
];

const STUDENT_TARGETS = [
  'student_rooms',
  'student_requests',
  'student_contracts',
  'student_feedbacks',
  'student_chatbot',
  'profile',
];

export default function Dashboard() {
  const { modal } = App.useApp();
  const { user, logout, updateUserLocal } = useAuth();
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
    if (modalType === 'add_room') {
      const body = {
        room_code: roomForm.room_code,
        building: roomForm.building,
        capacity: Number(roomForm.capacity),
        price: Number(roomForm.price),
      };
      if (!body.room_code || !body.building || !body.capacity || !body.price) {
        showToast(t('toast.fillAll'), 'error');
        throw new Error('validation');
      }
      await api('/admin/rooms', 'POST', body);
      showToast(t('toast.roomAdded'));
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
        capacity: Number(roomForm.capacity),
        price: Number(roomForm.price),
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
      if (!feedbackForm.title || !feedbackForm.description) {
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
      if (!knowledgeForm.question || !knowledgeForm.answer) {
        showToast(t('toast.knowledgeFill'), 'error');
        throw new Error('validation');
      }
      await api('/admin/knowledge', 'POST', knowledgeForm);
      showToast(t('toast.knowledgeAdded'));
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
            <Form.Item label={t('modal.capacity')} required>
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                value={roomForm.capacity}
                onChange={(v) => setRoomForm((f) => ({ ...f, capacity: v }))}
              />
            </Form.Item>
            <Form.Item label={t('modal.priceMonth')} required>
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                value={roomForm.price}
                onChange={(v) => setRoomForm((f) => ({ ...f, price: v }))}
              />
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
              <Input.TextArea rows={4} value={feedbackForm.description} onChange={(e) => setFeedbackForm((f) => ({ ...f, description: e.target.value }))} />
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
              <Input.TextArea rows={4} value={knowledgeForm.answer} onChange={(e) => setKnowledgeForm((f) => ({ ...f, answer: e.target.value }))} />
            </Form.Item>
          </Form>
        );
      default:
        return null;
    }
  };

  const pageTitle = t(`tab.${currentTab}`);

  const showSync = currentTab === 'rooms';
  const showAdd = ['rooms', 'students', 'student_feedbacks', 'admin_knowledge'].includes(currentTab);
  let addLabel = t('dashboard.addNew');
  if (currentTab === 'student_feedbacks') addLabel = t('dashboard.addFeedback');
  if (currentTab === 'admin_knowledge') addLabel = t('dashboard.addKnowledge');

  const handleAddClick = () => {
    if (currentTab === 'rooms') openModal('add_room');
    else if (currentTab === 'students') openModal('add_student');
    else if (currentTab === 'student_feedbacks') openModal('add_feedback');
    else if (currentTab === 'admin_knowledge') openModal('add_knowledge');
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
          style={{ width: '100%', marginTop: 8 }}
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

  const saveSettings = async () => {
    try {
      await api('/admin/settings', 'POST', { geminiApiKey: geminiKey });
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

  const sendChatMessage = (msg) => api('/student/chat', 'POST', { message: msg });

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Spin size="large" />
        </div>
      );
    }
    if (data.error) {
      return (
        <Empty
          description={<Typography.Text type="danger">{t('dashboard.loadError')}</Typography.Text>}
          style={{ padding: '2rem' }}
        />
      );
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

  const sidebarTitle = user?.role === 'Admin' ? t('dashboard.sidebarAdmin') : t('dashboard.sidebarStudent');
  const roleLabel = user?.role === 'Admin' ? t('dashboard.roleAdmin') : t('dashboard.roleStudent');

  return (
    <>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          theme="light"
          width={260}
          breakpoint="lg"
          collapsedWidth={0}
          style={{
            borderRight: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Typography.Title level={5} style={{ margin: 0, flex: 1 }}>
              🏢 {sidebarTitle}
            </Typography.Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[currentTab]}
            items={menuItems}
            onClick={({ key }) => setCurrentTab(key)}
            style={{ borderInlineEnd: 'none' }}
          />
          <div style={{ padding: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space>
                <Avatar style={{ backgroundColor: '#4F46E5' }}>{(user?.fullname || 'U').charAt(0).toUpperCase()}</Avatar>
                <div>
                  <Typography.Text strong ellipsis style={{ maxWidth: 140, display: 'block' }}>
                    {user?.fullname || 'User'}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {roleLabel}
                  </Typography.Text>
                </div>
              </Space>
              <Button type="text" icon={<LogoutOutlined />} aria-label={t('dashboard.logoutTitle')} onClick={logout} />
            </Space>
          </div>
        </Sider>

        <Layout>
          <Header
            style={{
              background: '#fff',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              height: 'auto',
              lineHeight: 1.4,
              paddingTop: 12,
              paddingBottom: 12,
            }}
          >
            <Typography.Title level={4} style={{ margin: 0 }}>
              {pageTitle}
            </Typography.Title>
            <Space wrap>
              {showSync ? (
                <Button icon={<ReloadOutlined />} onClick={handleSync}>
                  {t('dashboard.sync')}
                </Button>
              ) : null}
              {showAdd ? (
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddClick}>
                  {addLabel}
                </Button>
              ) : null}
              <LanguageSwitcher />
            </Space>
          </Header>

          <Content style={{ padding: 24, background: '#f5f5f5', minHeight: 280 }}>{renderContent()}</Content>
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
    </>
  );
}
