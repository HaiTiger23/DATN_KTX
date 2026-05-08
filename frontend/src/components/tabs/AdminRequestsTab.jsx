import { Button, Card, Col, Empty, Row, Tag, Typography } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { formatDate } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminRequestsTab({ requests, onHandle }) {
  const { t } = useLanguage();

  if (requests.length === 0) {
    return <Empty description={t('requests.empty')} />;
  }

  return (
    <Row gutter={[16, 16]}>
      {requests.map((r) => (
        <Col xs={24} md={12} lg={8} key={r._id}>
          <Card
            title={r.type === 'Cancellation' ? t('requests.cancelContract') : t('requests.register')}
            extra={<Tag color="processing">{t('requests.pending')}</Tag>}
            actions={[
              <Button key="reject" danger type="link" icon={<CloseOutlined />} onClick={() => onHandle(r._id, 'reject')}>
                {t('requests.reject')}
              </Button>,
              <Button key="approve" type="link" icon={<CheckOutlined />} onClick={() => onHandle(r._id, 'approve')}>
                {t('requests.approve')}
              </Button>,
            ]}
          >
            <Typography.Paragraph style={{ marginBottom: 8 }}>
              {t('requests.student')}{' '}
              <Typography.Text strong>
                {r.student_id?.fullname || t('common.na')} ({r.student_id?.mssv || t('common.na')})
              </Typography.Text>
            </Typography.Paragraph>
            <Typography.Paragraph style={{ marginBottom: 8 }}>
              {t('requests.room')}{' '}
              <Typography.Text strong>
                {r.room_id?.room_code || t('common.na')} — {r.room_id?.building || t('common.na')}
              </Typography.Text>
            </Typography.Paragraph>
            {r.type !== 'Cancellation' ? (
              <Typography.Paragraph style={{ marginBottom: 8 }}>
                {t('requests.term')} <Typography.Text strong>{t('requests.months', { n: r.months || 6 })}</Typography.Text>
              </Typography.Paragraph>
            ) : null}
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              {t('requests.sentAt')} <Typography.Text strong>{formatDate(r.createdAt)}</Typography.Text>
            </Typography.Paragraph>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
