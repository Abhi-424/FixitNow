import api from './api';

const authService = {
  // Login Function
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, token } = response.data;
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify({ ...user, token }));
      return { ...user, token };
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  },

  // Register Function
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data;
      
      localStorage.setItem('user', JSON.stringify({ ...user, token }));
      return { ...user, token };
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  // Logout Function
  logout: () => {
    localStorage.removeItem('user');
    // window.location.href = '/login'; // Optional: Redirect
  },

  // Get Current User
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
