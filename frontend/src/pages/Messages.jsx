import React, { useState, useEffect, useContext, useRef } from 'react';
import apiCall from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import { MessageSquare, Send, User, AlertCircle } from 'lucide-react';
import { initiateSocketConnection } from '../services/socket';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [activeContactId, setActiveContactId] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (activeContactId) {
      fetchChatHistory(activeContactId);
    }
  }, [activeContactId]);

  useEffect(() => {
    if (activeContactId && user) {
      const socket = initiateSocketConnection();
      
      const handlePrivateMsg = (msg) => {
        if (
          (msg.senderId === activeContactId && msg.receiverId === user.id) ||
          (msg.senderId === user.id && msg.receiverId === activeContactId)
        ) {
          setChatHistory(prev => [...prev, msg]);
        }
      };

      socket.on('privateMessage', handlePrivateMsg);

      return () => {
        socket.off('privateMessage', handlePrivateMsg);
      };
    }
  }, [activeContactId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const fetchContacts = async () => {
    setLoading(true);
    setErrorMsg('');
    const res = await apiCall('/messages/contacts');
    
    if (res.success && res.data) {
      setContacts(res.data);
      if (res.data.length > 0) {
        setActiveContactId(res.data[0]._id);
      }
    } else {
      setErrorMsg(res.error || 'Failed to load contacts list from server');
    }
    setLoading(false);
  };

  const fetchChatHistory = async (contactId) => {
    setErrorMsg('');
    const res = await apiCall(`/messages/history/${contactId}`);
    if (res.success && res.data) {
      setChatHistory(res.data);
    } else {
      setErrorMsg(res.error || 'Failed to load chat history');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeContactId) return;

    setErrorMsg('');
    const res = await apiCall('/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiverId: activeContactId,
        message: msgInput
      })
    });

    if (res.success && res.data) {
      setChatHistory([...chatHistory, res.data]);
      setMsgInput('');
    } else {
      setErrorMsg(res.error || 'Failed to deliver message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getActiveContact = () => {
    return contacts.find(c => c._id === activeContactId);
  };

  if (loading && contacts.length === 0) return <Loader />;

  const activeContact = getActiveContact();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 160px)' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={24} color="#6366f1" /> Support Helpdesk & Chat
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
          Submit bugs/problems directly to Support Admins or communicate with classmates
        </p>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          <span><strong>Error:</strong> {errorMsg}</span>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, gap: '1.5rem', minHeight: 0 }}>
        
        {/* Left contacts bar */}
        <div className="glass-card" style={{ width: '290px', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
              Contacts Registry
            </h3>
            <button onClick={fetchContacts} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.75rem', cursor: 'pointer' }}>Refresh</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }} className="hide-scrollbar">
            {contacts.map(c => {
              const isAdmin = c.role === 'admin';
              const isInstructor = c.role === 'evaluator';
              return (
                <div 
                  key={c._id} 
                  onClick={() => setActiveContactId(c._id)}
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: '12px', 
                    background: activeContactId === c._id ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.01)',
                    border: activeContactId === c._id ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.15rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'white', margin: 0, fontWeight: 600 }}>{c.name}</h4>
                    {isAdmin && <span style={{ fontSize: '0.6rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.1rem 0.3rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Support</span>}
                    {isInstructor && <span style={{ fontSize: '0.6rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '0.1rem 0.3rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Evaluator</span>}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{c.email}</span>
                </div>
              );
            })}
            {contacts.length === 0 && !loading && (
              <span style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem' }}>No contacts found in database.</span>
            )}
          </div>
        </div>

        {/* Right Chat window */}
        <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.25rem', minHeight: 0 }}>
          {activeContact ? (
            <>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {activeContact.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', margin: 0, color: 'white' }}>{activeContact.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'capitalize' }}>Role: {activeContact.role}</span>
                </div>
              </div>

              {/* Chat bubbles */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }} className="hide-scrollbar">
                {chatHistory.map(m => {
                  const isSentByMe = m.senderId === user.id;
                  return (
                    <div 
                      key={m._id} 
                      style={{ 
                        alignSelf: isSentByMe ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        padding: '0.75rem 1rem',
                        borderRadius: isSentByMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                        background: isSentByMe ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.03)',
                        border: isSentByMe ? 'none' : '1px solid rgba(255,255,255,0.05)'
                      }}
                    >
                      <p style={{ fontSize: '0.85rem', color: 'white', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {m.message}
                      </p>
                      <span style={{ fontSize: '0.65rem', color: '#9ca3af', display: 'block', textAlign: 'right', marginTop: '0.25rem' }}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Send bar */}
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                <input 
                  type="text" 
                  placeholder={activeContact.role === 'admin' ? "Explain the problem you faced here..." : "Type message here..."}
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  className="glass-input" 
                  style={{ flex: 1, height: '40px' }}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem', height: '40px' }}>
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', gap: '1rem' }}>
              <User size={48} />
              <p>Select a contact from the registry registry to start chatting.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Messages;
