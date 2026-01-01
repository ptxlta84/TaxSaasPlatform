import api from './authService';

export const itrService = {
  
  // Start or resume filing
  startFiling: async (financialYear) => {
    const response = await api.post('/itr/start', { financialYear });
    return response.data;
  },

  // Save Progress (Generic update)
  updateITR: async (id, data) => {
    const response = await api.put(`/itr/${id}`, data);
    return response.data;
  },

  // Calculate Tax
  calculateTax: async (id) => {
    const response = await api.post(`/itr/${id}/calculate`);
    return response.data;
  },

  // Final Submit
  submitITR: async (id) => {
    const response = await api.post(`/itr/${id}/submit`);
    return response.data;
  },

  // Get Visualization Summary
  getSummary: async (id) => {
    const response = await api.get(`/itr/${id}/summary`);
    return response.data;
  },

  // Download Report
  downloadReport: async (id, type) => {
    const response = await api.get(`/itr/${id}/export/${type}`, {
        responseType: 'blob'
    });
    
    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', type === 'pdf' ? `ITR_Report.pdf` : `ITR_Data.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
