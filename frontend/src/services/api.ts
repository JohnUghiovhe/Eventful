import axios from 'axios';

// Use the Vite proxy in development, full URL in production
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? '/api' : 'https://eventful-api.onrender.com/api');

console.log('API Configuration:', {
  mode: import.meta.env.DEV ? 'development' : 'production',
  API_URL,
  VITE_API_URL: import.meta.env.VITE_API_URL
});

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request:', { method: config.method, url: config.url, baseURL: config.baseURL });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('Response:', { status: response.status, url: response.config.url });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url,
      error: error.message
    });
    
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isPublicVerify = requestUrl.includes('/payments/verify-public');

      if (!isPublicVerify) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
