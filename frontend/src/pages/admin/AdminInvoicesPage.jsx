import React, { useState, useEffect } from 'react';
import { Empty, Spin, Input, Select, Button, Tag, Modal, Form, InputNumber } from 'antd';
import { SearchOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import AdminInvoicesTab from '../../components/tabs/AdminInvoicesTab';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';
import { exportToExcel } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';

export default function AdminInvoicesPage() {
  const { t } = useLanguage();
  const api = useApi();
  const { showToast } = useToast();
  
  const [data, setData] = useState({ invoices: [] });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ search: '', status: '', sort: '', room_id: '', month: '' });
  const [allRooms, setAllRooms] = useState([]);
  const [roomsList, setRoomsList] = useState([]);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ room_id: '', month: '', electricity_cost: 0, water_cost: 0, additional_cost: 0 });

  // Bulk Modal state
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkMonth, setBulkMonth] = useState(new Date().toISOString().slice(0, 7));
  const [bulkBuilding, setBulkBuilding] = useState('');
  const [bulkData, setBulkData] = useState([]);

  // Utilities
  const formatVndInput = (val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const parseVndInput = (val) => val.replace(/\$\s?|(,*)/g, '');

  const loadData = async () => {
    setLoading(true);
    try {
      let q = `?page=${page}&limit=${limit}`;
      if (filters.search) q += `&search=${encodeURIComponent(filters.search)}`;
      if (filters.status) q += `&status=${encodeURIComponent(filters.status)}`;
      if (filters.sort) q += `&sort=${encodeURIComponent(filters.sort)}`;
      if (filters.room_id) q += `&room_id=${encodeURIComponent(filters.room_id)}`;
      if (filters.month) q += `&month=${encodeURIComponent(filters.month)}`;

      const res = await api(`/admin/invoices${q}`);
      setData({ invoices: res.data });
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
      setRoomsList(res.data);
      setAllRooms(res.data.map(r => ({ label: `${r.building}-${r.room_code}`, value: r._id })));
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (bulkBuilding) {
      const filtered = roomsList.filter(r => r.building === bulkBuilding);
      setBulkData(filtered.map(r => ({
        room_id: r._id,
        room_code: r.room_code,
        electricity_cost: 0,
        water_cost: 0,
        additional_cost: 0
      })));
    } else {
      setBulkData([]);
    }
  }, [bulkBuilding, roomsList]);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    loadData();
  }, [page, limit, filters]);

  const handleModalSubmit = async () => {
    try {
      if (!invoiceForm.room_id || !invoiceForm.month) {
        showToast(t('toast.missingFields'), 'error');
        return;
      }
      await api('/admin/invoices', 'POST', invoiceForm);
      showToast(t('toast.invoiceCreated'));
      setModalOpen(false);
      loadData();
    } catch (err) {
      Modal.error({ title: t('dashboard.loadError'), content: err.message });
    }
  };

  const openAddInvoice = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    setInvoiceForm({ room_id: '', month: currentMonth, electricity_cost: 0, water_cost: 0, additional_cost: 0 });
    setModalOpen(true);
  };

  const handleBulkSubmit = async () => {
    try {
      const payload = {
        invoices: bulkData.map(d => ({
          room_id: d.room_id,
          month: bulkMonth,
          electricity_cost: d.electricity_cost,
          water_cost: d.water_cost,
          additional_cost: d.additional_cost
        }))
      };
      const res = await api('/admin/invoices/bulk', 'POST', payload);
      showToast(res.message || 'Tạo hóa đơn hàng loạt thành công');
      setBulkModalOpen(false);
      loadData();
    } catch (err) {
      Modal.error({ title: 'Lỗi', content: err.message });
    }
  };

  const confirmInvoice = async (id) => {
    Modal.confirm({
      title: t('confirm.paymentConfirm'),
      onOk: async () => {
        try {
          await api(`/admin/invoices/${id}/confirm`, 'PUT');
          showToast(t('toast.paymentConfirmed'));
          loadData();
        } catch (err) {
          showToast(err.message, 'error');
        }
      },
    });
  };

  const rejectInvoice = async (id) => {
    Modal.confirm({
      title: t('confirm.receiptReject'),
      okType: 'danger',
      onOk: async () => {
        try {
          await api(`/admin/invoices/${id}/reject`, 'PUT');
          showToast(t('toast.receiptRejected'));
          loadData();
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
      if (filters.month) q += `&month=${encodeURIComponent(filters.month)}`;

      const res = await api(`/admin/invoices${q}`);
      const formatted = res.data.map(i => {
        let statusStr = i.status;
        if (i.status === 'Pending') statusStr = 'Chưa thanh toán';
        if (i.status === 'Waiting_Approval') statusStr = 'Chờ duyệt';
        if (i.status === 'Paid') statusStr = 'Đã thanh toán';

        return {
          'Mã HĐ': i.invoice_code || i._id,
          'Tháng': i.month,
          'Phòng': i.room_id?.room_code || '',
          'Tiền điện (VNĐ)': i.electricity_cost,
          'Tiền nước (VNĐ)': i.water_cost,
          'Phụ phí (VNĐ)': i.additional_cost,
          'Tổng cộng (VNĐ)': i.total_amount,
          'Trạng thái': statusStr,
          'Ngày tạo': new Date(i.createdAt).toLocaleDateString('vi-VN')
        };
      });
      exportToExcel(formatted, 'DS_HoaDon', 'DuLieu');
    } catch (err) {
      console.error(err);
    }
  };

  const renderFilterBar = () => {
    const statusOptions = [
      { label: t('filter.unpaid'), value: 'Pending' },
      { label: t('filter.waiting_approval'), value: 'Waiting_Approval' },
      { label: t('filter.paid'), value: 'Paid' }
    ];
    const sortOptions = [
      { label: t('sort.newest'), value: '' },
      { label: t('sort.monthDesc'), value: 'month_desc' },
      { label: t('sort.monthAsc'), value: 'month_asc' },
      { label: t('sort.amountAsc'), value: 'amount_asc' },
      { label: t('sort.amountDesc'), value: 'amount_desc' }
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
              placeholder={t('filter.searchRoom')}
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
            <Input 
              placeholder={t('filter.month')} 
              value={filters.month}
              onChange={e => setFilters(prev => ({ ...prev, month: e.target.value }))}
              style={{ borderRadius: '8px', width: '160px' }}
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
              onClick={openAddInvoice}
            >
              {t('dashboard.addNew')}
            </Button>
            <Button 
              type="primary" 
              style={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', 
                border: 'none', 
                borderRadius: '10px', 
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                height: '40px',
                padding: '0 24px',
                fontWeight: 600,
                fontSize: '14px',
                marginLeft: '12px'
              }}
              onClick={() => setBulkModalOpen(true)}
            >
              Tạo hàng loạt
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
        title={t('modal.addInvoice', 'Tạo hóa đơn')}
        open={modalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setModalOpen(false)}
        okText={t('modal.save')}
        cancelText={t('modal.cancel')}
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label={t('modal.invoiceRoom', 'Phòng')} required>
            <Select
              placeholder={t('modal.invoiceRoomSelect', 'Chọn phòng')}
              value={invoiceForm.room_id || undefined}
              onChange={(v) => setInvoiceForm((f) => ({ ...f, room_id: v }))}
              showSearch
              filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            >
              {allRooms.map((r) => (
                <Select.Option key={r.value} value={r.value}>{r.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label={t('modal.invoiceMonth', 'Tháng')} required>
            <Input type="month" value={invoiceForm.month} onChange={(e) => setInvoiceForm((f) => ({ ...f, month: e.target.value }))} />
          </Form.Item>
          <Form.Item label={t('modal.invoiceElec', 'Tiền điện')} required>
            <InputNumber className="ktx-input-block" style={{ width: '100%' }} min={0} step={1000} value={invoiceForm.electricity_cost} formatter={formatVndInput} parser={parseVndInput} onChange={(v) => setInvoiceForm((f) => ({ ...f, electricity_cost: v || 0 }))} />
          </Form.Item>
          <Form.Item label={t('modal.invoiceWater', 'Tiền nước')} required>
            <InputNumber className="ktx-input-block" style={{ width: '100%' }} min={0} step={1000} value={invoiceForm.water_cost} formatter={formatVndInput} parser={parseVndInput} onChange={(v) => setInvoiceForm((f) => ({ ...f, water_cost: v || 0 }))} />
          </Form.Item>
          <Form.Item label={t('modal.invoiceAdditional', 'Phụ phí')}>
            <InputNumber className="ktx-input-block" style={{ width: '100%' }} min={0} step={1000} value={invoiceForm.additional_cost} formatter={formatVndInput} parser={parseVndInput} onChange={(v) => setInvoiceForm((f) => ({ ...f, additional_cost: v || 0 }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Tạo hóa đơn hàng loạt"
        open={bulkModalOpen}
        onOk={handleBulkSubmit}
        onCancel={() => setBulkModalOpen(false)}
        okText="Lưu tất cả"
        cancelText="Hủy"
        width={900}
        destroyOnClose
      >
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
          <strong style={{ whiteSpace: 'nowrap' }}>Tháng:</strong>
          <Input type="month" value={bulkMonth} onChange={e => setBulkMonth(e.target.value)} style={{ width: 160 }} />
          <strong style={{ whiteSpace: 'nowrap', marginLeft: 16 }}>Tòa nhà:</strong>
          <Select 
            placeholder="Chọn tòa nhà" 
            value={bulkBuilding || undefined} 
            onChange={v => setBulkBuilding(v)} 
            style={{ width: 160 }}
            options={[...new Set(roomsList.map(r => r.building))].map(b => ({ label: `Tòa ${b}`, value: b }))}
          />
        </div>
        {bulkData.length > 0 ? (
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: 12, borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Phòng</th>
                  <th style={{ padding: 12, borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Tiền điện (VNĐ)</th>
                  <th style={{ padding: 12, borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Tiền nước (VNĐ)</th>
                  <th style={{ padding: 12, borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>Phụ phí (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                {bulkData.map((d, index) => (
                  <tr key={d.room_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 12px' }}><strong>{d.room_code}</strong></td>
                    <td style={{ padding: '8px 12px' }}>
                      <InputNumber min={0} step={1000} value={d.electricity_cost} onChange={v => { const n = [...bulkData]; n[index].electricity_cost = v || 0; setBulkData(n); }} formatter={formatVndInput} parser={parseVndInput} style={{ width: '100%' }} />
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <InputNumber min={0} step={1000} value={d.water_cost} onChange={v => { const n = [...bulkData]; n[index].water_cost = v || 0; setBulkData(n); }} formatter={formatVndInput} parser={parseVndInput} style={{ width: '100%' }} />
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <InputNumber min={0} step={1000} value={d.additional_cost} onChange={v => { const n = [...bulkData]; n[index].additional_cost = v || 0; setBulkData(n); }} formatter={formatVndInput} parser={parseVndInput} style={{ width: '100%' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty description="Vui lòng chọn tòa nhà để hiển thị danh sách phòng" />
        )}
      </Modal>

      <AdminInvoicesTab
        invoices={data.invoices || []}
          onConfirm={confirmInvoice}
          onReject={rejectInvoice}
          pagination={{ current: page, pageSize: limit, total, onChange: (p, s) => { setPage(p); setLimit(s); }, showSizeChanger: true }}
        />
      </div>
    </div>
  );
}
