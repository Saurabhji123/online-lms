import React, { useEffect, useState } from 'react';
import apiCall from '../../services/api';
import Loader from '../common/Loader';
import { Users, ShieldAlert, GraduationCap, Award, BookOpen } from 'lucide-react';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    setLoading(true);
    const res = await apiCall('/analytics');
    if (res.success) {
      setStats(res.data.stats);
    }
    setLoading(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Platform Administration</h1>
        <p style={{ color: '#9ca3af' }}>Overview of users, registrations, and courses across the EduLearn network</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="glass-card stat-card" style={{ borderLeft: '3px solid #6366f1' }}>
            <div className="stat-icon" style={{ color: '#6366f1', background: 'rgba(99,102,241,0.1)' }}><Users size={22} /></div>
            <div className="stat-info">
              <h3>{stats.totalStudents}</h3>
              <p>Total Students</p>
            </div>
          </div>
          <div className="glass-card stat-card" style={{ borderLeft: '3px solid #fbbf24' }}>
            <div className="stat-icon" style={{ color: '#fbbf24', background: 'rgba(245,158,11,0.1)' }}><ShieldAlert size={22} /></div>
            <div className="stat-info">
              <h3>{stats.totalInstructors}</h3>
              <p>Total Instructors</p>
            </div>
          </div>
          <div className="glass-card stat-card" style={{ borderLeft: '3px solid #10b981' }}>
            <div className="stat-icon" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)' }}><GraduationCap size={22} /></div>
            <div className="stat-info">
              <h3>{stats.totalCourses}</h3>
              <p>Total Courses</p>
            </div>
          </div>
          <div className="glass-card stat-card" style={{ borderLeft: '3px solid #818cf8' }}>
            <div className="stat-icon" style={{ color: '#818cf8', background: 'rgba(129,140,248,0.1)' }}><Award size={22} /></div>
            <div className="stat-info">
              <h3>{stats.totalCertificates}</h3>
              <p>Credentials Issued</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin operations description */}
      <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', background: 'rgba(99,102,241,0.03)', border: '1px solid rgba(99,102,241,0.1)' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#818cf8', marginBottom: '0.5rem' }}>Administrator Operations Available</h3>
        <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '0.9rem' }}>Use the side navigation drawer to manage platform user registries, promote/demote active roles, moderate course curriculums, check credentials, or modify portal configurations.</p>
      </div>

    </div>
  );
};

export default AdminDashboard;
