import { useEffect, useState } from 'react';
import { X, Trash2, ChevronDown, List, CheckCircle2, Loader2 } from 'lucide-react';
import { Task } from '../pages/TasksPage';
import { apiFetch } from '../api';

export function TaskDetailsModal({
  task,
  onClose,
  onUpdated
}: {
  task: Task;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [status, setStatus] = useState<Task['status']>(task.status);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 🔒 Lock background scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function save() {
    setSaving(true);
    await apiFetch('/api/tasks/update/', {
      method: 'POST',
      body: JSON.stringify({
        task_id: task.id,
        status
      })
    });
    setSaving(false);
    onUpdated();
    onClose();
  }

  async function remove() {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setDeleting(true);
    await apiFetch('/api/tasks/delete/', {
      method: 'POST',
      body: JSON.stringify({ task_id: task.id })
    });
    setDeleting(false);
    onUpdated();
    onClose();
  }

  const statusLabel = (s: Task['status']) =>
    s === 'todo' ? 'To Do' : s === 'in_progress' ? 'In Progress' : 'Done';

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg">
        <div className="modal-header">
          <div className="flex items-center gap-4">
            <div className="modal-header-icon primary">
              <List className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 tracking-tight">{task.title}</h3>
              <p className="text-sm font-medium text-gray-500">Edit task status and details</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.15em] ml-1">Current Status</label>
              <div className="relative mt-2">
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl flex items-center justify-between focus:bg-white focus:border-primary-400 transition-all outline-none"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${status === 'done' ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className="text-sm font-medium text-gray-700">{statusLabel(status)}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                  <div className="absolute z-[1000] mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                    {(['todo', 'in_progress', 'done'] as Task['status'][]).map(
                      (s) => (
                        <div
                          key={s}
                          onClick={() => {
                            setStatus(s);
                            setOpen(false);
                          }}
                          className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors text-sm ${s === status ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600'
                            }`}
                        >
                          {statusLabel(s)}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.15em] ml-1">Task Description</label>
              <div className="mt-2 text-gray-600 bg-gray-50/50 border border-gray-100 rounded-xl p-4 text-sm leading-relaxed min-h-[80px]">
                {task.description || <span className="text-gray-300 italic font-light">No description provided</span>}
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.15em] block mb-1.5 ml-1">Assignee</label>
                <div className="flex items-center gap-2 px-1">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-600 uppercase">
                    {task.assignee_email[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate" title={task.assignee_email}>
                    {task.assignee_email}
                  </span>
                </div>
              </div>
              <div className="w-px h-10 bg-gray-100" />
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.15em] block mb-1.5 ml-1">Priority</label>
                <div className="px-1">
                  <span className={`task-priority ${task.priority === 'high' ? 'task-priority-high' : task.priority === 'normal' ? 'task-priority-normal' : 'task-priority-low'} !text-[10px] !px-3 !py-1`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer bg-gray-50/20 px-8 py-7 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={remove}
            disabled={deleting}
            className="flex items-center gap-2.5 text-[13px] font-medium text-gray-400 hover:text-red-600 hover:bg-red-50/50 px-4 py-2.5 rounded-lg transition-all"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4.5 h-4.5" />}
            <span>Delete Task</span>
          </button>

          <div className="flex items-center gap-6">
            <button
              onClick={onClose}
              className="px-6 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100/80 rounded-lg transition-all h-11"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-10 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-30 text-white text-[13px] font-semibold rounded-xl shadow-lg shadow-primary-500/20 transition-all h-11 flex items-center justify-center gap-3 whitespace-nowrap"
            >
              {saving ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
              ) : (
                <CheckCircle2 className="w-4.5 h-4.5" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
