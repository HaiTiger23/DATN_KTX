import { useState } from 'react';
import { Button, Table, Typography, Space, Modal } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate } from '../../api';
import FeedbackRichBody from '../FeedbackRichBody';

export default function AdminNotificationsTab({ notifications, onDelete, pagination }) {
  const { t } = useLanguage();
  const [viewingNotif, setViewingNotif] = useState(null);

  const columns = [
    {
      title: t('notifications.title'),
      dataIndex: 'title',
      key: 'title',
      width: '40%',
      render: (text, record) => (
        <Button type="link" onClick={() => setViewingNotif(record)} style={{ padding: 0, height: 'auto', whiteSpace: 'normal', textAlign: 'left' }}>
          <Typography.Text strong>{text}</Typography.Text>
        </Button>
      ),
    },
    {
      title: t('notifications.date'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '20%',
      render: (date) => formatDate(date),
    },
    {
      title: t('notifications.actions'),
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        <Space className="ktx-action-space">
          <Button
            type="default"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setViewingNotif(record)}
          >
            {t('common.view', 'Xem')}
          </Button>
          <Button
            type="default"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record._id)}
          >
            {t('notifications.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="ktx-tab-content">
      <Table
        dataSource={notifications}
        columns={columns}
        rowKey="_id"
        pagination={pagination}
        locale={{ emptyText: t('notifications.empty') }}
      />
      <Modal
        title={t('notifications.detailTitle', 'Chi tiết thông báo')}
        open={!!viewingNotif}
        onCancel={() => setViewingNotif(null)}
        footer={
          <Button onClick={() => setViewingNotif(null)}>
            {t('common.close', 'Đóng')}
          </Button>
        }
      >
        {viewingNotif && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Typography.Text strong style={{ fontSize: 18 }}>{viewingNotif.title}</Typography.Text>
              <div style={{ marginTop: 4 }}>
                <Typography.Text type="secondary">{formatDate(viewingNotif.createdAt)}</Typography.Text>
              </div>
            </div>
            <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
              <FeedbackRichBody content={viewingNotif.content} />
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
}
