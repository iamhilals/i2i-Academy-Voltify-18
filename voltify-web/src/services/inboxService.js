import API from './api';

export const inboxService = {
  // Penalty/anomali uyarılarını (e-posta olarak da gönderilen AI tavsiyeleri) getirir
  async getMessages() {
    const response = await API.get('/api/inbox');
    return response.data;
  },
};
