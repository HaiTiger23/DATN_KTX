import { Button, Card, Col, Input, Row, Space, Tag, Typography, Switch } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useLanguage } from '../../context/LanguageContext';

const PENDING_BLOCKS = [
  { id: 'email', titleKey: 'settings.blockEmailTitle', leadKey: 'settings.blockEmailLead' },
  { id: 'rent', titleKey: 'settings.blockRentTitle', leadKey: 'settings.blockRentLead' },
  { id: 'limits', titleKey: 'settings.blockLimitsTitle', leadKey: 'settings.blockLimitsLead' },
];

export default function AdminSettingsTab({ geminiKey, setGeminiKey, agentSettings, setAgentSettings, onSave }) {
  const { t } = useLanguage();

  return (
    <Space direction="vertical" size="large" className="ktx-settings-stack">
      <Card>
        <Space direction="vertical" size="small" className="ktx-settings-stack-tight">
          <Typography.Title level={3} className="ktx-settings-hero-title">
            <SettingOutlined /> {t('settings.heroTitle')}
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="ktx-settings-hint">
            {t('settings.heroSubtitle')}
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card title={t('settings.blockGeminiTitle')}>
        <Typography.Paragraph type="secondary">{t('settings.blockGeminiLead')}</Typography.Paragraph>
        <Typography.Text>{t('settings.geminiKey')}</Typography.Text>
        <Typography.Paragraph type="secondary" className="ktx-tab-text-secondary-xs">
          {t('settings.keyHint')}
        </Typography.Paragraph>
        <Input.Password
          autoComplete="off"
          value={geminiKey}
          onChange={(e) => setGeminiKey(e.target.value)}
          placeholder={t('settings.geminiPlaceholder')}
          className="ktx-settings-gemini-input"
        />

        <div style={{ marginTop: 24, marginBottom: 16 }}>
          <Typography.Title level={5}>Cấu hình Quyền của AI Agent</Typography.Title>
          <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
            Bật/Tắt các công cụ mà AI Agent có thể sử dụng thay mặt cho sinh viên.
          </Typography.Paragraph>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f5f5f5', borderRadius: 6 }}>
              <Typography.Text>Tra cứu phòng trống</Typography.Text>
              <Switch checked={agentSettings?.agentAllowCheckRoom} onChange={v => setAgentSettings(prev => ({ ...prev, agentAllowCheckRoom: v }))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f5f5f5', borderRadius: 6 }}>
              <Typography.Text>Tra cứu hợp đồng</Typography.Text>
              <Switch checked={agentSettings?.agentAllowCheckContract} onChange={v => setAgentSettings(prev => ({ ...prev, agentAllowCheckContract: v }))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f5f5f5', borderRadius: 6 }}>
              <Typography.Text>Tạo đơn báo hỏng cơ sở vật chất</Typography.Text>
              <Switch checked={agentSettings?.agentAllowCreateMaintenance} onChange={v => setAgentSettings(prev => ({ ...prev, agentAllowCreateMaintenance: v }))} />
            </div>
          </Space>
        </div>

        <Space direction="vertical" size="small">
          <Button type="primary" onClick={onSave}>
            {t('settings.saveGemini')}
          </Button>
          <Typography.Text type="secondary" className="ktx-settings-footnote">
            {t('settings.geminiFootnote')}
          </Typography.Text>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        {PENDING_BLOCKS.map((block) => (
          <Col xs={24} md={8} key={block.id}>
            <Card title={t(block.titleKey)}>
              <Typography.Paragraph type="secondary">{t(block.leadKey)}</Typography.Paragraph>
              <Tag>{t('settings.pendingBadge')}</Tag>
              <Typography.Paragraph className="ktx-settings-pending-note">{t('settings.pendingNote')}</Typography.Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}
