import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import API from '../api/axios';

export default function Chat() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [show, setShow] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => {
    if (!user) return;
    API.get('/messages/conversations').then(({ data }) => setConversations(data)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!socket || !active) return;
    socket.emit('join-conversation', active._id);
    API.get(`/messages/conversations/${active._id}/messages`).then(({ data }) => setMessages(data)).catch(() => {});
    API.put(`/messages/conversations/${active._id}/read`).catch(() => {});

    socket.on('new-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setConversations((prev) => prev.map((c) =>
        c._id === msg.conversation ? { ...c, lastMessage: msg, updatedAt: new Date() } : c
      ));
    });
    socket.on('typing', ({ conversationId }) => {
      if (conversationId === active._id) setTyping(true);
    });
    socket.on('stop-typing', ({ conversationId }) => {
      if (conversationId === active._id) setTyping(false);
    });
    return () => {
      socket.off('new-message');
      socket.off('typing');
      socket.off('stop-typing');
    };
  }, [socket, active]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const openConversation = async (conv) => {
    setActive(conv);
    setShow(true);
  };

  const startConversation = async (userId) => {
    const { data } = await API.post('/messages/conversations', { userId });
    setConversations((prev) => {
      const exists = prev.find((c) => c._id === data._id);
      return exists ? prev : [data, ...prev];
    });
    setActive(data);
    setShow(true);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    const { data } = await API.post('/messages', { conversationId: active._id, text });
    setMessages((prev) => [...prev, data]);
    socket.emit('send-message', { ...data, participants: active.participants.map(p => p._id) });
    setConversations((prev) => prev.map((c) =>
      c._id === active._id ? { ...c, lastMessage: data, updatedAt: new Date() } : c
    ));
    setText('');
    socket.emit('stop-typing', { conversationId: active._id });
  };

  const handleTyping = () => {
    if (active) socket.emit('typing', { conversationId: active._id, user: user });
  };

  const otherUser = (conv) => conv?.participants?.find((p) => p._id !== user?._id);

  const friendRequests = user?.friendRequests?.filter((r) => r.status === 'pending') || [];

  return (
    <>
      <button className="chat-toggle" onClick={() => { setShow(!show); if (!show) setActive(null); }}>
        <svg viewBox="0 0 24 24" width="24" height="24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" fill="currentColor"/></svg>
        <span>Chat</span>
        {friendRequests.length > 0 && <span className="badge">{friendRequests.length}</span>}
      </button>

      {show && (
        <div className="chat-panel">
          <div className="chat-header">
            <h3>{active ? otherUser(active)?.firstName || 'Chat' : 'Chats'}</h3>
            <button onClick={() => { setActive(null); setShow(false); }} className="close-btn">x</button>
          </div>

          {!active ? (
            <div className="chat-list">
              {conversations.length === 0 && <p className="empty-text">No conversations yet</p>}
              {conversations.map((c) => {
                const other = otherUser(c);
                return (
                  <div key={c._id} className="chat-item" onClick={() => openConversation(c)}>
                    <div className="chat-avatar-wrap">
                      <img src={other?.avatar ? `http://localhost:5000${other.avatar}` : 'https://via.placeholder.com/40'} alt="" />
                      {onlineUsers.includes(other?._id) && <span className="online-dot"></span>}
                    </div>
                    <div className="chat-item-info">
                      <strong>{other?.firstName} {other?.lastName}</strong>
                      <span>{c.lastMessage?.text?.substring(0, 30) || 'No messages'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="chat-messages">
              <div className="messages-list">
                {messages.map((m) => (
                  <div key={m._id} className={`msg ${m.sender?._id === user?._id ? 'own' : ''}`}>
                    <div className="msg-bubble">{m.text}</div>
                  </div>
                ))}
                {typing && <div className="typing-indicator">typing...</div>}
                <div ref={messagesEnd} />
              </div>
              <form className="msg-form" onSubmit={sendMessage}>
                <input type="text" placeholder="Type a message..." value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key !== 'Enter') handleTyping(); }} />
                <button type="submit">
                  <svg viewBox="0 0 24 24" width="20" height="20"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/></svg>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
