import { Button, Card, Col, Row, Tag, Typography } from 'antd';
import { EditOutlined, SwapOutlined } from '@ant-design/icons';
import { formatMoney } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

function statusTagColor(status) {
  if (status === 'Available') return 'success';
  if (status === 'Maintenance') return 'warning';
  return 'default';
}

export default function AdminRoomsTab({ rooms, onToggleStatus, onEdit }) {
  const { t } = useLanguage();

  return (
    <Row gutter={[16, 16]}>
      {rooms.map((r) => {
        const available = r.capacity - r.current_people;
        return (
          <Col xs={24} sm={12} lg={8} key={r._id}>
            <Card
              title={
                <Typography.Text strong>
                  {t('room.room')} {r.room_code}
                </Typography.Text>
              }
              extra={<Tag color={statusTagColor(r.status)}>{r.status === 'Available' ? t('room.available') : t('room.maintenance')}</Tag>}
              actions={[
                <Button key="toggle" type="link" icon={<SwapOutlined />} onClick={() => onToggleStatus(r._id, r.status)}>
                  {t('room.toggleStatus')}
                </Button>,
                <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => onEdit(r)}>
                  {t('room.edit')}
                </Button>,
              ]}
            >
              <Typography.Paragraph className="ktx-tab-p-sm">
                {t('room.building')} <Typography.Text strong>{r.building}</Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph className="ktx-tab-p-sm">
                {t('room.seats')}{' '}
                <Typography.Text strong>
                  {available}/{r.capacity}
                </Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph className="ktx-tab-p-last">
                {t('room.price')}{' '}
                <Typography.Text strong>
                  {formatMoney(r.price)}
                  {t('room.perMonth')}
                </Typography.Text>
              </Typography.Paragraph>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
