import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiCall from '../../services/api';
import Loader from '../common/Loader';
import { BookOpen, Award, Clock, Play, Video, Calendar, Flame } from 'lucide-react';

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
      
      {/* Welcome Banner */}
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Welcome back, {user?.name}!</h1>
        <p style={{ color: '#9ca3af' }}>Continue your learning journey</p>
      </div>

      {/* Metrics Row (PDF Layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '0.75rem', borderRadius: '12px' }}><BookOpen size={24} /></div>
          <div>
            <h3 style={{ fontSize: '1.4rem', color: 'white', fontWeight: 700, margin: 0 }}>{enrollments.length}</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>Enrolled Courses</p>
          </div>
        </div>
        
        <div className="glass-card stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.75rem', borderRadius: '12px' }}><Clock size={24} /></div>
          <div>
            <h3 style={{ fontSize: '1.4rem', color: 'white', fontWeight: 700, margin: 0 }}>{(enrollments.length * 8.5).toFixed(1)}</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>Hours Learned</p>
          </div>
        </div>

        <div className="glass-card stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ color: '#fbbf24', background: 'rgba(245,158,11,0.1)', padding: '0.75rem', borderRadius: '12px' }}><Award size={24} /></div>
          <div>
            <h3 style={{ fontSize: '1.4rem', color: 'white', fontWeight: 700, margin: 0 }}>{stats?.certificatesEarned || 0}</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>Certificates Earned</p>
          </div>
        </div>

        <div className="glass-card stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '12px' }}><Flame size={24} /></div>
          <div>
            <h3 style={{ fontSize: '1.4rem', color: 'white', fontWeight: 700, margin: 0 }}>12</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>Learning Streak (Days)</p>
          </div>
        </div>
      </div>

      {/* Split Columns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: '2rem', alignItems: 'flex-start' }} className="mobile-column-stack">
        
        {/* Left Column: Continue Learning List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Continue Learning</h3>
            <Link to="/my-courses" style={{ fontSize: '0.85rem', color: '#818cf8', textDecoration: 'none' }}>View all</Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {enrollments.map((e) => (
              <div 
                key={e._id} 
                className="glass-card" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '1.25rem', 
                  gap: '1rem' 
                }}
              >
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flex: 1 }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(245,158,11,0.05))', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <BookOpen size={24} color="#6366f1" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', color: 'white', fontWeight: 600, margin: '0 0 0.25rem 0' }}>{e.courseId?.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>by {e.courseId?.instructor?.name || 'Instructor'}</span>
                    
                    {/* Progress Slider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <div style={{ width: `${e.progress}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #818cf8)', borderRadius: '10px' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>{e.progress}% Complete</span>
                    </div>
                  </div>
                </div>

                <Link to={`/courses/play/${e.courseId?._id}`} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                  Continue
                </Link>
              </div>
            ))}

            {enrollments.length === 0 && (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#6b7280' }}>
                <p style={{ margin: 0 }}>You are not enrolled in any courses yet.</p>
                <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', fontSize: '0.8rem', display: 'inline-block' }}>Browse Course Catalog</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Broadcast Schedule & Announcements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Upcoming Live Classes Panel */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Upcoming Live Classes</h3>
              <Link to="/calendar" style={{ fontSize: '0.8rem', color: '#818cf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> View calendar</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600, margin: 0 }}>React Hooks Deep Dive</h4>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>📅 Tomorrow, 10:00 AM</p>
                </div>
                <a href="https://meet.jit.si/edulearn-weekly-qa" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', borderRadius: '6px' }}>Join</a>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600, margin: 0 }}>Database Design Principles</h4>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>📅 24 July, 02:00 PM</p>
                </div>
                <button disabled className="btn btn-secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', borderRadius: '6px', cursor: 'not-allowed', opacity: 0.6 }}>Join</button>
              </div>
            </div>
          </div>

          {/* Recent Announcements Panel */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Recent Announcements</h3>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>View all</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600, margin: 0 }}>Holiday on 15th August</h4>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.25rem 0', lineHeight: '1.5' }}>College will remain closed on 15th August for Independence Day celebration.</p>
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>3 hours ago</span>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600, margin: 0 }}>New Course: Next.js 15</h4>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.25rem 0', lineHeight: '1.5' }}>We have launched a new advanced course on Next.js App Router architectures.</p>
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>1 day ago</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
