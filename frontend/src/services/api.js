const API_URL = '/api';

/**
 * Custom Fetch wrapper with JWT injection
 */
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData (multipart uploads)
  if (options.body instanceof FormData) {
    delete headers['Content-Type']; // Let browser set boundary automatically
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Check for auth failure
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Try parsing json
    let data;
    try {
      data = await response.json();
    } catch {
      data = { success: false, error: 'Could not parse response data' };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || response.statusText || 'API Call failed',
        status: response.status
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Network error occurred'
    };
  }
};

export default apiCall;
