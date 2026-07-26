import React, { useState, useEffect, useContext } from 'react';
import apiCall from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';
import { Bell, Trash2, Send, Volume2, Shield, Check, CheckCheck, BellOff } from 'lucide-react';
import { initiateSocketConnection } from '../services/socket';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Instructor/Admin states
  const [myCourses, setMyCourses] = useState([]);
  const [targetScope, setTargetScope] = useState('all');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('error');

  useEffect(() => {
    fetchNotifications();
    if (user?.role === 'evaluator' || user?.role === 'admin') {
      loadScopeCourses();
    }
  }, [user]);

  // Real-time: append incoming socket notifications
  useEffect(() => {
    if (!user) return;
    const socket = initiateSocketConnection();
    const handleNewNotif = (notif) => {
      const newNotif = {
        _id: `live_${Date.now()}`,
        message: `${notif.title ? notif.title + ': ' : ''}${notif.message}`,
        type: notif.type || 'Announcement',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
    };
    socket.on('newNotification', handleNewNotif);
    return () => socket.off('newNotification', handleNewNotif);
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await apiCall('/notifications');
    if (res.success) {
      setNotifications(res.data);
    }
    setLoading(false);
  };

  const loadScopeCourses = async () => {
    const res = await apiCall('/courses');
    if (res.success) {
      if (user?.role === 'admin') {
        setMyCourses(res.data);
      } else {
        const filtered = res.data.filter(c => c.instructor?._id === user?.id || c.instructor === user?.id);
        setMyCourses(filtered);
      }
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setAlertMsg('');
    setAlertType('error');

    if (targetScope === 'course' && !selectedCourseId) {
      setAlertMsg('Please select a target course.');
      return;
    }

    setLoading(true);
    const res = await apiCall('/notifications', {
      method: 'POST',
      body: JSON.stringify({
        title: notifTitle,
        message: notifMessage,
        type: 'Announcement',
        target: targetScope,
        courseId: selectedCourseId || undefined
      })
    });
    setLoading(false);

    if (res.success) {
      setAlertType('success');
      setAlertMsg('Notification broadcast successfully sent to student(s)!');
      setNotifTitle('');
      setNotifMessage('');
      fetchNotifications();
    } else {
      setAlertMsg(res.error || 'Failed to dispatch notification');
    }
  };

  // Mark single notification as read (optimistic)
  const markRead = async (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    if (!id.startsWith('live_')) {
      await apiCall(`/notifications/${id}`, { method: 'PUT' });
    }
  };

  // Mark ALL as read via bulk API
  const handleMarkAllRead = async () => {
    const hasUnread = notifications.some(n => !n.isRead);
    if (!hasUnread) return;
    // Optimistic
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    // Bulk DB update
    await apiCall('/notifications/mark-all-read', { method: 'PUT' });
  };

  // Permanently delete from DB
  const deleteNotif = async (id) => {
    // Optimistic remove
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (!id.startsWith('live_')) {
      await apiCall(`/notifications/${id}`, { method: 'DELETE' });
    }
  };

  // Delete all read notifications
  const clearRead = async () => {
    const readOnes = notifications.filter(n => n.isRead);
    setNotifications(prev => prev.filter(n => !n.isRead));
    await Promise.all(
      readOnes
        .filter(n => !n._id.startsWith('live_'))
        .map(n => apiCall(`/notifications/${n._id}`, { method: 'DELETE' }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeColor = (type) => {
    switch (type) {
      case 'Assignment': return '#fbbf24';
      case 'Quiz': return '#10b981';
      case 'Lecture': return '#6366f1';
      case 'Announcement': return '#ec4899';
      default: return '#6b7280';
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      Assignment: { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24' },
      Quiz: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
      Lecture: { bg: 'rgba(99,102,241,0.1)', color: '#818cf8' },
      Announcement: { bg: 'rgba(236,72,153,0.1)', color: '#ec4899' },
    };
    const style = colors[type] || { bg: 'rgba(107,114,128,0.1)', color: '#9ca3af' };
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        fontSize: '0.65rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: '20px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {type || 'System'}
      </span>
    );
  };

  if (loading && notifications.length === 0) return <Loader />;

  // ─── Evaluator / Admin: Broadcast Panel ────────────────────────────────────
  if (user?.role === 'evaluator' || user?.role === 'admin') {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Broadcast Alerts Desk</h1>
          <p style={{ color: '#9ca3af' }}>Dispatch real-time push announcements to student cohorts</p>
        </div>

        <Alert message={alertMsg} type={alertType} />

        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          {/* Dispatch Form */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Volume2 size={20} color="#6366f1" /> Send Notification
            </h3>

            <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Target Audience</label>
                <select
                  value={targetScope}
                  onChange={(e) => setTargetScope(e.target.value)}
                  className="glass-input"
                  style={{ background: '#111827' }}
                  required
                >
                  <option value="all">All Registered Students</option>
                  <option value="course">Students of Specific Course</option>
                </select>
              </div>

              {targetScope === 'course' && (
                <div className="form-group">
                  <label>Select Target Course Scope</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="glass-input"
                    style={{ background: '#111827' }}
                    required
                  >
                    <option value="">-- Choose Course --</option>
                    {myCourses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Notification Headline / Title</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="glass-input"
                  placeholder="e.g. Schedule Rescheduled / Exam Reminder"
                  required
                />
              </div>

              <div className="form-group">
                <label>Alert Message Description</label>
                <textarea
                  rows="4"
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="glass-input"
                  placeholder="Type the message body here. This will pop out instantly on students' screens."
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={16} /> Dispatch Broadcast
              </button>
            </form>
          </div>

          {/* Sent Logs */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Shield size={20} color="#fbbf24" /> Platform Alerts Sent Logs
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.slice(0, 10).map(n => (
                <div key={n._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.04)'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'white', margin: '0 0 4px 0' }}>{n.message}</h4>
                    <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                      Sent at: {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <button onClick={() => deleteNotif(n._id)} className="btn btn-secondary" style={{ padding: '0.35rem', borderRadius: '50%', flexShrink: 0 }}>
                    <Trash2 size={12} color="#ef4444" />
                  </button>
                </div>
              ))}
              {notifications.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <BellOff size={32} style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>No broadcast records logged.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Student Notifications Inbox ───────────────────────────────────────────
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{
                marginLeft: '12px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '20px',
                padding: '2px 10px',
                fontSize: '1rem',
                fontWeight: 700,
                verticalAlign: 'middle'
              }}>
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p style={{ color: '#9ca3af' }}>Review course updates, announcements, and grading alerts</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}
            >
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
          {notifications.some(n => n.isRead) && (
            <button
              onClick={clearRead}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.4rem', alignItems: 'center', color: '#ef4444' }}
            >
              <Trash2 size={15} /> Clear read
            </button>
          )}
        </div>
      </div>

      {/* Notification list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {notifications.map(n => (
          <div
            key={n._id}
            className="glass-card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem 1.25rem',
              background: n.isRead ? 'rgba(17,24,39,0.4)' : 'rgba(99,102,241,0.05)',
              border: n.isRead ? '1px solid rgba(255,255,255,0.04)' : `1px solid ${getTypeColor(n.type)}40`,
              borderLeft: n.isRead ? '3px solid rgba(255,255,255,0.06)' : `3px solid ${getTypeColor(n.type)}`,
              cursor: n.isRead ? 'default' : 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => !n.isRead && markRead(n._id)}
          >
            {/* Left: icon + content */}
            <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: n.isRead ? 'rgba(255,255,255,0.04)' : `${getTypeColor(n.type)}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: n.isRead ? '#6b7280' : getTypeColor(n.type)
              }}>
                <Bell size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                  {getTypeBadge(n.type)}
                  {!n.isRead && (
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: getTypeColor(n.type), display: 'inline-block' }} />
                  )}
                </div>
                <p style={{
                  fontSize: '0.9rem',
                  color: n.isRead ? '#9ca3af' : 'white',
                  margin: 0,
                  fontWeight: n.isRead ? 400 : 600,
                  wordBreak: 'break-word'
                }}>
                  {n.message}
                </p>
                <span style={{ fontSize: '0.73rem', color: '#4b5563', display: 'block', marginTop: '4px' }}>
                  📅 {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Right: action buttons */}
            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
              {!n.isRead && (
                <button
                  onClick={(e) => { e.stopPropagation(); markRead(n._id); }}
                  className="btn btn-secondary"
                  title="Mark as read"
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                >
                  <Check size={13} /> Read
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); deleteNotif(n._id); }}
                className="btn btn-secondary"
                title="Delete"
                style={{ padding: '0.4rem', borderRadius: '50%' }}
              >
                <Trash2 size={14} color="#ef4444" />
              </button>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 1rem', color: '#6b7280' }}>
            <BellOff size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>You're all caught up!</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>No notifications right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
