import { Bell, MessageSquare, CheckSquare, Hash, X } from 'lucide-react';
import { apiFetch } from '../api';
import '../styles/notifications.css';

export type Notification = {
  id: number;
  type?: string;
  title?: string;
  message?: string;
  is_read: boolean;
  created_at?: string;
};

type NotificationsPanelProps = {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onClose: () => void;
};

export function NotificationsPanel({
  notifications,
  setNotifications,
  onClose,
}: NotificationsPanelProps) {
  /* ======================================================
     Helpers
  ====================================================== */

  const getIcon = (type?: string) => {
    if (!type) return <Hash size={18} />;

    if (type.toLowerCase().includes('task')) return <CheckSquare size={18} />;
    if (type.toLowerCase().includes('dm')) return <MessageSquare size={18} />;

    return <Hash size={18} />;
  };

  const formatDate = (value?: string) => {
    if (!value) return '';

    try {
      const safe = value.replace(/\.\d+Z$/, 'Z');
      const d = new Date(safe);

      if (isNaN(d.getTime())) return '';

      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  /* ======================================================
     Actions
  ====================================================== */

  const markAllRead = async () => {
    try {
      await apiFetch('/api/notifications/', {
        method: 'POST',
        body: JSON.stringify({ mark_all: true }),
      });

      // clear locally
      setNotifications([]);
    } catch (e) {
      console.error('Failed to mark notifications read', e);
    }
  };

  /* ======================================================
     Render
  ====================================================== */

  // 🔥 HARD DUPLICATE PROTECTION (extra safety)
  const uniqueNotifications = Array.from(
    new Map(notifications.map((n) => [n.id, n])).values()
  );

  return (
    <>
      <div onClick={onClose} className="notifications-backdrop" />

      <div className="notifications-panel">
        {/* HEADER */}
        <div className="notifications-header">
          <div className="notifications-header-content">
            <Bell />
            <h3>Notifications</h3>
          </div>

          <button onClick={onClose} className="notifications-close">
            <X />
          </button>
        </div>

        {/* LIST */}
        <div className="notifications-list">
          {uniqueNotifications.length === 0 ? (
            <div className="notifications-empty">
              <Bell />
              <p>No notifications</p>
            </div>
          ) : (
            uniqueNotifications.map((n) => (
              <div
                key={`notif-${n.id}`}   // ✅ SUPER SAFE KEY
                className={`notification-item ${!n.is_read ? 'unread' : ''}`}
              >
                <div className="notification-content">
                  <div className="notification-icon">
                    {getIcon(n.type)}
                  </div>

                  <div className="notification-body">
                    <p className="notification-title">
                      {n.title || 'Notification'}
                    </p>

                    <p className="notification-message">
                      {n.message || ''}
                    </p>

                    <p className="notification-time">
                      {formatDate(n.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        {uniqueNotifications.length > 0 && (
          <div className="notifications-footer">
            <button onClick={markAllRead}>Mark all as read</button>
          </div>
        )}
      </div>
    </>
  );
}
