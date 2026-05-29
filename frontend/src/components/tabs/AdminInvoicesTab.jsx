import { useState } from 'react';
import { Button, Table, Tag, Space, Image, Typography, Tooltip, Modal } from 'antd';
import { formatMoney, formatDate } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

function statusColor(s) {
  if (s === 'Paid') return 'success';
  if (s === 'Waiting_Approval') return 'warning';
  return 'default';
}

export default function AdminInvoicesTab({ invoices, pagination, onConfirm, onReject }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { t } = useLanguage();

  function statusText(s) {
    if (s === 'Paid') return t('invoices.statusPaid');
    if (s === 'Waiting_Approval') return t('invoices.statusWaiting');
    return t('invoices.statusUnpaid');
  }

  const columns = [
    {
      title: 'Mã Hóa Đơn',
      dataIndex: 'invoice_code',
      key: 'invoice_code',
      render: (val, record) => val || record._id.slice(-6),
    },
    {
      title: t('invoices.room'),
      key: 'room',
      render: (_, inv) => (
        <>
          <strong>{inv.room_id?.room_code}</strong>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {inv.room_id?.building}
          </Typography.Text>
        </>
      ),
    },
    { title: t('invoices.month'), dataIndex: 'month', key: 'month' },
    {
      title: t('invoices.electricity'),
      dataIndex: 'electricity_cost',
      key: 'electricity_cost',
      render: (v) => formatMoney(v),
    },

    {
      title: t('invoices.water'),
      dataIndex: 'water_cost',
      key: 'water_cost',
      render: (v) => formatMoney(v),
    },
    {
      title: t('invoices.total'),
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (v) => <strong style={{ color: '#cf1322' }}>{formatMoney(v)}</strong>,
    },
    {
      title: t('invoices.status'),
      key: 'status',
      render: (_, inv) => (
        <>
          <Tag color={statusColor(inv.status)}>{statusText(inv.status)}</Tag>
          {inv.paid_by && (
            <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
              {inv.paid_by.fullname}
            </Typography.Text>
          )}
        </>
      ),
    },
    {
      title: t('invoices.actions'),
      key: 'actions',
      render: (_, inv) => {
        return (
          <Space wrap className="ktx-action-space">
            <Button size="small" onClick={() => setSelectedInvoice(inv)}>
              Xem chi tiết
            </Button>
            {inv.status === 'Waiting_Approval' && (
              <>
                <Button size="small" type="primary" onClick={() => onConfirm(inv._id)}>
                  {t('invoices.approve')}
                </Button>
                <Button size="small" danger onClick={() => onReject(inv._id)}>
                  {t('invoices.reject')}
                </Button>
              </>
            )}
            {inv.status === 'Paid' && (
              <Tag color="success" style={{ margin: 0 }}>✅ {t('invoices.paidComplete')}</Tag>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={invoices}
        pagination={pagination}
        scroll={{ x: 800 }}
      />
      <Modal
        open={!!selectedInvoice}
        footer={null}
        onCancel={() => setSelectedInvoice(null)}
        title={<span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>Chi tiết hóa đơn</span>}
        width={700}
        style={{ top: 30 }}
        styles={{
          mask: { backdropFilter: 'blur(4px)' },
          content: { borderRadius: '16px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #f1f5f9' }
        }}
      >
        {selectedInvoice && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
            {/* Header / Basic Info */}
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
              padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' 
            }}>
              <div>
                <Typography.Text type="secondary" style={{ textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', fontWeight: 600 }}>Phòng</Typography.Text>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{selectedInvoice.room_id?.room_code}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Typography.Text type="secondary" style={{ textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', fontWeight: 600 }}>Kỳ thu</Typography.Text>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#334155' }}>Tháng {selectedInvoice.month}</div>
              </div>
            </div>

            {/* Detailed Costs */}
            <div style={{ padding: '0 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px dashed #cbd5e1' }}>
                <span style={{ color: '#475569', fontSize: '15px' }}>Tiền điện</span>
                <span style={{ fontWeight: 500, fontSize: '15px', color: '#1e293b' }}>{formatMoney(selectedInvoice.electricity_cost)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px dashed #cbd5e1' }}>
                <span style={{ color: '#475569', fontSize: '15px' }}>Tiền nước</span>
                <span style={{ fontWeight: 500, fontSize: '15px', color: '#1e293b' }}>{formatMoney(selectedInvoice.water_cost)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px' }}>
                <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '16px' }}>Tổng thanh toán</span>
                <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '22px' }}>{formatMoney(selectedInvoice.total_amount)}</span>
              </div>
            </div>

            {/* Payer & Status */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                 <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Người nộp</Typography.Text>
                 <strong style={{ color: '#1e293b', fontSize: '15px' }}>{selectedInvoice.paid_by?.fullname || 'Chưa có thông tin'}</strong>
              </div>
              <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                 <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Trạng thái</Typography.Text>
                 <Tag color={statusColor(selectedInvoice.status)} style={{ borderRadius: '6px', padding: '2px 12px', margin: 0, fontWeight: 500, border: 'none' }}>
                    {statusText(selectedInvoice.status)}
                 </Tag>
              </div>
            </div>

            {/* Receipt Image */}
            {selectedInvoice.payment_proof_url ? (
              <div style={{ marginTop: '4px' }}>
                <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '12px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', fontWeight: 600 }}>Ảnh minh chứng</Typography.Text>
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <Image
                    src={selectedInvoice.payment_proof_url}
                    alt="Ảnh minh chứng"
                    style={{ borderRadius: '8px', maxHeight: '350px', objectFit: 'contain', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                  />
                </div>
              </div>
            ) : (
              selectedInvoice.status === 'Paid' && (
                <div style={{ padding: '16px', background: '#f0fdf4', color: '#166534', borderRadius: '12px', textAlign: 'center', border: '1px solid #bbf7d0', fontWeight: 500 }}>
                  Hóa đơn đã thanh toán (không có ảnh minh chứng đính kèm)
                </div>
              )
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
