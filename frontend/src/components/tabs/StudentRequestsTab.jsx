import { Empty, Table, Tag } from 'antd';
import { formatDate } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

function statusColor(status) {
  if (status === 'Pending') return 'processing';
  if (status === 'Approved') return 'success';
  if (status === 'Rejected') return 'error';
  return 'default';
}

export default function StudentRequestsTab({ requests }) {
  const { t } = useLanguage();

  if (requests.length === 0) {
    return <Empty description={t('studentRequests.empty')} />;
  }

  const columns = [
    {
      title: t('studentRequests.roomCode'),
      key: 'code',
      render: (_, r) => <strong>{r.room_id?.room_code || t('common.na')}</strong>,
    },
    {
      title: t('studentRequests.building'),
      key: 'building',
      render: (_, r) => r.room_id?.building || t('common.na'),
    },
    {
      title: t('studentRequests.type'),
      key: 'type',
      render: (_, r) => (r.type === 'Cancellation' ? t('studentRequests.typeCancel') : t('studentRequests.typeRegister')),
    },
    {
      title: t('studentRequests.sentAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => formatDate(d),
    },
    {
      title: t('studentRequests.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColor(status)}>{status}</Tag>,
    },
  ];

  return <Table rowKey="_id" columns={columns} dataSource={requests} pagination={{ pageSize: 10 }} />;
}
