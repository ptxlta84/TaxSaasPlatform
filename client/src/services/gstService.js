import api from './authService';

export const gstService = {
  register: async (data) => {
    const response = await api.post('/gst/register', data);
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get('/gst/status');
    return response.data;
  },

  validateGSTIN: async (gstin) => {
    const response = await api.post('/gst/validate-gstin', { gstin });
    return response.data;
  }
};
