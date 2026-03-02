import { ReactNode, useState } from 'react';
import {
  Zap,
  MessageCircle,
  MessageSquare,
  CheckSquare,
  Activity,
  Github,
  Shield,
  Bell,
  Menu,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import { User, Workspace, Page } from '../App';
import { NotificationsPanel, Notification } from './NotificationsPanel';
import { apiFetch } from '../api';
import '../styles/dashboard.css';

type DashboardLayoutProps = {
  user: User;
  currentWorkspace: Workspace | null;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  children: ReactNode;
};

export function DashboardLayout({
  user,
  currentWorkspace,
  currentPage,
  onNavigate,
  onLogout,
  notifications,
  setNotifications,
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  /* 🔔 Toggle Notifications Properly */
  const toggleNotifications = async () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);

    // Auto mark all as read when opening
    if (nextState && unreadCount > 0) {
      try {
        await apiFetch('/api/notifications/', {
          method: 'POST',
          body: JSON.stringify({ mark_all: true }),
        });

        // Update local state
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
      } catch (err) {
        console.error('Failed to mark notifications as read');
      }
    }
  };

  const navigation = [
    { id: 'channels' as Page, name: 'Channels', icon: MessageCircle, disabled: !currentWorkspace },
    { id: 'direct-messages' as Page, name: 'Direct Messages', icon: MessageSquare, disabled: !currentWorkspace },
    { id: 'tasks' as Page, name: 'Tasks', icon: CheckSquare, disabled: !currentWorkspace },
    { id: 'activity' as Page, name: 'Activity Feed', icon: Activity, disabled: !currentWorkspace },
    { id: 'github' as Page, name: 'GitHub', icon: Github, disabled: !currentWorkspace },
  ];

  const avatarLetter =
    (user.username && user.username.trim()[0]) ||
    (user.full_name && user.full_name.trim()[0]) ||
    '?';

  return (
    <div className="dashboard-container">
      {/* ================= Sidebar ================= */}
      <aside
        className={`dashboard-sidebar 
          ${sidebarCollapsed ? 'collapsed' : ''} 
          ${!sidebarOpen ? 'mobile-hidden' : ''}
        `}
      >
        <div className="sidebar-inner">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Zap />
            </div>

            {!sidebarCollapsed && <span>PulseBoard</span>}

            <button
              className="sidebar-collapse-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <Menu />
            </button>
          </div>

          <div className="workspace-selector">
            <button
              className="workspace-selector-button"
              onClick={() => onNavigate('workspaces')}
            >
              <div className="workspace-selector-content">
                <Users />
                {!sidebarCollapsed && (
                  <span>
                    {currentWorkspace?.name || 'Select Workspace'}
                  </span>
                )}
              </div>
            </button>
          </div>

          <nav className="sidebar-nav">
            <ul className="nav-list">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => !item.disabled && onNavigate(item.id)}
                      disabled={item.disabled}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon />
                      {!sidebarCollapsed && <span>{item.name}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="sidebar-footer">
            <ul className="sidebar-footer-list">
              {user.is_admin && (
                <li>
                  <button
                    onClick={() => onNavigate('admin')}
                    className={`nav-item ${currentPage === 'admin' ? 'active' : ''}`}
                  >
                    <Shield />
                    {!sidebarCollapsed && <span>Admin</span>}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </aside>

      {/* ================= Main ================= */}
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu />
            </button>
          </div>

          <div className="topbar-center">
            <Zap />
            <span className="topbar-brand">PulseBoard</span>
          </div>

          <div className="topbar-right">
            {/* 🔔 Notifications Button */}
            <button
              onClick={toggleNotifications}
              className="notifications-button"
            >
              <Bell />
              {unreadCount > 0 && (
                <span className="notifications-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationsPanel
                notifications={notifications}
                setNotifications={setNotifications}
                onClose={() => setShowNotifications(false)}
              />
            )}

            {/* Avatar */}
            <div className="avatar-wrapper">
              <button
                className="user-avatar"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {avatarLetter.toUpperCase()}
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    {user.username || user.full_name}
                  </div>

                  <button onClick={() => onNavigate('settings')}>
                    <Settings /> Settings
                  </button>

                  <button onClick={onLogout} className="danger">
                    <LogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================= Content ================= */}
        <main className="dashboard-content">
          <div className="dashboard-scroll">
            {children}
          </div>
        </main>
      </div>

      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
    </div>
  );
}