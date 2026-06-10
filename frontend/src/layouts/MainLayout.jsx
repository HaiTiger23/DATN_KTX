import React, { useMemo, useState, useEffect } from 'react';
import { Layout, Menu, Typography, Avatar, Space, Button, Badge } from 'antd';
import { LogoutOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import {
  Home,
  Bed,
  Users,
  ClipboardList,
  FileText,
  Receipt,
  MessageSquare,
  BookOpen,
  Bell,
  Settings,
  User,
  PieChart
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import AiChatWidget from '../components/AiChatWidget';

const { Header, Sider, Content } = Layout;

const ADMIN_NAV = [
  'stats',
  'rooms',
  'students',
  'requests',
  'contracts',
  'invoices',
  'feedbacks',
  'admin_knowledge',
  'admin_notifications',
  'admin_settings',
];

const STUDENT_NAV = [
  'student_my_room',
  'student_rooms',
  'student_requests',
  'student_contracts',
  'student_invoices',
  'student_feedbacks',
  'student_notifications',
];

const getNavIcon = (target) => {
  const iconProps = { size: 18 };
  switch (target) {
    case 'student_my_room':
      return <Home {...iconProps} />;
    case 'stats':
      return <PieChart {...iconProps} />;
    case 'rooms':
    case 'student_rooms':
      return <Bed {...iconProps} />;
    case 'students':
      return <Users {...iconProps} />;
    case 'requests':
    case 'student_requests':
      return <ClipboardList {...iconProps} />;
    case 'contracts':
    case 'student_contracts':
      return <FileText {...iconProps} />;
    case 'invoices':
    case 'student_invoices':
      return <Receipt {...iconProps} />;
    case 'feedbacks':
    case 'student_feedbacks':
      return <MessageSquare {...iconProps} />;
    case 'admin_knowledge':
      return <BookOpen {...iconProps} />;
    case 'admin_notifications':
    case 'student_notifications':
      return <Bell {...iconProps} />;
    case 'admin_settings':
      return <Settings {...iconProps} />;
    case 'profile':
      return <User {...iconProps} />;
    default:
      return null;
  }
};

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const api = useApi();

  const [unreadList, setUnreadList] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Determine current active menu key based on URL path
  const currentPath = location.pathname;
  let activeKey = 'stats'; // Default fallback
  
  const navItems = useMemo(() => {
    if (!user) return [];
    const targets = user.role === 'Admin' ? ADMIN_NAV : STUDENT_NAV;
    return targets.map((target) => ({ target, label: t(`nav.${target}`) }));
  }, [user, t]);

  const menuItems = useMemo(() => {
    return [
      ...navItems.map(({ target, label }) => {
        const pathSuffix = target.replace(/^(student_|admin_)/, '');
        let menuLabel = label;
        if (target === 'requests' && pendingRequestsCount > 0) {
          menuLabel = (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '8px' }}>
              <span>{label}</span>
              <Badge count={pendingRequestsCount} />
            </div>
          );
        }
        return {
          key: `/${user?.role === 'Admin' ? 'admin' : 'student'}/${pathSuffix}`,
          icon: getNavIcon(target),
          label: menuLabel,
        };
      }),
      {
        key: '/profile',
        icon: getNavIcon('profile'),
        label: t('nav.profile'),
      }
    ];
  }, [navItems, user?.role, t, pendingRequestsCount]);

  useEffect(() => {
    if (user?.role === 'Student') {
      const fetchNotifs = async () => {
        try {
          const res = await api('/student/notifications');
          const data = res.data || [];
          setUnreadList(data.filter((n) => !n.isRead));
        } catch (error) {
          console.error(error);
        }
      };
      fetchNotifs();
      const intv = setInterval(fetchNotifs, 10000);
      window.addEventListener('notification_read', fetchNotifs);
      return () => {
        clearInterval(intv);
        window.removeEventListener('notification_read', fetchNotifs);
      };
    } else if (user?.role === 'Admin') {
      const fetchPendingReqs = async () => {
        try {
          const res = await api('/admin/requests?status=Pending&limit=1');
          setPendingRequestsCount(res.pagination?.total || 0);
        } catch (error) {
          console.error(error);
        }
      };
      fetchPendingReqs();
      const intv = setInterval(fetchPendingReqs, 10000);
      return () => clearInterval(intv);
    }
  }, [user?.role]);

  const sidebarTitle = user?.role === 'Admin' ? t('dashboard.adminTitle') : t('dashboard.studentTitle');
  const roleLabel = user?.role === 'Admin' ? t('dashboard.roleAdmin') : t('dashboard.roleStudent');

  // Find page title from navItems instead of menuItems to avoid rendering JSX badges
  const currentNavItem = navItems.find(item => {
    const pathSuffix = item.target.replace(/^(student_|admin_)/, '');
    const key = `/${user?.role === 'Admin' ? 'admin' : 'student'}/${pathSuffix}`;
    return currentPath.includes(key);
  });
  const pageTitle = currentNavItem ? currentNavItem.label : '';

  return (
    <Layout className="ktx-dashboard-layout" style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        width={260}
        breakpoint="lg"
        collapsedWidth={0}
        className="ktx-dashboard-sider"
      >
        <div className="ktx-dashboard-sider-brand">
          <Typography.Title level={5} className="ktx-dashboard-sider-title">
            🏢 {sidebarTitle}
          </Typography.Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentPath]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="ktx-dashboard-menu"
        />
        <div className="ktx-dashboard-user-footer">
          <Space align="center" className="ktx-dashboard-user-row">
            <Space>
              <Avatar className="ktx-avatar-brand">{(user?.fullname || 'U').charAt(0).toUpperCase()}</Avatar>
              <div className="ktx-dashboard-user-name-container">
                <Typography.Text strong ellipsis className="ktx-dashboard-user-name">
                  {user?.fullname || 'User'}
                </Typography.Text>
                <Typography.Text type="secondary" className="ktx-dashboard-user-role">
                  {roleLabel}
                </Typography.Text>
              </div>
            </Space>
            <Button type="text" icon={<LogoutOutlined />} aria-label={t('dashboard.logoutTitle')} onClick={logout} />
          </Space>
        </div>
      </Sider>

      <Layout className="ktx-dashboard-main">
        <Header className="ktx-dashboard-header" style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Title level={4} className="ktx-dashboard-page-title" style={{ margin: 0 }}>
            {pageTitle}
          </Typography.Title>
          <Space wrap>
            {user?.role === 'Student' && (
              <Badge count={unreadList.length} overflowCount={99} offset={[-2, 6]}>
                <Button icon={<BellOutlined />} onClick={() => navigate('/student/notifications')} />
              </Badge>
            )}
            <LanguageSwitcher />
          </Space>
        </Header>

        <Content className="ktx-dashboard-content" style={{ padding: '24px', overflowY: 'auto' }}>
          <Outlet />
        </Content>
        <AiChatWidget api={api} chatEndpoint={user?.role === 'Admin' ? '/admin/chat' : '/student/chat'} isAdmin={user?.role === 'Admin'} />
      </Layout>
    </Layout>
  );
}
