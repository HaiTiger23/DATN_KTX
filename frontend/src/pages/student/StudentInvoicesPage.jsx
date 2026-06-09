import React, { useState, useEffect } from 'react';
import { Empty, Spin } from 'antd';
import StudentInvoicesTab from '../../components/tabs/StudentInvoicesTab';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export default function StudentInvoicesPage() {
  const { t } = useLanguage();
  const api = useApi();
  const { showToast } = useToast();
  
  const [data, setData] = useState({ invoices: [], invoiceRoom: null });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api(`/student/invoices?page=${page}&limit=${limit}`);
      setData({ invoices: res.data, invoiceRoom: res.room });
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

  const onPay = async (invId, file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/student/invoices/${invId}/pay`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Error');
      showToast(t('toast.receiptSent'));
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
      loadData();
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
      <StudentInvoicesTab
        room={data.invoiceRoom}
        invoices={data.invoices || []}
        pagination={{ current: page, pageSize: limit, total, onChange: (p, s) => { setPage(p); setLimit(s); }, showSizeChanger: true }}
        onPay={onPay}
      />
    </div>
  );
}
