import { Button, Empty, Table, Tag } from 'antd';
import { formatDate } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

function statusColor(status) {
  if (status === 'Active') return 'success';
  return 'default';
}

export default function StudentContractsTab({ contracts, onCancelContract }) {
  const { t } = useLanguage();

  if (contracts.length === 0) {
    return <Empty description={t('studentContracts.empty')} />;
  }

  const columns = [
    {
      title: t('studentRequests.roomCode'),
      key: 'code',
      render: (_, c) => <strong>{c.room_id?.room_code || t('common.na')}</strong>,
    },
    {
      title: t('studentRequests.building'),
      key: 'building',
      render: (_, c) => c.room_id?.building || t('common.na'),
    },
    {
      title: t('contracts.from'),
      dataIndex: 'start_date',
      key: 'start_date',
      render: (d) => formatDate(d),
    },
    {
      title: t('contracts.to'),
      dataIndex: 'end_date',
      key: 'end_date',
      render: (d) => formatDate(d),
    },
    {
      title: t('contracts.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColor(status)}>{status}</Tag>,
    },
    {
      title: t('contracts.actions'),
      key: 'actions',
      render: (_, c) =>
        c.status === 'Active' ? (
          <Button size="small" danger type="link" onClick={() => onCancelContract(c._id)}>
            {t('studentContracts.cancelReq')}
          </Button>
        ) : null,
    },
  ];

  return <Table rowKey="_id" columns={columns} dataSource={contracts} pagination={{ pageSize: 10 }} />;
}
