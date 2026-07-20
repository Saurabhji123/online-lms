import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import ExploreCourses from './pages/Courses';
import About from './pages/About';
import VerifyCertificate from './pages/VerifyCertificate';
import CalendarPage from './pages/CalendarPage';
import LiveClasses from './pages/LiveClasses';
import Assignments from './pages/Assignments';
import Quizzes from './pages/Quizzes';
import Discussions from './pages/Discussions';
import Progress from './pages/Progress';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';

// Student
import StudentDashboard from './components/student/Dashboard';
import MyCourses from './components/student/MyCourses';
import CoursePlayer from './components/student/CoursePlayer';
import Certificates from './components/student/Certificates';
import StudentProfile from './components/student/Profile';

// Instructor
import InstructorDashboard from './components/instructor/Dashboard';
import CourseManagement from './components/instructor/CourseManagement';
import InstructorStudents from './components/instructor/Students';
import InstructorAnalytics from './components/instructor/Analytics';
import InstructorAssignments from './components/instructor/Assignments';
import InstructorQuizzes from './components/instructor/Quizzes';

// Admin
import AdminDashboard from './components/admin/Dashboard';
import AdminUsers from './components/admin/Users';
import AdminCourses from './components/admin/Courses';
import AdminSettings from './components/admin/Settings';

import Loader from './components/common/Loader';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main Dashboard Router (resolves role to proper dashboard layout)
const DashboardRouter = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'instructor':
      return <InstructorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/courses" element={<ExploreCourses />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-certificate" element={<VerifyCertificate />} />
      <Route path="/verify-certificate/:certId" element={<VerifyCertificate />} />

      {/* General Dashboard Routing */}
      <Route path="/dashboard" element={<DashboardRouter />} />

      {/* Student Protected Routes */}
      <Route path="/my-courses" element={
        <ProtectedRoute allowedRoles={['student', 'admin']}><MyCourses /></ProtectedRoute>
      } />
      <Route path="/courses/play/:courseId" element={
        <ProtectedRoute allowedRoles={['student', 'admin']}><CoursePlayer /></ProtectedRoute>
      } />
      <Route path="/certificates" element={
        <ProtectedRoute allowedRoles={['student', 'admin']}><Certificates /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><StudentProfile /></ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}><CalendarPage /></ProtectedRoute>
      } />
      <Route path="/live-classes" element={
        <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}><LiveClasses /></ProtectedRoute>
      } />
      <Route path="/assignments" element={
        <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}><Assignments /></ProtectedRoute>
      } />
      <Route path="/quizzes" element={
        <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}><Quizzes /></ProtectedRoute>
      } />
      <Route path="/discussions" element={
        <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}><Discussions /></ProtectedRoute>
      } />
      <Route path="/progress" element={
        <ProtectedRoute allowedRoles={['student', 'admin']}><Progress /></ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}><Messages /></ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}><Notifications /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><StudentProfile /></ProtectedRoute>
      } />

      {/* Instructor Protected Routes */}
      <Route path="/course-management" element={
        <ProtectedRoute allowedRoles={['instructor', 'admin']}><CourseManagement /></ProtectedRoute>
      } />
      <Route path="/instructor-students" element={
        <ProtectedRoute allowedRoles={['instructor', 'admin']}><InstructorStudents /></ProtectedRoute>
      } />
      <Route path="/instructor-analytics" element={
        <ProtectedRoute allowedRoles={['instructor', 'admin']}><InstructorAnalytics /></ProtectedRoute>
      } />
      <Route path="/instructor-evaluations" element={
        <ProtectedRoute allowedRoles={['instructor', 'admin']}><InstructorAssignments /></ProtectedRoute>
      } />
      <Route path="/instructor-quiz-reports" element={
        <ProtectedRoute allowedRoles={['instructor', 'admin']}><InstructorQuizzes /></ProtectedRoute>
      } />

      {/* Admin Protected Routes */}
      <Route path="/admin-users" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>
      } />
      <Route path="/admin-courses" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminCourses /></ProtectedRoute>
      } />
      <Route path="/admin-settings" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
