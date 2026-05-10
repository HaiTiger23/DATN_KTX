import { useMemo, useState } from 'react';
import { Button, Card, Col, Input, Row, Select, Space, Tag, Tooltip, Typography } from 'antd';
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
export default function StudentRoomsTab({ rooms, activeRoomId, pendingRoomId, onRegister }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');

  const filtered = useMemo(() => {
    let list = rooms.filter((r) => {
      const available = r.capacity - r.current_people;
      if (available <= 0) return false;
      const q = search.toLowerCase();
      return r.room_code.toLowerCase().includes(q) || r.building.toLowerCase().includes(q);
    });
    if (sort === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [rooms, search, sort]);

  const sortOptions = [
    { value: 'default', label: t('studentRooms.sortDefault') },
    { value: 'price_asc', label: t('studentRooms.sortPriceAsc') },
    { value: 'price_desc', label: t('studentRooms.sortPriceDesc') },
  ];

  return (
    <>
      <Space wrap className="ktx-student-rooms-toolbar">
        <Input
          allowClear
          prefix={<HomeOutlined className="ktx-icon-muted" />}
          placeholder={t('studentRooms.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ktx-student-rooms-search"
        />
        <Select value={sort} onChange={setSort} options={sortOptions} className="ktx-student-rooms-sort" />
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

            return (
              <Col xs={24} sm={12} lg={8} key={r._id}>
                <Card
                  className="ktx-student-room-card"
                  title={<Typography.Text strong>{`${t('room.room')} ${r.room_code}`}</Typography.Text>}
                  extra={extraTag}
                  actions={[actionButton]}
                >
                  <Typography.Paragraph className="ktx-tab-p-sm">
                    {t('room.building')} <Typography.Text strong>{r.building}</Typography.Text>
                  </Typography.Paragraph>
                  <Typography.Paragraph className="ktx-tab-p-sm">
                    {t('room.seats')}{' '}
                    <Typography.Text strong className="ktx-seat-available">
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
      )}
    </>
  );
}
