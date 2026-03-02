import { useState, useEffect } from 'react';
import { Shield, Users, Search, MoreVertical, Crown, CheckCircle, XCircle, Building, Loader2 } from 'lucide-react';
import { apiFetch } from '../api';
import '../styles/components.css';
import '../styles/globals.css';

type AdminUser = {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_super_admin: boolean;
  created_at: string;
};

type Workspace = {
  id: number;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  role: string;
  member_count: number;
};

type AdminStats = {
  users: number;
  active_users: number;
  admins: number;
  workspaces: number;
  channels: number;
};

export function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'workspaces'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorUsers, setErrorUsers] = useState('');
  const [errorWorkspaces, setErrorWorkspaces] = useState('');

  /* ================= Fetch Stats ================= */

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const res = await apiFetch('/api/stats/');
        setStats(res);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  /* ================= Fetch Users ================= */

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setErrorUsers('');
        const res = await apiFetch('/api/admin/users/');
        const list = res?.data ?? (Array.isArray(res) ? res : []);
        setUsers(list);
      } catch (err) {
        console.error('Failed to fetch admin users', err);
        setErrorUsers('Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  /* ================= Fetch Workspaces ================= */

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoadingWorkspaces(true);
        setErrorWorkspaces('');
        const res = await apiFetch('/api/workspaces/');
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setWorkspaces(list);
      } catch (err) {
        console.error('Failed to fetch workspaces', err);
        setErrorWorkspaces('Failed to load workspaces');
      } finally {
        setLoadingWorkspaces(false);
      }
    };
    fetchWorkspaces();
  }, []);

  /* ================= Helpers ================= */

  const formatDate = (value: string) => {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return value;
    }
  };

  const filteredUsers = users.filter(user =>
    (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-inner">
        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-icon">
            <Shield className="w-6 h-6" />
          </div>
          <div className="admin-header-text">
            <h1>Admin Dashboard</h1>
            <p>Manage users, workspaces, and system settings</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-icon primary">
                <Users />
              </div>
            </div>
            <div className="metric-value">{loadingStats ? '…' : (stats?.users ?? 0)}</div>
            <div className="metric-label">Total Users</div>
          </div>

          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-icon success">
                <CheckCircle />
              </div>
            </div>
            <div className="metric-value">{loadingStats ? '…' : (stats?.active_users ?? 0)}</div>
            <div className="metric-label">Active Users</div>
          </div>

          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-icon purple">
                <Building />
              </div>
            </div>
            <div className="metric-value">{loadingStats ? '…' : (stats?.workspaces ?? 0)}</div>
            <div className="metric-label">Workspaces</div>
          </div>

          <div className="metric-card">
            <div className="metric-card-header">
              <div className="metric-icon error">
                <Crown />
              </div>
            </div>
            <div className="metric-value">{loadingStats ? '…' : (stats?.admins ?? 0)}</div>
            <div className="metric-label">Admins</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs-header">
            <button
              onClick={() => setActiveTab('users')}
              className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            >
              <div className="tab-button-content">
                <Users />
                <span>User Management</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('workspaces')}
              className={`tab-button ${activeTab === 'workspaces' ? 'active' : ''}`}
            >
              <div className="tab-button-content">
                <Building />
                <span>Workspaces</span>
              </div>
            </button>
          </div>

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              {/* Search */}
              <div className="table-header">
                <div className="admin-search">
                  <Search />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name or email..."
                  />
                </div>
              </div>

              {/* Loading / Error / Table */}
              {loadingUsers ? (
                <div className="admin-loading">
                  <Loader2 className="admin-spinner" />
                  <span>Loading users…</span>
                </div>
              ) : errorUsers ? (
                <div className="admin-error">{errorUsers}</div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Roles</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="table-user-cell">
                              <div className="table-user-avatar">
                                {(user.full_name || user.email || '?')[0].toUpperCase()}
                              </div>
                              <div className="table-user-info">
                                <p>{user.full_name || '—'}</p>
                                <p>{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="table-badges">
                              {user.is_super_admin && (
                                <span className="table-badge admin">
                                  <Crown />
                                  Super Admin
                                </span>
                              )}
                              {user.is_admin && !user.is_super_admin && (
                                <span className="table-badge admin">
                                  <Shield />
                                  Admin
                                </span>
                              )}
                              {!user.is_admin && !user.is_super_admin && (
                                <span className="table-badge creator">
                                  Member
                                </span>
                              )}
                            </div>
                          </td>
                          <td>{formatDate(user.created_at)}</td>
                          <td>
                            <button className="table-actions-btn">
                              <MoreVertical />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={4} className="admin-empty">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Workspaces Tab */}
          {activeTab === 'workspaces' && (
            <div>
              {loadingWorkspaces ? (
                <div className="admin-loading">
                  <Loader2 className="admin-spinner" />
                  <span>Loading workspaces…</span>
                </div>
              ) : errorWorkspaces ? (
                <div className="admin-error">{errorWorkspaces}</div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Workspace</th>
                        <th>Created By</th>
                        <th>Members</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workspaces.map((workspace) => (
                        <tr key={workspace.id}>
                          <td>
                            <div className="table-user-cell">
                              <div className="metric-icon purple" style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-lg)', flexShrink: 0 }}>
                                <Building style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                              </div>
                              <div className="table-user-info">
                                <p>{workspace.name}</p>
                                {workspace.description && <p>{workspace.description}</p>}
                              </div>
                            </div>
                          </td>
                          <td>{workspace.created_by || '—'}</td>
                          <td>
                            <span className="table-badge creator">
                              {workspace.member_count ?? 0} members
                            </span>
                          </td>
                          <td>{formatDate(workspace.created_at)}</td>
                          <td>
                            <button className="table-actions-btn">
                              <MoreVertical />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {workspaces.length === 0 && (
                        <tr>
                          <td colSpan={5} className="admin-empty">
                            No workspaces found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}