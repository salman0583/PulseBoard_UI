import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  GitCommit,
  GitBranch,
  AlertCircle,
  Calendar,
  User as UserIcon,
  PlusCircle,
  Trash2,
  Globe,
  Loader2,
} from 'lucide-react';
import { Workspace, User } from '../App';
import { apiFetch, createWebSocket } from '../api';
import '../styles/activity_feed.css';

/* =======================
   Types
======================= */

type ActivityItem = {
  id?: number;
  type: string;
  actor: string;
  summary: string;
  ref_id?: number | null;
  created_at: string;
};

type Props = {
  workspace: Workspace;
  user: User;
};

/* =======================
   Component
======================= */

export function ActivityFeedPage({ workspace }: Props) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  /* =================================================
     1️⃣ LOAD ACTIVITY HISTORY (REST)
  ================================================= */
  useEffect(() => {
    setLoading(true);
    apiFetch('/api/activities/', {
      method: 'POST',
      body: JSON.stringify({
        workspace_id: workspace.id,
        limit: 50,
      }),
    })
      .then((res) => {
        if (!Array.isArray(res?.data)) {
          setLoading(false);
          return;
        }

        setActivities(
          res.data.map((a: any) => ({
            id: a.id,
            type: a.type,
            actor: a.actor_email,
            summary: a.summary,
            ref_id: a.ref_id,
            created_at: a.created_at,
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load activity history', err);
        setLoading(false);
      });
  }, [workspace.id]);

  /* =================================================
     2️⃣ REALTIME ACTIVITY (WEBSOCKET)
  ================================================= */
  useEffect(() => {
    const ws = createWebSocket('/ws/activity/');
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          action: 'join',
          workspace_id: workspace.id,
        })
      );
    };

    ws.onmessage = (event) => {
      if (!event.data) return;

      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      // Ignore non-activity payloads
      if (!data.type || !data.summary) return;

      setActivities((prev) => [
        {
          type: data.type,
          actor: data.actor || 'GitHub',
          summary: data.summary,
          ref_id: data.ref_id,
          created_at: data.created_at || new Date().toISOString(),
        },
        ...prev,
      ]);
    };

    ws.onerror = () => {
      console.error('Activity WebSocket error');
    };

    return () => {
      ws.close();
    };
  }, [workspace.id]);

  /* =================================================
     Helpers
  ================================================= */
  const getIconData = (type: string, summary: string) => {
    if (type.startsWith('github_')) {
      return {
        icon: GitCommit,
        className: 'icon-github'
      };
    }

    const s = summary.toLowerCase();
    if (s.includes('created task')) return { icon: PlusCircle, className: 'icon-task' };
    if (s.includes('deleted task')) return { icon: Trash2, className: 'icon-task' };
    if (s.includes('updated task')) return { icon: Activity, className: 'icon-task' };
    if (s.includes('joined')) return { icon: UserIcon, className: 'icon-workspace' };

    return { icon: Activity, className: 'icon-system' };
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  /* =================================================
     Render
  ================================================= */
  return (
    <div className="activity-page">
      <div className="activity-container">

        {/* ================= Header ================= */}
        <div className="activity-header">
          <h1>Activity Feed</h1>
          <p>
            Real-time updates from GitHub & workspace events
          </p>
        </div>

        {/* ================= Activity List ================= */}
        <div className="activity-card">
          <div className="activity-card-header">
            <h3>Recent Activity</h3>
          </div>

          {loading ? (
            <div className="activity-empty">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
              <p>Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="activity-empty">
              <div className="activity-empty-icon">
                <Globe />
              </div>
              <p>No activity recorded yet for this workspace.</p>
            </div>
          ) : (
            <div className="activity-list">
              {activities.map((a, idx) => {
                const { icon: Icon, className } = getIconData(a.type, a.summary);
                return (
                  <div
                    key={a.id || idx}
                    className="activity-item"
                  >
                    <div className={`activity-item-icon ${className}`}>
                      <Icon />
                    </div>

                    <div className="activity-item-content">
                      <p className="activity-item-summary">
                        <strong>{a.actor}</strong> {a.summary}
                      </p>
                      <div className="activity-item-meta">
                        <span>{formatDateTime(a.created_at)}</span>
                        <div className="activity-item-meta-divider" />
                        <span>{a.type.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= Info Box ================= */}
        <div className="activity-info">
          <AlertCircle className="activity-info-icon" />
          <div className="activity-info-content">
            <h4>Live updates enabled</h4>
            <p>
              GitHub webhooks and workspace events are streamed here instantly via WebSocket.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
