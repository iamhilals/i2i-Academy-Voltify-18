import API from './api';

export const homeService = {
  async getMyHomes() {
    const response = await API.get('/api/homes/my-homes');
    return response.data;
  },

  async registerHome(homeData) {
    const response = await API.post('/api/homes/register', homeData);
    return response.data;
  },

  async getHomeStatus(homeId) {
    const response = await API.get(`/api/homes/status/${homeId}`);
    return response.data;
  },

  async getHomeHistory(homeId) {
    const response = await API.get(`/api/homes/history/${homeId}`);
    return response.data;
  },

  async updateHome(homeId, updateData) {
    const response = await API.put(`/api/homes/${homeId}`, updateData);
    return response.data;
  },

  async deleteHome(homeId) {
    const response = await API.delete(`/api/homes/${homeId}`);
    return response.data;
  },

  async addAppliance(homeId, applianceData) {
    const response = await API.post(`/api/homes/${homeId}/appliances`, applianceData);
    return response.data;
  },

  async updateAppliance(homeId, applianceId, applianceData) {
    const response = await API.put(`/api/homes/${homeId}/appliances/${applianceId}`, applianceData);
    return response.data;
  },

  async deleteAppliance(homeId, applianceId) {
    const response = await API.delete(`/api/homes/${homeId}/appliances/${applianceId}`);
    return response.data;
  }
};
