import React, { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiCall from '../../services/api';
import { initiateSocketConnection } from '../../services/socket';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  User,
  Settings,
  PlusSquare,
  Users,
  BarChart3,
  Calendar,
  Video,
  FileText,
  CheckCircle2,
  MessageSquare,
  LineChart,
  MessageCircle,
  Bell
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();

      const socket = initiateSocketConnection();
      const handleNewNotif = () => {
        setUnreadCount(prev => prev + 1);
      };

      socket.on('newNotification', handleNewNotif);

      return () => {
        socket.off('newNotification', handleNewNotif);
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    const res = await apiCall('/notifications');
    if (res.success && res.data) {
      const unread = res.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    }
  };

  if (!user) return null;

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      const sidebar = document.querySelector('.glass-sidebar');
      if (sidebar) sidebar.classList.remove('active');
    }
  };

  const renderNavLinks = () => {
    switch (user.role) {
      case 'student':
        return (
          <>
            <NavLink to="/dashboard" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/my-courses" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <BookOpen size={20} /> My Courses
            </NavLink>
            <NavLink to="/live-classes" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Video size={20} /> Live Classes
            </NavLink>
            <NavLink to="/assignments" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FileText size={20} /> Assignments
            </NavLink>
            <NavLink to="/quizzes" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <CheckCircle2 size={20} /> Quizzes
            </NavLink>
            <NavLink to="/discussions" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <MessageSquare size={20} /> Discussions
            </NavLink>
            <NavLink to="/calendar" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Calendar size={20} /> Calendar
            </NavLink>
            <NavLink to="/progress" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LineChart size={20} /> Progress
            </NavLink>
            <NavLink to="/certificates" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Award size={20} /> Certificates
            </NavLink>
            <NavLink to="/messages" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <MessageCircle size={20} /> Messages
            </NavLink>
            <NavLink to="/notifications" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bell size={20} /> Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {unreadCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/settings" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Settings size={20} /> Settings
            </NavLink>
          </>
        );
      case 'evaluator':
        return (
          <>
            <NavLink to="/dashboard" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/course-management" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <PlusSquare size={20} /> Course Manager
            </NavLink>
            <NavLink to="/live-classes" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Video size={20} /> Live Classes
            </NavLink>
            <NavLink to="/assignments" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FileText size={20} /> Assignments
            </NavLink>
            <NavLink to="/quizzes" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <CheckCircle2 size={20} /> Quizzes
            </NavLink>
            <NavLink to="/instructor-students" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Users size={20} /> My Students
            </NavLink>
            <NavLink to="/calendar" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Calendar size={20} /> Calendar
            </NavLink>
            <NavLink to="/instructor-analytics" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={20} /> Analytics
            </NavLink>
            <NavLink to="/messages" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <MessageCircle size={20} /> Messages
            </NavLink>
            <NavLink to="/settings" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Settings size={20} /> Settings
            </NavLink>
          </>
        );
      case 'admin':
        return (
          <>
            <NavLink to="/dashboard" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} /> Admin Dashboard
            </NavLink>
            <NavLink to="/admin-users" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Users size={20} /> Manage Users
            </NavLink>
            <NavLink to="/admin-courses" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <GraduationCap size={20} /> Approve Courses
            </NavLink>
            <NavLink to="/course-management" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <PlusSquare size={20} /> Course Manager
            </NavLink>
            <NavLink to="/calendar" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Calendar size={20} /> Calendar
            </NavLink>
            <NavLink to="/progress" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LineChart size={20} /> Analytics
            </NavLink>
            <NavLink to="/messages" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <MessageCircle size={20} /> Messages
            </NavLink>
            <NavLink to="/notifications" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Bell size={20} /> Notifications
            </NavLink>
            <NavLink to="/admin-settings" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Settings size={20} /> Platform Settings
            </NavLink>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="glass-sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
          <GraduationCap size={28} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.15rem', color: 'white', fontWeight: 800, margin: 0, lineHeight: 1.1 }}>EduLearn</h2>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>LMS Platform</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '1rem', flex: 1, overflowY: 'auto' }} className="hide-scrollbar">
        {renderNavLinks()}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
            {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name}</h4>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0, textTransform: 'capitalize' }}>{user.role}</p>
          </div>
          <User size={16} color="#6b7280" />
        </div>
      </div>

      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: #9ca3af;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        .sidebar-link:hover {
          background: rgba(255, 255, 255, 0.03);
          color: white;
        }
        .sidebar-link.active {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border-left: 3px solid #6366f1;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
