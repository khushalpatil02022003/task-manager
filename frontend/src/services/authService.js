import api from '../api/axios';

const authService = {
  // Register a new user
  register: async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data; // Expects { success, token, data }
  },

  // Login an existing user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // Expects { success, token, data }
  }
};

export default authService;
