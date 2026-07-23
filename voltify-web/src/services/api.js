import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Outgoing request interceptor: add JWT Bearer token if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('voltify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 Unauthorized globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired auth data
      localStorage.removeItem('voltify_token');
      localStorage.removeItem('voltify_user');
    }
    return Promise.reject(error);
  }
);

export default API;
