import React, { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CourseContext } from '../context/CourseContext';
import { BookOpen, Users, Award, PlayCircle, Code, ArrowRight } from 'lucide-react';
import Loader from '../components/common/Loader';

const Home = () => {
  const { courses, fetchCourses, loading } = useContext(CourseContext);

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
      
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '5rem 1rem 3rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          width: '300px',
          height: '300px',
          background: 'rgba(99, 102, 241, 0.15)',
          filter: 'blur(100px)',
          borderRadius: '50%',
          zIndex: -1
        }} />

        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          lineHeight: '1.15',
          maxWidth: '800px',
          background: 'linear-gradient(135deg, #ffffff, #9ca3af, #6366f1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          University-Grade Education, <br />
          <span style={{ background: 'linear-gradient(135deg, #6366f1, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Elevated Online.</span>
        </h1>
        
        <p style={{ fontSize: '1.2rem', color: '#9ca3af', maxWidth: '600px', lineHeight: '1.6' }}>
          Welcome to EduLearn, a comprehensive university-grade Learning Management System powered by MERN and real-time assessments.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link to="/courses" className="btn btn-primary" style={{ padding: '0.8rem 2rem', borderRadius: '50px' }}>
            Browse Courses <ArrowRight size={18} />
          </Link>
          <Link to="/about" className="btn btn-secondary" style={{ padding: '0.8rem 2rem', borderRadius: '50px' }}>
            Learn More
          </Link>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon"><BookOpen size={24} /></div>
          <div className="stat-info">
            <h3>25+</h3>
            <p>Structured Courses</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-info">
            <h3>4.8K+</h3>
            <p>Active Students</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><Code size={24} /></div>
          <div className="stat-info">
            <h3>150+</h3>
            <p>Coding Sandbox Tasks</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><Award size={24} /></div>
          <div className="stat-info">
            <h3>3.2K+</h3>
            <p>Certificates Issued</p>
          </div>
        </div>
      </section>

      {/* Course Highlights */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem' }}>Popular Courses</h2>
            <p style={{ color: '#9ca3af' }}>Start learning from expert professors today</p>
          </div>
          <Link to="/courses" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid-3">
            {courses.slice(0, 3).map((course) => (
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
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Duration: {course.duration}h</span>
                  <Link to={`/courses/${course._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>View Course</Link>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No courses currently available. Register an evaluator to publish courses!</p>
            )}
          </div>
        )}
      </section>

      {/* Platform Features Section */}
      <section className="glass-card" style={{ padding: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '2rem' }}>State-Of-The-Art Learning Tools</h2>
          <p>EduLearn features built-in sandboxes, quizzes, and live classrooms to make online university education active and engaging.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', color: '#6366f1' }}><Code size={20} /></div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Interactive Coding Sandbox</h4>
                <p style={{ fontSize: '0.85rem' }}>Write, run, and auto-evaluate Javascript tasks directly in the Monaco code editor.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', color: '#fbbf24' }}><Award size={20} /></div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Cryptographic Credentials</h4>
                <p style={{ fontSize: '0.85rem' }}>Achieve 100% video completion to automatically generate secure PDF completion certificates.</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          height: '320px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(245,158,11,0.08))',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          textAlign: 'center',
          gap: '1rem'
        }}>
          <h3 style={{ color: '#fbbf24' }}>Curriculum Ecosystem</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '300px' }}>Course modules breakdown with sequential video lectures, automated MCQs, PDF attachments, and active discussion boards.</p>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', position: 'relative', marginTop: '1rem' }}>
            <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #6366f1, #fbbf24)', borderRadius: '10px' }} />
            <span style={{ position: 'absolute', right: '25%', top: '-25px', fontSize: '0.75rem', color: '#818cf8', fontWeight: 700 }}>75% Completed</span>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
