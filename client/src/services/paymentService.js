import api from './authService';

export const paymentService = {
    createOrder: async (plan, itrId) => {
        const response = await api.post('/payments/create-order', { plan, itrId });
        return response.data;
    },

    verifyPayment: async (data) => {
        const response = await api.post('/payments/verify', data);
        return response.data;
    }
};
