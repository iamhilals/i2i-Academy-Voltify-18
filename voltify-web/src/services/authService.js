import API from './api';

export const authService = {
  async login(usernameOrEmail, password) {
    const response = await API.post('/api/auth/login', { 
      identifier: usernameOrEmail, 
      username: usernameOrEmail, 
      email: usernameOrEmail, 
      password 
    });
    if (response.data && response.data.token) {
      localStorage.setItem('voltify_token', response.data.token);
      const data = response.data;
      const existingUser = JSON.parse(localStorage.getItem('voltify_user') || '{}');
      const uname = data.username || usernameOrEmail || 'sude';
      localStorage.setItem('voltify_user', JSON.stringify({
        ...existingUser,
        username: uname,
        email: data.email || existingUser.email || `${uname}@voltify.com`,
        firstName: data.firstName || existingUser.firstName || '',
        lastName: data.lastName || existingUser.lastName || '',
        fullName: data.fullName || (data.firstName ? `${data.firstName} ${data.lastName}` : (existingUser.fullName || uname)),
        phone: data.phoneNumber || data.phone || existingUser.phone || '0532 100 20 30',
        role: data.role || existingUser.role || 'USER',
      }));
      window.dispatchEvent(new Event('voltify_user_updated'));
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
