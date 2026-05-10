import { Button, Table, Tag, Typography } from 'antd';
import { formatDate } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

function statusColor(status) {
  if (status === 'Active') return 'success';
  if (status === 'Ended') return 'default';
  return 'processing';
}

export default function AdminContractsTab({ contracts, onEndContract }) {
  const { t } = useLanguage();

  const columns = [
    {
      title: t('contracts.student'),
      key: 'student',
      render: (_, c) => (
        <>
          <strong>{c.student_id?.fullname || t('common.na')}</strong>
          <br />
          <Typography.Text type="secondary" className="ktx-tab-text-secondary-xs">
            {c.student_id?.mssv || ''}
          </Typography.Text>
        </>
      ),
    },
    {
      title: t('contracts.room'),
      key: 'room',
      render: (_, c) => <strong>{c.room_id?.room_code || t('common.na')}</strong>,
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
          <Button size="small" danger type="link" onClick={() => onEndContract(c._id)}>
            {t('contracts.end')}
          </Button>
        ) : null,
    },
  ];

  return <Table rowKey="_id" columns={columns} dataSource={contracts} pagination={{ pageSize: 10 }} />;
}
