import { useMemo, useState } from 'react';
import { Button, Card, Col, Input, Row, Select, Space, Tag, Tooltip, Typography, Carousel, Pagination } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { formatMoney } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

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

  // We can just use the rooms passed down from the API directly!
  // No need for local filtering anymore since the backend handles it.
  const filtered = rooms;

  const uniqueFloors = ['1', '2', '3', '4']; // Fixed to avoid needing all rooms loaded

  const sortOptions = [
    { value: 'default', label: t('studentRooms.sortDefault') },
    { value: 'price_asc', label: t('studentRooms.sortPriceAsc') },
    { value: 'price_desc', label: t('studentRooms.sortPriceDesc') },
  ];

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
            } else {
              extraTag = <Tag color="success">{t('room.available')}</Tag>;
            }

            const registerDisabled = isMyRoom || isPending;
            const tooltipTitle = isMyRoom ? t('studentRooms.yourRoomHint') : isPending ? t('studentRooms.pendingHint') : '';

            const actionButton = (
              <Tooltip title={tooltipTitle || undefined}>
                <Button
                  key="reg"
                  type="primary"
                  block
                  disabled={registerDisabled}
                  onClick={() => !registerDisabled && onRegister(r._id)}
                >
                  {isMyRoom ? t('studentRooms.yourRoom') : isPending ? t('studentRooms.pendingRoom') : t('studentRooms.registerNow')}
                </Button>
              </Tooltip>
            );

            const typeColor = r.roomType === 'VIP' ? 'gold' : r.roomType === 'Service' ? 'geekblue' : 'default';

            return (
              <Col xs={24} sm={12} lg={8} key={r._id}>
                <Card
                  className="ktx-student-room-card"
                  cover={
                    r.images && r.images.length > 0 ? (
                      <Carousel autoplay>
                        {r.images.map((img, idx) => (
                          <div key={idx} style={{ background: '#f0f2f5' }}>
                            <img src={img} alt="Room" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                          </div>
                        ))}
                      </Carousel>
                    ) : (
                      <div style={{ background: '#f0f2f5', width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography.Text type="secondary">Chưa có ảnh</Typography.Text>
                      </div>
                    )
                  }
                  actions={[actionButton]}
                  bodyStyle={{ padding: 16 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {`${t('room.room')} ${r.room_code}`}
                    </Typography.Title>
                    {extraTag}
                  </div>
                  
                  <Space wrap style={{ marginBottom: 12 }}>
                    <Tag color={typeColor}>{r.roomType || 'Standard'}</Tag>
                    <Tag>Tầng {r.floor || 1}</Tag>
                  </Space>

                  <Typography.Paragraph className="ktx-tab-p-sm">
                    {t('room.building')}: <Typography.Text strong>{r.building}</Typography.Text>
                  </Typography.Paragraph>

                  {r.description && (
                    <Typography.Paragraph className="ktx-tab-p-sm" ellipsis={{ rows: 2, expandable: true, symbol: 'thêm' }}>
                      <Typography.Text type="secondary">{r.description}</Typography.Text>
                    </Typography.Paragraph>
                  )}

                  {r.amenities && r.amenities.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <Typography.Text type="secondary" style={{ fontSize: 13 }}>Tiện nghi:</Typography.Text>
                      <div style={{ marginTop: 4 }}>
                        {r.amenities.map(a => <Tag key={a} style={{ marginBottom: 4 }}>{a}</Tag>)}
                      </div>
                    </div>
                  )}

                  <Typography.Paragraph className="ktx-tab-p-sm">
                    {t('room.seats')}:{' '}
                    <Typography.Text strong className="ktx-seat-available">
                      {available}/{r.capacity}
                    </Typography.Text>
                  </Typography.Paragraph>
                  <Typography.Paragraph className="ktx-tab-p-last">
                    {t('room.price')}:{' '}
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
