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
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            <SettingOutlined /> {t('settings.heroTitle')}
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {t('settings.heroSubtitle')}
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card title={t('settings.blockGeminiTitle')}>
        <Typography.Paragraph type="secondary">{t('settings.blockGeminiLead')}</Typography.Paragraph>
        <Typography.Text>{t('settings.geminiKey')}</Typography.Text>
        <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>
          {t('settings.keyHint')}
        </Typography.Paragraph>
        <Input.Password
          autoComplete="off"
          value={geminiKey}
          onChange={(e) => setGeminiKey(e.target.value)}
          placeholder={t('settings.geminiPlaceholder')}
          style={{ marginBottom: 16, maxWidth: 560 }}
        />
        <Space direction="vertical" size="small">
          <Button type="primary" onClick={onSave}>
            {t('settings.saveGemini')}
          </Button>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
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
              <Typography.Paragraph style={{ marginTop: 12, marginBottom: 0 }}>{t('settings.pendingNote')}</Typography.Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}
