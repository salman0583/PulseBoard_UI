import { useEffect, useState } from 'react';
import { X, UserPlus, Trash2, Mail, Loader2, Users } from 'lucide-react';
import { apiFetch } from '../api';

type ChannelMembersModalProps = {
  channelId: number;
  onClose: () => void;
};

type ChannelMember = {
  user_email: string;
  added_at: string;
};

export function ChannelMembersModal({
  channelId,
  onClose,
}: ChannelMembersModalProps) {
  const [members, setMembers] = useState<ChannelMember[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/channels/${channelId}/members/`);
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [channelId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setAdding(true);
      setError('');
      await apiFetch(`/api/channels/${channelId}/members//`, {
        method: 'POST',
        body: JSON.stringify({ user_email: email.trim() }),
      });
      setEmail('');
      loadMembers();
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userEmail: string) => {
    if (!confirm(`Remove ${userEmail} from channel?`)) return;

    try {
      await apiFetch(`/api/channels/${channelId}/members//`, {
        method: 'DELETE',
        body: JSON.stringify({ user_email: userEmail }),
      });
      loadMembers();
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg">
        <div className="modal-header">
          <div className="flex items-center gap-4">
            <div className="modal-header-icon primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Channel Members</h3>
              <p className="text-sm font-medium text-gray-500">Manage who can see this channel</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <form onSubmit={handleAddMember} className="space-y-4">
            <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wider ml-1">Add New Member</label>
            <div className="flex gap-3">
              <div className="relative flex-1 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-8 focus:ring-primary-100/30 transition-all outline-none text-gray-900 font-bold"
                />
              </div>
              <button
                disabled={adding || !email.trim()}
                type="submit"
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-lg shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Add
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-bold text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-extrabold text-gray-700 uppercase tracking-wider ml-1">Current Members ({members.length})</label>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span className="text-sm font-bold">Syncing members...</span>
                </div>
              ) : members.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                  <Users className="w-12 h-12 opacity-10 mb-2" />
                  <span className="text-sm font-extrabold uppercase tracking-widest">No members yet</span>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {members.map((member) => (
                    <div key={member.user_email} className="px-6 py-4 flex items-center justify-between hover:bg-white transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-black text-sm uppercase">
                          {member.user_email[0]}
                        </div>
                        <span className="text-sm font-bold text-gray-700">{member.user_email}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member.user_email)}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Remove member"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer bg-gray-50/30 p-5 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-200 text-xs font-semibold text-gray-500 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
