import { Button, Table, Tag, Typography, Space } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { formatDate } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

function statusColor(status) {
  if (status === 'Pending') return 'processing';
  if (status === 'Approved') return 'success';
  if (status === 'Rejected') return 'error';
  return 'default';
}

export default function AdminRequestsTab({ requests, onHandle, pagination }) {
  const { t } = useLanguage();

  const columns = [
    {
      title: t('requests.student'),
      dataIndex: 'student',
      key: 'student',
      render: (_, r) => (
        <div>
          <Typography.Text strong>{r.student_id?.fullname || t('common.na')}</Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>{r.student_id?.mssv || t('common.na')}</Typography.Text>
        </div>
      ),
    },
    {
      title: t('requests.room'),
      dataIndex: 'room',
      key: 'room',
      render: (_, r) => (
        <div>
          <Typography.Text strong>{r.room_id?.room_code || t('common.na')}</Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>{r.room_id?.building || t('common.na')}</Typography.Text>
        </div>
      ),
    },
    {
      title: t('filter.type'),
      key: 'type',
      render: (_, r) => (
        <Typography.Text>
          {r.type === 'Cancellation' ? t('requests.cancelContract') : t('requests.register')}
        </Typography.Text>
      ),
    },
    {
      title: t('requests.term'),
      key: 'months',
      render: (_, r) => (
        r.type === 'Registration' ? <Typography.Text>{t('requests.months', { n: r.months || 6 })}</Typography.Text> : '-'
      ),
    },
    {
      title: t('requests.sentAt'),
      key: 'createdAt',
      render: (_, r) => <Typography.Text>{formatDate(r.createdAt)}</Typography.Text>,
    },
    {
      title: t('filter.status'),
      key: 'status',
      render: (_, r) => (
        <Tag color={statusColor(r.status)}>{t('filter.' + r.status.toLowerCase())}</Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      render: (_, r) => (
        r.status === 'Pending' ? (
          <Space>
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => onHandle(r._id, 'approve')}>
              {t('requests.approve')}
            </Button>
            <Button size="small" danger icon={<CloseOutlined />} onClick={() => onHandle(r._id, 'reject')}>
              {t('requests.reject')}
            </Button>
          </Space>
        ) : null
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
      <Table 
        columns={columns} 
        dataSource={requests} 
        rowKey="_id" 
        pagination={pagination}
        scroll={{ x: 800 }}
      />
    </div>
  );
}
