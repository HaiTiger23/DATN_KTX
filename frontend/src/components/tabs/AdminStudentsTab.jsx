import { Button, Space, Table, Tag } from 'antd';
import { useLanguage } from '../../context/LanguageContext';

function statusColor(status) {
  if (status === 'Active') return 'success';
  if (status === 'Inactive') return 'default';
  return 'processing';
}

export default function AdminStudentsTab({ students, onEdit, onDelete, onResetPassword, pagination }) {
  const { t } = useLanguage();

  const columns = [
    {
      title: t('students.mssv'),
      dataIndex: 'mssv',
      key: 'mssv',
      render: (v) => <strong>{v || t('common.na')}</strong>,
    },
    {
      title: t('students.name'),
      dataIndex: 'fullname',
      key: 'fullname',
    },
    {
      title: t('students.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('students.phone'),
      dataIndex: 'phone',
      key: 'phone',
      render: (v) => v || t('common.na'),
    },
    {
      title: t('students.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColor(status)}>{status}</Tag>,
    },
    {
      title: t('students.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => onEdit(record)}>
            {t('students.edit')}
          </Button>
          <Button size="small" onClick={() => onResetPassword(record._id)}>
            Reset Pass
          </Button>
          <Button size="small" danger type="link" onClick={() => onDelete(record._id)}>
            {t('students.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  return <Table rowKey="_id" columns={columns} dataSource={students} pagination={pagination} />;
}
