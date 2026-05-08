import { ConfigProvider, App as AntdApp } from 'antd';
import enUS from 'antd/locale/en_US';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';

function Routes() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <LoginScreen />;
}

function AntdLocaleBridge({ children }) {
  const { locale } = useLanguage();
  return (
    <ConfigProvider
      locale={locale === 'en' ? enUS : viVN}
      theme={{
        token: {
          colorPrimary: '#4F46E5',
          borderRadiusLG: 12,
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AntdLocaleBridge>
        <ToastProvider>
          <AuthProvider>
            <Routes />
          </AuthProvider>
        </ToastProvider>
      </AntdLocaleBridge>
    </LanguageProvider>
  );
}
