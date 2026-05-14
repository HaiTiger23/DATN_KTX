import { Button, Card, Col, Row, Tag, Typography, Pagination, Avatar, Tooltip } from 'antd';
import { EditOutlined, SwapOutlined, UserOutlined } from '@ant-design/icons';
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
                {t('room.building')}: <Typography.Text strong>{r.building}</Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph className="ktx-tab-p-sm" style={{ marginBottom: 4 }}>
                Tầng: <Typography.Text strong>{r.floor || 1}</Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph className="ktx-tab-p-sm" style={{ marginBottom: 4 }}>
                Loại phòng: <Tag color={r.roomType === 'VIP' ? 'gold' : r.roomType === 'Service' ? 'geekblue' : 'default'}>{r.roomType || 'Standard'}</Tag>
              </Typography.Paragraph>
              <Typography.Paragraph className="ktx-tab-p-sm" style={{ marginBottom: 4 }}>
                {t('room.seats')}:{' '}
                <Typography.Text strong>
                  {available}/{r.capacity}
                </Typography.Text>
              </Typography.Paragraph>

              {r.residents && r.residents.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Sinh viên đang ở:
                    </Typography.Text>
                    <Button 
                      type="link" 
                      size="small" 
                      style={{ fontSize: 11, padding: 0 }}
                      onClick={() => onNavigate('students', { room_id: r._id })}
                    >
                      Xem danh sách
                    </Button>
                  </div>
                  <Avatar.Group maxCount={4} size="small">
                    {r.residents.map(res => (
                      <Tooltip key={res._id} title={`${res.fullname} (${res.mssv || 'N/A'})`}>
                        <Avatar 
                          style={{ backgroundColor: '#1890ff', cursor: 'pointer' }} 
                          icon={<UserOutlined />} 
                          onClick={() => onNavigate('students', { room_id: r._id, search: res.mssv })}
                        />
                      </Tooltip>
                    ))}
                  </Avatar.Group>
                </div>
              )}
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
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <Pagination {...pagination} />
      </div>
    </>
  );
}
