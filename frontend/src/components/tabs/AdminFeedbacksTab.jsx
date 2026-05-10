import { Button, Card, Col, Row, Tag, Typography } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useLanguage } from '../../context/LanguageContext';

function statusColor(status) {
  return status === 'Pending' ? 'processing' : 'success';
}

export default function AdminFeedbacksTab({ feedbacks, onReply, pagination }) {
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
            <Typography.Paragraph type="secondary" className="ktx-tab-p-sm">
              {t('feedbacks.from')} <Typography.Text strong>{f.student_id?.fullname || t('common.na')}</Typography.Text>
            </Typography.Paragraph>
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
