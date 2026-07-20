import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CourseContext } from '../../context/CourseContext';
import { AuthContext } from '../../context/AuthContext';
import apiCall from '../../services/api';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import { 
  PlusSquare, 
  FolderPlus, 
  Video, 
  FileText, 
  HelpCircle, 
  Trash2, 
  Calendar,
  Layers,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Eye
} from 'lucide-react';

const CourseManagement = () => {
  const { user } = useContext(AuthContext);
  const { fetchCourses, courses, fetchCourseDetails, curriculum } = useContext(CourseContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCourseId = searchParams.get('id') || '';

  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('error');
  const [myCourses, setMyCourses] = useState([]);

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // New Course Form State
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseCat, setCourseCat] = useState('Web Development');
  const [courseDur, setCourseDur] = useState('');
  const [courseLevel, setCourseLevel] = useState('Beginner');
  const [courseLang, setCourseLang] = useState('English');
  const [courseThumb, setCourseThumb] = useState(null);

  // New Module Form State
  const [modTitle, setModTitle] = useState('');

  // New Lecture Form State
  const [selectedModId, setSelectedModId] = useState('');
  const [lecTitle, setLecTitle] = useState('');
  const [lecDesc, setLecDesc] = useState('');
  const [lecDur, setLecDur] = useState('');
  const [lecVideoFile, setLecVideoFile] = useState(null);
  const [lecVideoUrl, setLecVideoUrl] = useState('');

  // New Resource Form State
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState('PDF');
  const [resFile, setResFile] = useState(null);
  const [resLink, setResLink] = useState('');

  // New Live Session Form State
  const [liveTitle, setLiveTitle] = useState('');
  const [liveDate, setLiveDate] = useState('');
  const [liveDur, setLiveDur] = useState('');

  // New Assignment Form State
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('');
  const [assignMaxMarks, setAssignMaxMarks] = useState('');

  // New Quiz Form State
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDuration, setQuizDuration] = useState('');
  const [quizMaxMarks, setQuizMaxMarks] = useState('');
  const [quizAttempts, setQuizAttempts] = useState(1);

  // Question Creation State
  const [questions, setQuestions] = useState([]);
  const [activeQuizObj, setActiveQuizObj] = useState(null);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState('MCQ');
  const [qOption1, setQOption1] = useState('');
  const [qOption2, setQOption2] = useState('');
  const [qOption3, setQOption3] = useState('');
  const [qOption4, setQOption4] = useState('');
  const [qCorrectAns, setQCorrectAns] = useState('');

  useEffect(() => {
    loadInstructorCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseCurriculum();
    }
  }, [selectedCourseId]);

  const loadInstructorCourses = async () => {
    setLoading(true);
    const res = await apiCall('/courses');
    if (res.success) {
      const filtered = res.data.filter(c => c.instructor?._id === user?.id || c.instructor === user?.id);
      setMyCourses(filtered);
    }
    setLoading(false);
  };

  const loadCourseCurriculum = async () => {
    setLoading(true);
    await fetchCourseDetails(selectedCourseId);
    setLoading(false);
  };

  // Create Course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setAlertMsg('');
    setAlertType('error');

    const formData = new FormData();
    formData.append('title', courseTitle);
    formData.append('description', courseDesc);
    formData.append('category', courseCat);
    formData.append('duration', courseDur);
    formData.append('level', courseLevel);
    formData.append('language', courseLang);
    if (courseThumb) {
      formData.append('thumbnail', courseThumb);
    }

    setLoading(true);
    const res = await apiCall('/courses', {
      method: 'POST',
      body: formData
    });
    setLoading(false);

    if (res.success) {
      setAlertType('success');
      setAlertMsg('Course created successfully!');
      setShowCourseModal(false);
      
      // Clear forms
      setCourseTitle('');
      setCourseDesc('');
      setCourseDur('');
      setCourseThumb(null);

      // Reload
      loadInstructorCourses();
    } else {
      setAlertMsg(res.error || 'Failed to create course');
    }
  };

  // Create Module
  const handleCreateModule = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await apiCall('/modules', {
      method: 'POST',
      body: JSON.stringify({
        courseId: selectedCourseId,
        title: modTitle,
        order: curriculum.length
      })
    });
    setLoading(false);

    if (res.success) {
      setModTitle('');
      setShowModuleModal(false);
      loadCourseCurriculum();
    }
  };

  // Create Lecture (Video Upload)
  const handleCreateLecture = async (e) => {
    e.preventDefault();
    setAlertMsg('');

    const formData = new FormData();
    formData.append('moduleId', selectedModId);
    formData.append('title', lecTitle);
    formData.append('description', lecDesc);
    formData.append('duration', lecDur);
    if (lecVideoFile) {
      formData.append('video', lecVideoFile);
    } else if (lecVideoUrl) {
      formData.append('videoUrl', lecVideoUrl);
    } else {
      setAlertMsg('Please upload a video or input a URL');
      return;
    }

    setLoading(true);
    const res = await apiCall('/lectures', {
      method: 'POST',
      body: formData
    });
    setLoading(false);

    if (res.success) {
      setLecTitle('');
      setLecDesc('');
      setLecDur('');
      setLecVideoFile(null);
      setLecVideoUrl('');
      setShowLectureModal(false);
      loadCourseCurriculum();
    } else {
      setAlertMsg(res.error || 'Failed to publish lecture');
    }
  };

  // Create Resource
  const handleCreateResource = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('courseId', selectedCourseId);
    formData.append('title', resTitle);
    formData.append('type', resType);
    if (resFile) {
      formData.append('file', resFile);
    } else if (resLink) {
      formData.append('fileUrl', resLink);
    }

    setLoading(true);
    const res = await apiCall('/resources', {
      method: 'POST',
      body: formData
    });
    setLoading(false);

    if (res.success) {
      setResTitle('');
      setResFile(null);
      setResLink('');
      setShowResourceModal(false);
    }
  };

  // Schedule Live Session
  const handleScheduleLive = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await apiCall('/livesessions', {
      method: 'POST',
      body: JSON.stringify({
        courseId: selectedCourseId,
        title: liveTitle,
        date: liveDate,
        duration: liveDur
      })
    });
    setLoading(false);

    if (res.success) {
      setLiveTitle('');
      setLiveDate('');
      setLiveDur('');
      setShowLiveModal(false);
    }
  };

  // Create Assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await apiCall('/assignments', {
      method: 'POST',
      body: JSON.stringify({
        courseId: selectedCourseId,
        title: assignTitle,
        description: assignDesc,
        deadline: assignDeadline,
        maxMarks: assignMaxMarks
      })
    });
    setLoading(false);

    if (res.success) {
      setAssignTitle('');
      setAssignDesc('');
      setAssignDeadline('');
      setAssignMaxMarks('');
      setShowAssignmentModal(false);
    }
  };

  // Create Quiz
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await apiCall('/quizzes', {
      method: 'POST',
      body: JSON.stringify({
        courseId: selectedCourseId,
        title: quizTitle,
        duration: quizDuration,
        maxMarks: quizMaxMarks,
        maxAttempts: quizAttempts
      })
    });
    setLoading(false);

    if (res.success) {
      setQuizTitle('');
      setQuizDuration('');
      setQuizMaxMarks('');
      setActiveQuizObj(res.data);
      setShowQuizModal(false);
    }
  };

  // Add Question to Quiz
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
    }
  };

  if (loading && !selectedCourseId) return <Loader />;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Course Curriculum Manager</h1>
          <p style={{ color: '#9ca3af' }}>Select or create a course to add syllabus resources, tests, and live streams.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setShowCourseModal(true)} className="btn btn-primary" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            <PlusSquare size={16} /> New Course
          </button>
        </div>
      </div>

      <Alert message={alertMsg} type={alertType} />

      {/* Select course header dropdown selector */}
      <div className="glass-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ margin: 0, minWidth: '320px' }}>
          <label>Active Course Scope</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSearchParams({ id: e.target.value })}
            className="glass-input"
            style={{ background: '#111827' }}
          >
            <option value="">-- Choose Course to Edit --</option>
            {myCourses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        </div>

        {selectedCourseId && (
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Link to={`/courses/play/${selectedCourseId}`} className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}><Eye size={16} /> View Player</Link>
            <Link to={`/instructor-evaluations?courseId=${selectedCourseId}`} className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}><ClipboardList size={16} /> Submissions</Link>
          </div>
        )}
      </div>

      {selectedCourseId ? (
        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          
          {/* Syllabus Curriculum Structure */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Layers size={18} /> Syllabus Blueprint</h3>
              <button onClick={() => setShowModuleModal(true)} className="btn btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem' }}>
                <FolderPlus size={14} /> Add Module
              </button>
            </div>

            {curriculum.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem 0', color: '#6b7280', fontSize: '0.85rem' }}>This course has no modules. Click Add Module to start building your structure.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {curriculum.map((mod) => (
                  <div key={mod._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.95rem', color: '#f59e0b' }}>{mod.title}</h4>
                      <button 
                        onClick={() => { setSelectedModId(mod._id); setShowLectureModal(true); }}
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                      >
                        <Video size={12} /> Add Lecture
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '0.5rem' }}>
                      {mod.lectures?.map(lec => (
                        <div key={lec._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                          <span style={{ color: '#e5e7eb' }}>{lec.title}</span>
                          <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>{lec.duration} mins</span>
                        </div>
                      ))}
                      {(!mod.lectures || mod.lectures.length === 0) && (
                        <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>No lectures published under this module.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts Tasks panel */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>Resource Publishers</h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Add supplementary documents, evaluation tasks, and schedule streams.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => setShowResourceModal(true)} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', fontSize: '0.9rem' }}>
                <FileText size={18} color="#6366f1" /> Upload PDF Handouts / Slides
              </button>
              <button onClick={() => setShowAssignmentModal(true)} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', fontSize: '0.9rem' }}>
                <ClipboardList size={18} color="#10b981" /> Publish Homework Assignment
              </button>
              <button onClick={() => setShowQuizModal(true)} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', fontSize: '0.9rem' }}>
                <HelpCircle size={18} color="#fbbf24" /> Create Automated MCQ Quiz
              </button>
              <button onClick={() => setShowLiveModal(true)} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', fontSize: '0.9rem' }}>
                <Video size={18} color="#ef4444" /> Schedule Jitsi Live Session
              </button>
            </div>

            {/* Quiz Question Constructor Panel */}
            {activeQuizObj && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '1rem', color: '#fbbf24' }}>Quiz Questions: {activeQuizObj.title}</h4>
                
                <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255,255,255,0.01)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
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
                      <input type="text" placeholder="Option 1" value={qOption1} onChange={(e) => setQOption1(e.target.value)} className="glass-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} />
                      <input type="text" placeholder="Option 2" value={qOption2} onChange={(e) => setQOption2(e.target.value)} className="glass-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} />
                      <input type="text" placeholder="Option 3" value={qOption3} onChange={(e) => setQOption3(e.target.value)} className="glass-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} />
                      <input type="text" placeholder="Option 4" value={qOption4} onChange={(e) => setQOption4(e.target.value)} className="glass-input" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Correct Answer Value</label>
                    <input type="text" placeholder="Value matching correct option (case insensitive)" value={qCorrectAns} onChange={(e) => setQCorrectAns(e.target.value)} className="glass-input" required />
                  </div>

                  <button type="submit" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.45rem' }}>Add Question</button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Questions Added: {questions.length}</span>
                  {questions.length > 0 && <button onClick={() => { setActiveQuizObj(null); setQuestions([]); }} className="btn btn-primary" style={{ padding: '0.45rem', fontSize: '0.8rem' }}>Save & Finish</button>}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1rem' }}>
          <BookOpen size={48} color="#6b7280" />
          <h3>No Course Selected Scope</h3>
          <p style={{ maxWidth: '300px' }}>Select an active course from the scope selector dropdown above or create a new course to begin managing.</p>
        </div>
      )}

      {/* Course Modal */}
      <Modal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} title="Create New Course">
        <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Course Title</label>
            <input type="text" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} className="glass-input" placeholder="Complete Web Development Bootcamp" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows="3" value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} className="glass-input" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Category</label>
              <select value={courseCat} onChange={(e) => setCourseCat(e.target.value)} className="glass-input" style={{ background: '#111827' }}>
                <option value="Web Development">Web Development</option>
                <option value="Database">Database</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Business">Business</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duration (Hours)</label>
              <input type="number" value={courseDur} onChange={(e) => setCourseDur(e.target.value)} className="glass-input" required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Difficulty Level</label>
              <select value={courseLevel} onChange={(e) => setCourseLevel(e.target.value)} className="glass-input" style={{ background: '#111827' }}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label>Thumbnail Image</label>
              <input type="file" onChange={(e) => setCourseThumb(e.target.files[0])} style={{ display: 'block', color: '#9ca3af', fontSize: '0.8rem' }} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Create Course</button>
        </form>
      </Modal>

      {/* Module Modal */}
      <Modal isOpen={showModuleModal} onClose={() => setShowModuleModal(false)} title="Create Module">
        <form onSubmit={handleCreateModule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Module Title</label>
            <input type="text" placeholder="e.g. Module 1: HTML Essentials" value={modTitle} onChange={(e) => setModTitle(e.target.value)} className="glass-input" required />
          </div>
          <button type="submit" className="btn btn-primary">Save Module</button>
        </form>
      </Modal>

      {/* Lecture Modal */}
      <Modal isOpen={showLectureModal} onClose={() => setShowLectureModal(false)} title="Publish Lecture Video">
        <form onSubmit={handleCreateLecture} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Lecture Title</label>
            <input type="text" value={lecTitle} onChange={(e) => setLecTitle(e.target.value)} className="glass-input" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows="2" value={lecDesc} onChange={(e) => setLecDesc(e.target.value)} className="glass-input" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Duration (Minutes)</label>
              <input type="number" value={lecDur} onChange={(e) => setLecDur(e.target.value)} className="glass-input" required />
            </div>
            <div className="form-group">
              <label>Upload Video File</label>
              <input type="file" onChange={(e) => setLecVideoFile(e.target.files[0])} style={{ display: 'block', color: '#9ca3af', fontSize: '0.8rem' }} />
            </div>
          </div>
          <div className="form-group">
            <label>OR Paste Video URL</label>
            <input type="text" value={lecVideoUrl} onChange={(e) => setLecVideoUrl(e.target.value)} className="glass-input" placeholder="https://example.com/lecture.mp4" />
          </div>
          <button type="submit" className="btn btn-primary">Publish Lecture</button>
        </form>
      </Modal>

      {/* Resource Modal */}
      <Modal isOpen={showResourceModal} onClose={() => setShowResourceModal(false)} title="Upload PDF Handout / Reference Slide">
        <form onSubmit={handleCreateResource} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Attachment Title</label>
            <input type="text" value={resTitle} onChange={(e) => setResTitle(e.target.value)} className="glass-input" required />
          </div>
          <div className="form-group">
            <label>Format Type</label>
            <select value={resType} onChange={(e) => setResType(e.target.value)} className="glass-input" style={{ background: '#111827' }}>
              <option value="PDF">PDF Document</option>
              <option value="PPT">PowerPoint Slides (PPT)</option>
              <option value="DOCX">Word Document (DOCX)</option>
              <option value="ZIP">ZIP Archive</option>
            </select>
          </div>
          <div className="form-group">
            <label>Select File</label>
            <input type="file" onChange={(e) => setResFile(e.target.files[0])} style={{ display: 'block', color: '#9ca3af', fontSize: '0.8rem' }} />
          </div>
          <div className="form-group">
            <label>OR External Reference Link</label>
            <input type="text" value={resLink} onChange={(e) => setResLink(e.target.value)} className="glass-input" placeholder="https://drive.google.com/..." />
          </div>
          <button type="submit" className="btn btn-primary">Publish Material</button>
        </form>
      </Modal>

      {/* Live Session Modal */}
      <Modal isOpen={showLiveModal} onClose={() => setShowLiveModal(false)} title="Schedule Live Virtual Class">
        <form onSubmit={handleScheduleLive} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Session Title</label>
            <input type="text" placeholder="e.g. Advanced React Hooks Q&A" value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} className="glass-input" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Date and Time</label>
              <input type="datetime-local" value={liveDate} onChange={(e) => setLiveDate(e.target.value)} className="glass-input" required />
            </div>
            <div className="form-group">
              <label>Duration (Minutes)</label>
              <input type="number" value={liveDur} onChange={(e) => setLiveDur(e.target.value)} className="glass-input" required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Schedule Session</button>
        </form>
      </Modal>

      {/* Assignment Modal */}
      <Modal isOpen={showAssignmentModal} onClose={() => setShowAssignmentModal(false)} title="Publish Homework Assignment">
        <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Assignment Title</label>
            <input type="text" value={assignTitle} onChange={(e) => setAssignTitle(e.target.value)} className="glass-input" required />
          </div>
          <div className="form-group">
            <label>Task Instructions</label>
            <textarea rows="3" value={assignDesc} onChange={(e) => setAssignDesc(e.target.value)} className="glass-input" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Rubric Max Marks</label>
              <input type="number" value={assignMaxMarks} onChange={(e) => setAssignMaxMarks(e.target.value)} className="glass-input" required />
            </div>
            <div className="form-group">
              <label>Due Deadline</label>
              <input type="date" value={assignDeadline} onChange={(e) => setAssignDeadline(e.target.value)} className="glass-input" required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Publish Task</button>
        </form>
      </Modal>

      {/* Quiz Modal */}
      <Modal isOpen={showQuizModal} onClose={() => setShowQuizModal(false)} title="Create Automated MCQ Quiz">
        <form onSubmit={handleCreateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Quiz Name</label>
            <input type="text" placeholder="e.g. JavaScript Basics Quiz" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} className="glass-input" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label>Allowed Duration (Minutes)</label>
              <input type="number" value={quizDuration} onChange={(e) => setQuizDuration(e.target.value)} className="glass-input" required />
            </div>
            <div className="form-group">
              <label>Total Exam Marks</label>
              <input type="number" value={quizMaxMarks} onChange={(e) => setQuizMaxMarks(e.target.value)} className="glass-input" required />
            </div>
          </div>
          <div className="form-group">
            <label>Allowed Attempt Limit</label>
            <input type="number" value={quizAttempts} onChange={(e) => setQuizAttempts(e.target.value)} className="glass-input" />
          </div>
          <button type="submit" className="btn btn-primary">Save & Add Questions</button>
        </form>
      </Modal>

    </div>
  );
};

export default CourseManagement;
