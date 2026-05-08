import { Button, Table } from 'antd';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminKnowledgeTab({ items, onDelete }) {
  const { t } = useLanguage();

  const columns = [
    {
      title: t('knowledge.question'),
      dataIndex: 'question',
      key: 'question',
      ellipsis: true,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: t('knowledge.answer'),
      dataIndex: 'answer',
      key: 'answer',
      ellipsis: true,
    },
    {
      title: t('knowledge.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button size="small" danger type="link" onClick={() => onDelete(record._id)}>
          {t('knowledge.delete')}
        </Button>
      ),
    },
  ];

  return (
    <Table
      rowKey="_id"
      columns={columns}
      dataSource={items}
      pagination={{ pageSize: 10 }}
      locale={{ emptyText: t('knowledge.empty') }}
    />
  );
}
