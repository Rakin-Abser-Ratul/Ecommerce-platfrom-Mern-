import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/', // Matches FastAPI prefix
});

// Request Interceptor: Attach JWT Bearer Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Redirect or emit event if necessary
    }
    return Promise.reject(error);
  }
);

export default API;