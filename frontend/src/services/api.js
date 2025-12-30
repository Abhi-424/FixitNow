import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      // Assuming the user object has a token field (adjust as needed)
      if (parsedUser.token) {
        config.headers.Authorization = `Bearer ${parsedUser.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        console.error('Unauthorized access. Please login again.');
        // Optionally redirect to login or clear storage
        // localStorage.removeItem('user');
        // window.location.href = '/login';
      } else if (status === 403) {
        console.error('Access forbidden.');
      } else if (status === 500) {
        console.error('Internal server error.');
      }
    } else {
        console.error('Network error or server unreachable.');
    }
    return Promise.reject(error);
  }
);

export default api;
