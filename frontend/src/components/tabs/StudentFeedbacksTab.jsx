import { Card, Col, Row, Tag, Typography } from 'antd';
import { useLanguage } from '../../context/LanguageContext';

function statusColor(status) {
  return status === 'Pending' ? 'processing' : 'success';
}

export default function StudentFeedbacksTab({ feedbacks }) {
  const { t } = useLanguage();

  if (feedbacks.length === 0) {
    return (
      <Typography.Paragraph type="secondary" style={{ textAlign: 'center', padding: '2rem' }}>
        {t('studentFeedbacks.empty')}
      </Typography.Paragraph>
    );
  }

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
          >
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
