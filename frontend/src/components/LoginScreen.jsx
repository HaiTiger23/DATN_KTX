import { useState, useEffect } from 'react';
import { Button, Card, Form, Input, Typography, Space, Checkbox, Modal } from 'antd';
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
  const [otpLoading, setOtpLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const [registerForm] = Form.useForm();
  const [forgotForm] = Form.useForm();

  const [generalRules, setGeneralRules] = useState('');
  const [rulesModalOpen, setRulesModalOpen] = useState(false);

  useEffect(() => {
    // Fetch public settings for rules
    fetchAPI('/auth/public-settings', 'GET')
      .then(res => setGeneralRules(res?.generalRules || ''))
      .catch(() => {});
  }, []);

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
    if (!values.acceptRules) {
      showToast('Bạn phải đồng ý với Nội quy chung để đăng ký', 'error');
      return;
    }
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
          otp: values.otp,
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

  async function onSendRegisterOtp() {
    try {
      const email = registerForm.getFieldValue('email');
      if (!email) {
        showToast(t('toast.emailRequiredOtp'), 'error');
        return;
      }
      setOtpLoading(true);
      const res = await api('/auth/send-otp-register', 'POST', { email });
      showToast(res.message);
    } catch {
      // handled
    } finally {
      setOtpLoading(false);
    }
  }

  async function onSendForgotOtp() {
    try {
      const email = forgotForm.getFieldValue('email');
      if (!email) {
        showToast(t('toast.emailRequiredOtp'), 'error');
        return;
      }
      setOtpLoading(true);
      const res = await api('/auth/forgot-password', 'POST', { email });
      showToast(res.message);
    } catch {
      // handled
    } finally {
      setOtpLoading(false);
    }
  }

  async function onResetPassword(values) {
    setForgotLoading(true);
    try {
      const res = await api('/auth/reset-password', 'POST', {
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      });
      showToast(res.message);
      setMode('login');
    } catch {
      // handled
    } finally {
      setForgotLoading(false);
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
              <Typography.Text type="secondary">{mode === 'login' ? t('login.subtitleLogin') : mode === 'register' ? t('login.subtitleRegister') : 'Khôi phục mật khẩu'}</Typography.Text>
            </div>

            {mode === 'login' ? (
              <Form
                key="login"
                layout="vertical"
                onFinish={onLogin}
                className="ktx-login-form"
              >
                <Form.Item name="email" label={t('login.email')} rules={[{ required: true, type: 'email' }]}>
                  <Input placeholder={t('students.email')} />
                </Form.Item>
                <Form.Item name="password" label={t('login.password')} rules={[{ required: true }]}>
                  <Input.Password placeholder="••••••••" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loginLoading}>
                    {t('login.submit')}
                  </Button>
                </Form.Item>
                <Typography.Text type="secondary" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    {t('login.noAccount')}{' '}
                    <Button type="link" className="ktx-login-link-btn" onClick={() => setMode('register')}>
                      {t('login.registerStudent')}
                    </Button>
                  </span>
                  <Button type="link" className="ktx-login-link-btn" onClick={() => setMode('forgot_password')}>
                    Quên mật khẩu?
                  </Button>
                </Typography.Text>
              </Form>
            ) : mode === 'register' ? (
              <Form key="register" form={registerForm} layout="vertical" onFinish={onRegister} className="ktx-login-form">
                <Form.Item name="fullname" label={t('login.fullname')} rules={[{ required: true }]}>
                  <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
                <Form.Item name="email" label={t('login.email')} rules={[{ required: true, type: 'email' }]}>
                  <Input placeholder="sv@dorm.com" />
                </Form.Item>
                <Form.Item label="Mã OTP" style={{ marginBottom: 0 }}>
                  <Space style={{ display: 'flex', marginBottom: 24 }}>
                    <Form.Item name="otp" rules={[{ required: true }]} noStyle>
                      <Input placeholder="Nhập mã 6 số" style={{ width: '100%' }} />
                    </Form.Item>
                    <Button onClick={onSendRegisterOtp} loading={otpLoading}>
                      Nhận mã
                    </Button>
                  </Space>
                </Form.Item>
                <Form.Item name="password" label={t('login.password')} rules={[{ required: true }]}>
                  <Input.Password placeholder="••••••••" />
                </Form.Item>
                <Form.Item name="mssv" label={t('login.mssv')}>
                  <Input placeholder="SV001" />
                </Form.Item>
                <Form.Item name="acceptRules" valuePropName="checked" rules={[{ required: true, message: 'Vui lòng xác nhận nội quy' }]}>
                  <Checkbox>
                    Tôi đã đọc và đồng ý với{' '}
                    <a onClick={(e) => { e.preventDefault(); setRulesModalOpen(true); }}>
                      Nội quy chung
                    </a>
                  </Checkbox>
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
            ) : (
              <Form key="forgot" form={forgotForm} layout="vertical" onFinish={onResetPassword} className="ktx-login-form">
                <Form.Item name="email" label={t('login.email')} rules={[{ required: true, type: 'email' }]}>
                  <Input placeholder="Nhập email đăng ký" />
                </Form.Item>
                <Form.Item label="Mã OTP" style={{ marginBottom: 0 }}>
                  <Space style={{ display: 'flex', marginBottom: 24 }}>
                    <Form.Item name="otp" rules={[{ required: true }]} noStyle>
                      <Input placeholder="Nhập mã 6 số" style={{ width: '100%' }} />
                    </Form.Item>
                    <Button onClick={onSendForgotOtp} loading={otpLoading}>
                      Nhận mã
                    </Button>
                  </Space>
                </Form.Item>
                <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true }]}>
                  <Input.Password placeholder="••••••••" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block loading={forgotLoading}>
                    Đổi mật khẩu
                  </Button>
                </Form.Item>
                <Typography.Text type="secondary">
                  <Button type="link" className="ktx-login-link-btn" onClick={() => setMode('login')} style={{ paddingLeft: 0 }}>
                    Quay lại Đăng nhập
                  </Button>
                </Typography.Text>
              </Form>
            )}
          </Space>
        </Card>
      </div>

      <Modal
        title="Nội quy chung"
        open={rulesModalOpen}
        onCancel={() => setRulesModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setRulesModalOpen(false)}>
            Đã hiểu
          </Button>
        ]}
        width={700}
      >
        <div 
          className="ktx-rules-content" 
          dangerouslySetInnerHTML={{ __html: generalRules || 'Chưa có nội quy nào được cấu hình.' }} 
          style={{ maxHeight: '60vh', overflowY: 'auto' }}
        />
      </Modal>
    </>
  );
}
