import React, { useState, useEffect, useContext } from 'react';
import apiCall from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';
import { Bell, Trash, Send, Volume2, Shield } from 'lucide-react';

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
    if (user?.role === 'instructor' || user?.role === 'admin') {
      loadScopeCourses();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const socket = initiateSocketConnection();
      const handleNewNotif = (notif) => {
        // Construct notification list item
        const newNotif = {
          _id: `live_${Date.now()}`,
          message: `${notif.title ? notif.title + ': ' : ''}${notif.message}`,
          type: notif.type,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev]);
      };

      socket.on('newNotification', handleNewNotif);

      return () => {
        socket.off('newNotification', handleNewNotif);
      };
    }
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
      setAlertMsg(`Notification broadcast successfully sent to student(s)!`);
      setNotifTitle('');
      setNotifMessage('');
      fetchNotifications();
    } else {
      setAlertMsg(res.error || 'Failed to dispatch notification');
    }
  };

  const markRead = async (id) => {
    const res = await apiCall(`/notifications/${id}`, {
      method: 'PUT'
    });
    if (res.success) {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleMarkAllRead = async () => {
    const unreadNotifs = notifications.filter(n => !n.isRead);
    if (unreadNotifs.length === 0) return;

    setLoading(true);
    await Promise.all(
      unreadNotifs.map(n => apiCall(`/notifications/${n._id}`, { method: 'PUT' }))
    );
    setLoading(false);

    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotif = async (id) => {
    // Local UI filter since delete notification is localized
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  if (loading && notifications.length === 0) return <Loader />;

  // Render Instructor/Admin Broadcast Center
  if (user?.role === 'instructor' || user?.role === 'admin') {
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
            <h3 style={{ fontSize: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Volume2 size={20} color="#6366f1" /> Send Notification</h3>
            
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

          {/* Previous Sent Logs */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Shield size={20} color="#fbbf24" /> Platform Alerts Sent Logs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notifications.slice(0, 10).map(n => (
                <div key={n._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'white', margin: 0 }}>{n.message}</h4>
                    <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Sent at: {new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <button onClick={() => deleteNotif(n._id)} className="btn btn-secondary" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                    <Trash size={12} color="#ef4444" />
                  </button>
                </div>
              ))}
              {notifications.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center' }}>No broadcast records logged.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Student Alerts Panel view
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>System Alerts</h1>
          <p style={{ color: '#9ca3af' }}>Review course updates, announcements, and grading alerts</p>
        </div>
        <button 
          onClick={handleMarkAllRead} 
          className="btn btn-secondary" 
          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
        >
          Mark all as read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.map(n => (
          <div 
            key={n._id} 
            className="glass-card" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              gap: '1rem',
              background: n.isRead ? 'rgba(17, 24, 39, 0.4)' : 'rgba(99, 102, 241, 0.04)',
              border: n.isRead ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(99,102,241,0.2)'
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ color: n.isRead ? '#9ca3af' : '#6366f1' }}><Bell size={20} /></div>
              <div>
                <p style={{ fontSize: '0.9rem', color: 'white', margin: 0, fontWeight: n.isRead ? 500 : 700 }}>
                  {n.message}
                </p>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '0.25rem' }}>
                  📅 {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {!n.isRead && (
                <button onClick={() => markRead(n._id)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                  Mark Read
                </button>
              )}
              <button onClick={() => deleteNotif(n._id)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
                <Trash size={14} color="#ef4444" />
              </button>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 1rem', color: '#6b7280' }}>
            <p style={{ margin: 0 }}>No notifications logged.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
