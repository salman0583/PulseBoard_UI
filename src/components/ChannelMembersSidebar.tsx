import { useEffect, useState } from 'react';
import { X, UserPlus, Trash2, Mail, Loader2, Users } from 'lucide-react';
import { apiFetch } from '../api';

type ChannelMembersSidebarProps = {
    channelId: number;
    onClose: () => void;
};

type ChannelMember = {
    user_email: string;
    added_at: string;
};

export function ChannelMembersSidebar({
    channelId,
    onClose,
}: ChannelMembersSidebarProps) {
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
            await apiFetch(`/api/channels/${channelId}/members/`, {
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
            await apiFetch(`/api/channels/${channelId}/members/`, {
                method: 'DELETE',
                body: JSON.stringify({ user_email: userEmail }),
            });
            loadMembers();
        } catch (err: any) {
            alert(err.message || 'Failed to remove member');
        }
    };

    return (
        <div className="chat-members-sidebar">
            <div className="members-sidebar-header">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Members</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em]">Manage Access</p>
            </div>

            <div className="members-sidebar-content">
                <div className="sidebar-invite-section">
                    <label className="sidebar-label">Invite Member</label>
                    <form onSubmit={handleAddMember} className="sidebar-input-wrapper">
                        <Mail className="sidebar-input-icon w-4 h-4" />
                        <input
                            type="email"
                            placeholder="name@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="sidebar-input font-medium"
                        />
                        <button
                            disabled={adding || !email.trim()}
                            type="submit"
                            className="sidebar-add-btn disabled:opacity-50"
                        >
                            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        </button>
                    </form>
                    {error && <p className="text-[10px] font-semibold text-red-500 mt-2 px-1">{error}</p>}
                </div>

                <div className="space-y-4">
                    <label className="sidebar-label">Current Members ({members.length})</label>
                    {loading ? (
                        <div className="py-8 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="w-6 h-6 animate-spin mb-2" />
                            <span className="text-[10px] font-semibold uppercase tracking-widest">Syncing...</span>
                        </div>
                    ) : members.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center text-gray-300">
                            <Users className="w-10 h-10 opacity-20 mb-2" />
                            <span className="text-[10px] font-semibold uppercase tracking-widest">Empty Channel</span>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {members.map((member) => (
                                <div key={member.user_email} className="sidebar-member-item group">
                                    <div className="sidebar-avatar font-semibold">
                                        {member.user_email[0].toUpperCase()}
                                    </div>
                                    <span className="sidebar-member-name" title={member.user_email}>
                                        {member.user_email}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveMember(member.user_email)}
                                        className="sidebar-remove-btn opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
