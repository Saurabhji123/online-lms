import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiCall from '../../services/api';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import { Check, ClipboardList, AlertTriangle } from 'lucide-react';

const InstructorAssignments = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId') || '';

  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssign, setSelectedAssign] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  // Evaluation modal state
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('error');

  useEffect(() => {
    if (courseId) {
      fetchAssignments();
    }
  }, [courseId]);

  const fetchAssignments = async () => {
    setLoading(true);
    const res = await apiCall(`/assignments/course/${courseId}`);
    if (res.success) {
      setAssignments(res.data);
    }
    setLoading(false);
  };

  const handleSelectAssignment = async (assign) => {
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
      
      // Update local submission item
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

  if (loading && !selectedAssign) return <Loader />;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Grading Desk</h1>
        <p style={{ color: '#9ca3af' }}>Evaluate student homework submissions</p>
      </div>

      {!courseId && (
        <div className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <AlertTriangle color="#f59e0b" />
          <p>Please navigate to the <a href="/course-management" style={{ color: '#818cf8', fontWeight: 600 }}>Course Manager</a> to select a course for evaluation.</p>
        </div>
      )}

      {courseId && !selectedAssign && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Active Tasks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {assignments.map((assign) => (
              <div 
                key={assign._id} 
                onClick={() => handleSelectAssignment(assign)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', cursor: 'pointer' }}
                className="hover-bg"
              >
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'white' }}>{assign.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>Deadline: {new Date(assign.deadline).toLocaleDateString()} | Max Marks: {assign.maxMarks}</p>
                </div>
                <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Review Submissions</button>
              </div>
            ))}
            {assignments.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No assignments created for this course yet.</p>}
          </div>
        </div>
      )}

      {selectedAssign && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <button onClick={() => setSelectedAssign(null)} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', marginBottom: '0.5rem' }}>&larr; Back Tasks</button>
              <h3 style={{ fontSize: '1.25rem' }}>Submissions for "{selectedAssign.title}"</h3>
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
                  <h4 style={{ fontSize: '0.95rem', color: 'white' }}>{sub.studentId?.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Submitted at: {new Date(sub.submittedAt).toLocaleString()}</p>
                  
                  {sub.textSubmission && (
                    <p style={{ fontSize: '0.85rem', color: '#e5e7eb', marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                      "{sub.textSubmission}"
                    </p>
                  )}
                  {sub.fileUrl && (
                    <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: '0.8rem', color: '#818cf8', marginTop: '0.5rem', textDecoration: 'none' }}>
                      View Submitted Document File
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
        <Alert message={alertMsg} type={alertType} />

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
};

export default InstructorAssignments;
