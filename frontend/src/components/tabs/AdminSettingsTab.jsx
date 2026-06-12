import { Button, Card, Col, Input, Row, Space, Tag, Typography, Switch, Select } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useLanguage } from '../../context/LanguageContext';
import RichTextEditor from '../RichTextEditor';

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

        <div style={{ marginTop: 24, marginBottom: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Typography.Title level={5}>{t('settings.smtpTitle')}</Typography.Title>
          <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
            {t('settings.smtpDesc')}
          </Typography.Paragraph>
          
          <Row gutter={[16, 16]}>
            <Col span={18}>
              <Typography.Text>{t('settings.smtpHost')}</Typography.Text>
              <Input 
                value={agentSettings?.smtpHost} 
                onChange={(e) => setAgentSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                placeholder="smtp.gmail.com"
              />
            </Col>
            <Col span={6}>
              <Typography.Text>{t('settings.smtpPort')}</Typography.Text>
              <Input 
                type="number"
                value={agentSettings?.smtpPort} 
                onChange={(e) => setAgentSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || 587 }))}
                placeholder="587"
              />
            </Col>
            <Col span={12}>
              <Typography.Text>{t('settings.smtpUser')}</Typography.Text>
              <Input 
                value={agentSettings?.smtpUser} 
                onChange={(e) => setAgentSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                placeholder="admin@gmail.com"
              />
            </Col>
            <Col span={12}>
              <Typography.Text>{t('settings.smtpPass')}</Typography.Text>
              <Input.Password 
                value={agentSettings?.smtpPass} 
                onChange={(e) => setAgentSettings(prev => ({ ...prev, smtpPass: e.target.value }))}
                placeholder="App Password"
              />
            </Col>
          </Row>
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

      <Card title="Cấu hình Hợp đồng (Bên A)">
        <Typography.Paragraph type="secondary">Cấu hình thông tin đại diện pháp lý và các điều khoản mẫu cho Hợp đồng Thuê chỗ ở.</Typography.Paragraph>
        
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Typography.Text>Tên đơn vị quản lý</Typography.Text>
            <Input 
              value={agentSettings?.contractBqlName} 
              onChange={(e) => setAgentSettings(prev => ({ ...prev, contractBqlName: e.target.value }))}
              placeholder="Ban Quản lý Ký túc xá"
            />
          </Col>
          <Col span={12}>
            <Typography.Text>Người đại diện</Typography.Text>
            <Input 
              value={agentSettings?.contractRepName} 
              onChange={(e) => setAgentSettings(prev => ({ ...prev, contractRepName: e.target.value }))}
              placeholder="Họ và tên người đại diện"
            />
          </Col>
          <Col span={12}>
            <Typography.Text>Chức vụ</Typography.Text>
            <Input 
              value={agentSettings?.contractRepRole} 
              onChange={(e) => setAgentSettings(prev => ({ ...prev, contractRepRole: e.target.value }))}
              placeholder="Giám đốc / Trưởng ban"
            />
          </Col>
          <Col span={12}>
            <Typography.Text>Số điện thoại liên hệ</Typography.Text>
            <Input 
              value={agentSettings?.contractRepPhone} 
              onChange={(e) => setAgentSettings(prev => ({ ...prev, contractRepPhone: e.target.value }))}
              placeholder="0123.456.789"
            />
          </Col>
        </Row>
        
        <div style={{ marginTop: 24 }}>
          <Typography.Text strong>Các điều khoản hợp đồng</Typography.Text>
          <div style={{ marginTop: 8, height: 300, marginBottom: 50 }}>
            <RichTextEditor 
              value={agentSettings?.contractTerms || ''} 
              onChange={(val) => setAgentSettings(prev => ({ ...prev, contractTerms: val }))}
              placeholder="Nhập nội dung các điều khoản (Điều 1, Điều 2...)"
            />
          </div>
        </div>

        <Space orientation="vertical" size="small" style={{ marginTop: 16 }}>
          <Button type="primary" onClick={onSave}>
            Lưu cấu hình hợp đồng
          </Button>
        </Space>
      </Card>

    </Space>
  );
}
