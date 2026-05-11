import { useState } from 'react';
import { Button, Card, Form, Input, Typography, Space } from 'antd';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function LoginScreen() {
  const api = useApi();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const { loginSuccess, registerSuccess } = useAuth();
  const [mode, setMode] = useState('login');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  async function onLogin(values) {
    setLoginLoading(true);
    try {
      const data = await api('/auth/login', 'POST', { email: values.email, password: values.password });
      loginSuccess(data);
    } catch {
      // toast handled in fetchAPI
    } finally {
      setLoginLoading(false);
    }
  }

  async function onRegister(values) {
    setRegisterLoading(true);
    try {
      const data = await fetchAPI(
        '/auth/register',
        'POST',
        {
          fullname: values.fullname,
          email: values.email,
          password: values.password,
          mssv: values.mssv,
        },
        showToast,
      );
      registerSuccess(data);
    } catch {
      // handled
    } finally {
      setRegisterLoading(false);
    }
  }

  return (
    <>
      <LanguageSwitcher variant="fixed" />
      <div id="login-screen" className="screen active ktx-login-screen">
        <Card className="ktx-login-card" bordered={false}>
          <Space orientation="vertical" size="large" className="ktx-login-stack">
            <div>
              <Typography.Title level={3} className="ktx-login-brand-title">
                🏢 {t('login.brand')}
              </Typography.Title>
              <Typography.Text type="secondary">{mode === 'login' ? t('login.subtitleLogin') : t('login.subtitleRegister')}</Typography.Text>
            </div>

            {mode === 'login' ? (
              <Form
                key="login"
                layout="vertical"
                initialValues={{ email: 'admin@dorm.com', password: 'admin123' }}
                onFinish={onLogin}
                className="ktx-login-form"
              >
                <Form.Item name="email" label={t('login.email')} rules={[{ required: true, type: 'email' }]}>
                  <Input placeholder="admin@dorm.com" />
                </Form.Item>
                <Form.Item name="password" label={t('login.password')} rules={[{ required: true }]}>
                  <Input.Password placeholder="••••••••" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loginLoading}>
                    {t('login.submit')}
                  </Button>
                </Form.Item>
                <Typography.Text type="secondary">
                  {t('login.noAccount')}{' '}
                  <Button type="link" className="ktx-login-link-btn" onClick={() => setMode('register')}>
                    {t('login.registerStudent')}
                  </Button>
                </Typography.Text>
              </Form>
            ) : (
              <Form key="register" layout="vertical" onFinish={onRegister} className="ktx-login-form">
                <Form.Item name="fullname" label={t('login.fullname')} rules={[{ required: true }]}>
                  <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
                <Form.Item name="email" label={t('login.email')} rules={[{ required: true, type: 'email' }]}>
                  <Input placeholder="sv@dorm.com" />
                </Form.Item>
                <Form.Item name="password" label={t('login.password')} rules={[{ required: true }]}>
                  <Input.Password placeholder="••••••••" />
                </Form.Item>
                <Form.Item name="mssv" label={t('login.mssv')}>
                  <Input placeholder="SV001" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block loading={registerLoading}>
                    {t('login.register')}
                  </Button>
                </Form.Item>
                <Typography.Text type="secondary">
                  {t('login.haveAccount')}{' '}
                  <Button type="link" className="ktx-login-link-btn" onClick={() => setMode('login')}>
                    {t('login.loginLink')}
                  </Button>
                </Typography.Text>
              </Form>
            )}
          </Space>
        </Card>
      </div>
    </>
  );
}
