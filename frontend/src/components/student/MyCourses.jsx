import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiCall from '../../services/api';
import Loader from '../common/Loader';
import { PlayCircle } from 'lucide-react';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    setLoading(true);
    const res = await apiCall('/enrollments');
    if (res.success) {
      setEnrollments(res.data);
    }
    setLoading(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>My Enrolled Courses</h1>
        <p style={{ color: '#9ca3af' }}>Track your active academic courses</p>
      </div>

      <div className="grid-3">
        {enrollments.map((enrollment) => (
          <div key={enrollment._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <div style={{
              height: '150px',
              borderRadius: '12px',
              background: enrollment.courseId?.thumbnail ? `url(${enrollment.courseId.thumbnail}) center/cover` : 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(245,158,11,0.05))',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <span className="badge badge-primary" style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem' }}>{enrollment.courseId?.level}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600, textTransform: 'uppercase' }}>{enrollment.courseId?.category}</span>
              <h3 style={{ fontSize: '1.15rem' }}>{enrollment.courseId?.title}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ca3af' }}>
                  <span>Learning progress</span>
                  <span>{enrollment.progress}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                  <div style={{ width: `${enrollment.progress}%`, height: '100%', background: '#6366f1', borderRadius: '10px' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', marginTop: 'auto' }}>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Status: {enrollment.status}</span>
              <Link to={`/courses/play/${enrollment.courseId?._id}`} className="btn btn-primary" style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem' }}>
                Play Course
              </Link>
            </div>
          </div>
        ))}

        {enrollments.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 1rem' }}>
            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>You are not enrolled in any courses yet.</p>
            <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem' }}>Explore Courses</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
