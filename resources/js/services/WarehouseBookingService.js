import axios from 'axios';

const API_BASE_URL = '/vendors/warehouse/api';

// Axios instance with CSRF and common headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Attach CSRF token for Laravel
api.interceptors.request.use((config) => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (token) {
    config.headers['X-CSRF-TOKEN'] = token;
  }
  return config;
});

class WarehouseBookingService {
  // Vendor bookings list (supports optional filters)
  async getBookings(filters = {}) {
    const { data } = await api.get('/bookings', { params: filters });
    return data;
  }

  // Booking statistics for vendor dashboard
  async getBookingStats() {
    const { data } = await api.get('/bookings/stats');
    return data;
  }

  // Single booking details
  async getBookingDetails(bookingId) {
    const { data } = await api.get(`/bookings/${bookingId}`);
    return data;
  }

  // Update booking (e.g., dates, notes)
  async updateBooking(bookingId, updates) {
    const { data } = await api.put(`/bookings/${bookingId}`, updates);
    return data;
  }

  // Approve a pending booking
  async approveBooking(bookingId) {
    const { data } = await api.patch(`/bookings/${bookingId}/approve`);
    return data;
  }

  // Reject a pending booking with reason
  async rejectBooking(bookingId, rejectionReason) {
    const { data } = await api.patch(`/bookings/${bookingId}/reject`, {
      rejection_reason: rejectionReason,
    });
    return data;
  }

  // Mark booking as complete
  async completeBooking(bookingId) {
    const { data } = await api.patch(`/bookings/${bookingId}/complete`);
    return data;
  }

  // Utility: presentational formatting for UI components
  formatBookingForDisplay(booking) {
    const paymentStatusColors = {
      Paid: { color: '#3B8F31', bg: '#ACE199' },
      Pending: { color: '#B45309', bg: '#FDE68A' },
      Unpaid: { color: '#DC2626', bg: '#FECACA' },
    };

    const statusColors = {
      pending: { bg: '#FFA500', text: '#FFFFFF' },
      confirmed: { bg: '#3B8F31', text: '#FFFFFF' },
      active: { bg: '#FFCD29', text: '#000000' },
      completed: { bg: '#28A745', text: '#FFFFFF' },
      cancelled: { bg: '#DC3545', text: '#FFFFFF' },
    };

    const payment = booking.paymentStatus || booking.payment_status || 'Unpaid';
    const status = booking.status || 'pending';

    return {
      ...booking,
      paymentStatusColor: paymentStatusColors[payment]?.color || '#6B7280',
      paymentStatusBg: paymentStatusColors[payment]?.bg || '#E5E7EB',
      statusBg: statusColors[status]?.bg || '#6C757D',
      statusText: statusColors[status]?.text || '#FFFFFF',
    };
  }
}

export default new WarehouseBookingService();