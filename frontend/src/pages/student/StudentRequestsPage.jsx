import React, { useState, useEffect } from 'react';
import { Empty, Spin } from 'antd';
import StudentRequestsTab from '../../components/tabs/StudentRequestsTab';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';

export default function StudentRequestsPage() {
  const { t } = useLanguage();
  const api = useApi();
  
  const [data, setData] = useState({ requests: [] });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api(`/student/requests?page=${page}&limit=${limit}`);
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
  }, [page, limit]);

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
      <StudentRequestsTab
        requests={data.requests || []}
        pagination={{ current: page, pageSize: limit, total, onChange: (p, s) => { setPage(p); setLimit(s); }, showSizeChanger: true }}
      />
    </div>
  );
}
