import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Bell, Search, User, LogOut, BookOpen, Compass, Menu, CheckCircle, Sun, Moon, Check } from 'lucide-react';
import apiCall from '../../services/api';
import { initiateSocketConnection } from '../../services/socket';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Refs for click-outside detection
  const notifRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // ─── Fetch notifications on login ──────────────────────────────────────────
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  // ─── Socket: push new notification into Navbar state ──────────────────────
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

  // ─── Click-outside closes both dropdowns ──────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Close on Escape key ──────────────────────────────────────────────────
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowDropdown(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const fetchNotifications = async () => {
    const res = await apiCall('/notifications');
    if (res.success) {
      setNotifications(res.data);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchVal)}`);
    }
  };

  // Mark single notification as read — updates local state immediately
  const handleMarkAsRead = async (id) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    // Skip API call for live socket notifications (they don't exist in DB)
    if (!id.startsWith('live_')) {
      await apiCall(`/notifications/${id}`, { method: 'PUT' });
    }
  };

  // Mark ALL unread as read
  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    // Persist to DB (skip live_ ones)
    const dbUnread = unread.filter(n => !n._id.startsWith('live_'));
    await Promise.all(dbUnread.map(n => apiCall(`/notifications/${n._id}`, { method: 'PUT' })));
  };

  // Delete a notification from dropdown list
  const handleDeleteNotif = (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Icon color per notification type
  const getTypeColor = (type) => {
    switch (type) {
      case 'Assignment': return '#fbbf24';
      case 'Quiz': return '#10b981';
      case 'Lecture': return '#6366f1';
      default: return '#9ca3af';
    }
  };

  return (
    <nav className="glass-navbar" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      background: 'rgba(11, 15, 25, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 200
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {user && (
          <button
            onClick={() => {
              const sidebar = document.querySelector('.glass-sidebar');
              if (sidebar) sidebar.classList.toggle('active');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '0.25rem',
              marginRight: '0.5rem'
            }}
            className="mobile-hamburger"
          >
            <Menu size={24} />
          </button>
        )}
        {!user && (
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen color="#6366f1" size={28} />
            <span style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EduLearn
            </span>
          </Link>
        )}

        <form onSubmit={handleSearch} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search courses, topics..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="glass-input"
            style={{ width: '280px', paddingLeft: '2.5rem', height: '38px', borderRadius: '50px' }}
          />
          <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem' }} />
        </form>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/courses" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', display: 'flex', gap: '0.25rem', alignItems: 'center', borderRadius: '50px', fontSize: '0.85rem' }}>
          <Compass size={16} /> <span className="nav-btn-text">Explore</span>
        </Link>

        <Link to="/verify-certificate" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', display: 'flex', gap: '0.25rem', alignItems: 'center', borderRadius: '50px', fontSize: '0.85rem' }}>
          <CheckCircle size={16} /> <span className="nav-btn-text">Verify Certificate</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
        </button>

        {user ? (
          <>
            {/* ─── Notification Bell ────────────────────────────────────────── */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(prev => !prev);
                  setShowDropdown(false);
                }}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', position: 'relative', display: 'flex', padding: '0.25rem' }}
                title="Notifications"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    minWidth: '18px',
                    height: '18px',
                    background: '#ef4444',
                    borderRadius: '50%',
                    color: 'white',
                    fontSize: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    padding: '0 3px',
                    lineHeight: 1,
                    boxShadow: '0 0 0 2px #0b0f19'
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className="glass-card notif-dropdown"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '44px',
                    width: '340px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 300,
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.9rem 1rem 0.75rem',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    position: 'sticky',
                    top: 0,
                    background: 'rgba(17,24,39,0.98)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 10
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>
                      Notifications {unreadCount > 0 && (
                        <span style={{ marginLeft: '6px', background: '#ef4444', color: 'white', borderRadius: '12px', padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>
                          {unreadCount}
                        </span>
                      )}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 6px', borderRadius: '6px' }}
                          title="Mark all as read"
                        >
                          <Check size={13} /> All Read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, padding: '2px 6px', borderRadius: '4px' }}
                        title="Close"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {/* Notification Items */}
                  <div style={{ padding: '0.5rem' }}>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>No notifications</p>
                    ) : (
                      notifications.slice(0, 20).map(n => (
                        <div
                          key={n._id}
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'flex-start',
                            padding: '0.65rem 0.5rem',
                            borderRadius: '8px',
                            background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.06)',
                            borderLeft: n.isRead ? '3px solid transparent' : `3px solid ${getTypeColor(n.type)}`,
                            cursor: 'pointer',
                            marginBottom: '2px',
                            transition: 'background 0.15s'
                          }}
                          onClick={() => handleMarkAsRead(n._id)}
                        >
                          {/* Unread dot */}
                          <div style={{ flexShrink: 0, paddingTop: '3px' }}>
                            {!n.isRead ? (
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getTypeColor(n.type) }} />
                            ) : (
                              <div style={{ width: '8px', height: '8px' }} />
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              color: n.isRead ? '#9ca3af' : '#f9fafb',
                              fontWeight: n.isRead ? 400 : 600,
                              margin: 0,
                              fontSize: '0.83rem',
                              lineHeight: '1.4',
                              wordBreak: 'break-word'
                            }}>
                              {n.message}
                            </p>
                            <span style={{ fontSize: '0.7rem', color: '#4b5563', display: 'block', marginTop: '2px' }}>
                              {new Date(n.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteNotif(n._id); }}
                            style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', padding: '2px', flexShrink: 0, fontSize: '1rem', lineHeight: 1 }}
                            title="Dismiss"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer: View All */}
                  {notifications.length > 0 && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '0.6rem 1rem', position: 'sticky', bottom: 0, background: 'rgba(17,24,39,0.98)' }}>
                      <Link
                        to="/notifications"
                        onClick={() => setShowNotifications(false)}
                        style={{ color: '#6366f1', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', display: 'block', textAlign: 'center' }}
                      >
                        View all notifications →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── Profile Dropdown ──────────────────────────────────────────── */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <div
                onClick={() => {
                  setShowDropdown(prev => !prev);
                  setShowNotifications(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(99,102,241,0.2)',
                  border: '1px solid rgba(99,102,241,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {user.photo ? (
                    <img src={user.photo} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={20} color="#6366f1" />
                  )}
                </div>
                <div className="hidden-mobile" style={{ fontSize: '0.9rem' }}>
                  <p style={{ fontWeight: 600, color: 'white', margin: 0 }}>{user.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'capitalize', margin: 0 }}>{user.role}</p>
                </div>
              </div>

              {showDropdown && (
                <div className="glass-card" style={{
                  position: 'absolute',
                  right: 0,
                  top: '50px',
                  width: '200px',
                  zIndex: 300,
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Link
                    to="/dashboard"
                    onClick={() => setShowDropdown(false)}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', color: '#f9fafb', textDecoration: 'none', fontSize: '0.9rem' }}
                    className="hover-bg"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', color: '#f9fafb', textDecoration: 'none', fontSize: '0.9rem' }}
                    className="hover-bg"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => { setShowDropdown(false); logout(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'none', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem' }}
                    className="hover-bg"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.4rem 1.2rem', borderRadius: '8px' }}>Log In</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 1.2rem', borderRadius: '8px' }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
