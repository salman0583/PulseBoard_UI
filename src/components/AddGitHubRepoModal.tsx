import { useState } from 'react';
import { X, Github } from 'lucide-react';
import { Workspace } from '../App';

type AddGitHubRepoModalProps = {
  workspace: Workspace;
  onClose: () => void;
};

export function AddGitHubRepoModal({ workspace, onClose }: AddGitHubRepoModalProps) {
  const [repoName, setRepoName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 1000);
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
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Github className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-gray-900">Add GitHub Repository</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="repo-name" className="block mb-2 text-gray-700">
                Repository Name *
              </label>
              <input
                id="repo-name"
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="owner/repository"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
              <p className="mt-2 text-gray-600">
                Enter the full repository name (e.g., octocat/Hello-World)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900">
                A webhook secret will be automatically generated. You&apos;ll need to add this to your GitHub repository webhook settings.
              </p>
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
                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Repository'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
