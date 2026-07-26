import React, { useState, useEffect } from 'react';
import apiCall from '../services/api';
import Loader from '../components/common/Loader';
import { MessageSquare, ThumbsUp } from 'lucide-react';

const Discussions = () => {
  const [loading, setLoading] = useState(false);
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    setLoading(true);
    // Fetch enrolled courses
    const enrollRes = await apiCall('/enrollments');
    if (enrollRes.success && enrollRes.data && enrollRes.data.length > 0) {
      const courses = enrollRes.data;
      const allPromises = courses.map(async (e) => {
        const courseId = e.courseId?._id;
        if (!courseId) return [];
        const res = await apiCall(`/discussions/course/${courseId}`);
        if (res.success && res.data) {
          return res.data.map(thread => ({ ...thread, course: e.courseId }));
        }
        return [];
      });
      const results = await Promise.all(allPromises);
      const aggregated = results.flat();
      
      if (aggregated.length > 0) {
        setThreads(aggregated);
      } else {
        setThreads([]);
      }
    } else {
      setThreads([]);
    }
    setLoading(false);
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Discussions Forum</h1>
        <p style={{ color: '#9ca3af' }}>Participate in peer brainstorming and Q&A threads</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {threads.map((t) => (
          <div key={t._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '0.75rem', borderRadius: '12px' }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{t.question}</h3>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginTop: '0.15rem' }}>
                  Started by: {t.author} | Course: {t.course?.title}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ThumbsUp size={14} /> {t.likes}
              </span>
              <span className="badge badge-primary">{t.replies} Replies</span>
            </div>
          </div>
        ))}

        {threads.length === 0 && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 1rem', color: '#6b7280' }}>
            <p style={{ margin: 0 }}>You are not enrolled in any courses with active discussions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discussions;
