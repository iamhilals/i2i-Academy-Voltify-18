import API from './api';

export const authService = {
  async login(username, password) {
    const response = await API.post('/api/auth/login', { username, password });
    if (response.data && response.data.token) {
      localStorage.setItem('voltify_token', response.data.token);
      localStorage.setItem('voltify_user', JSON.stringify({
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
      }));
    }
    return response.data;
  },

  async register(firstName, lastName, username, email, phoneNumber, password) {
    const response = await API.post('/api/auth/register', { firstName, lastName, username, email, phoneNumber, password });
    if (response.data && response.data.token) {
      localStorage.setItem('voltify_token', response.data.token);
      localStorage.setItem('voltify_user', JSON.stringify({
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
      }));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('voltify_token');
    localStorage.removeItem('voltify_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('voltify_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('voltify_token');
  }
};
