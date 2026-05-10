import { Button, Card, Col, Input, Row, Space, Tag, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useLanguage } from '../../context/LanguageContext';

const PENDING_BLOCKS = [
  { id: 'email', titleKey: 'settings.blockEmailTitle', leadKey: 'settings.blockEmailLead' },
  { id: 'rent', titleKey: 'settings.blockRentTitle', leadKey: 'settings.blockRentLead' },
  { id: 'limits', titleKey: 'settings.blockLimitsTitle', leadKey: 'settings.blockLimitsLead' },
];

export default function AdminSettingsTab({ geminiKey, setGeminiKey, onSave }) {
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
