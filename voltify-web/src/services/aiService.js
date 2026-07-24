import API from './api';

export const aiService = {
  async sendMessage(message) {
    const response = await API.post('/api/ai/chat', { message });
    return response.data;
  }
};
