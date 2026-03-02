import { useEffect, useRef, useState } from 'react';
import { Send, Search, User as UserIcon, MoreHorizontal } from 'lucide-react';
import { createWebSocket, apiFetch } from '../api';
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
};

type WorkspaceMember = {
  user_email: string;
  full_name: string;
};

type Conversation = {
  user_email: string;
  user_name: string;
};

type DMMessage = {
  id: number;
  sender_email: string;
  sender_name: string;
  recipient: string;
  body: string;
  created_at: string;
};

/* =======================
   Helpers
======================= */

const formatMessageDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return 'Today';
  if (new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
};

/* =======================
   Component
======================= */

export function DirectMessagesPage({
  workspace,
  user,
}: {
  workspace: Workspace;
  user: User;
}) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* =================================================
     Load workspace members (LEFT SIDEBAR)
  ================================================= */
  useEffect(() => {
    apiFetch(`/api/workspaces/${workspace.id}/members/`)
      .then((data) => {
        setMembers(
          data
            .filter((m: any) => m.user_email !== user.email)
            .map((m: any) => ({
              user_email: m.user_email,
              full_name: m.full_name || m.user_email,
            }))
        );
      })
      .catch((err) => {
        console.error('Failed to load members', err);
      });
  }, [workspace.id, user.email]);

  /* =================================================
     WebSocket — OPEN **ONCE PER WORKSPACE**
  ================================================= */
  useEffect(() => {
    const ws = createWebSocket('/ws/chat/');
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      /* ---------- HISTORY ---------- */
      if (data.event === 'dm_history') {
        setMessages(data.messages || []);
        return;
      }

      /* ---------- LIVE MESSAGE ---------- */
      if (data.event === 'dm_message' && selectedConversation) {
        const isRelevant =
          (data.sender_email === selectedConversation.user_email &&
            data.recipient === user.email) ||
          (data.sender_email === user.email &&
            data.recipient === selectedConversation.user_email);

        if (isRelevant) {
          setMessages((prev) => [...prev, data]);
        }
      }
    };

    ws.onerror = () => {
      console.error('DM WebSocket error');
    };

    return () => {
      ws.close();
    };
  }, [workspace.id, user.email, selectedConversation?.user_email]);

  /* =================================================
     Select member → REQUEST HISTORY
  ================================================= */
  const selectConversation = (member: WorkspaceMember) => {
    const conv = {
      user_email: member.user_email,
      user_name: member.full_name,
    };

    setSelectedConversation(conv);
    setMessages([]);

    socketRef.current?.send(
      JSON.stringify({
        action: 'dm_history',
        workspace_id: workspace.id,
        other_user: member.user_email,
        limit: 100,
      })
    );
  };

  /* =================================================
     Send DM
  ================================================= */
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    socketRef.current?.send(
      JSON.stringify({
        action: 'dm_send',
        workspace_id: workspace.id,
        other_user: selectedConversation.user_email,
        body: newMessage,
      })
    );

    setNewMessage('');
  };

  const filteredMembers = members.filter(m =>
    m.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="channels-page"> {/* Reuse generic page class */}
      {/* ================= Sidebar ================= */}
      <div className="channels-sidebar">
        <div className="channels-sidebar-header">
          <div className="channels-header-top">
            <h4>Direct Messages</h4>
          </div>
          <div className="channels-search group">
            <Search className="w-4 h-4 transition-colors group-focus-within:text-primary-500" />
            <input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="channels-list">
          {filteredMembers.map((m) => (
            <button
              key={m.user_email}
              className={`channel-item ${selectedConversation?.user_email === m.user_email ? 'active' : ''
                }`}
              onClick={() => selectConversation(m)}
            >
              <div className="channel-icon-bg">
                <UserIcon className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="channel-name">{m.full_name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= Chat Area ================= */}
      <div className="chat-area">
        {!selectedConversation ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">
              <UserIcon className="w-16 h-16 text-primary-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mt-4">Start a conversation</h3>
            <p className="text-gray-500 font-medium max-w-sm mt-2">
              Select a team member from the left to start a private conversation.
            </p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-header-icon-bg shadow-sm">
                  <UserIcon className="w-6 h-6 text-primary-600 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">{selectedConversation.user_name}</h3>
                  <span className="chat-header-status">
                    <span className="status-indicator online" />
                    <span className="font-bold text-[10px] uppercase tracking-widest opacity-70">Active Now</span>
                  </span>
                </div>
              </div>
              <div className="chat-header-actions">
                <button className="chat-action-btn hover:bg-gray-100 transition-all rounded-xl p-2" title="More Options">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((msg, index) => {
                const isMe = msg.sender_email === user.email;
                const prevMsg = index > 0 ? messages[index - 1] : null;
                const isSameSender = prevMsg?.sender_email === msg.sender_email;

                const showDateDivider = !prevMsg ||
                  new Date(prevMsg.created_at).toDateString() !== new Date(msg.created_at).toDateString();

                return (
                  <div key={msg.id ?? `${msg.sender_email}-${msg.created_at}-${index}`}>
                    {showDateDivider && (
                      <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                          {formatMessageDate(msg.created_at)}
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                    )}

                    <div className={`message-bubble-wrapper ${isMe ? 'message-right' : 'message-left'
                      } ${isSameSender ? 'consecutive' : ''}`}>
                      {!isMe && (
                        <div className="message-sender-avatar shadow-sm border-2 border-white">
                          {msg.sender_name?.[0].toUpperCase()}
                        </div>
                      )}

                      <div className="message-content">
                        <div className={`message-bubble ${isMe ? 'own' : ''}`}>
                          <p className="font-medium text-[0.9375rem] leading-relaxed">{msg.body}</p>
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
                  placeholder={`Message ${selectedConversation.user_name}`}
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
    </div>
  );
}
