import React, { useState } from 'react';
import { X, MessageCircle, Plus, Loader2 } from 'lucide-react';
import { apiFetch } from '../api';

type CreateChannelModalProps = {
    workspaceId: number;
    onClose: () => void;
    onCreated: () => void;
};

export function CreateChannelModal({ workspaceId, onClose, onCreated }: CreateChannelModalProps) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Channel name is required');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await apiFetch(`/api/workspaces/${workspaceId}/channels/`, {
                method: 'POST',
                body: JSON.stringify({ name: name.trim() }),
            });
            onCreated();
            onClose();
        } catch (err) {
            console.error('Failed to create channel', err);
            setError('Failed to create channel. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-md">
                <div className="modal-header">
                    <div className="flex items-center gap-4">
                        <div className="modal-header-icon primary">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Create Channel</h3>
                            <p className="text-sm font-medium text-gray-500">Organize your team communication</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="modal-close-btn" aria-label="Close">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-[13px] font-medium text-red-600 animate-fade-in">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em]">Channel Name</label>
                                <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest">Optional</span>
                            </div>
                            <div className="relative group">
                                <input
                                    autoFocus
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. backend-api"
                                    className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:bg-white focus:border-primary-400 focus:ring-4 focus:ring-primary-100/20 transition-all outline-none text-gray-900 font-normal text-base placeholder:text-gray-300 placeholder:font-light"
                                />
                            </div>
                            <div className="flex gap-2 items-center px-1 opacity-60">
                                <Plus className="w-3 h-3 text-gray-400 rotate-45" />
                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                    Lowercase only, no spaces.
                                </p>
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
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-lg shadow-sm transition-all flex items-center gap-1 justify-center h-10"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            <span>Create Channel</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
