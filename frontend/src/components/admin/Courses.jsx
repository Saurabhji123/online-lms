import React, { useEffect, useState } from 'react';
import apiCall from '../../services/api';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { BookOpen, Trash2 } from 'lucide-react';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('error');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const res = await apiCall('/courses');
    if (res.success) {
      setCourses(res.data);
    }
    setLoading(false);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course and all associated lectures/modules?')) return;
    setAlertMsg('');

    const res = await apiCall(`/courses/${courseId}`, {
      method: 'DELETE'
    });

    if (res.success) {
      setAlertType('success');
      setAlertMsg('Course and all curriculum components deleted successfully.');
      setCourses(courses.filter(c => c._id !== courseId));
    } else {
      setAlertMsg(res.error || 'Failed to delete course');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Audit Courses</h1>
        <p style={{ color: '#9ca3af' }}>Review course registries and moderate platform syllabus contents</p>
      </div>

      <Alert message={alertMsg} type={alertType} />

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}>
              <th style={{ padding: '0.75rem' }}>Course Scope</th>
              <th style={{ padding: '0.75rem' }}>Category</th>
              <th style={{ padding: '0.75rem' }}>Instructor</th>
              <th style={{ padding: '0.75rem' }}>Duration</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '0.75rem', color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={14} color="#6366f1" />
                  {c.title}
                </td>
                <td style={{ padding: '0.75rem', color: '#9ca3af' }}>{c.category}</td>
                <td style={{ padding: '0.75rem' }}>{c.instructor?.name || 'Evaluator'}</td>
                <td style={{ padding: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>{c.duration} hours</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleDeleteCourse(c._id)}
                    className="btn btn-secondary" 
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                  >
                    <Trash2 size={12} /> Delete Course
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCourses;
