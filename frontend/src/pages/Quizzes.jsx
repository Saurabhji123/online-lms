import React, { useState, useEffect, useContext } from 'react';
import apiCall from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';
import { CheckCircle2, Clock, Trash2, PlusSquare, BarChart } from 'lucide-react';

const Quizzes = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState([]);

  // Instructor-specific states
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDuration, setQuizDuration] = useState('');
  const [quizMaxMarks, setQuizMaxMarks] = useState('');
  const [quizAttempts, setQuizAttempts] = useState(1);

  // Question Constructor states
  const [activeQuizObj, setActiveQuizObj] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState('MCQ');
  const [qOption1, setQOption1] = useState('');
  const [qOption2, setQOption2] = useState('');
  const [qOption3, setQOption3] = useState('');
  const [qOption4, setQOption4] = useState('');
  const [qCorrectAns, setQCorrectAns] = useState('');

  // Results Desk state
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [results, setResults] = useState([]);

  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('error');

  useEffect(() => {
    if (user?.role === 'evaluator' || user?.role === 'admin') {
      loadInstructorCourses();
    } else {
      fetchStudentQuizzes();
    }
  }, [user]);

  useEffect(() => {
    if ((user?.role === 'evaluator' || user?.role === 'admin') && selectedCourseId) {
      fetchCourseQuizzes(selectedCourseId);
    }
  }, [selectedCourseId]);

  // STUDENT flow: Fetch quizzes for enrolled courses
  const fetchStudentQuizzes = async () => {
    setLoading(true);
    const enrollRes = await apiCall('/enrollments');
    if (enrollRes.success && enrollRes.data && enrollRes.data.length > 0) {
      const courses = enrollRes.data;
      const allPromises = courses.map(async (e) => {
        const courseId = e.courseId?._id;
        if (!courseId) return [];
        const res = await apiCall(`/quizzes/course/${courseId}`);
        if (res.success && res.data) {
          return res.data.map(quiz => ({ ...quiz, course: e.courseId }));
        }
        return [];
      });
      const results = await Promise.all(allPromises);
      const aggregated = results.flat();
      
      if (aggregated.length > 0) {
        setQuizzes(aggregated);
      } else {
        setQuizzes([]);
      }
    } else {
      setQuizzes([]);
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

  const fetchCourseQuizzes = async (courseId) => {
    setLoading(true);
    const res = await apiCall(`/quizzes/course/${courseId}`);
    if (res.success) {
      setQuizzes(res.data);
    }
    setLoading(false);
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setAlertMsg('');
    setAlertType('error');

    if (!selectedCourseId) {
      setAlertMsg('Please select a course.');
      return;
    }

    setLoading(true);
    const res = await apiCall('/quizzes', {
      method: 'POST',
      body: JSON.stringify({
        courseId: selectedCourseId,
        title: quizTitle,
        duration: Number(quizDuration),
        maxMarks: Number(quizMaxMarks),
        maxAttempts: Number(quizAttempts)
      })
    });
    setLoading(false);

    if (res.success) {
      setAlertType('success');
      setAlertMsg('Quiz created successfully! You can now add questions below.');
      setQuizTitle('');
      setQuizDuration('');
      setQuizMaxMarks('');
      setActiveQuizObj(res.data);
      fetchCourseQuizzes(selectedCourseId);
    } else {
      setAlertMsg(res.error || 'Failed to create quiz');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!activeQuizObj) return;

    const options = qType === 'MCQ' ? [qOption1, qOption2, qOption3, qOption4].filter(Boolean) : [];

    setLoading(true);
    const res = await apiCall(`/quizzes/${activeQuizObj._id}/questions`, {
      method: 'POST',
      body: JSON.stringify({
        type: qType,
        questionText: qText,
        options,
        correctAnswer: qCorrectAns
      })
    });
    setLoading(false);

    if (res.success) {
      setQuestions([...questions, res.data]);
      setQText('');
      setQOption1('');
      setQOption2('');
      setQOption3('');
      setQOption4('');
      setQCorrectAns('');
      setAlertType('success');
      setAlertMsg('Question added successfully!');
    } else {
      setAlertMsg(res.error || 'Failed to add question');
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz? All grades will be deleted.')) return;
    setLoading(true);
    const res = await apiCall(`/quizzes/${id}`, { method: 'DELETE' });
    setLoading(false);

    if (res.success) {
      setAlertType('success');
      setAlertMsg('Quiz deleted successfully.');
      fetchCourseQuizzes(selectedCourseId);
    } else {
      setAlertMsg(res.error || 'Failed to delete quiz');
    }
  };

  const handleSelectQuizResults = async (quiz) => {
    setSelectedQuiz(quiz);
    setLoading(true);
    const res = await apiCall(`/quizzes/${quiz._id}/results`);
    if (res.success) {
      setResults(res.data);
    }
    setLoading(false);
  };

  if (loading && myCourses.length === 0 && quizzes.length === 0 && !selectedQuiz) return <Loader />;

  // Render Evaluator Dashboard
  if (user?.role === 'evaluator' || user?.role === 'admin') {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Quizzes Desk</h1>
          <p style={{ color: '#9ca3af' }}>Create quizzes, append questions, review scores, and delete assessments</p>
        </div>

        <Alert message={alertMsg} type={alertType} />

        {!selectedQuiz ? (
          <div className="grid-2" style={{ alignItems: 'flex-start' }}>
            {/* Left Panel: Create Quiz & Question Constructor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><PlusSquare size={20} color="#6366f1" /> Create MCQ Quiz</h3>
                
                <form onSubmit={handleCreateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                    <label>Quiz Title</label>
                    <input 
                      type="text" 
                      value={quizTitle} 
                      onChange={(e) => setQuizTitle(e.target.value)} 
                      className="glass-input" 
                      placeholder="e.g. Chapter 2: Conceptual Logic Test"
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label>Duration (Mins)</label>
                      <input 
                        type="number" 
                        value={quizDuration} 
                        onChange={(e) => setQuizDuration(e.target.value)} 
                        className="glass-input" 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Max Marks</label>
                      <input 
                        type="number" 
                        value={quizMaxMarks} 
                        onChange={(e) => setQuizMaxMarks(e.target.value)} 
                        className="glass-input" 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Max Attempts</label>
                      <input 
                        type="number" 
                        value={quizAttempts} 
                        onChange={(e) => setQuizAttempts(e.target.value)} 
                        className="glass-input" 
                        required 
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', justifyContent: 'center' }}>
                    <PlusSquare size={16} /> Publish Quiz
                  </button>
                </form>
              </div>

              {/* Question Constructor */}
              {activeQuizObj && (
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#fbbf24' }}>Add Questions: {activeQuizObj.title}</h3>
                  
                  <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Question Text</label>
                      <input type="text" value={qText} onChange={(e) => setQText(e.target.value)} className="glass-input" required />
                    </div>

                    <div className="form-group">
                      <label>Type</label>
                      <select value={qType} onChange={(e) => setQType(e.target.value)} className="glass-input" style={{ background: '#111827' }}>
                        <option value="MCQ">Multiple Choice (MCQ)</option>
                        <option value="True/False">True / False</option>
                        <option value="FillInTheBlank">Fill in the blank</option>
                      </select>
                    </div>

                    {qType === 'MCQ' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input type="text" placeholder="Option 1" value={qOption1} onChange={(e) => setQOption1(e.target.value)} className="glass-input" />
                        <input type="text" placeholder="Option 2" value={qOption2} onChange={(e) => setQOption2(e.target.value)} className="glass-input" />
                        <input type="text" placeholder="Option 3" value={qOption3} onChange={(e) => setQOption3(e.target.value)} className="glass-input" />
                        <input type="text" placeholder="Option 4" value={qOption4} onChange={(e) => setQOption4(e.target.value)} className="glass-input" />
                      </div>
                    )}

                    <div className="form-group">
                      <label>Correct Answer Value</label>
                      <input type="text" placeholder="Value matching correct answer option" value={qCorrectAns} onChange={(e) => setQCorrectAns(e.target.value)} className="glass-input" required />
                    </div>

                    <button type="submit" className="btn btn-secondary">Add Question</button>
                  </form>
                  <button onClick={() => { setActiveQuizObj(null); setQuestions([]); }} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>Save & Done</button>
                </div>
              )}
            </div>

            {/* Right Panel: Existing Quizzes */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Existing Course Quizzes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {quizzes.map(q => (
                  <div key={q._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', color: 'white', margin: 0 }}>{q.title}</h4>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.25rem 0' }}>Duration: {q.duration} mins | Max Marks: {q.maxMarks}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <button onClick={() => { setActiveQuizObj(q); setQuestions(q.questions || []); }} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                          Add Questions
                        </button>
                        <button onClick={() => handleSelectQuizResults(q)} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                          <BarChart size={12} /> Results
                        </button>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteQuiz(q._id)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                ))}
                {quizzes.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center' }}>No quizzes created yet.</p>}
              </div>
            </div>
          </div>
        ) : (
          /* Results Desk */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <button onClick={() => setSelectedQuiz(null)} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', marginBottom: '0.5rem' }}>&larr; Back to Panel</button>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Attempts for "{selectedQuiz.title}"</h3>
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
  }

  // Render Student View (Default)
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Quizzes</h1>
        <p style={{ color: '#9ca3af' }}>Validate your knowledge through curriculum assessments</p>
      </div>

      <div className="grid-3">
        {quizzes.map((q) => (
          <div key={q._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '0.75rem', borderRadius: '12px' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{q.title}</h3>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                  <Clock size={12} /> {q.duration} mins
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 500 }}>
                Course: {q.course?.title}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', marginTop: 'auto' }}>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Marks: {q.maxMarks}</span>
              {q.status === 'Completed' ? (
                <span className="badge badge-success">Score: {q.score}</span>
              ) : (
                <button className="btn btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}>Start Quiz</button>
              )}
            </div>
          </div>
        ))}

        {quizzes.length === 0 && (
          <div className="glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 1rem', color: '#6b7280' }}>
            <p style={{ margin: 0 }}>You are not enrolled in any courses with active quizzes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;
