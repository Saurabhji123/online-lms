import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CourseContext } from '../../context/CourseContext';
import { AuthContext } from '../../context/AuthContext';
import apiCall from '../../services/api';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import { 
  initiateSocketConnection, 
  disconnectSocket, 
  subscribeToChat, 
  sendChatMessage 
} from '../../services/socket';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  CheckCircle, 
  FileText, 
  MessageSquare, 
  Video, 
  Code, 
  Award, 
  ListOrdered,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Tv
} from 'lucide-react';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);
  const { fetchCourseDetails, currentCourse, curriculum, completeLecture } = useContext(CourseContext);
  
  const [loading, setLoading] = useState(true);
  const [activeLecture, setActiveLecture] = useState(null);
  const [activeTab, setActiveTab] = useState('resources'); // resources, discussion, assignments, quizzes, live
  const [completedLectures, setCompletedLectures] = useState([]);
  const [progress, setProgress] = useState(0);
  const [certificate, setCertificate] = useState(null);

  // Discussion state
  const [discussions, setDiscussions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [activeThread, setActiveThread] = useState(null);
  const [newReply, setNewReply] = useState('');

  // Resources list
  const [resources, setResources] = useState([]);

  // Live sessions list
  const [liveSessions, setLiveSessions] = useState([]);

  // Assignment states
  const [assignments, setAssignments] = useState([]);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [assignmentText, setAssignmentText] = useState('');
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  // Quiz states
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({}); // { questionId: studentAnswer }
  const [quizResult, setQuizResult] = useState(null);

  // Coding Sandbox states
  const [codingProblem, setCodingProblem] = useState('Reverse A String');
  const [codingLang, setCodingLang] = useState('javascript');
  const [codingCode, setCodingCode] = useState(`function reverseString(str) {
  // Write your code here
  return str.split('').reverse().join('');
}`);
  const [codingOutput, setCodingOutput] = useState(null);
  const [codingRunning, setCodingRunning] = useState(false);

  useEffect(() => {
    loadCourseDetails();
    return () => {
      disconnectSocket();
    };
  }, [courseId]);

  // Hook up Socket.io for course forum
  useEffect(() => {
    if (activeTab === 'discussion' && courseId) {
      const socket = initiateSocketConnection(courseId);
      subscribeToChat((msg) => {
        // Append message to active thread or update discussion list
        if (msg.courseId === courseId) {
          fetchDiscussions();
        }
      });
    } else {
      disconnectSocket();
    }
  }, [activeTab]);

  const loadCourseDetails = async () => {
    setLoading(true);
    const data = await fetchCourseDetails(courseId);
    
    // Fetch enrollment status
    const enrollRes = await apiCall(`/enrollments/course/${courseId}`);
    if (enrollRes.success) {
      setCompletedLectures(enrollRes.completedLectures || []);
      setProgress(enrollRes.progress || 0);
      if (enrollRes.progress >= 100) {
        fetchCertificate();
      }
    }

    // Set first lecture as active automatically
    if (data && data.curriculum && data.curriculum.length > 0) {
      const firstMod = data.curriculum[0];
      if (firstMod.lectures && firstMod.lectures.length > 0) {
        setActiveLecture(firstMod.lectures[0]);
      }
    }

    // Load resources, discussions, assignments, quizzes, live sessions
    await Promise.all([
      fetchResources(),
      fetchDiscussions(),
      fetchAssignments(),
      fetchQuizzes(),
      fetchLiveSessions()
    ]);

    setLoading(false);
  };

  const fetchCertificate = async () => {
    const res = await apiCall('/certificates/me');
    if (res.success && res.data.length > 0) {
      const courseCert = res.data.find(c => c.courseId?._id === courseId);
      if (courseCert) {
        setCertificate(courseCert);
      }
    }
  };

  const fetchResources = async () => {
    const res = await apiCall(`/resources/course/${courseId}`);
    if (res.success && res.data && res.data.length > 0) {
      setResources(res.data);
    } else {
      setResources([
        { _id: 'res_mock_1', title: 'React 19 Core Concepts Cheat Sheet', type: 'PDF', fileUrl: 'https://react.dev' },
        { _id: 'res_mock_2', title: 'State Management Reference Guide', type: 'DOCX', fileUrl: 'https://react.dev' }
      ]);
    }
  };

  const fetchDiscussions = async () => {
    const res = await apiCall(`/discussions/course/${courseId}`);
    if (res.success && res.data && res.data.length > 0) {
      setDiscussions(res.data);
    } else {
      setDiscussions([
        {
          _id: 'disc_mock_1',
          question: 'What is the key difference between UseMemo and UseCallback?',
          user: { name: 'Alice Smith' },
          createdAt: new Date().toISOString(),
          answers: [
            { _id: 'ans_mock_1', replyText: 'useMemo returns a memoized value, while useCallback returns a memoized callback function.', user: { name: 'Bob Johnson' }, isBest: true }
          ]
        }
      ]);
    }
  };

  const fetchAssignments = async () => {
    const res = await apiCall(`/assignments/course/${courseId}`);
    if (res.success && res.data && res.data.length > 0) {
      setAssignments(res.data);
    } else {
      setAssignments([
        { _id: 'assign_mock_1', title: 'Build a Custom State Hook', description: 'Create a custom hook useLocalStorage to persist state across page reloads.', maxMarks: 100, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
      ]);
    }
  };

  const fetchQuizzes = async () => {
    const res = await apiCall(`/quizzes/course/${courseId}`);
    if (res.success && res.data && res.data.length > 0) {
      setQuizzes(res.data);
    } else {
      setQuizzes([
        { _id: 'quiz_mock_1', title: 'MERN Fundamentals Quiz', maxMarks: 30, duration: 15 }
      ]);
    }
  };

  const fetchLiveSessions = async () => {
    const res = await apiCall(`/livesessions/course/${courseId}`);
    if (res.success && res.data && res.data.length > 0) {
      setLiveSessions(res.data);
    } else {
      setLiveSessions([
        { _id: 'live_mock_1', title: 'MERN Stack Weekly Live Q&A', meetingLink: 'https://meet.jit.si/edulearn-weekly-qa', date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), duration: 60 }
      ]);
    }
  };

  // Mark lecture as completed
  const handleMarkComplete = async () => {
    if (!activeLecture) return;
    const res = await completeLecture(courseId, activeLecture._id);
    if (res.success) {
      if (!completedLectures.includes(activeLecture._id)) {
        setCompletedLectures([...completedLectures, activeLecture._id]);
      }
      setProgress(res.progress);
      if (res.progress >= 100 && res.certificate) {
        setCertificate(res.certificate);
      }
    }
  };

  // Submit discussion question
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const res = await apiCall('/discussions', {
      method: 'POST',
      body: JSON.stringify({ courseId, question: newQuestion })
    });

    if (res.success) {
      setNewQuestion('');
      setDiscussions([res.data, ...discussions]);
      // Trigger Socket event
      sendChatMessage(courseId, newQuestion, user);
    }
  };

  // Submit reply
  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim() || !activeThread) return;

    const res = await apiCall(`/discussions/${activeThread._id}/replies`, {
      method: 'POST',
      body: JSON.stringify({ replyText: newReply })
    });

    if (res.success) {
      setNewReply('');
      setActiveThread(res.data);
      setDiscussions(discussions.map(d => d._id === res.data._id ? res.data : d));
      // Trigger Socket event
      sendChatMessage(courseId, newReply, user);
    }
  };

  // Submit Assignment
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!activeAssignment) return;

    setLoading(true);

    if (activeAssignment._id === 'assign_mock_1') {
      setTimeout(() => {
        setSubmissionStatus('Assignment submitted successfully! (Simulated submission)');
        setLoading(false);
      }, 500);
      return;
    }

    const formData = new FormData();
    formData.append('assignmentId', activeAssignment._id);
    formData.append('textSubmission', assignmentText);
    if (assignmentFile) {
      formData.append('file', assignmentFile);
    }

    const res = await apiCall('/submissions', {
      method: 'POST',
      body: formData
    });
    setLoading(false);

    if (res.success) {
      setSubmissionStatus('Submitted successfully!');
      setAssignmentText('');
      setAssignmentFile(null);
    } else {
      setSubmissionStatus(`Submission failed: ${res.error}`);
    }
  };

  // Load Quiz Details
  const handleStartQuiz = async (quiz) => {
    setLoading(true);
    const res = await apiCall(`/quizzes/${quiz._id}`);
    if (res.success && res.data && res.data.questions && res.data.questions.length > 0) {
      setActiveQuiz(res.data.quiz);
      setQuizQuestions(res.data.questions);
    } else {
      // Fallback pre-populated mock quiz for instant preview!
      setActiveQuiz({
        _id: 'quiz_mock_1',
        title: 'MERN Stack Fundamentals Quiz',
        duration: 15,
        maxMarks: 30,
        maxAttempts: 3
      });
      setQuizQuestions([
        {
          _id: 'q_mock_1',
          type: 'MCQ',
          questionText: 'Which lifecycle hook in React is used to execute side effects like fetching data?',
          options: ['useState', 'useEffect', 'useContext', 'useReducer']
        },
        {
          _id: 'q_mock_2',
          type: 'True/False',
          questionText: 'In Node.js, the require() function is used to load and import local or third-party modules.'
        },
        {
          _id: 'q_mock_3',
          type: 'FillInTheBlank',
          questionText: 'MongoDB is a document-oriented database that stores records as semi-structured ___ format documents.'
        }
      ]);
    }
    setQuizAnswers({});
    setQuizResult(null);
    setLoading(false);
  };

  // Submit Quiz Answers
  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    
    setLoading(true);

    if (activeQuiz._id === 'quiz_mock_1') {
      let score = 0;
      if (quizAnswers['q_mock_1'] === 'useEffect') score += 10;
      if (quizAnswers['q_mock_2'] === 'True') score += 10;
      if (quizAnswers['q_mock_3'] && quizAnswers['q_mock_3'].toLowerCase().trim() === 'json') score += 10;

      setTimeout(() => {
        setQuizResult({
          score,
          passed: score >= 20,
          completedAt: new Date().toISOString()
        });
        setLoading(false);
      }, 500);
      return;
    }

    // Map answers
    const answersArray = Object.keys(quizAnswers).map((qId) => ({
      questionId: qId,
      studentAnswer: quizAnswers[qId]
    }));

    const res = await apiCall(`/quizzes/${activeQuiz._id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers: answersArray })
    });
    setLoading(false);

    if (res.success) {
      setQuizResult(res.data);
    }
  };

  // Compile / Run coding test cases
  const handleRunCompiler = async () => {
    setCodingRunning(true);
    setCodingOutput(null);

    const res = await apiCall('/quizzes/coding/execute', {
      method: 'POST',
      body: JSON.stringify({
        code: codingCode,
        language: codingLang,
        problemName: codingProblem
      })
    });

    setCodingRunning(false);
    if (res.success) {
      setCodingOutput(res);
    } else {
      setCodingOutput({ error: res.error || 'Compiler error occurred' });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
      
      {/* Center Screen: Player + Tabs */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
        
        {/* Video Screen & Header */}
        {activeLecture ? (
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000' }}>
              <video
                src={activeLecture.videoUrl}
                controls
                style={{ position: 'absolute', width: '100%', height: '100%', left: 0, top: 0 }}
                playbackRate={1.0}
              />
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem' }}>{activeLecture.title}</h2>
                <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '0.25rem' }}>{activeLecture.description}</p>
              </div>

              {completedLectures.includes(activeLecture._id) ? (
                <button className="btn btn-secondary" style={{ color: '#10b981', display: 'flex', gap: '0.5rem', cursor: 'default' }}>
                  <CheckCircle2 size={18} /> Completed
                </button>
              ) : (
                <button onClick={handleMarkComplete} className="btn btn-primary">
                  Mark as Complete
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ height: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1rem' }}>
            <Tv size={48} color="#6b7280" />
            <h3>No Lecture Selected</h3>
            <p style={{ maxWidth: '300px' }}>Please choose a lecture or task from the curriculum tree on the right side.</p>
          </div>
        )}

        {/* Certificate Callout */}
        {progress >= 100 && certificate && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(99, 102, 241, 0.05))',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ color: '#fbbf24' }}><Award size={36} /></div>
              <div>
                <h4 style={{ color: '#fbbf24' }}>Congratulations! Course Completed!</h4>
                <p style={{ fontSize: '0.85rem' }}>Your university credential has been verified and compiled successfully.</p>
              </div>
            </div>
            <a 
              href={certificate.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-accent" 
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            >
              Download PDF Certificate
            </a>
          </div>
        )}

        {/* Interactive Tabs Menu */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', gap: '1rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {['curriculum', 'resources', 'discussion', 'assignments', 'quizzes', 'coding', 'live'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={tab === 'curriculum' ? 'mobile-only-tab' : ''}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 1rem',
                color: activeTab === tab ? '#818cf8' : '#9ca3af',
                borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease',
                display: tab === 'curriculum' ? undefined : 'inline-block'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div style={{ paddingBottom: '2rem' }}>
          
          {/* Curriculum Tab (Mobile only) */}
          {activeTab === 'curriculum' && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Course Curriculum Blueprint</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {curriculum.map((mod) => (
                  <div key={mod._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ListOrdered size={16} /> {mod.title}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.75rem' }}>
                      {mod.lectures?.map((lecture) => {
                        const isActive = activeLecture?._id === lecture._id;
                        const isCompleted = completedLectures.includes(lecture._id);

                        return (
                          <div
                            key={lecture._id}
                            onClick={() => { setActiveLecture(lecture); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                              borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent'
                            }}
                            className="hover-bg"
                          >
                            <span style={{ fontSize: '0.85rem', color: isActive ? '#f9fafb' : '#9ca3af' }}>
                              {lecture.title}
                            </span>
                            {isCompleted && <CheckCircle size={14} color="#10b981" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Course Attachments & Downloads</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {resources.map((res) => (
                  <div key={res._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <FileText size={18} color="#6366f1" />
                      <div>
                        <p style={{ fontSize: '0.9rem', color: '#f9fafb' }}>{res.title}</p>
                        <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>{res.type}</span>
                      </div>
                    </div>
                    <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}>Download</a>
                  </div>
                ))}
                {resources.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No resource attachments available.</p>}
              </div>
            </div>
          )}

          {/* Discussions Tab */}
          {activeTab === 'discussion' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Question list / Thread detail view */}
              {activeThread ? (
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <button onClick={() => setActiveThread(null)} className="btn btn-secondary" style={{ alignSelf: 'flex-start', padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>&larr; Threads</button>
                  
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                        {activeThread.user?.name?.substring(0,1).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>{activeThread.user?.name}</p>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{new Date(activeThread.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '1rem', color: '#f9fafb', paddingLeft: '0.5rem' }}>{activeThread.question}</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Replies ({activeThread.answers?.length || 0})</h4>
                    {activeThread.answers?.map((reply) => (
                      <div key={reply._id} style={{ background: reply.isBest ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.01)', border: reply.isBest ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                              {reply.user?.name?.substring(0,1).toUpperCase() || 'U'}
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{reply.user?.name}</span>
                            {reply.isBest && <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>Best Answer</span>}
                          </div>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#e5e7eb' }}>{reply.replyText}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddReply} style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <input
                      type="text"
                      placeholder="Add a reply..."
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      className="glass-input"
                      required
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>Reply</button>
                  </form>
                </div>
              ) : (
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>Discussion Forum</h3>
                  
                  <form onSubmit={handleAskQuestion} style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="text"
                      placeholder="Ask a question about this course..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="glass-input"
                      required
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Ask Question</button>
                  </form>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {discussions.map((d) => (
                      <div 
                        key={d._id} 
                        onClick={() => setActiveThread(d)}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          background: 'rgba(255,255,255,0.02)', 
                          padding: '0.85rem 1rem', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          border: '1px solid rgba(255,255,255,0.04)'
                        }}
                        className="hover-bg"
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <p style={{ fontSize: '0.9rem', color: '#f9fafb', fontWeight: 500 }}>{d.question}</p>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Posted by {d.user?.name} on {new Date(d.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af' }}>
                          <MessageSquare size={16} />
                          <span style={{ fontSize: '0.8rem' }}>{d.answers?.length || 0}</span>
                        </div>
                      </div>
                    ))}
                    {discussions.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No discussions yet. Be the first to ask!</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Course Assignments</h3>
              
              {activeAssignment ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <button onClick={() => { setActiveAssignment(null); setSubmissionStatus(null); }} className="btn btn-secondary" style={{ alignSelf: 'flex-start', padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>&larr; Back</button>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: 'white' }}>{activeAssignment.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '0.25rem' }}>{activeAssignment.description}</p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#fbbf24', marginTop: '0.5rem' }}>
                      <span>Max Marks: {activeAssignment.maxMarks}</span>
                      <span>Deadline: {new Date(activeAssignment.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Alert message={submissionStatus} type={submissionStatus?.includes('success') ? 'success' : 'error'} />

                  <form onSubmit={handleSubmitAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                    <div className="form-group">
                      <label>Text Submission (Optional)</label>
                      <textarea
                        rows="4"
                        placeholder="Write your explanation or repository link here..."
                        value={assignmentText}
                        onChange={(e) => setAssignmentText(e.target.value)}
                        className="glass-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Upload File (PDF or ZIP)</label>
                      <input
                        type="file"
                        onChange={(e) => setAssignmentFile(e.target.files[0])}
                        style={{ display: 'block', color: '#9ca3af', fontSize: '0.85rem' }}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Submit Assignment</button>
                  </form>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {assignments.map((assign) => (
                    <div key={assign._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                      <div>
                        <p style={{ fontSize: '0.9rem', color: '#f9fafb', fontWeight: 500 }}>{assign.title}</p>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Deadline: {new Date(assign.deadline).toLocaleDateString()}</span>
                      </div>
                      <button onClick={() => setActiveAssignment(assign)} className="btn btn-secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}>Submit Task</button>
                    </div>
                  ))}
                  {assignments.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No assignments assigned for this course.</p>}
                </div>
              )}
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === 'quizzes' && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Course Quizzes</h3>
              
              {activeQuiz ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '1.1rem', color: 'white' }}>{activeQuiz.title}</h4>
                    <span className="badge badge-warning">Duration: {activeQuiz.duration} mins</span>
                  </div>

                  {quizResult ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h4 style={{ color: '#10b981' }}>Quiz Completed Successfully!</h4>
                      <p>Your Score: <strong style={{ fontSize: '1.25rem' }}>{quizResult.score} / {activeQuiz.maxMarks}</strong></p>
                      <button onClick={() => { setActiveQuiz(null); setQuizResult(null); }} className="btn btn-secondary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>Back to Quizzes</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                      {quizQuestions.map((q, index) => (
                        <div key={q._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '1rem' }}>
                          <p style={{ fontSize: '0.95rem', color: '#f9fafb' }}>Q{index + 1}. {q.questionText}</p>
                          
                          {/* MCQ Options */}
                          {q.type === 'MCQ' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '0.5rem' }}>
                              {q.options?.map((opt) => (
                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#9ca3af', cursor: 'pointer' }}>
                                  <input
                                    type="radio"
                                    name={`q-${q._id}`}
                                    value={opt}
                                    checked={quizAnswers[q._id] === opt}
                                    onChange={(e) => setQuizAnswers({ ...quizAnswers, [q._id]: e.target.value })}
                                    style={{ accentColor: '#6366f1' }}
                                  />
                                  {opt}
                                </label>
                              ))}
                            </div>
                          )}

                          {/* True / False */}
                          {q.type === 'True/False' && (
                            <div style={{ display: 'flex', gap: '1rem', paddingLeft: '0.5rem' }}>
                              {['True', 'False'].map((opt) => (
                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#9ca3af', cursor: 'pointer' }}>
                                  <input
                                    type="radio"
                                    name={`q-${q._id}`}
                                    value={opt}
                                    checked={quizAnswers[q._id] === opt}
                                    onChange={(e) => setQuizAnswers({ ...quizAnswers, [q._id]: e.target.value })}
                                    style={{ accentColor: '#6366f1' }}
                                  />
                                  {opt}
                                </label>
                              ))}
                            </div>
                          )}

                          {/* Fill In Blank / Short Answer */}
                          {(q.type === 'FillInTheBlank' || q.type === 'ShortAnswer') && (
                            <input
                              type="text"
                              placeholder="Write your answer..."
                              value={quizAnswers[q._id] || ''}
                              onChange={(e) => setQuizAnswers({ ...quizAnswers, [q._id]: e.target.value })}
                              className="glass-input"
                              style={{ maxWidth: '300px', fontSize: '0.85rem' }}
                            />
                          )}
                        </div>
                      ))}

                      <button onClick={handleSubmitQuiz} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Submit Quiz</button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {quizzes.map((q) => (
                    <div key={q._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                      <div>
                        <p style={{ fontSize: '0.9rem', color: '#f9fafb', fontWeight: 500 }}>{q.title}</p>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Max Marks: {q.maxMarks}</span>
                      </div>
                      <button onClick={() => handleStartQuiz(q)} className="btn btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}>Start Quiz</button>
                    </div>
                  ))}
                  {quizzes.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No quizzes available for this course.</p>}
                </div>
              )}
            </div>
          )}

          {/* Coding Sandbox Tab */}
          {activeTab === 'coding' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>Coding Assessment: {codingProblem}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Task: Write a function `reverseString(str)` which returns the reverse of a string.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <select 
                    value={codingLang} 
                    onChange={(e) => setCodingLang(e.target.value)} 
                    className="glass-input" 
                    style={{ width: '130px', padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: '#111827' }}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                  </select>
                  
                  <button 
                    onClick={handleRunCompiler} 
                    className="btn btn-accent" 
                    style={{ padding: '0.4rem 1.25rem', fontSize: '0.8rem' }}
                    disabled={codingRunning}
                  >
                    {codingRunning ? 'Compiling...' : 'Run Code'}
                  </button>
                </div>
              </div>

              {/* Monaco Editor Frame */}
              <div className="glass-card" style={{ padding: '0.5rem', background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <Editor
                  height="340px"
                  theme="vs-dark"
                  language={codingLang}
                  value={codingCode}
                  onChange={(val) => setCodingCode(val)}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true
                  }}
                />
              </div>

              {/* Test Cases Terminal Output */}
              {codingOutput && (
                <div className="glass-card" style={{ background: '#090d16', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Console Execution Output</span>
                    {codingOutput.allPassed ? (
                      <span className="badge badge-success">All Test Cases Passed</span>
                    ) : (
                      <span className="badge badge-danger">{codingOutput.passedTestCases} / {codingOutput.totalTestCases} Passed</span>
                    )}
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {codingOutput.results?.map((t) => (
                      <div key={t.testCase} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.4rem 0.75rem', borderRadius: '4px', background: t.passed ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)' }}>
                        <div>
                          <span style={{ fontWeight: 600, color: t.passed ? '#10b981' : '#ef4444' }}>Case {t.testCase}: </span>
                          <span style={{ color: '#9ca3af' }}>Input: {JSON.stringify(t.input)} | Expected: {JSON.stringify(t.expected)}</span>
                        </div>
                        <span style={{ fontWeight: 600, color: t.passed ? '#34d399' : '#f87171' }}>
                          {t.passed ? 'PASSED' : `FAILED (Got: ${JSON.stringify(t.actual)})`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Live Virtual Classes Tab */}
          {activeTab === 'live' && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Scheduled Live Virtual Classes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {liveSessions.map((session) => (
                  <div key={session._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                    <div>
                      <p style={{ fontSize: '0.95rem', color: '#f9fafb', fontWeight: 600 }}>{session.title}</p>
                      <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Date: {new Date(session.date).toLocaleString()} | Duration: {session.duration} mins</span>
                    </div>
                    
                    {/* Launch Jitsi link in a new tab */}
                    <a 
                      href={session.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-accent" 
                      style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                    >
                      <Video size={16} /> Join Class
                    </a>
                  </div>
                ))}
                {liveSessions.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No live virtual sessions scheduled.</p>}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Right Sidebar: Curriculum Tree Navigation */}
      <div className="glass-card hidden-mobile" style={{ width: '320px', padding: '1.25rem', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>Curriculum Layout</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {curriculum.map((mod) => (
            <div key={mod._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ListOrdered size={16} /> {mod.title}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.75rem' }}>
                {mod.lectures?.map((lecture) => {
                  const isActive = activeLecture?._id === lecture._id;
                  const isCompleted = completedLectures.includes(lecture._id);

                  return (
                    <div
                      key={lecture._id}
                      onClick={() => setActiveLecture(lecture)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                        borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent'
                      }}
                      className="hover-bg"
                    >
                      <span style={{ fontSize: '0.85rem', color: isActive ? '#f9fafb' : '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                        {lecture.title}
                      </span>
                      {isCompleted && <CheckCircle size={14} color="#10b981" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CoursePlayer;
