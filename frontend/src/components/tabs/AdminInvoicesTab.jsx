import { useState } from 'react';
import { Button, Table, Tag, Space, Image, Typography, Tooltip, Modal } from 'antd';
import { formatMoney, formatDate } from '../../api';

function statusColor(s) {
  if (s === 'Paid') return 'success';
  if (s === 'Waiting_Approval') return 'warning';
  return 'default';
}
function statusText(s) {
  if (s === 'Paid') return 'Đã thu';
  if (s === 'Waiting_Approval') return 'Chờ duyệt';
  return 'Chưa đóng';
}

export default function AdminInvoicesTab({ invoices, pagination, onConfirm, onReject }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  const columns = [
    {
      title: 'Phòng',
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
    { title: 'Tháng', dataIndex: 'month', key: 'month' },
    {
      title: 'Tiền điện',
      dataIndex: 'electricity_cost',
      key: 'electricity_cost',
      render: (v) => formatMoney(v),
    },
    {
      title: 'Tiền nước',
      dataIndex: 'water_cost',
      key: 'water_cost',
      render: (v) => formatMoney(v),
    },
    {
      title: 'Tổng cộng',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (v) => <strong style={{ color: '#cf1322' }}>{formatMoney(v)}</strong>,
    },
    {
      title: 'Trạng thái',
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
      title: 'Hành động',
      key: 'actions',
      render: (_, inv) => {
        if (inv.status === 'Waiting_Approval') {
          return (
            <Space wrap>
              {inv.payment_proof_url && (
                <Tooltip title="Xem biên lai">
                  <Button size="small" onClick={() => setPreviewUrl(inv.payment_proof_url)}>
                    🖼 Biên lai
                  </Button>
                </Tooltip>
              )}
              <Button size="small" type="primary" onClick={() => onConfirm(inv._id)}>
                Duyệt
              </Button>
              <Button size="small" danger onClick={() => onReject(inv._id)}>
                Từ chối
              </Button>
            </Space>
          );
        }
        if (inv.status === 'Paid') {
          return <Tag color="success">✅ Hoàn tất</Tag>;
        }
        return <Typography.Text type="secondary">Chờ thanh toán</Typography.Text>;
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
        title="Biên lai chuyển khoản"
        width={600}
      >
        {previewUrl && (
          <Image
            src={previewUrl}
            alt="Biên lai"
            style={{ width: '100%', borderRadius: 8 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
          />
        )}
      </Modal>
    </>
  );
}
