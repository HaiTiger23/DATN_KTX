import { Card, Col, Row, Tag, Typography } from 'antd';
import { useLanguage } from '../../context/LanguageContext';

function statusColor(status) {
  return status === 'Pending' ? 'processing' : 'success';
}

export default function StudentFeedbacksTab({ feedbacks, pagination }) {
  const { t } = useLanguage();

  if (feedbacks.length === 0) {
    return (
      <Typography.Paragraph type="secondary" className="ktx-tab-empty">
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
            <Typography.Paragraph
              className={`ktx-tab-pre-wrap ${f.reply_content ? 'ktx-tab-p-sm' : 'ktx-tab-p-last'}`}
            >
              {f.description}
            </Typography.Paragraph>
            {f.reply_content ? (
              <Typography.Paragraph className="ktx-tab-reply-box">
                <Typography.Text strong>{t('feedbacks.adminReply')}</Typography.Text> {f.reply_content}
              </Typography.Paragraph>
            ) : null}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
