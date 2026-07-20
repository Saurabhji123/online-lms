import React, { useEffect, useState } from 'react';
import apiCall from '../../services/api';
import Loader from '../common/Loader';
import { BarChart3, LineChart, PieChart, Users, BookOpen, DollarSign, Award } from 'lucide-react';

const InstructorAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
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
        <h1 style={{ fontSize: '2rem' }}>Course Metrics & Reports</h1>
        <p style={{ color: '#9ca3af' }}>Analyze enrollment rates, class performance, and platform revenue</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="glass-card stat-card" style={{ borderLeft: '3px solid #6366f1' }}>
            <div className="stat-icon" style={{ color: '#6366f1', background: 'rgba(99,102,241,0.1)' }}><BookOpen size={22} /></div>
            <div className="stat-info">
              <h3>{stats.coursesCreated}</h3>
              <p>Active Courses</p>
            </div>
          </div>
          <div className="glass-card stat-card" style={{ borderLeft: '3px solid #fbbf24' }}>
            <div className="stat-icon" style={{ color: '#fbbf24', background: 'rgba(245,158,11,0.1)' }}><Users size={22} /></div>
            <div className="stat-info">
              <h3>{stats.totalStudents}</h3>
              <p>Total Enrolled</p>
            </div>
          </div>
          <div className="glass-card stat-card" style={{ borderLeft: '3px solid #10b981' }}>
            <div className="stat-icon" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)' }}><Award size={22} /></div>
            <div className="stat-info">
              <h3>{stats.certificatesIssued}</h3>
              <p>Verified Credentials</p>
            </div>
          </div>
          <div className="glass-card stat-card" style={{ borderLeft: '3px solid #818cf8' }}>
            <div className="stat-icon" style={{ color: '#818cf8', background: 'rgba(129,140,248,0.1)' }}><DollarSign size={22} /></div>
            <div className="stat-info">
              <h3>${stats.revenue}</h3>
              <p>Simulated Earnings</p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics simulation */}
      <div className="grid-2">
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LineChart size={20} color="#6366f1" /> Course Enrollment Growth</h3>
          <p style={{ fontSize: '0.85rem' }}>Visual representation of enrolled students monthly growth rate.</p>
          
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', gap: '0.5rem' }}>
            {/* Simple CSS charts layout */}
            {[20, 35, 45, 60, 85, 120].map((height, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{height}</span>
                <div style={{ width: '100%', height: `${height}px`, background: 'linear-gradient(to top, #6366f1, #fbbf24)', borderRadius: '4px' }} />
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Month {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart3 size={20} color="#fbbf24" /> Quiz Grade Distribution</h3>
          <p style={{ fontSize: '0.85rem' }}>Average student score percentages categories.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', height: '220px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span>Grade A (90% - 100%)</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>40% of students</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                <div style={{ width: '40%', height: '100%', background: '#10b981', borderRadius: '10px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span>Grade B (75% - 89%)</span>
                <span style={{ fontWeight: 600, color: '#6366f1' }}>35% of students</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                <div style={{ width: '35%', height: '100%', background: '#6366f1', borderRadius: '10px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span>Grade C (60% - 74%)</span>
                <span style={{ fontWeight: 600, color: '#fbbf24' }}>20% of students</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                <div style={{ width: '20%', height: '100%', background: '#fbbf24', borderRadius: '10px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default InstructorAnalytics;
