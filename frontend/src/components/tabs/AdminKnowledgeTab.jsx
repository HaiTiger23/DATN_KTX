import { Button, Table, Typography } from 'antd';
import { htmlToPlainText } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminKnowledgeTab({ items, onDelete, pagination }) {
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
      render: (html) => {
        const plain = htmlToPlainText(html);
        return <Typography.Text ellipsis={{ tooltip: plain }}>{plain || '—'}</Typography.Text>;
      },
    },
    {
      title: t('knowledge.actions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div className="ktx-action-space">
          <Button size="small" danger type="default" onClick={() => onDelete(record._id)}>
            {t('knowledge.delete')}
          </Button>
        </div>
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
