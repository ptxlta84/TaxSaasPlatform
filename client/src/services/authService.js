import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for sending cookies
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    // We now only store the short-lived access token in memory (or localStorage for simplicity in this phase, 
    // ideally strictly memory for max security, but localStorage is acceptable for MVP if HttpOnly refresh token is used)
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for refreshing token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loops
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;

      try {
        const res = await api.post('/auth/refresh');
        if (res.data.accessToken) {
          localStorage.setItem('accessToken', res.data.accessToken);
          api.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.accessToken;
          originalRequest.headers['Authorization'] = 'Bearer ' + res.data.accessToken;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        authService.logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user)); 
    }
    return response.data;
  },

  sendOTP: async (mobile) => {
    const response = await api.post('/auth/otp/send', { mobile });
    return response.data;
  },

  verifyOTP: async (mobile, otp) => {
    const response = await api.post('/auth/otp/verify', { mobile, otp });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      // Redirect to login optional here, usually handled by component state
      window.location.href = '/login'; 
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default api;
