import { useMemo, useState } from 'react';
import { Button, Card, Col, Input, Row, Select, Space, Tag, Tooltip, Typography, Carousel, Pagination, Image } from 'antd';
import { HomeOutlined, EyeOutlined } from '@ant-design/icons';
import { Building2, Bed, Banknote, MapPin } from 'lucide-react';
import { formatMoney } from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import StudentRoomDetail from './StudentRoomDetail';

/**
 * @param {object} props
 * @param {object[]} props.rooms
 * @param {string|null} props.activeRoomId — Phòng đang có hợp đồng Active
 * @param {string|null} props.pendingRoomId — Phòng có đơn đăng ký Pending
 * @param {(roomId: string) => void} props.onRegister
 */
export default function StudentRoomsTab({ rooms, activeRoomId, pendingRoomId, onRegister, pagination, filters, onFiltersChange }) {
  const { t } = useLanguage();
  
  // Local search state so we don't fetch on every keystroke
  const [localSearch, setLocalSearch] = useState(filters?.search || '');
  const [selectedRoom, setSelectedRoom] = useState(null);

  // We can just use the rooms passed down from the API directly!
  // No need for local filtering anymore since the backend handles it.
  const filtered = rooms;

  const uniqueFloors = ['1', '2', '3', '4']; // Fixed to avoid needing all rooms loaded

  const sortOptions = [
    { value: 'default', label: t('studentRooms.sortDefault') },
    { value: 'price_asc', label: t('studentRooms.sortPriceAsc') },
    { value: 'price_desc', label: t('studentRooms.sortPriceDesc') },
  ];

  if (selectedRoom) {
    return (
      <StudentRoomDetail 
        room={selectedRoom} 
        activeRoomId={activeRoomId} 
        pendingRoomId={pendingRoomId} 
        onRegister={onRegister} 
        onBack={() => setSelectedRoom(null)} 
      />
    );
  }

  return (
    <>
      <Space wrap className="ktx-student-rooms-toolbar" style={{ marginBottom: 16 }}>
        <Input.Search
          allowClear
          prefix={<HomeOutlined className="ktx-icon-muted" />}
          placeholder={t('studentRooms.searchPlaceholder')}
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onSearch={(val) => onFiltersChange({ search: val })}
          className="ktx-student-rooms-search"
          style={{ width: 250 }}
        />
        <Select value={filters?.sort || 'default'} onChange={(v) => onFiltersChange({ sort: v })} options={sortOptions} style={{ width: 180 }} />
        <Select 
          value={filters?.floor || ''} 
          onChange={(v) => onFiltersChange({ floor: v })} 
          style={{ width: 150 }}
        >
          <Select.Option value="">Tất cả các tầng</Select.Option>
          {uniqueFloors.map(f => <Select.Option key={f} value={f}>Tầng {f}</Select.Option>)}
        </Select>
        <Select 
          value={filters?.roomType || ''} 
          onChange={(v) => onFiltersChange({ roomType: v })} 
          style={{ width: 180 }}
        >
          <Select.Option value="">Tất cả loại phòng</Select.Option>
          <Select.Option value="Standard">Tiêu chuẩn</Select.Option>
          <Select.Option value="Service">Dịch vụ</Select.Option>
          <Select.Option value="VIP">VIP</Select.Option>
        </Select>
      </Space>
      {filtered.length === 0 ? (
        <Typography.Paragraph type="secondary" className="ktx-tab-empty">
          {t('studentRooms.noMatch')}
        </Typography.Paragraph>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((r) => {
            const rid = String(r._id);
            const available = r.capacity - r.current_people;
            const isMyRoom = Boolean(activeRoomId && rid === activeRoomId);
            const isPending = Boolean(pendingRoomId && rid === pendingRoomId && !isMyRoom);

            let extraTag;
            if (isMyRoom) {
              extraTag = <Tag color="blue">{t('studentRooms.yourRoom')}</Tag>;
            } else if (isPending) {
              extraTag = <Tag color="warning">{t('studentRooms.pendingRoom')}</Tag>;
            } else if (r.status === 'Maintenance') {
              extraTag = <Tag color="warning">{t('room.maintenance')}</Tag>;
            } else {
              extraTag = <Tag color="success">{t('room.available')}</Tag>;
            }

            const registerDisabled = isMyRoom || isPending || r.status === 'Maintenance';
            const tooltipTitle = isMyRoom ? t('studentRooms.yourRoomHint') : isPending ? t('studentRooms.pendingHint') : r.status === 'Maintenance' ? t('room.maintenance') : '';

            const actionButton = (
              <Tooltip title={tooltipTitle || undefined}>
                <Button
                  key="reg"
                  type="primary"
                  block
                  style={{ flex: 1 }}
                  disabled={registerDisabled || available === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!registerDisabled && available > 0) onRegister(r._id);
                  }}
                >
                  {isMyRoom ? t('studentRooms.yourRoom') : isPending ? t('studentRooms.pendingRoom') : r.status === 'Maintenance' ? t('room.maintenance') : available === 0 ? t('studentRooms.full') : t('studentRooms.registerNow')}
                </Button>
              </Tooltip>
            );

            const detailButton = (
              <Button
                key="detail"
                type="default"
                block
                style={{ flex: 1 }}
                icon={<EyeOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRoom(r);
                }}
              >
                {t('common.detail')}
              </Button>
            );

            const typeColor = r.roomType === 'VIP' ? 'gold' : r.roomType === 'Service' ? 'geekblue' : 'default';

            return (
              <Col xs={24} sm={12} lg={8} key={r._id}>
                <Card
                  hoverable
                  onClick={() => setSelectedRoom(r)}
                  className="ktx-student-room-card"
                  cover={
                    r.images && r.images.length > 0 ? (
                      <div className="ktx-room-carousel-container" onClick={(e) => e.stopPropagation()}>
                        <Image.PreviewGroup>
                          <Carousel autoplay arrows dots={{ className: 'ktx-dots-custom' }}>
                            {r.images.map((img, idx) => (
                              <div key={idx} style={{ background: '#f0f2f5' }}>
                                <Image
                                  src={img}
                                  alt="Room"
                                  height={220}
                                  width="100%"
                                  style={{ objectFit: 'cover' }}
                                />
                              </div>
                            ))}
                          </Carousel>
                        </Image.PreviewGroup>
                      </div>
                    ) : (
                      <div style={{ background: '#f0f2f5', width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography.Text type="secondary">{t('studentRooms.noImages')}</Typography.Text>
                      </div>
                    )
                  }
                  actions={[
                    <div key="actions" style={{ display: 'flex', gap: 12, padding: '0 16px' }}>
                      {detailButton}
                      {actionButton}
                    </div>
                  ]}
                  styles={{ body: { padding: 16 } }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {`${t('room.room')} ${r.room_code}`}
                    </Typography.Title>
                    {extraTag}
                  </div>
                  
                  <Space wrap style={{ marginBottom: 12 }}>
                    <Tag color={typeColor}>{r.roomType || 'Standard'}</Tag>
                    <Tag><MapPin size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} /> {t('room.floor')} {r.floor || 1}</Tag>
                  </Space>

                  <Typography.Paragraph className="ktx-tab-p-sm">
                    <Building2 size={16} style={{ marginRight: 6, verticalAlign: '-3px' }} /> {t('room.building')} <Typography.Text strong>{r.building}</Typography.Text>
                  </Typography.Paragraph>

                  {r.description && (
                    <Typography.Paragraph className="ktx-tab-p-sm" ellipsis={{ rows: 2, expandable: true, symbol: t('common.more') }}>
                      <Typography.Text type="secondary">{r.description}</Typography.Text>
                    </Typography.Paragraph>
                  )}

                  {r.amenities && r.amenities.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <Typography.Text type="secondary" style={{ fontSize: 13 }}>{t('studentRooms.amenities')}</Typography.Text>
                      <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {r.amenities.map(a => <Tag key={a} style={{ marginBottom: 4 }}>{a}</Tag>)}
                      </div>
                    </div>
                  )}

                  <Typography.Paragraph className="ktx-tab-p-sm">
                    <Bed size={16} style={{ marginRight: 6, verticalAlign: '-3px' }} /> {t('room.seats')}{' '}
                    <Typography.Text strong className="ktx-seat-available" style={{ color: available / r.capacity > 0.5 ? '#52c41a' : available / r.capacity === 0.5 ? '#faad14' : '#ff4d4f' }}>
                      {available}/{r.capacity}
                    </Typography.Text>
                  </Typography.Paragraph>
                  <Typography.Paragraph className="ktx-tab-p-last">
                    <Banknote size={16} style={{ marginRight: 6, verticalAlign: '-3px' }} /> {t('room.price')}:{' '}
                    <Typography.Text strong style={{ color: '#ff4d4f', fontSize: 16 }}>
                      {formatMoney(r.price)}
                      {t('room.perMonth')}
                    </Typography.Text>
                  </Typography.Paragraph>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <Pagination {...pagination} />
      </div>
    </>
  );
}

