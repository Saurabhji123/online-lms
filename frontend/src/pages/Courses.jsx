import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CourseContext } from '../context/CourseContext';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import apiCall from '../services/api';
import { PlayCircle, Search, Filter, BookOpen, Clock, BarChart, GraduationCap, X } from 'lucide-react';

const Courses = () => {
  const { courses, fetchCourses, loading } = useContext(CourseContext);
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const navigate = useNavigate();

  // Modal and details state
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Payment checkout scanner states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const [paymentTimer, setPaymentTimer] = useState(300);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 9;

  useEffect(() => {
    setSearchTerm(searchParam);
  }, [searchParam]);

  // Reset pagination index on search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, category, level]);

  useEffect(() => {
    let searchFilter = searchTerm;
    if (searchParam && !searchTerm) {
      searchFilter = searchParam;
    }
    fetchCourses(searchFilter);
  }, [searchParam, category, level]);

  // Payment checkout window timer ticking down
  useEffect(() => {
    let interval = null;
    if (showPaymentModal && paymentTimer > 0) {
      interval = setInterval(() => {
        setPaymentTimer(prev => prev - 1);
      }, 1000);
    } else if (paymentTimer === 0) {
      setShowPaymentModal(false);
      alert('Payment scan window expired. Please try again.');
    }
    return () => clearInterval(interval);
  }, [showPaymentModal, paymentTimer]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchTerm });
  };

  const handleOpenDetails = async (course) => {
    setSelectedCourse(course);
    setCourseModules([]);
    setIsEnrolled(false);
    
    // Fetch detailed syllabus modules
    const detailRes = await apiCall(`/courses/${course._id}`);
    if (detailRes.success && detailRes.data.modules) {
      setCourseModules(detailRes.data.modules);
    }

    if (user && user.role === 'student') {
      setCheckingEnrollment(true);
      const enrollRes = await apiCall(`/enrollments/course/${course._id}`);
      if (enrollRes.success) {
        setIsEnrolled(enrollRes.enrolled);
      }
      setCheckingEnrollment(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Launch simulated Razorpay payment checkout layout
    setShowPaymentModal(true);
    setPaymentMethod('qr');
    setPaymentTimer(300);
  };

  const handleConfirmEnrollment = async () => {
    setEnrolling(true);
    
    // Mock payment ID
    const paymentId = 'pay_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const res = await apiCall('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId: selectedCourse._id, paymentId })
    });

    setEnrolling(false);

    if (res.success) {
      setIsEnrolled(true);
      setShowPaymentModal(false);
      setSelectedCourse(null);
      alert('Payment success! Course enrollment registered.');
      navigate(`/courses/play/${selectedCourse._id}`);
    } else {
      alert(res.error || 'Enrollment registration failed');
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesCategory = category ? c.category.toLowerCase() === category.toLowerCase() : true;
    const matchesLevel = level ? c.level.toLowerCase() === level.toLowerCase() : true;
    return matchesCategory && matchesLevel;
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem' }}>Explore Courses</h1>
        <p style={{ color: '#9ca3af' }}>Expand your knowledge with curated university programs</p>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', position: 'relative', flex: '1', minWidth: '260px' }}>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input"
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
        </form>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="#9ca3af" />
            <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Filters:</span>
          </div>

          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="glass-input" 
            style={{ width: '160px', background: '#111827', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="">All Categories</option>
            <option value="Web Development">Web Development</option>
            <option value="Database">Database</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Business">Business</option>
          </select>

          <select 
            value={level} 
            onChange={(e) => setLevel(e.target.value)}
            className="glass-input" 
            style={{ width: '150px', background: '#111827', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (() => {
        const indexOfLastCourse = currentPage * coursesPerPage;
        const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
        const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
        const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="grid-3">
              {currentCourses.map((course) => (
                <div key={course._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <div style={{
                height: '160px',
                borderRadius: '12px',
                background: course.thumbnail ? `url(${course.thumbnail}) center/cover` : 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(245,158,11,0.05))',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {!course.thumbnail && <PlayCircle size={48} color="#6366f1" style={{ opacity: 0.6 }} />}
                <span className="badge badge-primary" style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem' }}>{course.level}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600, textTransform: 'uppercase' }}>{course.category}</span>
                <h3 style={{ fontSize: '1.15rem' }}>{course.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {course.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600 }}>
                    {course.instructor?.name?.substring(0,1).toUpperCase() || 'E'}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{course.instructor?.name || 'Evaluator'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Duration: {course.duration}h</span>
                <button 
                  onClick={() => handleOpenDetails(course)}
                  className="btn btn-primary" 
                  style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                >
                  View Details
                </button>
              </div>
            </div>
              ))}

              {filteredCourses.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 1rem' }}>
                  <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>No courses matched your filter criteria.</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`btn ${currentPage === pageNumber ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', minWidth: '40px' }}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* Course Details Modal */}
      {selectedCourse && (
        <Modal 
          isOpen={true}
          title={selectedCourse.title} 
          onClose={() => setSelectedCourse(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>{selectedCourse.category}</span>
              <p style={{ color: '#e5e7eb', fontSize: '1rem', lineHeight: '1.6' }}>{selectedCourse.description}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af' }}>
                <Clock size={16} /> <span>Duration: <strong>{selectedCourse.duration} Hours</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af' }}>
                <BarChart size={16} /> <span>Level: <strong>{selectedCourse.level}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af' }}>
                <GraduationCap size={16} /> <span>Evaluator: <strong>{selectedCourse.instructor?.name || 'Academic Faculty'}</strong></span>
              </div>
            </div>

            {/* Syllabus Checklist */}
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: '#f9fafb' }}>Course Syllabus ({courseModules.length} Modules)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {courseModules.map((m, idx) => (
                  <div key={m._id} style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.85rem', borderRadius: '8px' }}>
                    <span style={{ color: '#6366f1', fontWeight: 600 }}>{idx + 1}.</span>
                    <span style={{ fontSize: '0.9rem', color: '#e5e7eb' }}>{m.title}</span>
                  </div>
                ))}
                {courseModules.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No modules published yet for this course.</p>}
              </div>
            </div>

            {/* Gated Checkout Action */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => setSelectedCourse(null)} className="btn btn-secondary" style={{ flex: 1 }}>Close</button>
              
              {!user ? (
                <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ flex: 2 }}>Login to Enroll</button>
              ) : user.role !== 'student' ? (
                <button disabled className="btn btn-secondary" style={{ flex: 2, cursor: 'not-allowed' }}>Only Students Can Enroll</button>
              ) : checkingEnrollment ? (
                <button disabled className="btn btn-primary" style={{ flex: 2 }}><Loader /></button>
              ) : isEnrolled ? (
                <button 
                  onClick={() => navigate(`/courses/play/${selectedCourse._id}`)} 
                  className="btn btn-accent" 
                  style={{ flex: 2 }}
                >
                  Resume Watch
                </button>
              ) : (
                <button 
                  onClick={handleEnroll} 
                  disabled={enrolling} 
                  className="btn btn-primary" 
                  style={{ flex: 2 }}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll & Buy Course'}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* UPI QR Code Scanner & Card Checkout Modal */}
      {showPaymentModal && selectedCourse && (
        <Modal
          isOpen={true}
          title="Payment Checkout (Razorpay Simulated)"
          onClose={() => setShowPaymentModal(false)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', color: '#f9fafb' }}>{selectedCourse.title}</h4>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Professional Certificate Track</p>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>₹4,999</span>
            </div>

            {/* Payment Method Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button 
                onClick={() => setPaymentMethod('qr')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: paymentMethod === 'qr' ? 'rgba(99, 102, 241, 0.15)' : 'none',
                  color: paymentMethod === 'qr' ? '#818cf8' : '#9ca3af',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                UPI QR Code
              </button>
              <button 
                onClick={() => setPaymentMethod('card')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: paymentMethod === 'card' ? 'rgba(99, 102, 241, 0.15)' : 'none',
                  color: paymentMethod === 'card' ? '#818cf8' : '#9ca3af',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                Card Payment
              </button>
            </div>

            {/* UPI QR Code view */}
            {paymentMethod === 'qr' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }}>
                  Scan this UPI QR Code using GPay, PhonePe, Paytm, or BHIM apps to pay securely.
                </p>
                
                {/* Dynamically Styled QR Code Mockup */}
                <div style={{ 
                  background: 'white', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  width: '180px', 
                  height: '180px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  position: 'relative'
                }}>
                  <svg width="140" height="140" viewBox="0 0 29 29" style={{ shapeRendering: 'crispEdges' }}>
                    <path fill="#000" d="M0 0h7v7H0zm22 0h7v7h-7zM0 22h7v7H0zm10 0h2v2h-2zm2 2h2v2h-2zm-2 2h2v3h-2zm4 0h3v-2h-3zm3-2h2v-2h-2zm-3-2h2v-2h-2zm5-4h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm2 2h3v-2h-3zm-6-8h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm6-6h2v2h-2zm-2 2h2v2h-2zm-2-4h2v2h-2zm-2 2h2v2h-2zm4-4h2v2h-2zm-4 4h2v2h-2z" />
                    <path fill="#000" d="M1 1h5v5H1zm22 0h5v5h-5zM1 23h5v5H1zm9-12h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm4-4h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm-4 2h2v2h-2zm2 2h2v2h-2z" />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#6366f1',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    border: '3px solid white'
                  }}>
                    UPI
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Merchant: EduLearn LMS</span>
                  <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}>UPI ID: edulearn@paytm</span>
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 500, marginTop: '0.5rem' }}>
                    Expires in: {Math.floor(paymentTimer / 60)}:{(paymentTimer % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}

            {/* Card Payment view */}
            {paymentMethod === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input type="text" placeholder="John Doe" className="glass-input" defaultValue={user?.name} />
                </div>
                <div className="form-group">
                  <label>Card Number</label>
                  <input type="text" placeholder="4111 2222 3333 4444" className="glass-input" maxLength="19" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" className="glass-input" maxLength="5" />
                  </div>
                  <div className="form-group">
                    <label>CVV Code</label>
                    <input type="password" placeholder="•••" className="glass-input" maxLength="3" />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="btn btn-secondary" 
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmEnrollment}
                disabled={enrolling}
                className="btn btn-primary" 
                style={{ flex: 2 }}
              >
                {enrolling ? 'Verifying payment...' : 'Simulate Success Scan'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Courses;
