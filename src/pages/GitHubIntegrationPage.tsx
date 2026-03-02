import { useEffect, useRef, useState } from 'react';
import {
  Github,
  Plus,
  Trash2,
  GitCommit,
  GitBranch,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Workspace, User } from '../App';
import { AddGitHubRepoModal } from '../components/AddGitHubRepoModal';
import { apiFetch, createWebSocket } from '../api';
import '../styles/pages.css';

/* =======================
   Types
======================= */

type GitHubRepo = {
  id: number;
  repo_full_name: string;
  events_mask: string;
  is_active: boolean;
  created_at: string;
};

type Activity = {
  id?: number;
  type: string;
  actor: string;
  summary: string;
  created_at: string;
};

/* =======================
   Component
======================= */

export function GitHubIntegrationPage({
  workspace,
}: {
  workspace: Workspace;
  user: User;
}) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  /* =================================================
     1️⃣ FETCH CONNECTED REPOSITORIES (CONFIG ONLY)
  ================================================= */
  useEffect(() => {
    apiFetch(`/api/github/integrations/?workspace_id=${workspace.id}`)
      .then((res) => {
        if (Array.isArray(res?.data)) {
          setRepos(res.data);
        }
      })
      .catch(() => {
        console.error('Failed to load GitHub integrations');
      });
  }, [workspace.id]);

  /* =================================================
     2️⃣ FETCH GITHUB ACTIVITY HISTORY
  ================================================= */
  useEffect(() => {
    apiFetch('/api/activities/', {
      method: 'POST',
      body: JSON.stringify({
        workspace_id: workspace.id,
        limit: 30,
      }),
    })
      .then((res) => {
        if (!Array.isArray(res?.data)) return;

        const githubEvents = res.data
          .filter((a: any) => a.type?.startsWith('github_'))
          .map((a: any) => ({
            id: a.id,
            type: a.type,
            actor: a.actor_email || 'GitHub',
            summary: a.summary,
            created_at: a.created_at,
          }));

        setActivities(githubEvents);
      })
      .catch(() => {
        console.error('Failed to load GitHub activities');
      });
  }, [workspace.id]);

  /* =================================================
     3️⃣ REALTIME GITHUB EVENTS (WEBSOCKET)
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
      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (!data?.type?.startsWith('github_')) return;

      const activity: Activity = {
        type: data.type,
        actor: data.actor || 'GitHub',
        summary: data.summary,
        created_at: new Date().toISOString(),
      };

      setActivities((prev) => [activity, ...prev].slice(0, 30));
    };

    ws.onerror = () => {
      console.error('GitHub activity WebSocket error');
    };

    return () => ws.close();
  }, [workspace.id]);

  /* =================================================
     Helpers
  ================================================= */
  const renderIcon = (type: string) => {
    if (type === 'github_push') return <GitCommit className="w-5 h-5 text-indigo-600" />;
    return <GitBranch className="w-5 h-5 text-purple-600" />;
  };

  /* =================================================
     Render
  ================================================= */
  return (
    <div className="admin-page">
      <div className="github-page">

        {/* ================= Header ================= */}
        <div className="github-header">
          <div className="github-header-left">
            <div className="github-header-icon">
              <Github className="w-8 h-8" />
            </div>
            <div className="github-header-text">
              <h1>GitHub Integration</h1>
              <p>Connect repositories and monitor live code activity</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="connect-repo-btn"
          >
            <Plus className="w-5 h-5" />
            Connect Repository
          </button>
        </div>

        <div className="github-grid">
          {/* ================= Connected Repos ================= */}
          <div className="github-section-card">
            <div className="github-section-header">
              <h3>Connected Repositories</h3>
            </div>

            <div className="github-section-content">
              {repos.length === 0 ? (
                <div className="github-empty-state">
                  No repositories connected yet.
                </div>
              ) : (
                <div className="github-item-list">
                  {repos.map((repo) => (
                    <div key={repo.id} className="github-repo-item">
                      <div className="github-repo-info">
                        <div className="github-repo-icon">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="github-repo-name">{repo.repo_full_name}</div>
                          <div className="github-repo-meta">
                            Events: {repo.events_mask.split(',').join(', ')}
                          </div>
                        </div>
                      </div>
                      <button className="github-repo-delete" title="Remove Integration">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ================= GitHub Activity Feed ================= */}
          <div className="github-section-card">
            <div className="github-section-header">
              <h3>Live Activity Feed</h3>
            </div>

            <div className="github-section-content" style={{ maxHeight: '32rem', overflowY: 'auto' }}>
              {activities.length === 0 ? (
                <div className="github-empty-state">
                  Waiting for GitHub events...
                </div>
              ) : (
                <div className="github-item-list">
                  {activities.map((a, idx) => (
                    <div key={idx} className="github-activity-item">
                      <div className="github-activity-icon">
                        {renderIcon(a.type)}
                      </div>
                      <div className="github-activity-body">
                        <p>
                          <strong>{a.actor}</strong> {a.summary}
                        </p>
                        <span className="github-activity-time">
                          {new Date(a.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= Status Info ================= */}
        <div className="github-status-footer">
          <div className="github-status-icon">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="github-status-text">
            <h4>Webhook Delivery: Active</h4>
            <p>
              Events are received via secure webhooks and streamed here in real time.
            </p>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddGitHubRepoModal
          workspace={workspace}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
