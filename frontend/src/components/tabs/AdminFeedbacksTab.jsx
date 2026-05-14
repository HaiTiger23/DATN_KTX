import { useState } from 'react';
import { Button, List, Tag, Typography, Modal, Pagination, Space } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import FeedbackRichBody from '../FeedbackRichBody';
import { useLanguage } from '../../context/LanguageContext';

function statusColor(status) {
  return status === 'Pending' ? 'processing' : 'success';
}

export default function AdminFeedbacksTab({ feedbacks, onReply, pagination }) {
  const { t } = useLanguage();
  const [viewingFeedback, setViewingFeedback] = useState(null);

  return (
    <>
      <List
        className="ktx-feedback-list"
        itemLayout="horizontal"
        dataSource={feedbacks}
        renderItem={(f) => (
          <List.Item
            style={{ 
              cursor: 'pointer', 
              background: '#fff', 
              marginBottom: 12, 
              borderRadius: 8, 
              padding: '16px 24px',
              border: '1px solid #f0f0f0',
              transition: 'box-shadow 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            onClick={() => setViewingFeedback(f)}
            actions={[
              <Tag color={statusColor(f.status)}>
                {f.status === 'Pending' ? t('feedbacks.pending') : t('feedbacks.replied')}
              </Tag>
            ]}
          >
            <List.Item.Meta
              title={
                <Typography.Text strong ellipsis style={{ maxWidth: '100%', fontSize: 16 }}>
                  {f.title}
                </Typography.Text>
              }
              description={
                <Typography.Text type="secondary">
                  {t('feedbacks.from')} <Typography.Text strong>{f.student_id?.fullname || t('common.na')}</Typography.Text>
                </Typography.Text>
              }
            />
          </List.Item>
        )}
      />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <Pagination {...pagination} />
      </div>

      <Modal
        title={t('feedbacks.detailTitle', 'Chi tiết phản ánh')}
        open={!!viewingFeedback}
        onCancel={() => setViewingFeedback(null)}
        footer={
          viewingFeedback?.status === 'Pending' ? (
            <Button
              type="primary"
              icon={<MessageOutlined />}
              onClick={() => {
                onReply(viewingFeedback._id);
                setViewingFeedback(null);
              }}
            >
              {t('feedbacks.reply')}
            </Button>
          ) : null
        }
      >
        {viewingFeedback && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Typography.Text type="secondary">{t('feedbacks.from')} </Typography.Text>
              <Typography.Text strong>{viewingFeedback.student_id?.fullname || t('common.na')}</Typography.Text>
            </div>
            <div>
              <Typography.Text strong style={{ fontSize: 18 }}>{viewingFeedback.title}</Typography.Text>
            </div>
            <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
              <FeedbackRichBody content={viewingFeedback.description} />
            </div>

            {viewingFeedback.reply_content && (
              <div>
                <Typography.Text strong style={{ color: '#1890ff' }}>{t('feedbacks.adminReply')}</Typography.Text>
                <div style={{ background: '#e6f7ff', padding: 16, borderRadius: 8, marginTop: 8, border: '1px solid #91d5ff' }}>
                  <FeedbackRichBody content={viewingFeedback.reply_content} />
                </div>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </>
  );
}
