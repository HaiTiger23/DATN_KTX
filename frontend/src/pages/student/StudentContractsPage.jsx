import React, { useState, useEffect } from 'react';
import { Empty, Spin, Modal } from 'antd';
import StudentContractsTab from '../../components/tabs/StudentContractsTab';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export default function StudentContractsPage() {
  const { t } = useLanguage();
  const api = useApi();
  const { showToast } = useToast();
  
  const [data, setData] = useState({ contracts: [] });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api(`/student/contracts?page=${page}&limit=${limit}`);
      setData({ contracts: res.data });
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

  const cancelStudentContract = (id) => {
    Modal.confirm({
      title: t('confirm.cancelContract'),
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await api(`/student/contracts/${id}/cancel`, 'POST');
          showToast(res.message || t('toast.cancelContractSent'));
          // Navigate to requests page
          window.location.href = '/student/requests';
        } catch (err) {
          showToast(err.message, 'error');
        }
      },
    });
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
      <StudentContractsTab
        contracts={data.contracts || []}
        onCancelContract={cancelStudentContract}
        pagination={{ current: page, pageSize: limit, total, onChange: (p, s) => { setPage(p); setLimit(s); }, showSizeChanger: true }}
      />
    </div>
  );
}
