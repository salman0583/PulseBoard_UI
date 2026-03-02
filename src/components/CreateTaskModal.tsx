import { useState } from 'react';
import { X, CheckSquare, Loader2, Plus } from 'lucide-react';
import { Workspace } from '../App';
import { apiFetch } from '../api';

export function CreateTaskModal({
  workspace,
  onClose
}: {
  workspace: Workspace;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'normal',
    assignee_email: ''
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await apiFetch('/api/tasks/create/', {
      method: 'POST',
      body: JSON.stringify({
        workspace_id: workspace.id,
        ...form
      })
    });

    setLoading(false);
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md">
        <div className="modal-header">
          <div className="flex items-center gap-4">
            <div className="modal-header-icon primary">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Create Task</h3>
              <p className="text-sm font-medium text-gray-500">Track your progress and sub-tasks</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="p-8 space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] ml-1">Task Details</label>
                <input
                  placeholder="Task Title"
                  required
                  autoFocus
                  className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:bg-white focus:border-primary-400 focus:ring-4 focus:ring-primary-100/20 transition-all outline-none text-gray-900 font-normal text-base placeholder:text-gray-300 placeholder:font-light"
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <textarea
                placeholder="Description (Optional)"
                className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:bg-white focus:border-primary-400 focus:ring-4 focus:ring-primary-100/20 transition-all outline-none text-gray-900 font-normal text-sm placeholder:text-gray-300 placeholder:font-light min-h-[100px]"
                onChange={e => setForm({ ...form, description: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] ml-1">Priority</label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:bg-white focus:border-primary-400 transition-all outline-none text-gray-700 text-sm font-medium"
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] ml-1">Assignee</label>
                  <input
                    placeholder="Assign to email"
                    type="email"
                    required
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:bg-white focus:border-primary-400 transition-all outline-none text-gray-900 font-normal text-sm placeholder:text-gray-300 placeholder:font-light"
                    onChange={e => setForm({ ...form, assignee_email: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-gray-50/30 p-6 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.2 text-xs font-semibold text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all h-10"
            >
              Cancel
            </button>
            <button
              disabled={loading || !form.title.trim()}
              className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-lg shadow-sm transition-all flex items-center gap-2 justify-center h-10"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
