import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiCall from '../../services/api';
import Loader from '../common/Loader';
import { BookOpen, Users, Award, DollarSign, PlusSquare, ArrowRight } from 'lucide-react';

const InstructorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const fetchInstructorData = async () => {
    setLoading(true);
    const [analyticsRes, coursesRes] = await Promise.all([
      apiCall('/analytics'),
      apiCall('/courses')
    ]);

    if (analyticsRes.success) {
      setStats(analyticsRes.data.stats);
    }
    
    if (coursesRes.success) {
      // Filter only courses created by this instructor
      const filtered = coursesRes.data.filter(c => c.instructor?._id === user?.id || c.instructor === user?.id);
      setMyCourses(filtered);
    }
    setLoading(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Evaluator Central</h1>
          <p style={{ color: '#9ca3af' }}>Manage your university courses and evaluate student performance</p>
        </div>
        <Link to="/course-management" className="btn btn-primary" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <PlusSquare size={18} /> Add New Course
        </Link>
      </div>

      {/* Metrics widgets */}
      {stats && (
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ color: '#6366f1', background: 'rgba(99,102,241,0.1)' }}><BookOpen size={22} /></div>
            <div className="stat-info">
              <h3>{stats.coursesCreated}</h3>
              <p>Active Courses</p>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ color: '#fbbf24', background: 'rgba(245,158,11,0.1)' }}><Users size={22} /></div>
            <div className="stat-info">
              <h3>{stats.totalStudents}</h3>
              <p>Total Enrolled Students</p>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)' }}><Award size={22} /></div>
            <div className="stat-info">
              <h3>{stats.certificatesIssued}</h3>
              <p>Credentials Issued</p>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ color: '#818cf8', background: 'rgba(129,140,248,0.1)' }}><DollarSign size={22} /></div>
            <div className="stat-info">
              <h3>${stats.revenue}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>
      )}

      {/* Course List */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem' }}>My Courses Catalog</h3>
        
        <div className="grid-3">
          {myCourses.map((course) => (
            <div key={course._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{
                height: '110px',
                borderRadius: '8px',
                background: course.thumbnail ? `url(${course.thumbnail}) center/cover` : 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(245,158,11,0.05))',
                position: 'relative'
              }}>
                <span className="badge badge-primary" style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', fontSize: '0.65rem' }}>{course.level}</span>
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', color: 'white' }}>{course.title}</h4>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', marginTop: '0.25rem' }}>{course.category}</p>
              </div>
              <Link to={`/course-management?id=${course._id}`} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem' }}>
                Manage Curriculum
              </Link>
            </div>
          ))}
          
          {myCourses.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <p>You haven't created any courses yet.</p>
              <Link to="/course-management" style={{ color: '#818cf8', textDecoration: 'none', fontSize: '0.85rem' }}>Create your first course now &rarr;</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
