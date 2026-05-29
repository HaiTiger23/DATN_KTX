import { Button, Table, Tag, Typography } from 'antd';
import { formatDate } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

function statusColor(status) {
  if (status === 'Active') return 'success';
  if (status === 'Ended') return 'default';
  return 'processing';
}

export default function AdminContractsTab({ contracts, onEndContract, onEditContract, onViewContract, pagination }) {
  const { t } = useLanguage();

  const columns = [
    {
      title: 'Mã HĐ',
      dataIndex: 'contract_code',
      key: 'contract_code',
      render: (val, record) => val || record._id.slice(-6),
    },
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
      render: (_, c) => (
        <div className="ktx-action-space">
          <Button size="small" onClick={() => onViewContract(c)}>
            {t('contracts.details')}
          </Button>
          {c.status === 'Active' && (
            <>
              <Button size="small" type="primary" ghost onClick={() => onEditContract(c)}>
                {t('contracts.edit')}
              </Button>
              <Button size="small" danger type="default" onClick={() => onEndContract(c._id)}>
                {t('contracts.end')}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return <Table rowKey="_id" columns={columns} dataSource={contracts} pagination={pagination} />;
}
