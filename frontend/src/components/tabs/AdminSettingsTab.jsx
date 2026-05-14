import { Button, Card, Col, Input, Row, Space, Tag, Typography, Switch, Select } from 'antd';
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
    <Space orientation="vertical" size="large" className="ktx-settings-stack">
      <Card>
        <Space orientation="vertical" size="small" className="ktx-settings-stack-tight">
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
          <Typography.Title level={5}>{t('settings.agentPermsTitle')}</Typography.Title>
          <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
            {t('settings.agentPermsDesc')}
          </Typography.Paragraph>
          <Space orientation="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f5f5f5', borderRadius: 6 }}>
              <Typography.Text>{t('settings.agentCheckRoom')}</Typography.Text>
              <Switch checked={agentSettings?.agentAllowCheckRoom} onChange={v => setAgentSettings(prev => ({ ...prev, agentAllowCheckRoom: v }))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f5f5f5', borderRadius: 6 }}>
              <Typography.Text>{t('settings.agentCheckContract')}</Typography.Text>
              <Switch checked={agentSettings?.agentAllowCheckContract} onChange={v => setAgentSettings(prev => ({ ...prev, agentAllowCheckContract: v }))} />
            </div>

          </Space>

          <div style={{ marginTop: 20 }}>
            <Typography.Text strong>{t('settings.aiSystemPromptTitle')}</Typography.Text>
            <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 8 }}>
              {t('settings.aiSystemPromptDesc')}
            </Typography.Paragraph>
            <Input.TextArea
              rows={4}
              value={agentSettings?.aiSystemPrompt}
              onChange={(e) => setAgentSettings(prev => ({ ...prev, aiSystemPrompt: e.target.value }))}
              placeholder={t('settings.aiSystemPromptPlaceholder')}
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <Typography.Text strong>{t('settings.allowedEmailTitle')}</Typography.Text>
            <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 8 }}>
              {t('settings.allowedEmailDesc')}
            </Typography.Paragraph>
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder={t('settings.allowedEmailPlaceholder')}
              value={agentSettings?.allowedEmailDomains}
              onChange={(v) => setAgentSettings(prev => ({ ...prev, allowedEmailDomains: v }))}
            />
          </div>
        </div>

        <Space orientation="vertical" size="small">
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
