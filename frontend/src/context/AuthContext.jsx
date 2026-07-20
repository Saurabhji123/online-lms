import React, { createContext, useState, useEffect } from 'react';
import apiCall from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await apiCall('/auth/me');
        if (res.success && res.data) {
          // Normalize user object so both id and _id are defined
          const normalized = {
            ...res.data,
            id: res.data._id || res.data.id,
            _id: res.data._id || res.data.id
          };
          setUser(normalized);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  // Login User
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    const res = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (res.success) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      
      const normalized = {
        ...res.user,
        id: res.user.id || res.user._id,
        _id: res.user.id || res.user._id
      };
      
      setUser(normalized);
      setLoading(false);
      return { success: true };
    } else {
      setError(res.error);
      setLoading(false);
      return { success: false, error: res.error };
    }
  };

  // Register User
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    const res = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (res.success) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      
      const normalized = {
        ...res.user,
        id: res.user.id || res.user._id,
        _id: res.user.id || res.user._id
      };
      
      setUser(normalized);
      setLoading(false);
      return { success: true };
    } else {
      setError(res.error);
      setLoading(false);
      return { success: false, error: res.error };
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update profile details
  const updateProfile = async (formData) => {
    setError(null);
    const res = await apiCall('/auth/profile', {
      method: 'PUT',
      body: formData
    });

    if (res.success && res.data) {
      const normalized = {
        ...res.data,
        id: res.data._id || res.data.id,
        _id: res.data._id || res.data.id
      };
      setUser(normalized);
      return { success: true, data: normalized };
    } else {
      return { success: false, error: res.error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
