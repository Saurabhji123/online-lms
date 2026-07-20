import React, { createContext, useState } from 'react';
import apiCall from '../services/api';

export const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all courses
  const fetchCourses = async (search = '') => {
    setLoading(true);
    const endpoint = search ? `/courses?search=${encodeURIComponent(search)}` : '/courses';
    const res = await apiCall(endpoint);
    if (res.success) {
      setCourses(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  // Fetch single course details including curriculum (modules + lectures)
  const fetchCourseDetails = async (id) => {
    setLoading(true);
    setError(null);
    const res = await apiCall(`/courses/${id}`);
    if (res.success) {
      setCurrentCourse(res.data.course);
      setCurriculum(res.data.curriculum);
      setLoading(false);
      return res.data;
    } else {
      setError(res.error);
      setLoading(false);
      return null;
    }
  };

  // Enroll in a course
  const enrollInCourse = async (courseId, paymentId = '') => {
    setLoading(true);
    const res = await apiCall('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId, paymentId })
    });
    setLoading(false);
    return res;
  };

  // Mark lecture as completed
  const completeLecture = async (courseId, lectureId) => {
    const res = await apiCall(`/enrollments/course/${courseId}/lecture/${lectureId}`, {
      method: 'POST'
    });
    return res;
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        currentCourse,
        curriculum,
        loading,
        error,
        fetchCourses,
        fetchCourseDetails,
        enrollInCourse,
        completeLecture,
        setCourses
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};
