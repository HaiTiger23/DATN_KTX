import { Button, Card, Col, Row, Tag, Typography, Pagination, Avatar, Tooltip } from 'antd';
import { EditOutlined, SwapOutlined, UserOutlined } from '@ant-design/icons';
import { Building2, Bed, Banknote, MapPin, Tag as TagIcon } from 'lucide-react';
import { formatMoney } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

function statusTagColor(status) {
  if (status === 'Available') return 'success';
  if (status === 'Maintenance') return 'warning';
  return 'default';
}

export default function AdminRoomsTab({ rooms, onToggleStatus, onEdit, onNavigate, pagination }) {
  const { t } = useLanguage();

  return (
    <>
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
              <Typography.Paragraph className="ktx-tab-p-sm" style={{ marginBottom: 4 }}>
                <Building2 size={16} style={{ marginRight: 6, verticalAlign: '-3px' }} /> {t('room.building')} <Typography.Text strong>{r.building}</Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph className="ktx-tab-p-sm" style={{ marginBottom: 4 }}>
                <MapPin size={16} style={{ marginRight: 6, verticalAlign: '-3px' }} /> {t('room.floor')} <Typography.Text strong>{r.floor || 1}</Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph className="ktx-tab-p-sm" style={{ marginBottom: 4 }}>
                <TagIcon size={16} style={{ marginRight: 6, verticalAlign: '-3px' }} /> {t('room.type')} <Tag color={r.roomType === 'VIP' ? 'gold' : r.roomType === 'Service' ? 'geekblue' : 'default'}>{r.roomType === 'VIP' ? t('modal.roomTypeVip') : r.roomType === 'Service' ? t('modal.roomTypeService') : t('modal.roomTypeStandard')}</Tag>
              </Typography.Paragraph>
              <Typography.Paragraph className="ktx-tab-p-sm" style={{ marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <Bed size={16} style={{ marginRight: 6, verticalAlign: '-3px' }} /> {t('room.seats')}{' '}
                  <Typography.Text strong style={{ color: available / r.capacity > 0.5 ? '#52c41a' : available / r.capacity === 0.5 ? '#faad14' : '#ff4d4f' }}>
                    {available}/{r.capacity}
                  </Typography.Text>
                </span>
                {r.residents && r.residents.length > 0 && (
                  <Button 
                    type="link" 
                    size="small" 
                    style={{ fontSize: 11, padding: 0 }}
                    onClick={() => onNavigate('students', { room_id: r._id })}
                  >
                    {t('room.viewList')}
                  </Button>
                )}
              </Typography.Paragraph>
              <Typography.Paragraph className="ktx-tab-p-last">
                <Banknote size={16} style={{ marginRight: 6, verticalAlign: '-3px' }} /> {t('room.price')}{' '}
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
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <Pagination {...pagination} />
      </div>
    </>
  );
}
