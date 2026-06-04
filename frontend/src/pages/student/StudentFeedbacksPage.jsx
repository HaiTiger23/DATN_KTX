import React, { useState, useEffect } from 'react';
import { Empty, Spin, Modal, Form, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import StudentFeedbacksTab from '../../components/tabs/StudentFeedbacksTab';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import RichTextEditor from '../../components/RichTextEditor';

export default function StudentFeedbacksPage() {
  const { t } = useLanguage();
  const api = useApi();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [data, setData] = useState({ feedbacks: [] });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ title: '', description: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api(`/student/feedbacks?page=${page}&limit=${limit}`);
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
  }, [page, limit]);

  const handleSendFeedbackReply = async (feedbackId, content) => {
    try {
      await api(`/student/feedbacks/${feedbackId}/reply`, 'POST', { reply_content: content });
      showToast(t('feedbacks.replySuccess', 'Đã gửi phản hồi'));
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteFeedbackReply = async (feedbackId, replyId) => {
    try {
      await api(`/student/feedbacks/${feedbackId}/reply/${replyId}`, 'DELETE');
      showToast(t('feedbacks.deleteReplySuccess', 'Đã xóa phản hồi'));
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleModalSubmit = async () => {
    try {
      if (!feedbackForm.title || !feedbackForm.description) {
        showToast(t('toast.missingFields'), 'error');
        return;
      }
      await api('/student/feedbacks', 'POST', feedbackForm);
      showToast(t('toast.feedbackCreated', 'Gửi phản ánh thành công'));
      setModalOpen(false);
      loadData();
    } catch (err) {
      Modal.error({ title: t('dashboard.loadError'), content: err.message });
    }
  };

  const openAddFeedback = () => {
    setFeedbackForm({ title: '', description: '' });
    setModalOpen(true);
  };

  if (data.error) {
    return <Empty description={<span style={{ color: 'red' }}>{t('dashboard.loadError')}</span>} />;
  }

  return (
    <div style={{ position: 'relative', minHeight: '200px' }}>
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255, 255, 255, 0.6)', zIndex: 10, borderRadius: '12px' }}>
          <Spin size="large" />
        </div>
      )}
      
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none', borderRadius: '8px' }}
          onClick={openAddFeedback}
        >
          {t('dashboard.addFeedback')}
        </Button>
      </div>

      <Modal
        title={t('modal.addFeedback', 'Tạo phản ánh mới')}
        open={modalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setModalOpen(false)}
        okText={t('modal.save')}
        cancelText={t('modal.cancel')}
        destroyOnClose
        width={700}
      >
        <Form layout="vertical">
          <Form.Item label={t('modal.feedbackTitle', 'Tiêu đề')} required>
            <Input value={feedbackForm.title} onChange={(e) => setFeedbackForm((f) => ({ ...f, title: e.target.value }))} />
          </Form.Item>
          <Form.Item label={t('modal.feedbackDesc', 'Nội dung chi tiết')} required>
            <RichTextEditor
              value={feedbackForm.description}
              onChange={(html) => setFeedbackForm((f) => ({ ...f, description: html }))}
              placeholder={t('modal.feedbackDescPlaceholder', 'Mô tả chi tiết vấn đề của bạn...')}
            />
          </Form.Item>
        </Form>
      </Modal>

      <StudentFeedbacksTab
        feedbacks={data.feedbacks || []}
        onSendReply={handleSendFeedbackReply}
        onDeleteReply={handleDeleteFeedbackReply}
        onAdd={openAddFeedback}
        pagination={{ current: page, pageSize: limit, total, onChange: (p, s) => { setPage(p); setLimit(s); }, showSizeChanger: true }}
        currentUser={user}
      />
    </div>
  );
}
