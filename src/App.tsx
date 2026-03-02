import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import { OTPVerificationPage } from './pages/OTPVerificationPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardLayout } from './components/DashboardLayout';
import { WorkspacePage } from './pages/WorkspacePage';
import { ChannelsPage } from './pages/ChannelsPage';
import { DirectMessagesPage } from './pages/DirectMessagesPage';
import { TasksPage } from './pages/TasksPage';
import { ActivityFeedPage } from './pages/ActivityFeedPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { GitHubIntegrationPage } from './pages/GitHubIntegrationPage';
import { apiFetch, createWebSocket } from './api';
import { Notification } from './components/NotificationsPanel';

export type User = {
  username: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  can_create_workspace: boolean;
};

export type Workspace = {
  id: number;
  name: string;
  description: string;
  created_by: string;
  role: 'admin' | 'member' | 'leader';
};

export type Page =
  | 'login'
  | 'otp-verify'
  | 'register'
  | 'workspaces'
  | 'channels'
  | 'direct-messages'
  | 'tasks'
  | 'activity'
  | 'settings'
  | 'admin'
  | 'github';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [emailForOTP, setEmailForOTP] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /* ================= LOGIN FLOW ================= */

  const handleLogin = (email: string) => {
    setEmailForOTP(email);
    setCurrentPage('otp-verify');
  };

  const handleOTPVerified = async () => {
    try {
      const res = await apiFetch('/api/account/');

      if (res?.data) {
        setUser({
          username: res.data.username,
          email: res.data.email,
          full_name: res.data.full_name,
          is_admin: res.data.is_admin,
          can_create_workspace: true,
        });

        setCurrentPage('workspaces');
      }
    } catch (err) {
      console.error('Failed to load account info');
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/logout/', { method: 'POST' });
    } catch {}

    localStorage.removeItem('access_token');
    setUser(null);
    setCurrentWorkspace(null);
    setNotifications([]);
    setEmailForOTP('');
    setCurrentPage('login');
  };

  const handleRegisterSuccess = (email: string) => {
    setEmailForOTP(email);
    setCurrentPage('login');
  };

  const handleSelectWorkspace = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    setCurrentPage('channels');
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  /* ================= AUTO LOGIN ON REFRESH ================= */

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const res = await apiFetch('/api/account/');
        if (res?.data) {
          setUser({
            username: res.data.username,
            email: res.data.email,
            full_name: res.data.full_name,
            is_admin: res.data.is_admin,
            can_create_workspace: true,
          });
          setCurrentPage('workspaces');
        }
      } catch {
        // Not logged in — ignore
      }
    };

    loadAccount();
  }, []);

  /* ================= LOAD NOTIFICATIONS ================= */

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const res = await apiFetch('/api/notifications/');
        if (res?.data && Array.isArray(res.data)) {
          setNotifications(res.data);
        }
      } catch {
        console.error('Failed to load notifications');
      }
    };

    loadNotifications();
  }, [user]);

  /* ================= WEBSOCKET ================= */

  useEffect(() => {
    if (!user) return;

    const socket = createWebSocket('/ws/notifications/');

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.event === 'notification') {
          const newNotification: Notification = {
            id: data.id,
            type: data.type,
            title: data.payload?.title || 'Notification',
            message: data.payload?.message || '',
            is_read: false,
            created_at: data.created_at,
          };

          setNotifications((prev) => {
            if (prev.some((n) => n.id === newNotification.id)) {
              return prev;
            }
            return [newNotification, ...prev];
          });
        }
      } catch {
        console.error('Invalid notification payload');
      }
    };

    return () => socket.close();
  }, [user]);

  /* ================= AUTH SCREENS ================= */

  if (!user) {
    if (currentPage === 'register') {
      return (
        <RegisterPage
          onRegisterSuccess={handleRegisterSuccess}
          onBackToLogin={() => setCurrentPage('login')}
        />
      );
    }

    if (currentPage === 'otp-verify') {
      return (
        <OTPVerificationPage
          email={emailForOTP}
          onVerified={handleOTPVerified}
          onBack={() => setCurrentPage('login')}
        />
      );
    }

    return (
      <LoginPage
        onLoginRequest={handleLogin}
        onNavigateToRegister={() => setCurrentPage('register')}
      />
    );
  }

  /* ================= MAIN APP ================= */

  return (
    <DashboardLayout
      user={user}
      currentWorkspace={currentWorkspace}
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      notifications={notifications}
      setNotifications={setNotifications}
    >
      {currentPage === 'workspaces' && (
        <WorkspacePage user={user} onSelectWorkspace={handleSelectWorkspace} />
      )}

      {currentPage === 'channels' && currentWorkspace && (
        <ChannelsPage workspace={currentWorkspace} user={user} />
      )}

      {currentPage === 'direct-messages' && currentWorkspace && (
        <DirectMessagesPage workspace={currentWorkspace} user={user} />
      )}

      {currentPage === 'tasks' && currentWorkspace && (
        <TasksPage workspace={currentWorkspace} user={user} />
      )}

      {currentPage === 'activity' && currentWorkspace && (
        <ActivityFeedPage workspace={currentWorkspace} user={user} />
      )}

      {currentPage === 'github' && currentWorkspace && (
        <GitHubIntegrationPage workspace={currentWorkspace} user={user} />
      )}

      {currentPage === 'settings' && <SettingsPage user={user} />}
      {currentPage === 'admin' && user.is_admin && <AdminPage />}
    </DashboardLayout>
  );
}

export default App;