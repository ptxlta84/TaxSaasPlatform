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

  // Create or Get Draft ITR
  startFiling: async (financialYear) => {
    const response = await api.post('/itr/start', { financialYear });
    return response.data;
  },

  // Generic Document Upload (Cloudinary)
  uploadDocument: async (itrId, file, category) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('category', category);

    const response = await api.post(`/itr/${itrId}/document`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
  },

  uploadForm16: async (file) => {
    const formData = new FormData();
    formData.append('file', file); // Matches backend 'upload.single("file")'

    const response = await api.post('/tax/upload-form16', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
  },

  // Get current income details (for state hydration)
  getIncomeDetails: async () => {
      const response = await api.get('/income/details');
      return response.data;
  },

  // Reset/Clear Data
  resetData: async () => {
    const response = await api.delete('/tax/reset');
    return response.data;
  }
};
