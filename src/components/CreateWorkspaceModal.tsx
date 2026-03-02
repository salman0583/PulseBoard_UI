import { useState } from 'react';
import { X } from 'lucide-react';

type CreateWorkspaceModalProps = {
  onClose: () => void;
  onCreated?: () => void;
};

export function CreateWorkspaceModal({ onClose, onCreated }: CreateWorkspaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/workspaces/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          description,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create workspace');
      }

      onClose();
      onCreated?.();
    } catch (err) {
      alert('Workspace creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-gray-900">Create New Workspace</h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="workspace-name" className="block mb-2 text-gray-700">
                Workspace Name
              </label>
              <input
                id="workspace-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Engineering Team"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="workspace-description" className="block mb-2 text-gray-700">
                Description
              </label>
              <textarea
                id="workspace-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this workspace for?"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
