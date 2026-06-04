import React, { useState, useEffect } from 'react';
import { Empty, Spin, Input, Select, Button, Tag, Modal, Form } from 'antd';
import { SearchOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import AdminStudentsTab from '../../components/tabs/AdminStudentsTab';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';
import { exportToExcel } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';

export default function AdminStudentsPage() {
  const { t } = useLanguage();
  const api = useApi();
  const { showToast } = useToast();
  
  const [data, setData] = useState({ students: [] });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ search: '', status: '', sort: '', room_id: '' });
  const [allRooms, setAllRooms] = useState([]);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [studentForm, setStudentForm] = useState({ fullname: '', email: '', password: '', phone: '', address: '', mssv: '', cccd: '' });
  
  const loadData = async () => {
    setLoading(true);
    try {
      let q = `?page=${page}&limit=${limit}`;
      if (filters.search) q += `&search=${encodeURIComponent(filters.search)}`;
      if (filters.status) q += `&status=${encodeURIComponent(filters.status)}`;
      if (filters.sort) q += `&sort=${encodeURIComponent(filters.sort)}`;
      if (filters.room_id) q += `&room_id=${encodeURIComponent(filters.room_id)}`;

      const res = await api(`/admin/students${q}`);
      setData({ students: res.data });
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setData({ error: true });
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const res = await api('/admin/rooms?limit=1000');
      setAllRooms(res.data.map(r => ({ label: `${r.building}-${r.room_code}`, value: r._id })));
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    loadData();
  }, [page, limit, filters]);

  const handleModalSubmit = async () => {
    try {
      if (modalType === 'add_student') {
        if (!studentForm.password) {
          showToast(t('toast.missingPassword'), 'error');
          return;
        }
        await api('/admin/students', 'POST', studentForm);
        showToast(t('toast.studentAdded'));
      } else if (modalType === 'edit_student') {
        const body = {
          fullname: studentForm.fullname,
          email: studentForm.email,
          phone: studentForm.phone,
          address: studentForm.address
        };
        if (studentForm.password) body.password = studentForm.password;
        await api(`/admin/students/${editingId}`, 'PUT', body);
        showToast(t('toast.studentUpdated'));
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      Modal.error({ title: t('dashboard.loadError'), content: err.message });
    }
  };

  const openAddStudent = () => {
    setModalType('add_student');
    setStudentForm({ fullname: '', email: '', password: '', phone: '', address: '', mssv: '', cccd: '' });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEditStudent = (student) => {
    setModalType('edit_student');
    setStudentForm({
      fullname: student.fullname,
      email: student.email,
      password: '',
      phone: student.phone || '',
      address: student.address || '',
      mssv: student.mssv || '',
      cccd: student.cccd || ''
    });
    setEditingId(student._id);
    setModalOpen(true);
  };

  const deleteStudent = (id) => {
    Modal.confirm({
      title: t('confirm.deleteStudent'),
      okType: 'danger',
      onOk: async () => {
        try {
          await api(`/admin/students/${id}`, 'DELETE');
          showToast(t('toast.studentDeleted'));
          loadData();
        } catch (err) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  const resetStudentPassword = (id) => {
    Modal.confirm({
      title: t('confirm.resetPassword'),
      okType: 'danger',
      onOk: async () => {
        try {
          await api(`/admin/students/${id}/reset-password`, 'PUT');
          showToast(t('toast.passwordResetSuccess'));
        } catch (err) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  const handleExportExcel = async () => {
    try {
      let q = `?limit=10000`;
      if (filters.search) q += `&search=${encodeURIComponent(filters.search)}`;
      if (filters.status) q += `&status=${encodeURIComponent(filters.status)}`;
      if (filters.sort) q += `&sort=${encodeURIComponent(filters.sort)}`;
      if (filters.room_id) q += `&room_id=${encodeURIComponent(filters.room_id)}`;

      const res = await api(`/admin/students${q}`);
      const formatted = res.data.map(s => {
        let statusStr = s.status;
        if (s.status === 'Active') statusStr = 'Hoạt động';
        if (s.status === 'Inactive') statusStr = 'Đã khóa';

        return {
          'Mã SV': s.mssv || '',
          'Họ và tên': s.fullname || '',
          'Email': s.email,
          'SĐT': s.phone,
          'Phòng': s.room_id?.room_code || 'Chưa xếp',
          'Trạng thái': statusStr
        };
      });
      exportToExcel(formatted, 'DS_SinhVien', 'DuLieu');
    } catch (err) {
      console.error(err);
    }
  };

  const renderFilterBar = () => {
    const statusOptions = [
      { label: t('filter.active'), value: 'Active' },
      { label: t('filter.inactive'), value: 'Inactive' }
    ];
    const sortOptions = [
      { label: t('sort.newest'), value: '' },
      { label: t('sort.nameAsc'), value: 'name_asc' },
      { label: t('sort.nameDesc'), value: 'name_desc' }
    ];

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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', flex: 1 }}>
            <Input 
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder={t('filter.search')}
              allowClear
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              style={{ borderRadius: '8px', width: '240px' }}
            />
            <Select 
              showSearch
              style={{ width: '180px', borderRadius: '8px' }}
              placeholder={t('filter.selectRoom')}
              allowClear
              value={filters.room_id || undefined}
              onChange={v => setFilters(prev => ({ ...prev, room_id: v || '' }))}
              options={allRooms}
              optionFilterProp="label"
            />
            <Select 
              style={{ width: '160px', borderRadius: '8px' }}
              placeholder={t('filter.status')}
              allowClear
              value={filters.status || undefined}
              onChange={v => setFilters(prev => ({ ...prev, status: v || '' }))}
              options={statusOptions}
            />
            <Select 
              style={{ width: '160px', borderRadius: '8px' }}
              placeholder={t('filter.sort')}
              value={filters.sort || ''}
              onChange={v => setFilters(prev => ({ ...prev, sort: v }))}
              options={sortOptions}
            />
          </div>
          <div>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                border: 'none', 
                borderRadius: '10px', 
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                height: '40px',
                padding: '0 24px',
                fontWeight: 600,
                fontSize: '14px'
              }}
              onClick={handleExportExcel}
            >
              Xuất Excel
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                border: 'none', 
                borderRadius: '10px', 
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                height: '40px',
                padding: '0 24px',
                fontWeight: 600,
                fontSize: '14px',
                marginLeft: '12px'
              }}
              onClick={openAddStudent}
            >
              {t('dashboard.addNew')}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (data.error) {
    return <Empty description={<span style={{ color: 'red' }}>{t('dashboard.loadError')}</span>} />;
  }

  return (
    <div>
      {renderFilterBar()}
      <div style={{ position: 'relative', minHeight: '200px' }}>
        {loading && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255, 255, 255, 0.6)', zIndex: 10, borderRadius: '12px' }}>
            <Spin size="large" />
          </div>
        )}
        
        <Modal
          title={modalType === 'add_student' ? t('modal.addStudent', 'Thêm sinh viên') : t('modal.editStudent', 'Sửa sinh viên')}
          open={modalOpen}
          onOk={handleModalSubmit}
          onCancel={() => setModalOpen(false)}
          okText={t('modal.save')}
          cancelText={t('modal.cancel')}
          destroyOnClose
        >
          <Form layout="vertical">
            <Form.Item label={t('modal.fullname', 'Họ và tên')} required>
              <Input value={studentForm.fullname} onChange={(e) => setStudentForm((f) => ({ ...f, fullname: e.target.value }))} />
            </Form.Item>
            <Form.Item label={t('modal.email', 'Email')} required>
              <Input type="email" value={studentForm.email} onChange={(e) => setStudentForm((f) => ({ ...f, email: e.target.value }))} />
            </Form.Item>
            <Form.Item label={modalType === 'add_student' ? t('modal.passwordRequired', 'Mật khẩu (bắt buộc)') : t('modal.passwordNewOptional', 'Mật khẩu mới (Tùy chọn)')}>
              <Input.Password
                value={studentForm.password}
                onChange={(e) => setStudentForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={modalType === 'edit_student' ? t('modal.placeholderNewPass', 'Để trống nếu không đổi') : undefined}
              />
            </Form.Item>
            {modalType === 'add_student' ? (
              <>
                <Form.Item label={t('modal.mssv', 'MSSV')}>
                  <Input value={studentForm.mssv} onChange={(e) => setStudentForm((f) => ({ ...f, mssv: e.target.value }))} />
                </Form.Item>
                <Form.Item label={t('modal.cccd', 'Số CCCD')}>
                  <Input value={studentForm.cccd} onChange={(e) => setStudentForm((f) => ({ ...f, cccd: e.target.value }))} />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item label={t('modal.phone', 'Số điện thoại')}>
                  <Input value={studentForm.phone} onChange={(e) => setStudentForm((f) => ({ ...f, phone: e.target.value }))} />
                </Form.Item>
                <Form.Item label={t('modal.address', 'Địa chỉ')}>
                  <Input value={studentForm.address} onChange={(e) => setStudentForm((f) => ({ ...f, address: e.target.value }))} />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>

        <AdminStudentsTab
          students={data.students || []}
          onEdit={openEditStudent}
          onDelete={deleteStudent}
          onResetPassword={resetStudentPassword}
          onNavigate={(target) => console.log('Navigate', target)}
          pagination={{ current: page, pageSize: limit, total, onChange: (p, s) => { setPage(p); setLimit(s); }, showSizeChanger: true }}
        />
      </div>
    </div>
  );
}
