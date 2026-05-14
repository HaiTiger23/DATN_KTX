import { Button, Col, Row, Space, Tag, Typography, Carousel, Divider, Image } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, InfoCircleOutlined, AppstoreOutlined } from '@ant-design/icons';
import { formatMoney } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

export default function StudentRoomDetail({ room, activeRoomId, pendingRoomId, onRegister, onBack }) {
  const { t } = useLanguage();
  
  const r = room;
  const rid = String(r._id);
  const available = r.capacity - r.current_people;
  const isMyRoom = Boolean(activeRoomId && rid === activeRoomId);
  const isPending = Boolean(pendingRoomId && rid === pendingRoomId && !isMyRoom);
  const registerDisabled = isMyRoom || isPending;
  const typeColor = r.roomType === 'VIP' ? 'gold' : r.roomType === 'Service' ? 'geekblue' : 'default';

  return (
    <div className="ktx-student-room-detail" style={{ animation: 'fadeIn 0.3s' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={onBack} 
        style={{ marginBottom: 24 }}
      >
        {t('common.back', 'Quay lại')}
      </Button>

      <Row gutter={[32, 32]}>
        <Col xs={24} md={14}>
          <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {r.images && r.images.length > 0 ? (
              <Image.PreviewGroup>
                <Carousel autoplay arrows dotPosition="bottom">
                  {r.images.map((img, idx) => (
                    <div key={idx} style={{ background: '#f0f2f5' }}>
                      <Image 
                        src={img} 
                        alt="Room" 
                        height={450} 
                        width="100%"
                        style={{ objectFit: 'cover' }} 
                      />
                    </div>
                  ))}
                </Carousel>
              </Image.PreviewGroup>
            ) : (
              <div style={{ background: '#f0f2f5', width: '100%', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography.Text type="secondary" style={{ fontSize: 18 }}>{t('studentRooms.noImages')}</Typography.Text>
              </div>
            )}
          </div>
        </Col>
        <Col xs={24} md={10}>
          <Typography.Title level={2} style={{ marginTop: 0, marginBottom: 8 }}>
            {t('room.room')} {r.room_code}
          </Typography.Title>
          
          <Space wrap style={{ marginBottom: 20 }}>
            <Tag color={typeColor} style={{ fontSize: 14, padding: '4px 12px' }}>{r.roomType || 'Standard'}</Tag>
            {isMyRoom && <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>{t('studentRooms.yourRoom')}</Tag>}
            {isPending && <Tag color="warning" style={{ fontSize: 14, padding: '4px 12px' }}>{t('studentRooms.pendingRoom')}</Tag>}
            {!isMyRoom && !isPending && <Tag color="success" style={{ fontSize: 14, padding: '4px 12px' }}>{t('room.available')}</Tag>}
          </Space>

          <Typography.Title level={3} style={{ color: '#ff4d4f', marginTop: 0 }}>
            {formatMoney(r.price)} {t('room.perMonth')}
          </Typography.Title>

          <Divider />

          <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
            <Typography.Text style={{ fontSize: 16 }}>
              <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <strong>{t('room.building')}</strong> {r.building} - {t('room.floor') ?? 'Tầng'} {r.floor || 1}
            </Typography.Text>
            
            <Typography.Text style={{ fontSize: 16 }}>
              <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <strong>{t('studentRooms.availability')}</strong> <span style={{ color: available / r.capacity > 0.5 ? '#52c41a' : available / r.capacity === 0.5 ? '#faad14' : '#ff4d4f', fontWeight: 'bold' }}>{available}/{r.capacity}</span>
            </Typography.Text>

            {r.amenities && r.amenities.length > 0 && (
              <div>
                <Typography.Text style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                  <AppstoreOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <strong>{t('studentRooms.amenities')}</strong>
                </Typography.Text>
                <Space wrap>
                  {r.amenities.map(a => <Tag key={a} style={{ padding: '4px 10px', fontSize: 14 }}>{a}</Tag>)}
                </Space>
              </div>
            )}

            {r.description && (
              <div style={{ marginTop: 8, background: '#fafafa', padding: 16, borderRadius: 8 }}>
                <Typography.Text style={{ fontSize: 15, whiteSpace: 'pre-line' }}>{r.description}</Typography.Text>
              </div>
            )}
          </Space>

          <div style={{ marginTop: 32 }}>
            <Button
              type="primary"
              size="large"
              block
              disabled={registerDisabled || available === 0}
              onClick={() => !registerDisabled && available > 0 && onRegister(r._id)}
              style={{ height: 50, fontSize: 16, fontWeight: 'bold', borderRadius: 8 }}
            >
              {isMyRoom ? t('studentRooms.yourRoom') : isPending ? t('studentRooms.pendingRoom') : available === 0 ? t('studentRooms.full') : t('studentRooms.registerNow')}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}
