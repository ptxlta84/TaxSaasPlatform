import api from './authService';

export const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings/create', bookingData);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  }
};
