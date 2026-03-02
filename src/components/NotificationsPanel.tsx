import { Bell, MessageSquare, CheckSquare, MessageCircle, X } from 'lucide-react';
import { apiFetch } from '../api';
import '../styles/notifications.css';

export type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
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

  /* ================= Helpers ================= */

  const formatDate = (value: string) => {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;

      return date.toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return value;
    }
  };

  const getIcon = (type: string) => {
    if (type.includes('task')) return <CheckSquare />;
    if (type.includes('dm')) return <MessageSquare />;
    return <MessageCircle />;
  };

  /* ================= Actions ================= */

  const markAllRead = async () => {
    try {
      await apiFetch('/api/notifications/', {
        method: 'POST',
        body: JSON.stringify({ mark_all: true }),
      });

      setNotifications([]);
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const markSingleRead = async (id: number) => {
    try {
      await apiFetch('/api/notifications/', {
        method: 'POST',
        body: JSON.stringify({ id }),
      });

      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  /* ================= Render ================= */

  // Sort newest first (safety)
  const sortedNotifications = [...notifications].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );

  return (
    <>
      <div onClick={onClose} className="notifications-backdrop" />

      <div className="notifications-panel">
        {/* Header */}
        <div className="notifications-header">
          <div className="notifications-header-content">
            <Bell />
            <h3>Notifications</h3>
          </div>
          <button onClick={onClose} className="notifications-close">
            <X />
          </button>
        </div>

        {/* List */}
        <div className="notifications-list">
          {sortedNotifications.length === 0 ? (
            <div className="notifications-empty">
              <Bell />
              <p>No notifications</p>
            </div>
          ) : (
            sortedNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() =>
                  !notification.is_read &&
                  markSingleRead(notification.id)
                }
                className={`notification-item ${!notification.is_read ? 'unread' : ''
                  }`}
              >
                <div className="notification-content">
                  <div className="notification-icon">
                    {getIcon(notification.type)}
                  </div>

                  <div className="notification-body">
                    <p className="notification-title">
                      {notification.title}
                    </p>

                    <p className="notification-message">
                      {notification.message}
                    </p>

                    <p className="notification-time">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {sortedNotifications.length > 0 && (
          <div className="notifications-footer">
            <button onClick={markAllRead}>
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
}