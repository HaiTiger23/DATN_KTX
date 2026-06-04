import React, { useState, useEffect } from 'react';
import { Empty, Spin, Input, Select, Button, Tag, Modal, Form } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import AdminRequestsTab from '../../components/tabs/AdminRequestsTab';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';
import { exportToExcel } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';

export default function AdminRequestsPage() {
  const { t } = useLanguage();
  const api = useApi();
  const { showToast } = useToast();
  
  const [data, setData] = useState({ requests: [] });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ search: '', status: '', sort: '', type: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      let q = `?page=${page}&limit=${limit}`;
      if (filters.search) q += `&search=${encodeURIComponent(filters.search)}`;
      if (filters.status) q += `&status=${encodeURIComponent(filters.status)}`;
      if (filters.sort) q += `&sort=${encodeURIComponent(filters.sort)}`;
      if (filters.type) q += `&type=${encodeURIComponent(filters.type)}`;

      const res = await api(`/admin/requests${q}`);
      setData({ requests: res.data });
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setData({ error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, limit, filters]);

  const handleRequest = async (id, action, rejectReason = '') => {
    try {
      await api(`/admin/requests/${id}/${action}`, 'POST', action === 'reject' ? { rejectReason } : null);
      showToast(action === 'approve' ? t('toast.requestApproved') : t('toast.requestRejected'));
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleExportExcel = async () => {
    try {
      let q = `?limit=10000`;
      if (filters.search) q += `&search=${encodeURIComponent(filters.search)}`;
      if (filters.status) q += `&status=${encodeURIComponent(filters.status)}`;
      if (filters.sort) q += `&sort=${encodeURIComponent(filters.sort)}`;
      if (filters.type) q += `&type=${encodeURIComponent(filters.type)}`;

      const res = await api(`/admin/requests${q}`);
      const formatted = res.data.map(r => {
        let typeStr = r.type;
        if (r.type === 'Maintenance') typeStr = 'Sửa chữa';
        if (r.type === 'ChangeRoom') typeStr = 'Chuyển phòng';
        if (r.type === 'CancelContract') typeStr = 'Hủy hợp đồng';

        let statusStr = r.status;
        if (r.status === 'Pending') statusStr = 'Đang chờ';
        if (r.status === 'Approved') statusStr = 'Đã duyệt';
        if (r.status === 'Rejected') statusStr = 'Từ chối';

        return {
          'Sinh viên': r.student_id?.fullname || '',
          'Phòng yêu cầu': r.room_id?.room_code || '',
          'Loại đơn': typeStr,
          'Trạng thái': statusStr,
          'Ngày tạo': new Date(r.createdAt).toLocaleDateString('vi-VN')
        };
      });
      exportToExcel(formatted, 'DS_DonDangKy', 'DuLieu');
    } catch (err) {
      console.error(err);
    }
  };

  const renderFilterBar = () => {
    const statusOptions = [
      { label: t('filter.pending'), value: 'Pending' },
      { label: t('filter.approved'), value: 'Approved' },
      { label: t('filter.rejected'), value: 'Rejected' }
    ];
    const typeOptions = [
      { label: t('filter.typeReg'), value: 'Registration' },
      { label: t('filter.typeCancel'), value: 'Cancellation' }
    ];
    const sortOptions = [
      { label: t('sort.newest'), value: '' },
      { label: t('sort.oldest'), value: 'oldest' }
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
              style={{ width: '160px', borderRadius: '8px' }}
              placeholder={t('filter.type')}
              allowClear
              value={filters.type || undefined}
              onChange={v => setFilters(prev => ({ ...prev, type: v || '' }))}
              options={typeOptions}
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
        <AdminRequestsTab
          requests={data.requests || []}
          onHandle={handleRequest}
          pagination={{ current: page, pageSize: limit, total, onChange: (p, s) => { setPage(p); setLimit(s); }, showSizeChanger: true }}
        />
      </div>
    </div>
  );
}
