import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiCall from '../../services/api';
import Loader from '../common/Loader';
import { BookOpen, Award, Clock, ArrowRight, Play, Video } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const [analyticsRes, enrollmentsRes] = await Promise.all([
      apiCall('/analytics'),
      apiCall('/enrollments')
    ]);

    if (analyticsRes.success) {
      setStats(analyticsRes.data.stats);
    }
    if (enrollmentsRes.success) {
      setEnrollments(enrollmentsRes.data);
    }
    setLoading(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Welcome back, {user?.name}!</h1>
        <p style={{ color: '#9ca3af' }}>Let's continue learning today.</p>
      </div>

      {/* Metrics widgets */}
      {stats && (
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ color: '#6366f1', background: 'rgba(99,102,241,0.1)' }}><BookOpen size={22} /></div>
            <div className="stat-info">
              <h3>{stats.coursesEnrolled}</h3>
              <p>Enrolled Courses</p>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ color: '#fbbf24', background: 'rgba(245,158,11,0.1)' }}><Clock size={22} /></div>
            <div className="stat-info">
              <h3>{stats.hoursLearned} hrs</h3>
              <p>Time Spent</p>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)' }}><Award size={22} /></div>
            <div className="stat-info">
              <h3>{stats.certificatesEarned}</h3>
              <p>Certificates Earned</p>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}><Play size={22} /></div>
            <div className="stat-info">
              <h3>{stats.averageProgress}%</h3>
              <p>Average Progress</p>
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Courses */}
      <div className="grid-2">
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Recent Courses</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {enrollments.slice(0, 3).map((enrollment) => (
              <div 
                key={enrollment._id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '1rem',
                  borderRadius: '12px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, marginRight: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', color: '#f9fafb' }}>{enrollment.courseId?.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Instructor: {enrollment.courseId?.instructor?.name}</p>
                  
                  {/* Progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                      <div style={{ width: `${enrollment.progress}%`, height: '100%', background: '#6366f1', borderRadius: '10px' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818cf8' }}>{enrollment.progress}%</span>
                  </div>
                </div>

                <Link to={`/courses/play/${enrollment.courseId?._id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                  Resume
                </Link>
              </div>
            ))}

            {enrollments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#6b7280' }}>
                <p>You are not enrolled in any courses yet.</p>
                <Link to="/courses" style={{ color: '#818cf8', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-block', marginTop: '0.5rem' }}>Explore Catalog &rarr;</Link>
              </div>
            )}
          </div>
        </div>

        {/* Calendar / Schedule Live Classes */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Upcoming Live Classes</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {enrollments.length > 0 ? (
              // Simple live announcement card simulator
              <div style={{ display: 'flex', gap: '1rem', padding: '1rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                <div style={{ color: '#fbbf24', marginTop: '0.15rem' }}><Video size={20} /></div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: 'white' }}>Live Q&A Session - Javascript Advanced</h4>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>Scheduled on Monday, 10:00 AM</p>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Duration: 60 mins</p>
                  <span className="badge badge-warning" style={{ marginTop: '0.5rem' }}>Join Link inside Player</span>
                </div>
              </div>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Enroll in a course to view scheduled live sessions.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
