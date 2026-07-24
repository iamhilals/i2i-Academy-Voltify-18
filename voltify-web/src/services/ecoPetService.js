import API from './api';

export const ecoPetService = {
  async getPet() {
    const response = await API.get('/api/eco-pet');
    return response.data;
  },

  async feedPet() {
    const response = await API.post('/api/eco-pet/feed');
    return response.data;
  },

  async renamePet(newName) {
    const response = await API.post(`/api/eco-pet/rename?name=${encodeURIComponent(newName)}`);
    return response.data;
  }
};
