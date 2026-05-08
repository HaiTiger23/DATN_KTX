import { Button, Card, Col, Row, Tag, Typography } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useLanguage } from '../../context/LanguageContext';

function statusColor(status) {
  return status === 'Pending' ? 'processing' : 'success';
}

export default function AdminFeedbacksTab({ feedbacks, onReply }) {
  const { t } = useLanguage();

  return (
    <Row gutter={[16, 16]}>
      {feedbacks.map((f) => (
        <Col xs={24} md={12} key={f._id}>
          <Card
            title={
              <Typography.Text ellipsis title={f.title}>
                {f.title}
              </Typography.Text>
            }
            extra={<Tag color={statusColor(f.status)}>{f.status === 'Pending' ? t('feedbacks.pending') : t('feedbacks.replied')}</Tag>}
            actions={
              f.status === 'Pending'
                ? [
                    <Button key="reply" type="link" icon={<MessageOutlined />} onClick={() => onReply(f._id)}>
                      {t('feedbacks.reply')}
                    </Button>,
                  ]
                : undefined
            }
          >
            <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
              {t('feedbacks.from')} <Typography.Text strong>{f.student_id?.fullname || t('common.na')}</Typography.Text>
            </Typography.Paragraph>
            <Typography.Paragraph style={{ marginBottom: f.reply_content ? 8 : 0, whiteSpace: 'pre-wrap' }}>
              {f.description}
            </Typography.Paragraph>
            {f.reply_content ? (
              <Typography.Paragraph
                style={{
                  marginBottom: 0,
                  padding: 8,
                  borderRadius: 8,
                  background: 'rgba(79, 70, 229, 0.06)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                <Typography.Text strong>{t('feedbacks.adminReply')}</Typography.Text> {f.reply_content}
              </Typography.Paragraph>
            ) : null}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
