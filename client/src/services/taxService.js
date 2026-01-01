import api from './authService';

export const taxService = {
  // Save calculation scenario
  saveCalculation: async (data) => {
    const response = await api.post('/tax/calculate', data);
    return response.data;
  },

  // Get calculation history
  getHistory: async () => {
    const response = await api.get('/tax/my-returns');
    return response.data;
  },

  uploadForm16: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/tax/upload-form16', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
  }
};
