import { Button, Table, Typography, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate } from '../../api';

export default function AdminNotificationsTab({ notifications, onDelete, pagination }) {
  const { t } = useLanguage();

  const columns = [
    {
      title: t('notifications.title'),
      dataIndex: 'title',
      key: 'title',
      width: '40%',
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
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
        <Space>
          <Button
            type="text"
            danger
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
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: t('notifications.empty') }}
      />
    </div>
  );
}
