import React, { useState, useEffect } from 'react';
import { Empty, Spin, Modal, Form, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AdminNotificationsTab from '../../components/tabs/AdminNotificationsTab';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import RichTextEditor from '../../components/RichTextEditor';

export default function AdminNotificationsPage() {
  const { t } = useLanguage();
  const api = useApi();
  const { showToast } = useToast();
  
  const [data, setData] = useState({ notifications: [] });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [notificationForm, setNotificationForm] = useState({ title: '', content: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api(`/admin/notifications?page=${page}&limit=${limit}`);
      setData({ notifications: res.data });
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

  const deleteNotification = (id) => {
    Modal.confirm({
      title: t('confirm.deleteNotification'),
      okType: 'danger',
      onOk: async () => {
        try {
          await api(`/admin/notifications/${id}`, 'DELETE');
          showToast(t('toast.notificationDeleted'));
          loadData();
        } catch (err) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  const handleModalSubmit = async () => {
    try {
      if (!notificationForm.title || !notificationForm.content) {
        showToast(t('toast.missingFields'), 'error');
        return;
      }
      await api('/admin/notifications', 'POST', notificationForm);
      showToast(t('toast.notificationCreated', 'Tạo thông báo thành công'));
      setModalOpen(false);
      loadData();
    } catch (err) {
      Modal.error({ title: t('dashboard.loadError'), content: err.message });
    }
  };

  const openAddNotification = () => {
    setNotificationForm({ title: '', content: '' });
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
          onClick={openAddNotification}
        >
          {t('dashboard.addNotification', 'Tạo thông báo')}
        </Button>
      </div>

      <Modal
        title={t('modal.addNotification', 'Tạo thông báo mới')}
        open={modalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setModalOpen(false)}
        okText={t('modal.save')}
        cancelText={t('modal.cancel')}
        destroyOnClose
        width={700}
      >
        <Form layout="vertical">
          <Form.Item label={t('modal.notificationTitle', 'Tiêu đề')} required>
            <Input value={notificationForm.title} onChange={(e) => setNotificationForm((f) => ({ ...f, title: e.target.value }))} />
          </Form.Item>
          <Form.Item label={t('modal.notificationContent', 'Nội dung')} required>
            <RichTextEditor
              value={notificationForm.content}
              onChange={(html) => setNotificationForm((f) => ({ ...f, content: html }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <AdminNotificationsTab
        notifications={data.notifications || []}
        onDelete={deleteNotification}
        pagination={{ current: page, pageSize: limit, total, onChange: (p, s) => { setPage(p); setLimit(s); }, showSizeChanger: true }}
      />
    </div>
  );
}
