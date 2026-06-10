import { ConfigProvider, App as AntdApp } from 'antd';
import enUS from 'antd/locale/en_US';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import DashboardBackup from './components/Dashboard_backup'; // Legacy
import MainLayout from './layouts/MainLayout';
import AdminStatsPage from './pages/admin/AdminStatsPage';
import AdminRoomsPage from './pages/admin/AdminRoomsPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminContractsPage from './pages/admin/AdminContractsPage';
import AdminInvoicesPage from './pages/admin/AdminInvoicesPage';
import AdminFeedbacksPage from './pages/admin/AdminFeedbacksPage';
import AdminKnowledgePage from './pages/admin/AdminKnowledgePage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// Shared Pages
import ProfilePage from './pages/shared/ProfilePage';

import StudentMyRoomPage from './pages/student/StudentMyRoomPage';
import StudentRoomsPage from './pages/student/StudentRoomsPage';
import StudentRequestsPage from './pages/student/StudentRequestsPage';
import StudentContractsPage from './pages/student/StudentContractsPage';
import StudentInvoicesPage from './pages/student/StudentInvoicesPage';
import StudentFeedbacksPage from './pages/student/StudentFeedbacksPage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';

function Routes() {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <LoginScreen />;

  return (
    <BrowserRouter>
      <RouterRoutes>
        {/* New Refactored Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to={user?.role === 'Admin' ? '/admin/stats' : '/student/my-room'} replace />} />
          {user?.role === 'Admin' && (
            <>
              <Route path="admin/stats" element={<AdminStatsPage />} />
              <Route path="admin/rooms" element={<AdminRoomsPage />} />
              <Route path="admin/students" element={<AdminStudentsPage />} />
              <Route path="admin/requests" element={<AdminRequestsPage />} />
              <Route path="admin/contracts" element={<AdminContractsPage />} />
              <Route path="admin/invoices" element={<AdminInvoicesPage />} />
              <Route path="admin/feedbacks" element={<AdminFeedbacksPage />} />
              <Route path="admin/knowledge" element={<AdminKnowledgePage />} />
              <Route path="admin/notifications" element={<AdminNotificationsPage />} />
              <Route path="admin/settings" element={<AdminSettingsPage />} />
            </>
          )}
          {user?.role === 'Student' && (
            <>
              <Route path="student/my-room" element={<StudentMyRoomPage />} />
              <Route path="student/rooms" element={<StudentRoomsPage />} />
              <Route path="student/requests" element={<StudentRequestsPage />} />
              <Route path="student/contracts" element={<StudentContractsPage />} />
              <Route path="student/invoices" element={<StudentInvoicesPage />} />
              <Route path="student/feedbacks" element={<StudentFeedbacksPage />} />
              <Route path="student/notifications" element={<StudentNotificationsPage />} />
            </>
          )}

          {/* Shared Routes */}
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </RouterRoutes>
    </BrowserRouter>
  );
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
