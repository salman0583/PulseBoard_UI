import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Plus, Users, Send, Search, MoreHorizontal } from 'lucide-react';
import { apiFetch, createWebSocket } from '../api';
import { ChannelMembersSidebar } from '../components/ChannelMembersSidebar';
import { CreateChannelModal } from '../components/CreateChannelModal';
import '../styles/pages.css';

/* =======================
   Types
======================= */

type Workspace = {
  id: number;
  name: string;
};

type User = {
  email: string;
  full_name?: string;
  is_admin: boolean;
};

type Channel = {
  id: number;
  name: string;
};

type Message = {
  id?: number;
  sender_email: string;
  sender_name: string;
  body: string;
  created_at: string;
};

type ChannelsPageProps = {
  workspace: Workspace;
  user: User;
};

/* =======================
   Helpers
======================= */

const formatMessageDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return 'Today';
  if (new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase();
};

/* =======================
   Component
======================= */

export function ChannelsPage({ workspace, user }: ChannelsPageProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] =
    useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMembersSidebar, setShowMembersSidebar] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* -----------------------------
     Load channels
  ------------------------------*/
  const loadChannels = async () => {
    const data = await apiFetch(
      `/api/workspaces/${workspace.id}/channels/`
    );
    setChannels(data);
    if (!selectedChannel && data.length > 0) {
      setSelectedChannel(data[0]);
    }
  };

  useEffect(() => {
    loadChannels();
  }, [workspace.id]);

  /* -----------------------------
     WebSocket lifecycle
  ------------------------------*/
  useEffect(() => {
    if (!selectedChannel) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    const ws = createWebSocket('/ws/chat/');
    socketRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          action: 'join',
          channel_id: selectedChannel.id,
        })
      );

      ws.send(
        JSON.stringify({
          action: 'sync_history',
          channel_id: selectedChannel.id,
          limit: 100,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.event === 'history') {
        setMessages(data.messages);
      }

      if (data.event === 'message') {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.onerror = () => {
      console.error('Channel WebSocket error');
    };

    return () => ws.close();
  }, [selectedChannel?.id]);

  /* -----------------------------
     Send message
  ------------------------------*/
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    socketRef.current.send(
      JSON.stringify({
        action: 'send',
        body: newMessage,
      })
    );

    setNewMessage('');
  };

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="channels-page">
      {/* Sidebar */}
      <div className="channels-sidebar">
        <div className="channels-sidebar-header">
          <div className="channels-header-top">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Channels</h4>
            <button
              className="add-channel-btn"
              onClick={() => setShowCreateModal(true)}
              title="Create new channel"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          <div className="channels-search group">
            <Search className="w-4 h-4 transition-colors group-focus-within:text-primary-500" />
            <input
              type="text"
              placeholder="Jump to..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="channels-list">
          {filteredChannels.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChannel(c)}
              className={`channel-item ${selectedChannel?.id === c.id ? 'active' : ''}`}
            >
              <div className="channel-icon-bg shadow-sm">
                <MessageCircle className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="channel-name">{c.name}</span>
            </button>
          ))}
          {filteredChannels.length === 0 && (
            <div className="channels-empty">
              <Search className="w-8 h-8 mb-2 opacity-20" />
              <p>No matching channels</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area (Three-Column Wrapper) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Middle: Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {!selectedChannel ? (
            <div className="chat-empty-state">
              <div className="chat-empty-icon">
                <MessageCircle className="w-16 h-16 text-primary-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-4">Welcome back!</h3>
              <p className="text-gray-500 font-medium max-w-sm mt-2">
                Select a channel from the left to start collaborating with your team members.
              </p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="chat-header-icon-bg">
                    <MessageCircle className="w-6 h-6 text-primary-600 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight text-gray-900">{selectedChannel.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Online</span>
                    </div>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <button
                    className={`chat-action-btn transition-all rounded-xl p-2 ${showMembersSidebar ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:bg-gray-50'}`}
                    onClick={() => setShowMembersSidebar(!showMembersSidebar)}
                    title="Channel Members"
                  >
                    <Users className="w-5 h-5 stroke-[2.5]" />
                  </button>
                  <div className="w-px h-6 bg-gray-100 mx-2" />
                  <button className="chat-action-btn hover:bg-gray-100 transition-all rounded-xl p-2" title="More Options">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="chat-messages">
                {[...messages]
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((msg, index, sortedArr) => {
                    const isMe = msg.sender_email === user.email;
                    const prevMsg = index > 0 ? sortedArr[index - 1] : null;
                    const isSameSender = prevMsg?.sender_email === msg.sender_email;

                    const showDateDivider = !prevMsg ||
                      new Date(prevMsg.created_at).toDateString() !== new Date(msg.created_at).toDateString();

                    return (
                      <div key={msg.id ?? `${msg.sender_email}-${msg.created_at}-${index}`}>
                        {showDateDivider && (
                          <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px bg-gray-100" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                              {formatMessageDate(msg.created_at)}
                            </span>
                            <div className="flex-1 h-px bg-gray-100" />
                          </div>
                        )}

                        <div className={`message-bubble-wrapper ${isMe ? 'message-right' : 'message-left'} ${isSameSender ? 'consecutive' : ''}`}>
                          {!isMe && (
                            <div className="message-sender-avatar shadow-sm border-2 border-white">
                              {msg.sender_name[0].toUpperCase()}
                            </div>
                          )}

                          <div className="message-content">
                            {!isMe && !isSameSender && (
                              <div className="message-sender-name">
                                {msg.sender_name}
                              </div>
                            )}

                            <div className={`message-bubble ${isMe ? 'own' : ''}`}>
                              <p className="font-normal text-[0.875rem] leading-relaxed">{msg.body}</p>
                              <span className="message-time">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-container">
                <form onSubmit={handleSendMessage} className="chat-input-wrapper shadow-sm">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${selectedChannel.name}`}
                    className="chat-input-field"
                  />
                  <button type="submit" className="chat-send-btn shadow-lg" disabled={!newMessage.trim()}>
                    <Send className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Members Sidebar */}
        {showMembersSidebar && selectedChannel && (
          <ChannelMembersSidebar
            channelId={selectedChannel.id}
            onClose={() => setShowMembersSidebar(false)}
          />
        )}
      </div>

      {/* Modal Overlay for Creating Channel */}
      {showCreateModal && (
        <CreateChannelModal
          workspaceId={workspace.id}
          onClose={() => setShowCreateModal(false)}
          onCreated={loadChannels}
        />
      )}
    </div>
  );
}
