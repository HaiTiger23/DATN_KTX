import React, { useState, useEffect } from 'react';
import { Empty, Spin, Card, Row, Col, Typography, Tag, Button, Avatar, List, Space, Divider, Alert } from 'antd';
import { 
  HomeOutlined, UserOutlined, TeamOutlined, CalendarOutlined, BuildOutlined,
  PhoneOutlined, MessageOutlined, ToolOutlined, FileTextOutlined,
  ThunderboltOutlined, CheckCircleOutlined, WalletOutlined, ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';
import { formatMoney, formatDate } from '../../api';

const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export default function StudentMyRoomPage() {
  const { t } = useLanguage();
  const api = useApi();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resRoom, resInv, resNotif] = await Promise.all([
          api('/student/my-room'),
          api('/student/invoices?limit=5'),
          api('/student/notifications?limit=5')
        ]);
        setData(resRoom.data);
        setInvoices(resInv.data || []);
        setNotifications(resNotif.data || []);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [api]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><Spin size="large" /></div>;
  if (error) return <Empty description={<span style={{ color: 'red' }}>{t('dashboard.loadError')}</span>} />;
  
  if (!data || !data.room) {
    return (
      <Card>
        <Empty description={<Typography.Text type="secondary" style={{ fontSize: 16 }}>{t('myRoom.noRoom', 'Bạn chưa có phòng hiện tại')}</Typography.Text>}>
          <Button type="primary" onClick={() => navigate('/student/rooms')} size="large" icon={<HomeOutlined />}>{t('myRoom.registerNow', 'Đăng ký phòng ngay')}</Button>
        </Empty>
      </Card>
    );
  }

  const { room, roommates, contract } = data;
  const latestInvoice = invoices.length > 0 ? invoices[0] : null;
  const isInvoiceUnpaid = latestInvoice && latestInvoice.status !== 'Paid';
  
  // Tính toán ngày
  const startDate = contract ? new Date(contract.start_date) : new Date();
  const endDate = contract ? new Date(contract.end_date) : new Date();
  const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
  const coverImage = room.images && room.images.length > 0 ? room.images[0] : 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image';

  return (
    <div className="ktx-my-room-dashboard" style={{ width: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={2} style={{ margin: 0 }}>Phòng của tôi</Typography.Title>
        <Typography.Text type="secondary">Quản lý thông tin phòng và các dịch vụ</Typography.Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* KHỐI 1: THÔNG TIN PHÒNG (BÊN TRÁI) */}
        <Col xs={24} xl={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
            <Card bordered={false} bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Row gutter={[32, 24]}>
                <Col xs={24} md={10}>
                  <div style={{ width: '100%', height: 260, borderRadius: 12, overflow: 'hidden' }}>
                    <img src={coverImage} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </Col>
                <Col xs={24} md={14}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <Typography.Title level={3} style={{ margin: 0 }}>Phòng {room.room_code}</Typography.Title>
                    <Tag color="success" style={{ borderRadius: 12, padding: '2px 12px', fontSize: 14 }}>Đang ở</Tag>
                  </div>

                  <Row gutter={[16, 24]}>
                    <Col span={12}>
                      <Space align="start">
                        <div style={{ background: '#f0f5ff', padding: 8, borderRadius: 8, color: '#2f54eb' }}><HomeOutlined /></div>
                        <div>
                          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Tòa nhà</Typography.Text>
                          <Typography.Text strong>{room.building}</Typography.Text>
                        </div>
                      </Space>
                    </Col>
                    <Col span={12}>
                      <Space align="start">
                        <div style={{ background: '#f6ffed', padding: 8, borderRadius: 8, color: '#52c41a' }}><BuildOutlined /></div>
                        <div>
                          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Tầng</Typography.Text>
                          <Typography.Text strong>Tầng {room.floor}</Typography.Text>
                        </div>
                      </Space>
                    </Col>
                    <Col span={12}>
                      <Space align="start">
                        <div style={{ background: '#fff0f6', padding: 8, borderRadius: 8, color: '#eb2f96' }}><TeamOutlined /></div>
                        <div>
                          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Số người ở</Typography.Text>
                          <Typography.Text strong>{room.current_people || 0} / {room.capacity}</Typography.Text>
                        </div>
                      </Space>
                    </Col>
                    <Col span={12}>
                      <Space align="start">
                        <div style={{ background: '#e6fffb', padding: 8, borderRadius: 8, color: '#13c2c2' }}><HomeOutlined /></div>
                        <div>
                          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Loại phòng</Typography.Text>
                          <Typography.Text strong>{room.roomType}</Typography.Text>
                        </div>
                      </Space>
                    </Col>
                  </Row>

                  <Divider style={{ margin: '16px 0' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space align="center">
                      <CalendarOutlined style={{ color: '#8c8c8c' }} />
                      <Typography.Text type="secondary">Hợp đồng:</Typography.Text>
                      <Typography.Text strong>{formatDate(startDate)} &rarr; {formatDate(endDate)}</Typography.Text>
                    </Space>
                    <Tag color="cyan" style={{ borderRadius: 20, padding: '4px 12px' }}>Còn {daysLeft > 0 ? daysLeft : 0} ngày</Tag>
                  </div>
                </Col>
              </Row>
            </Card>

            {room.description && (
              <Card bordered={false} title={<Typography.Title level={5} style={{ margin: 0 }}>Mô tả chi tiết phòng</Typography.Title>} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flex: 1 }}>
                <Typography.Paragraph type="secondary" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {room.description}
                </Typography.Paragraph>
              </Card>
            )}
          </div>
        </Col>

        {/* THÔNG BÁO (BÊN PHẢI) */}
        <Col xs={24} xl={8}>
          <Card bordered={false} title={<Typography.Title level={5} style={{ margin: 0 }}>Thông báo mới</Typography.Title>} extra={<Button type="link" onClick={() => navigate('/student/notifications')}>Xem tất cả</Button>} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}>
            <List
              dataSource={notifications.slice(0, 3)}
              renderItem={(notif) => (
                <List.Item style={{ borderBottom: 'none', padding: '12px 0' }}>
                  <List.Item.Meta
                    avatar={
                      <div style={{ padding: 12, background: notif.type === 'Warning' ? '#fef2f2' : '#f0fdf4', borderRadius: '50%' }}>
                        <Typography.Text style={{ fontSize: 20 }}>{notif.type === 'Warning' ? '🔔' : '📣'}</Typography.Text>
                      </div>
                    }
                    title={<Typography.Text strong>{notif.title}</Typography.Text>}
                    description={
                      <Space direction="vertical" size={2}>
                        <Typography.Text type="secondary" style={{ fontSize: 13 }}>{stripHtml(notif.content).substring(0, 60)}...</Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 11 }}>{formatDate(notif.createdAt)}</Typography.Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'Không có thông báo mới' }}
            />
          </Card>
        </Col>

        {/* KHỐI 2: TÀI CHÍNH */}
        <Col xs={24} lg={12} xl={8}>
          <Card bordered={false} bodyStyle={{ padding: 32 }} style={{ borderRadius: 16, background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', color: 'white', height: '100%', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)' }}>
            <Space align="center" style={{ marginBottom: 16 }}>
              <WalletOutlined style={{ fontSize: 24, opacity: 0.8 }} />
              <Typography.Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>Tổng tiền tháng này</Typography.Text>
            </Space>
            
            <Typography.Title level={1} style={{ color: 'white', margin: '0 0 8px 0', fontSize: 42 }}>
              {isInvoiceUnpaid ? formatMoney(latestInvoice.total_amount) : '0 ₫'}
            </Typography.Title>
            
            {isInvoiceUnpaid ? (
              <Typography.Text style={{ color: '#fca5a5', display: 'block', marginBottom: 32 }}>
                Hạn thanh toán: 05/{latestInvoice.month.split('/')[0]}/{latestInvoice.month.split('/')[1]}
              </Typography.Text>
            ) : (
              <Typography.Text style={{ color: '#86efac', display: 'block', marginBottom: 32 }}>
                Bạn đã thanh toán đủ hóa đơn hiện tại.
              </Typography.Text>
            )}

            <Button 
              type="default" 
              size="large" 
              style={{ borderRadius: 24, padding: '0 32px', fontWeight: 'bold', color: '#4F46E5', border: 'none' }}
              onClick={() => navigate('/student/invoices')}
            >
              {isInvoiceUnpaid ? 'Thanh toán ngay' : 'Xem hóa đơn'}
            </Button>
          </Card>
        </Col>
        
        <Col xs={24} lg={12} xl={8}>
          <Card bordered={false} title={<Typography.Title level={5} style={{ margin: 0 }}>Chi phí hàng tháng</Typography.Title>} style={{ borderRadius: 16, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {latestInvoice ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Space><HomeOutlined style={{ color: '#ff4d4f' }} /> Giá thuê phòng</Space>
                  <Typography.Text>{formatMoney(latestInvoice.total_amount - latestInvoice.electricity_cost - latestInvoice.water_cost - latestInvoice.additional_cost)}</Typography.Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Space><ThunderboltOutlined style={{ color: '#faad14' }} /> Điện</Space>
                  <Typography.Text>{formatMoney(latestInvoice.electricity_cost)}</Typography.Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Space><span style={{ color: '#1890ff' }}>💧</span> Nước</Space>
                  <Typography.Text>{formatMoney(latestInvoice.water_cost)}</Typography.Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Space><ToolOutlined style={{ color: '#722ed1' }} /> Dịch vụ phụ (rác, vệ sinh)</Space>
                  <Typography.Text>{formatMoney(latestInvoice.additional_cost)}</Typography.Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography.Text strong>Tổng cộng</Typography.Text>
                  <Typography.Text strong type="danger" style={{ fontSize: 18 }}>{formatMoney(latestInvoice.total_amount)}</Typography.Text>
                </div>
              </div>
            ) : (
               <Empty description="Chưa có hóa đơn nào" />
            )}
          </Card>
        </Col>

        {/* KHỐI 3: THÀNH VIÊN & TIỆN ÍCH */}
        <Col xs={24} lg={12} xl={8}>
          <Card bordered={false} title={<Typography.Title level={5} style={{ margin: 0 }}>Thành viên phòng</Typography.Title>} style={{ borderRadius: 16, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <List
              itemLayout="horizontal"
              dataSource={roommates}
              renderItem={(item, index) => {
                const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068'];
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar size={48} src={item.avatar} style={{ backgroundColor: colors[index % colors.length] }}>{item.fullname[0]}</Avatar>}
                      title={<Typography.Text strong>{item.fullname}</Typography.Text>}
                      description={
                        <Space direction="vertical" size={0}>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>MSSV: {item.mssv}</Typography.Text>
                          <Space><PhoneOutlined style={{ fontSize: 12 }} /> <Typography.Text type="secondary" style={{ fontSize: 12 }}>{item.phone || 'N/A'}</Typography.Text></Space>
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
              locale={{ emptyText: 'Phòng chưa có ai ở ghép' }}
            />
          </Card>
        </Col>

        {/* KHỐI 4: LỊCH SỬ & HỖ TRỢ */}
        <Col xs={24} lg={12} xl={8}>
          <Card bordered={false} title={<Typography.Title level={5} style={{ margin: 0 }}>Lịch sử thanh toán</Typography.Title>} style={{ borderRadius: 16, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <List
              dataSource={invoices.slice(0, 4)}
              renderItem={(inv) => (
                <List.Item style={{ padding: '12px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography.Text>Tháng {inv.month}</Typography.Text>
                    <Typography.Text strong>{formatMoney(inv.total_amount)}</Typography.Text>
                    <Tag color={inv.status === 'Paid' ? 'success' : 'warning'} style={{ borderRadius: 12 }}>
                      {inv.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
            <Button block style={{ marginTop: 16, borderRadius: 8 }} onClick={() => navigate('/student/invoices')}>
              Xem tất cả hóa đơn <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>

        <Col xs={24} lg={12} xl={8}>
          <Card bordered={false} title={<Typography.Title level={5} style={{ margin: 0 }}>Tiện ích trong phòng</Typography.Title>} style={{ borderRadius: 16, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {room.amenities && room.amenities.map((a, idx) => {
                const colors = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'];
                const color = colors[idx % colors.length];
                return (
                  <Tag color={color} key={idx} style={{ padding: '6px 16px', fontSize: 14, borderRadius: 20, border: 'none', fontWeight: 500, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    {a}
                  </Tag>
                );
              })}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12} xl={8}>
          <Card bordered={false} title={<Typography.Title level={5} style={{ margin: 0 }}>Quản lý & Hỗ trợ</Typography.Title>} style={{ borderRadius: 16, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: 12, marginBottom: 16 }}>
              <Space>
                <Avatar size={48} src="https://ui-avatars.com/api/?name=Admin&background=random" />
                <div>
                  <Typography.Text strong style={{ display: 'block' }}>Ban Quản Lý KTX</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>Quản lý khu trọ</Typography.Text>
                </div>
              </Space>
              <Space>
                <Button shape="circle" icon={<MessageOutlined />} type="primary" ghost onClick={() => document.querySelector('.ktx-ai-widget-button')?.click()} />
              </Space>
            </div>
            
            <List
              itemLayout="horizontal"
              dataSource={[
                { title: 'Gửi phản hồi / Khiếu nại', desc: 'Góp ý hoặc khiếu nại dịch vụ', icon: <MessageOutlined style={{ color: '#10b981' }} />, path: '/student/feedbacks' },
              ]}
              renderItem={(item) => (
                <List.Item style={{ cursor: 'pointer', padding: '16px 8px' }} onClick={() => item.path !== '#' && navigate(item.path)}>
                  <List.Item.Meta
                    avatar={<div style={{ padding: 12, background: '#f1f5f9', borderRadius: 8 }}>{item.icon}</div>}
                    title={<Typography.Text strong>{item.title}</Typography.Text>}
                    description={<Typography.Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Typography.Text>}
                  />
                  <ArrowRightOutlined style={{ color: '#cbd5e1' }} />
                </List.Item>
              )}
            />
          </Card>
        </Col>


      </Row>
    </div>
  );
}
