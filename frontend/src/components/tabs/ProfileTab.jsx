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
        <Form.Item label={t('profile.phone') || 'Số điện thoại'}>
          <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} disabled={isAdmin} />
        </Form.Item>
        <Form.Item label={t('profile.address') || 'Địa chỉ thường trú'}>
          <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} disabled={isAdmin} />
        </Form.Item>
        
        {!isAdmin && (
          <>
            <Form.Item label="Mã số sinh viên (MSSV)">
              <Input value={form.mssv} onChange={(e) => setForm((f) => ({ ...f, mssv: e.target.value }))} />
            </Form.Item>
            <Form.Item label="Số CCCD/CMND">
              <Input value={form.cccd} onChange={(e) => setForm((f) => ({ ...f, cccd: e.target.value }))} />
            </Form.Item>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Form.Item label="Ngày cấp" style={{ flex: 1 }}>
                <Input type="date" value={form.cccd_date} onChange={(e) => setForm((f) => ({ ...f, cccd_date: e.target.value }))} />
              </Form.Item>
              <Form.Item label="Nơi cấp" style={{ flex: 1 }}>
                <Input value={form.cccd_place} onChange={(e) => setForm((f) => ({ ...f, cccd_place: e.target.value }))} />
              </Form.Item>
            </div>
          </>
        )}
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
