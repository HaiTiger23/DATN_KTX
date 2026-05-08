import { useMemo, useState } from 'react';
import { Button, Card, Col, Input, Row, Select, Space, Tag, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { formatMoney } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

export default function StudentRoomsTab({ rooms, onRegister }) {
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
      <Space wrap style={{ marginBottom: 16, width: '100%' }}>
        <Input
          allowClear
          prefix={<HomeOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
          placeholder={t('studentRooms.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 220, maxWidth: 400 }}
        />
        <Select value={sort} onChange={setSort} options={sortOptions} style={{ minWidth: 200 }} />
      </Space>
      {filtered.length === 0 ? (
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center', padding: '2rem' }}>
          {t('studentRooms.noMatch')}
        </Typography.Paragraph>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map((r) => {
            const available = r.capacity - r.current_people;
            return (
              <Col xs={24} sm={12} lg={8} key={r._id}>
                <Card
                  title={
                    <Typography.Text strong>
                      {t('room.room')} {r.room_code}
                    </Typography.Text>
                  }
                  extra={<Tag color="success">{t('room.available')}</Tag>}
                  actions={[
                    <Button key="reg" type="primary" block onClick={() => onRegister(r._id)}>
                      {t('studentRooms.registerNow')}
                    </Button>,
                  ]}
                >
                  <Typography.Paragraph style={{ marginBottom: 8 }}>
                    {t('room.building')} <Typography.Text strong>{r.building}</Typography.Text>
                  </Typography.Paragraph>
                  <Typography.Paragraph style={{ marginBottom: 8 }}>
                    {t('room.seats')}{' '}
                    <Typography.Text strong style={{ color: '#52c41a' }}>
                      {available}/{r.capacity}
                    </Typography.Text>
                  </Typography.Paragraph>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
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
