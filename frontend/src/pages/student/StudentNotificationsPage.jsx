import React, { useState, useEffect } from 'react';
import { Empty, Spin } from 'antd';
import StudentNotificationsTab from '../../components/tabs/StudentNotificationsTab';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';

export default function StudentNotificationsPage() {
  const { t } = useLanguage();
  const api = useApi();
  
  const [data, setData] = useState({ notifications: [] });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api(`/student/notifications`);
      setData({ notifications: res.data || [] });
    } catch (err) {
      setData({ error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const readNotification = async (id) => {
    try {
      await api(`/student/notifications/${id}/read`, 'POST');
      setData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => n._id === id ? { ...n, isRead: true } : n)
      }));
      window.dispatchEvent(new Event('notification_read'));
    } catch {
      // ignore
    }
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
      <StudentNotificationsTab
        notifications={data.notifications || []}
        onRead={readNotification}
      />
    </div>
  );
}
