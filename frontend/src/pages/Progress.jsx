import React, { useState, useEffect } from 'react';
import apiCall from '../services/api';
import Loader from '../components/common/Loader';
import { BookOpen, Clock, Award, CheckCircle } from 'lucide-react';

const Progress = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const res = await apiCall('/analytics');
    if (res.success && res.data && res.data.stats) {
      setStats(res.data.stats);
    } else {
      setStats({ coursesEnrolled: 6, hoursLearned: 48.5, certificatesEarned: 3, attendanceRate: 95 });
    }
    setLoading(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Learning Analytics & Progress</h1>
        <p style={{ color: '#9ca3af' }}>Track your academic metrics and certificates progression</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '0.75rem', borderRadius: '12px' }}><BookOpen size={24} /></div>
          <div>
            <h3 style={{ fontSize: '1.4rem', color: 'white', fontWeight: 700, margin: 0 }}>{stats?.coursesEnrolled || 6}</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>Enrolled Courses</p>
          </div>
        </div>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.75rem', borderRadius: '12px' }}><Clock size={24} /></div>
          <div>
            <h3 style={{ fontSize: '1.4rem', color: 'white', fontWeight: 700, margin: 0 }}>{stats?.hoursLearned || 48.5}</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>Hours Learned</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ color: '#fbbf24', background: 'rgba(245,158,11,0.1)', padding: '0.75rem', borderRadius: '12px' }}><Award size={24} /></div>
          <div>
            <h3 style={{ fontSize: '1.4rem', color: 'white', fontWeight: 700, margin: 0 }}>{stats?.certificatesEarned || 3}</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>Certificates Earned</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '0.75rem', borderRadius: '12px' }}><CheckCircle size={24} /></div>
          <div>
            <h3 style={{ fontSize: '1.4rem', color: 'white', fontWeight: 700, margin: 0 }}>{stats?.attendanceRate || 95}%</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>Class Attendance</p>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem' }}>Weekly Study Consistency</h3>
        <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', paddingTop: '1rem' }}>
          {[
            { label: 'Mon', height: '60%' },
            { label: 'Tue', height: '40%' },
            { label: 'Wed', height: '80%' },
            { label: 'Thu', height: '95%' },
            { label: 'Fri', height: '50%' },
            { label: 'Sat', height: '30%' },
            { label: 'Sun', height: '70%' }
          ].map((bar, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <div style={{ width: '100%', height: '180px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ width: '100%', height: bar.height, background: 'linear-gradient(to top, #6366f1, #818cf8)', borderRadius: '8px', transition: 'height 0.5s ease' }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{bar.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Progress;
