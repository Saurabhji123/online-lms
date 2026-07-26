import React, { useState, useEffect, useContext } from 'react';
import apiCall from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import { FileText, Trash2, PlusSquare, Award, Check } from 'lucide-react';

const Assignments = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);

  // Instructor-specific states
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('');
  const [assignMaxMarks, setAssignMaxMarks] = useState('');
  
  // Submission review state
  const [selectedAssign, setSelectedAssign] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('error');

  useEffect(() => {
    if (user?.role === 'evaluator' || user?.role === 'admin') {
      loadInstructorCourses();
    } else {
      fetchStudentAssignments();
    }
  }, [user]);

  useEffect(() => {
    if ((user?.role === 'evaluator' || user?.role === 'admin') && selectedCourseId) {
      fetchCourseAssignments(selectedCourseId);
    }
  }, [selectedCourseId]);

  // STUDENT flow: Fetch assignments for enrolled courses
  const fetchStudentAssignments = async () => {
    setLoading(true);
    const enrollRes = await apiCall('/enrollments');
    if (enrollRes.success && enrollRes.data && enrollRes.data.length > 0) {
      const courses = enrollRes.data;
      const allPromises = courses.map(async (e) => {
        const courseId = e.courseId?._id;
        if (!courseId) return [];
        const res = await apiCall(`/assignments/course/${courseId}`);
        if (res.success && res.data) {
          return res.data.map(assign => ({ ...assign, course: e.courseId }));
        }
        return [];
      });
      const results = await Promise.all(allPromises);
      const aggregated = results.flat();
      
      if (aggregated.length > 0) {
        setAssignments(aggregated);
      } else {
        setAssignments([]);
      }
    } else {
      setAssignments([]);
    }
    setLoading(false);
  };

  // INSTRUCTOR flow: Load instructor courses
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

  const fetchCourseAssignments = async (courseId) => {
    setLoading(true);
    const res = await apiCall(`/assignments/course/${courseId}`);
    if (res.success) {
      setAssignments(res.data);
    }
    setLoading(false);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setAlertMsg('');
    setAlertType('error');

    if (!selectedCourseId) {
      setAlertMsg('Please select a course.');
      return;
    }

    setLoading(true);
    const res = await apiCall('/assignments', {
      method: 'POST',
      body: JSON.stringify({
        courseId: selectedCourseId,
        title: assignTitle,
        description: assignDesc,
        deadline: assignDeadline,
        maxMarks: Number(assignMaxMarks)
      })
    });
    setLoading(false);

    if (res.success) {
      setAlertType('success');
      setAlertMsg('Assignment created successfully!');
      setAssignTitle('');
      setAssignDesc('');
      setAssignDeadline('');
      setAssignMaxMarks('');
      fetchCourseAssignments(selectedCourseId);
    } else {
      setAlertMsg(res.error || 'Failed to create assignment');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment? All submissions will also be deleted.')) return;
    setLoading(true);
    const res = await apiCall(`/assignments/${id}`, { method: 'DELETE' });
    setLoading(false);

    if (res.success) {
      setAlertType('success');
      setAlertMsg('Assignment deleted successfully.');
      fetchCourseAssignments(selectedCourseId);
    } else {
      setAlertMsg(res.error || 'Failed to delete assignment');
    }
  };

  const handleSelectAssignmentSubmissions = async (assign) => {
    setSelectedAssign(assign);
    setLoading(true);
    const res = await apiCall(`/submissions/assignment/${assign._id}`);
    if (res.success) {
      setSubmissions(res.data);
    }
    setLoading(false);
  };

  const handleEvaluateSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg('');
    setAlertType('error');

    if (!marks) {
      setAlertMsg('Please assign marks');
      return;
    }

    setLoading(true);
    const res = await apiCall(`/submissions/${activeSubmission._id}/evaluate`, {
      method: 'PUT',
      body: JSON.stringify({ marks: Number(marks), feedback })
    });
    setLoading(false);

    if (res.success) {
      setAlertType('success');
      setAlertMsg('Submission graded successfully!');
      setSubmissions(submissions.map(s => s._id === activeSubmission._id ? { ...s, marks: Number(marks), feedback, status: 'evaluated' } : s));
      
      setTimeout(() => {
        setActiveSubmission(null);
        setMarks('');
        setFeedback('');
        setAlertMsg('');
      }, 1000);
    } else {
      setAlertMsg(res.error || 'Failed to grade submission');
    }
  };

  if (loading && myCourses.length === 0 && assignments.length === 0 && !selectedAssign) return <Loader />;

  // Render Evaluator Dashboard
  if (user?.role === 'evaluator' || user?.role === 'admin') {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Assignments Desk</h1>
          <p style={{ color: '#9ca3af' }}>Create assignments, grade student homework, and delete tasks</p>
        </div>

        <Alert message={alertMsg} type={alertType} />

        {!selectedAssign ? (
          <div className="grid-2" style={{ alignItems: 'flex-start' }}>
            {/* Create Assignment Form */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><PlusSquare size={20} color="#6366f1" /> Create Assignment</h3>
              
              <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  <label>Assignment Title</label>
                  <input 
                    type="text" 
                    value={assignTitle} 
                    onChange={(e) => setAssignTitle(e.target.value)} 
                    className="glass-input" 
                    placeholder="e.g. Module 3: SQL Normalization Task"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Description & Guidelines</label>
                  <textarea 
                    rows="3"
                    value={assignDesc} 
                    onChange={(e) => setAssignDesc(e.target.value)} 
                    className="glass-input" 
                    placeholder="Write details and homework requirements here..."
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Deadline Date</label>
                    <input 
                      type="date" 
                      value={assignDeadline} 
                      onChange={(e) => setAssignDeadline(e.target.value)} 
                      className="glass-input" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Maximum Marks</label>
                    <input 
                      type="number" 
                      value={assignMaxMarks} 
                      onChange={(e) => setAssignMaxMarks(e.target.value)} 
                      className="glass-input" 
                      placeholder="100"
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', justifyContent: 'center' }}>
                  <PlusSquare size={16} /> Publish Assignment
                </button>
              </form>
            </div>

            {/* Existing Course Assignments */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Existing Course Assignments</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {assignments.map(a => (
                  <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', color: 'white', margin: 0 }}>{a.title}</h4>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.25rem 0' }}>Deadline: {new Date(a.deadline).toLocaleDateString()} | Max Marks: {a.maxMarks}</p>
                      <button onClick={() => handleSelectAssignmentSubmissions(a)} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        Submissions Desk
                      </button>
                    </div>
                    <button onClick={() => handleDeleteAssignment(a._id)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                ))}
                {assignments.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center' }}>No assignments created yet.</p>}
              </div>
            </div>
          </div>
        ) : (
          /* Submissions Desk Panel */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <button onClick={() => setSelectedAssign(null)} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', marginBottom: '0.5rem' }}>&larr; Back to Panel</button>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Submissions for "{selectedAssign.title}"</h3>
              </div>
              <span className="badge badge-warning">Max Marks: {selectedAssign.maxMarks}</span>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {submissions.map((sub) => (
                <div 
                  key={sub._id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px solid rgba(255,255,255,0.03)',
                    padding: '1rem', 
                    borderRadius: '12px' 
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: 'white', margin: 0 }}>{sub.studentId?.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0' }}>Submitted at: {new Date(sub.submittedAt).toLocaleString()}</p>
                    
                    {sub.textSubmission && (
                      <p style={{ fontSize: '0.85rem', color: '#e5e7eb', marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                        "{sub.textSubmission}"
                      </p>
                    )}
                    {sub.fileUrl && (
                      <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: '0.8rem', color: '#818cf8', marginTop: '0.5rem', textDecoration: 'none' }}>
                        View Submitted File
                      </a>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    {sub.status === 'evaluated' ? (
                      <span className="badge badge-success" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <Check size={12} /> Graded: {sub.marks} / {selectedAssign.maxMarks}
                      </span>
                    ) : (
                      <button 
                        onClick={() => { setActiveSubmission(sub); setMarks(sub.marks || ''); setFeedback(sub.feedback || ''); }} 
                        className="btn btn-primary" 
                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                      >
                        Grade Task
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {submissions.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No submissions received yet.</p>}
            </div>
          </div>
        )}

        {/* Grade Modal */}
        <Modal isOpen={!!activeSubmission} onClose={() => setActiveSubmission(null)} title={`Evaluate submission: ${activeSubmission?.studentId?.name}`}>
          <form onSubmit={handleEvaluateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label>Award Marks (Max: {selectedAssign?.maxMarks})</label>
              <input 
                type="number" 
                value={marks} 
                onChange={(e) => setMarks(e.target.value)} 
                className="glass-input" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Written Feedback / Corrections</label>
              <textarea 
                rows="3" 
                value={feedback} 
                onChange={(e) => setFeedback(e.target.value)} 
                className="glass-input" 
              />
            </div>
            <button type="submit" className="btn btn-primary">Submit Grade Record</button>
          </form>
        </Modal>
      </div>
    );
  }

  // Render Student View (Default)
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Assignments</h1>
        <p style={{ color: '#9ca3af' }}>Submit and review coursework requirements</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {assignments.map((a) => (
          <div key={a._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '0.75rem', borderRadius: '12px' }}>
                <FileText size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{a.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '0.25rem 0' }}>{a.description}</p>
                <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 500 }}>
                  Course: {a.course?.title}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>Deadline</p>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{new Date(a.deadline).toLocaleDateString()}</span>
              </div>

              <div>
                {a.status === 'Graded' ? (
                  <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Award size={12} /> {a.score}/{a.maxMarks}
                  </span>
                ) : a.status === 'Submitted' ? (
                  <span className="badge badge-primary">Submitted</span>
                ) : (
                  <span className="badge badge-warning">Pending</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {assignments.length === 0 && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 1rem', color: '#6b7280' }}>
            <p style={{ margin: 0 }}>You are not enrolled in any courses with assignments.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;
