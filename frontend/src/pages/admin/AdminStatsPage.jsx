import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Row, Col, Card, Spin, Progress, Badge, Statistic, Space } from 'antd';
import { HomeOutlined, UserOutlined, ToolOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useApi } from '../../hooks/useApi';
import { useLanguage } from '../../context/LanguageContext';

const { Title, Text } = Typography;

export default function AdminStatsPage() {
  const { t } = useLanguage();
  const api = useApi();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // We will call the new aggregate endpoint
        const res = await api('/admin/stats/buildings');
        setStats(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalRooms = useMemo(() => stats.reduce((acc, b) => acc + b.totalRooms, 0), [stats]);
  const totalAvailable = useMemo(() => stats.reduce((acc, b) => acc + b.availableRooms, 0), [stats]);
  const totalFull = useMemo(() => stats.reduce((acc, b) => acc + b.fullRooms, 0), [stats]);
  const totalMaintenance = useMemo(() => stats.reduce((acc, b) => acc + b.maintenanceRooms, 0), [stats]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Overview Top Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}>
            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Tổng số phòng</span>} value={totalRooms} valueStyle={{ color: 'white', fontWeight: 'bold' }} prefix={<HomeOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Phòng trống</span>} value={totalAvailable} valueStyle={{ color: 'white', fontWeight: 'bold' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Phòng đã đầy</span>} value={totalFull} valueStyle={{ color: 'white', fontWeight: 'bold' }} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Đang bảo trì</span>} value={totalMaintenance} valueStyle={{ color: 'white', fontWeight: 'bold' }} prefix={<ToolOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Buildings Game-Like Grid */}
      <Row gutter={[24, 24]}>
        {stats.map((building) => (
          <Col xs={24} xl={12} key={building._id}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HomeOutlined style={{ fontSize: 24, color: '#4F46E5' }} />
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#1f2937' }}>TÒA NHÀ {building._id}</span>
                </div>
              }
              bordered={false} 
              style={{ 
                borderRadius: 20, 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(229, 231, 235, 1)',
                background: '#f9fafb'
              }}
              headStyle={{ borderBottom: '2px dashed #e5e7eb', padding: '16px 24px' }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {building.floors.map((floor) => (
                  <div key={floor.floor} style={{ 
                    background: 'white', 
                    padding: '16px', 
                    borderRadius: 12,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #f3f4f6'
                  }}>
                    <Row align="middle" justify="space-between">
                      <Col>
                        <Text strong style={{ fontSize: 16 }}>Tầng {floor.floor}</Text>
                      </Col>
                      <Col>
                        <Space size="large">
                          <Badge color="green" text={`Trống: ${floor.availableRooms}`} />
                          <Badge color="red" text={`Đầy: ${floor.fullRooms}`} />
                          <Badge color="yellow" text={`Bảo trì: ${floor.maintenanceRooms}`} />
                          <Text type="secondary">({floor.totalRooms} phòng)</Text>
                        </Space>
                      </Col>
                    </Row>
                    
                    {/* Visual Progress Bar (Game style) */}
                    <div style={{ display: 'flex', height: 24, width: '100%', borderRadius: 12, overflow: 'hidden', marginTop: 12 }}>
                      {floor.availableRooms > 0 && <div style={{ width: `${(floor.availableRooms / floor.totalRooms) * 100}%`, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 'bold' }}></div>}
                      {floor.fullRooms > 0 && <div style={{ width: `${(floor.fullRooms / floor.totalRooms) * 100}%`, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 'bold' }}></div>}
                      {floor.maintenanceRooms > 0 && <div style={{ width: `${(floor.maintenanceRooms / floor.totalRooms) * 100}%`, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 'bold' }}></div>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
