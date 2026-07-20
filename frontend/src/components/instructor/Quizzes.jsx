import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiCall from '../../services/api';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { ClipboardList, AlertTriangle } from 'lucide-react';

const InstructorQuizzes = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId') || '';

  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (courseId) {
      fetchQuizzes();
    }
  }, [courseId]);

  const fetchQuizzes = async () => {
    setLoading(true);
    const res = await apiCall(`/quizzes/course/${courseId}`);
    if (res.success) {
      setQuizzes(res.data);
    }
    setLoading(false);
  };

  const handleSelectQuiz = async (quiz) => {
    setSelectedQuiz(quiz);
    setLoading(true);
    const res = await apiCall(`/quizzes/${quiz._id}/results`);
    if (res.success) {
      setResults(res.data);
    }
    setLoading(false);
  };

  if (loading && !selectedQuiz) return <Loader />;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Quiz Results Desk</h1>
        <p style={{ color: '#9ca3af' }}>Check student grades for published quizzes</p>
      </div>

      {!courseId && (
        <div className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <AlertTriangle color="#f59e0b" />
          <p>Please navigate to the <a href="/course-management" style={{ color: '#818cf8', fontWeight: 600 }}>Course Manager</a> to select a course for checking results.</p>
        </div>
      )}

      {courseId && !selectedQuiz && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Course Quizzes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {quizzes.map((quiz) => (
              <div 
                key={quiz._id} 
                onClick={() => handleSelectQuiz(quiz)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', cursor: 'pointer' }}
                className="hover-bg"
              >
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'white' }}>{quiz.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>Duration: {quiz.duration} mins | Max Marks: {quiz.maxMarks}</p>
                </div>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Check Results</button>
              </div>
            ))}
            {quizzes.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No quizzes created for this course yet.</p>}
          </div>
        </div>
      )}

      {selectedQuiz && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <button onClick={() => setSelectedQuiz(null)} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', marginBottom: '0.5rem' }}>&larr; Back Quizzes</button>
              <h3 style={{ fontSize: '1.25rem' }}>Attempts for "{selectedQuiz.title}"</h3>
            </div>
            <span className="badge badge-warning">Max Marks: {selectedQuiz.maxMarks}</span>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}>
                  <th style={{ padding: '0.75rem' }}>Student Name</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>Attempt No</th>
                  <th style={{ padding: '0.75rem' }}>Completed At</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {results.map((resItem) => (
                  <tr key={resItem._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.75rem', color: 'white', fontWeight: 500 }}>{resItem.studentId?.name}</td>
                    <td style={{ padding: '0.75rem', color: '#9ca3af' }}>{resItem.studentId?.email}</td>
                    <td style={{ padding: '0.75rem' }}>{resItem.attemptNumber}</td>
                    <td style={{ padding: '0.75rem', color: '#6b7280' }}>{new Date(resItem.completedAt).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', color: '#34d399', fontWeight: 600 }}>{resItem.score} / {selectedQuiz.maxMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No quiz submissions logged yet.</p>}
          </div>
        </div>
      )}

    </div>
  );
};

export default InstructorQuizzes;
