import { Button, Card, Form, Input } from 'antd';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfileTab({ user, form, setForm, onSave }) {
  const { t } = useLanguage();
  const isAdmin = user?.role === 'Admin';

  return (
    <Card title={t('profile.title')} className="ktx-profile-card">
      <Form layout="vertical">
        <Form.Item label={t('profile.fullname')}>
          <Input value={form.fullname} onChange={(e) => setForm((f) => ({ ...f, fullname: e.target.value }))} />
        </Form.Item>
        <Form.Item label={t('profile.email')}>
          <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </Form.Item>
        <Form.Item label={t('profile.phone')}>
          <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} disabled={isAdmin} />
        </Form.Item>
        <Form.Item label={t('profile.address')}>
          <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} disabled={isAdmin} />
        </Form.Item>
        <Form.Item label={t('profile.passwordHint')}>
          <Input.Password
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder={t('profile.passwordPlaceholder')}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={onSave}>
            {t('profile.save')}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
