import { useEffect, useState } from 'react';
import { Plus, Users, Crown, Calendar } from 'lucide-react';
import { apiFetch } from '../api';
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal';
import '../styles/pages.css';

/**
 * Types aligned with backend response
 */
type Workspace = {
  id: number;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  role: 'admin' | 'leader' | 'member';
  member_count: number; // ✅ ADD THIS
};


export type User = {
  email: string;
  is_admin: boolean;
  can_create_workspace: boolean;
};

type WorkspacePageProps = {
  user: User;
  onSelectWorkspace: (workspace: Workspace) => void;
};

export function WorkspacePage({
  user,
  onSelectWorkspace,
}: WorkspacePageProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/workspaces/');
      setWorkspaces(data);
    } catch (err) {
      console.error('Failed to fetch workspaces', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  return (
    <div className="workspace-page">
      <div className="workspace-header">
        <h1>Your Workspaces</h1>
        <p>Select a workspace to start collaborating with your team</p>
      </div>

      {(user.is_admin || user.can_create_workspace) && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="workspace-create-btn"
        >
          <Plus />
          Create New Workspace
        </button>
      )}

      <div className="workspace-grid">
        {loading && <p>Loading workspaces...</p>}

        {!loading &&
          workspaces.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => onSelectWorkspace(workspace)}
              className="workspace-card"
            >
              <div className="workspace-card-header">
                <div className="workspace-card-icon">
                  <Users />
                </div>

                {(workspace.role === 'admin' ||
                  workspace.role === 'leader') && (
                    <div className="workspace-card-badge">
                      <Crown />
                      <span>
                        {workspace.role === 'admin' ? 'Admin' : 'Leader'}
                      </span>
                    </div>
                  )}


              </div>

              <h3>{workspace.name}</h3>

              <div className="workspace-card-description">
                {workspace.description || 'No description'}
              </div>

              <div className="workspace-card-meta">
                <div className="workspace-card-meta-item">
                  <Users />
                  <span>{workspace.member_count} Members</span>
                </div>

                <div className="workspace-card-meta-item">
                  <Calendar />
                  <span>Active</span>
                </div>
              </div>
            </button>
          ))}

        {!loading && workspaces.length === 0 && (
          <p>No workspaces found</p>
        )}
      </div>

      {showCreateModal && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateModal(false)}
          onCreated={loadWorkspaces}
        />
      )}
    </div>
  );
}
