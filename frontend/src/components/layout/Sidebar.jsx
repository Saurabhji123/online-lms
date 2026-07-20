import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  User,
  Settings,
  PlusSquare,
  Users,
  BarChart3
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  // Auto-collapse navigation sidebar on mobile click
  const handleLinkClick = () => {
    const sidebar = document.querySelector('.glass-sidebar');
    if (sidebar && window.innerWidth <= 768) {
      sidebar.classList.remove('active');
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
            <NavLink to="/certificates" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Award size={20} /> Certificates
            </NavLink>
            <NavLink to="/profile" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <User size={20} /> Profile
            </NavLink>
          </>
        );
      case 'instructor':
        return (
          <>
            <NavLink to="/dashboard" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/course-management" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <PlusSquare size={20} /> Course Manager
            </NavLink>
            <NavLink to="/instructor-students" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Users size={20} /> My Students
            </NavLink>
            <NavLink to="/instructor-analytics" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={20} /> Analytics
            </NavLink>
            <NavLink to="/profile" onClick={handleLinkClick} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <User size={20} /> Profile
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
      <div style={{ padding: '0 0.5rem 1.5rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em', fontWeight: 600 }}>Portal Navigation</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
        {renderNavLinks()}
      </div>

      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
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
