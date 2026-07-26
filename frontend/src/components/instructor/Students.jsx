import React, { useEffect, useState } from 'react';
import apiCall from '../../services/api';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import { Users, User, Calendar, Check, X } from 'lucide-react';

const InstructorStudents = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [students, setStudents] = useState([]);
  
  // Attendance state
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [targetStudent, setTargetStudent] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState('Present');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('error');

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchEnrolledStudents();
    }
  }, [selectedCourseId]);

  const fetchInstructorCourses = async () => {
    setLoading(true);
    const res = await apiCall('/courses');
    if (res.success) {
      setCourses(res.data);
      if (res.data.length > 0) {
        setSelectedCourseId(res.data[0]._id);
      }
    }
    setLoading(false);
  };

  const fetchEnrolledStudents = async () => {
    setLoading(true);
    // Fetch all enrollments for selected course
    const res = await apiCall(`/enrollments/course/${selectedCourseId}/students`);
    if (res.success && res.data && res.data.length > 0) {
      const mapped = res.data.map(enrollment => ({
        _id: enrollment.studentId?._id,
        name: enrollment.studentId?.name || 'Unknown Student',
        email: enrollment.studentId?.email || 'N/A',
        progress: enrollment.progress || 0,
        attendance: '100%'
      }));
      setStudents(mapped);
    } else {
      setStudents([]);
    }
    setLoading(false);
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setAlertMsg('');
    setAlertType('error');

    setLoading(true);
    const res = await apiCall('/attendance', {
      method: 'POST',
      body: JSON.stringify({
        studentId: targetStudent._id,
        courseId: selectedCourseId,
        status: attendanceStatus
      })
    });
    setLoading(false);

    if (res.success) {
      setAlertType('success');
      setAlertMsg(`Attendance for ${targetStudent.name} registered successfully!`);
      setTimeout(() => {
        setShowAttendanceModal(false);
        setTargetStudent(null);
        setAlertMsg('');
      }, 1200);
    } else {
      setAlertMsg(res.error || 'Failed to submit attendance');
    }
  };

  if (loading && courses.length === 0) return <Loader />;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Classroom Roster</h1>
        <p style={{ color: '#9ca3af' }}>Manage enrolled students and review course attendance registers</p>
      </div>

      <div className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="form-group" style={{ margin: 0, minWidth: '320px' }}>
          <label>Select Course Scope</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="glass-input"
            style={{ background: '#111827' }}
          >
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={20} /> Enrolled Students ({students.length})</h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}>
              <th style={{ padding: '0.75rem' }}>Student Details</th>
              <th style={{ padding: '0.75rem' }}>Email</th>
              <th style={{ padding: '0.75rem' }}>Syllabus Progress</th>
              <th style={{ padding: '0.75rem' }}>Attendance Rate</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No students enrolled in this course yet.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '0.75rem', color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                      <User size={14} color="#6366f1" />
                    </div>
                    {student.name}
                  </td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af' }}>{student.email}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '120px' }}>
                      <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <div style={{ width: `${student.progress}%`, height: '100%', background: '#6366f1', borderRadius: '10px' }} />
                      </div>
                      <span>{student.progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>{student.attendance}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => { setTargetStudent(student); setShowAttendanceModal(true); }}
                      className="btn btn-secondary" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}
                    >
                      <Calendar size={12} /> Log Attendance
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Attendance Modal */}
      <Modal isOpen={showAttendanceModal} onClose={() => setShowAttendanceModal(false)} title={`Register Attendance: ${targetStudent?.name}`}>
        <Alert message={alertMsg} type={alertType} />
        
        <form onSubmit={handleMarkAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Attendance Status</label>
            <select 
              value={attendanceStatus} 
              onChange={(e) => setAttendanceStatus(e.target.value)} 
              className="glass-input"
              style={{ background: '#111827' }}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Submit Log</button>
        </form>
      </Modal>

    </div>
  );
};

export default InstructorStudents;
