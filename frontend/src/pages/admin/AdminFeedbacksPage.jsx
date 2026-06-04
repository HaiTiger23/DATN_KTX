import React, { useState, useEffect } from 'react';
import { Empty, Spin, Input, Select, Button, Tag, Modal, Form } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import AdminFeedbacksTab from '../../components/tabs/AdminFeedbacksTab';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';
import { exportToExcel } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminFeedbacksPage() {
  const { t } = useLanguage();
  const api = useApi();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [data, setData] = useState({ feedbacks: [] });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ search: '', status: '', sort: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      let q = `?page=${page}&limit=${limit}`;
      if (filters.search) q += `&search=${encodeURIComponent(filters.search)}`;
      if (filters.status) q += `&status=${encodeURIComponent(filters.status)}`;
      if (filters.sort) q += `&sort=${encodeURIComponent(filters.sort)}`;

      const res = await api(`/admin/feedbacks${q}`);
      setData({ feedbacks: res.data });
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

  const handleSendFeedbackReply = async (feedbackId, content) => {
    try {
      await api(`/admin/feedbacks/${feedbackId}/reply`, 'POST', { reply_content: content });
      showToast(t('feedbacks.replySuccess', 'Đã gửi phản hồi'));
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteFeedbackReply = async (feedbackId, replyId) => {
    try {
      await api(`/admin/feedbacks/${feedbackId}/reply/${replyId}`, 'DELETE');
      showToast(t('feedbacks.deleteReplySuccess', 'Đã xóa phản hồi'));
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const deleteFeedback = async (id) => {
    try {
      await api(`/admin/feedbacks/${id}`, 'DELETE');
      showToast(t('toast.feedbackDeleted'));
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

      const res = await api(`/admin/feedbacks${q}`);
      const formatted = res.data.map(f => {
        let statusStr = f.status;
        if (f.status === 'Pending') statusStr = 'Đang chờ';
        if (f.status === 'Answered') statusStr = 'Đã trả lời';

        const plainText = f.description ? f.description.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim() : '';
        
        return {
          'Tiêu đề': f.title,
          'Nội dung': plainText,
          'Người gửi': f.student_id?.fullname || '',
          'Trạng thái': statusStr,
          'Ngày gửi': new Date(f.createdAt).toLocaleDateString('vi-VN')
        };
      });
      exportToExcel(formatted, 'DS_PhanAnh', 'DuLieu');
    } catch (err) {
      console.error(err);
    }
  };

  const renderFilterBar = () => {
    const statusOptions = [
      { label: t('filter.unanswered'), value: 'Pending' },
      { label: t('filter.answered'), value: 'Answered' }
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
        <AdminFeedbacksTab
          feedbacks={data.feedbacks || []}
          onSendReply={handleSendFeedbackReply}
          onDeleteReply={handleDeleteFeedbackReply}
          onDelete={deleteFeedback}
          pagination={{ current: page, pageSize: limit, total, onChange: (p, s) => { setPage(p); setLimit(s); }, showSizeChanger: true }}
          currentUser={user}
        />
      </div>
    </div>
  );
}
