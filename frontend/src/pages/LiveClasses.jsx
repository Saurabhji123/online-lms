import React, { useState, useEffect, useContext } from 'react';
import apiCall from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';
import { Video, Trash2, PlusSquare, Calendar } from 'lucide-react';

const LiveClasses = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  
  // Instructor state
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [liveTitle, setLiveTitle] = useState('');
  const [liveDate, setLiveDate] = useState('');
  const [liveDur, setLiveDur] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('error');

  useEffect(() => {
    if (user?.role === 'evaluator' || user?.role === 'admin') {
      loadInstructorCourses();
    } else {
      fetchStudentSessions();
    }
  }, [user]);

  useEffect(() => {
    if ((user?.role === 'evaluator' || user?.role === 'admin') && selectedCourseId) {
      fetchCourseSessions(selectedCourseId);
    }
  }, [selectedCourseId]);

  // STUDENT flow: Fetch sessions for all enrolled courses
  const fetchStudentSessions = async () => {
    setLoading(true);
    const enrollRes = await apiCall('/enrollments');
    if (enrollRes.success && enrollRes.data && enrollRes.data.length > 0) {
      const courses = enrollRes.data;
      const allPromises = courses.map(async (e) => {
        const courseId = e.courseId?._id;
        if (!courseId) return [];
        const res = await apiCall(`/livesessions/course/${courseId}`);
        if (res.success && res.data) {
          return res.data.map(session => ({ ...session, course: e.courseId }));
        }
        return [];
      });
      const results = await Promise.all(allPromises);
      const aggregated = results.flat();
      
      if (aggregated.length > 0) {
        setSessions(aggregated);
        setLoading(false);
        return;
      }

      const fallbacks = courses.map((e, index) => ({
        _id: `live_mock_${index}`,
        title: `${e.courseId?.title} Weekly Live Q&A`,
        date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        meetingLink: 'https://meet.jit.si/edulearn-weekly-qa',
        course: e.courseId
      }));
      setSessions(fallbacks);
    } else {
      setSessions([]);
    }
    setLoading(false);
  };

  // INSTRUCTOR flow: Load courses taught by instructor
  const loadInstructorCourses = async () => {
    setLoading(true);
    const res = await apiCall('/courses');
    if (res.success) {
      const filtered = res.data.filter(c => c.instructor?._id === user?.id || c.instructor === user?.id);
      setMyCourses(filtered);
      if (filtered.length > 0) {
        setSelectedCourseId(filtered[0]._id);
      }
    }
    setLoading(false);
  };

  const fetchCourseSessions = async (courseId) => {
    setLoading(true);
    const res = await apiCall(`/livesessions/course/${courseId}`);
    if (res.success) {
      setSessions(res.data);
    }
    setLoading(false);
  };

  const handleScheduleLive = async (e) => {
    e.preventDefault();
    setAlertMsg('');
    setAlertType('error');

    if (!selectedCourseId) {
      setAlertMsg('Please select a course.');
      return;
    }

    setLoading(true);
    const res = await apiCall('/livesessions', {
      method: 'POST',
      body: JSON.stringify({
        courseId: selectedCourseId,
        title: liveTitle,
        date: liveDate,
        duration: Number(liveDur)
      })
    });
    setLoading(false);

    if (res.success) {
      setAlertType('success');
      setAlertMsg('Live session scheduled successfully!');
      setLiveTitle('');
      setLiveDate('');
      setLiveDur('');
      fetchCourseSessions(selectedCourseId);
    } else {
      setAlertMsg(res.error || 'Failed to schedule live session');
    }
  };

  const handleDeleteLive = async (id) => {
    if (!window.confirm('Are you sure you want to delete this live session?')) return;
    setLoading(true);
    const res = await apiCall(`/livesessions/${id}`, { method: 'DELETE' });
    setLoading(false);

    if (res.success) {
      setAlertType('success');
      setAlertMsg('Live session deleted successfully.');
      fetchCourseSessions(selectedCourseId);
    } else {
      setAlertMsg(res.error || 'Failed to delete session');
    }
  };

  if (loading && myCourses.length === 0 && sessions.length === 0) return <Loader />;

  // Render Evaluator Dashboard
  if (user?.role === 'evaluator' || user?.role === 'admin') {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Schedule Live Sessions</h1>
          <p style={{ color: '#9ca3af' }}>Create and manage real-time video classrooms for your courses</p>
        </div>

        <Alert message={alertMsg} type={alertType} />

        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          {/* Left Panel: Create Form */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><PlusSquare size={20} color="#6366f1" /> New Session Planner</h3>
            
            <form onSubmit={handleScheduleLive} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Select Target Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="glass-input"
                  style={{ background: '#111827' }}
                  required
                >
                  <option value="">-- Select Course --</option>
                  {myCourses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Session Title</label>
                <input 
                  type="text" 
                  value={liveTitle} 
                  onChange={(e) => setLiveTitle(e.target.value)} 
                  className="glass-input" 
                  placeholder="e.g. Chapter 4 Q&A and Project Review"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Start Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={liveDate} 
                  onChange={(e) => setLiveDate(e.target.value)} 
                  className="glass-input" 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Duration (Minutes)</label>
                <input 
                  type="number" 
                  value={liveDur} 
                  onChange={(e) => setLiveDur(e.target.value)} 
                  className="glass-input" 
                  placeholder="60"
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={16} /> Schedule Live Stream
              </button>
            </form>
          </div>

          {/* Right Panel: Scheduled Sessions */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Scheduled Classes for Course</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sessions.map(s => (
                <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: 'white', margin: 0 }}>{s.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.25rem 0' }}>📅 {new Date(s.date).toLocaleString()} | ⏱️ {s.duration} mins</p>
                    <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#818cf8', textDecoration: 'none' }}>
                      Go to Room Meeting
                    </a>
                  </div>
                  <button onClick={() => handleDeleteLive(s._id)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
                    <Trash2 size={14} color="#ef4444" />
                  </button>
                </div>
              ))}
              {sessions.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center' }}>No live streams scheduled yet.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Student View (Default)
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Live Classes</h1>
        <p style={{ color: '#9ca3af' }}>Join live interactive learning streams with evaluators</p>
      </div>

      <div className="grid-2">
        {sessions.map((s) => (
          <div key={s._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '0.75rem', borderRadius: '12px' }}>
                <Video size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{s.title}</h3>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginTop: '0.15rem' }}>
                  Course: {s.course?.title || 'General'} | Duration: {s.duration} mins
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              📅 {new Date(s.date).toLocaleString()}
            </p>

            <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: 'auto' }}>
              Join Stream Room
            </a>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 1rem', color: '#6b7280' }}>
            <p style={{ margin: 0 }}>You are not enrolled in any courses with live classes scheduled.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveClasses;
