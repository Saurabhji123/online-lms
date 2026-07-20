import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Bell, Search, User, LogOut, BookOpen, Compass, Menu, CheckCircle, Sun, Moon } from 'lucide-react';
import apiCall from '../../services/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

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

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

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

  const handleMarkAsRead = async (id) => {
    const res = await apiCall(`/notifications/${id}`, { method: 'PUT' });
    if (res.success) {
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
      zIndex: 100
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
              display: 'none',
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
          <Compass size={16} /> Explore
        </Link>

        <Link to="/verify-certificate" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', display: 'flex', gap: '0.25rem', alignItems: 'center', borderRadius: '50px', fontSize: '0.85rem' }}>
          <CheckCircle size={16} /> Verify Certificate
        </Link>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={22} className="hover:text-white" /> : <Moon size={22} className="hover:text-black" />}
        </button>

        {user ? (
          <>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', position: 'relative', display: 'flex', padding: '0.25rem' }}
              >
                <Bell size={22} className="hover:text-white" />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '18px',
                    height: '18px',
                    background: '#ef4444',
                    borderRadius: '50%',
                    color: 'white',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="glass-card" style={{
                  position: 'absolute',
                  right: 0,
                  top: '40px',
                  width: '320px',
                  maxHeight: '360px',
                  overflowY: 'auto',
                  zIndex: 100,
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <h4 style={{ fontSize: '0.95rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Notifications</span>
                    {unreadCount > 0 && <span className="badge badge-danger">{unreadCount} New</span>}
                  </h4>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', textAlign: 'center', padding: '1rem 0' }}>No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n._id} 
                        onClick={() => handleMarkAsRead(n._id)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                          borderLeft: n.isRead ? 'none' : '3px solid #6366f1',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        <p style={{ color: '#f9fafb', fontWeight: n.isRead ? 400 : 500 }}>{n.message}</p>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowDropdown(!showDropdown)}
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
                  <p style={{ fontWeight: 600, color: 'white' }}>{user.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'capitalize' }}>{user.role}</p>
                </div>
              </div>

              {showDropdown && (
                <div className="glass-card" style={{
                  position: 'absolute',
                  right: 0,
                  top: '50px',
                  width: '200px',
                  zIndex: 100,
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
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
