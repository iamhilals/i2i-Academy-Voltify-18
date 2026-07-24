import API from './api';

export const authService = {
  async login(username, password) {
    const response = await API.post('/api/auth/login', { username, password });
    if (response.data && response.data.token) {
      localStorage.setItem('voltify_token', response.data.token);
      const existingUser = JSON.parse(localStorage.getItem('voltify_user') || '{}');
      localStorage.setItem('voltify_user', JSON.stringify({
        ...existingUser,
        username: response.data.username || username,
        email: response.data.email || existingUser.email || `${username}@voltify.com`,
        fullName: response.data.fullName || existingUser.fullName || username,
        phone: response.data.phone || existingUser.phone || '',
        role: response.data.role || 'USER',
      }));
    }
    return response.data;
  },

  async register(firstName, lastName, username, email, phoneNumber, password) {
    const response = await API.post('/api/auth/register', { firstName, lastName, username, email, phoneNumber, password });
    const fullName = `${firstName} ${lastName}`.trim();
    if (response.data && response.data.token) {
      localStorage.setItem('voltify_token', response.data.token);
      localStorage.setItem('voltify_user', JSON.stringify({
        username: response.data.username || username,
        fullName: fullName,
        firstName: firstName,
        lastName: lastName,
        email: response.data.email || email,
        phone: phoneNumber || '',
        role: response.data.role || 'USER',
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
