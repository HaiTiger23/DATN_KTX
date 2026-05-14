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
  const [previewUrl, setPreviewUrl] = useState(null);
  const { t } = useLanguage();

  function statusText(s) {
    if (s === 'Paid') return t('invoices.statusPaid');
    if (s === 'Waiting_Approval') return t('invoices.statusWaiting');
    return t('invoices.statusUnpaid');
  }

  const columns = [
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
        if (inv.status === 'Waiting_Approval') {
          return (
            <Space wrap className="ktx-action-space">
              {inv.payment_proof_url && (
                <Tooltip title={t('invoices.viewReceipt')}>
                  <Button size="small" onClick={() => setPreviewUrl(inv.payment_proof_url)}>
                    {t('invoices.viewReceipt')}
                  </Button>
                </Tooltip>
              )}
              <Button size="small" type="primary" onClick={() => onConfirm(inv._id)}>
                {t('invoices.approve')}
              </Button>
              <Button size="small" danger onClick={() => onReject(inv._id)}>
                {t('invoices.reject')}
              </Button>
            </Space>
          );
        }
        if (inv.status === 'Paid') {
          return <Tag color="success">✅ {t('invoices.paidComplete')}</Tag>;
        }
        return <Typography.Text type="secondary">{t('invoices.pendingPayment')}</Typography.Text>;
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
        open={!!previewUrl}
        footer={null}
        onCancel={() => setPreviewUrl(null)}
        title={t('invoices.receiptTitle')}
        width={600}
      >
        {previewUrl && (
          <Image
            src={previewUrl}
            alt={t('invoices.viewReceipt')}
            style={{ width: '100%', borderRadius: 8 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
          />
        )}
      </Modal>
    </>
  );
}
