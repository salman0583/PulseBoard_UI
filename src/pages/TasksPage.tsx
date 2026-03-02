import { useEffect, useState } from 'react';
import { Plus, MoreVertical, AlertCircle } from 'lucide-react';
import { Workspace, User } from '../App';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { TaskDetailsModal } from '../components/TaskDetailsModal';
import { apiFetch } from '../api';
import '../styles/tasks.css';

export type Task = {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'normal' | 'high';
  assignee_email: string;
  created_by: string;
  created_at: string;
};

type Props = {
  workspace: Workspace;
  user: User;
};

export function TasksPage({ workspace }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [workspace.id]);

  async function loadTasks() {
    setLoading(true);
    const res = await apiFetch(`/api/tasks/?workspace_id=${workspace.id}`);
    setTasks(res.data || []);
    setLoading(false);
  }

  const columns = [
    { id: 'todo', title: 'To Do', className: 'task-col-todo' },
    { id: 'in_progress', title: 'In Progress', className: 'task-col-progress' },
    { id: 'done', title: 'Done', className: 'task-col-done' }
  ] as const;

  const getPriorityClass = (p: Task['priority']) =>
    p === 'high' ? 'task-priority-high'
      : p === 'normal' ? 'task-priority-normal'
        : 'task-priority-low';

  return (
    <div className="tasks-page">
      {/* Header */}
      <div className="tasks-header">
        <div>
          <h2 className="tasks-title">Tasks</h2>
          <p className="tasks-subtitle">{workspace.name}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="tasks-new-btn"
        >
          <Plus size={14} />
          <span>New Task</span>
        </button>
      </div>

      {/* Board */}
      <div className="tasks-board">
        <div className="tasks-columns">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="tasks-column">
                <div className={`tasks-column-header ${col.className}`}>
                  <span className="tasks-column-title">{col.title}</span>
                  <span className="tasks-column-count">{colTasks.length}</span>
                </div>

                {loading ? (
                  <p className="tasks-loading">Loading…</p>
                ) : (
                  <div className="tasks-card-list">
                    {colTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="task-card"
                      >
                        <div className="task-card-top">
                          <h4 className="task-card-title">{task.title}</h4>
                          <button className="task-card-menu">
                            <MoreVertical size={14} />
                          </button>
                        </div>
                        {task.description && (
                          <p className="task-card-desc">{task.description}</p>
                        )}
                        <div className="task-card-footer">
                          <span className={`task-priority ${getPriorityClass(task.priority)}`}>
                            {task.priority === 'high' && <AlertCircle size={11} />}
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                    {colTasks.length === 0 && !loading && (
                      <div className="tasks-empty">No tasks</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showCreateModal && (
        <CreateTaskModal
          workspace={workspace}
          onClose={() => {
            setShowCreateModal(false);
            loadTasks();
          }}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={loadTasks}
        />
      )}
    </div>
  );
}
