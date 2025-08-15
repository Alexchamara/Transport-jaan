import { usePage } from '@inertiajs/react';
import { Car, Clock, User2, UserCheck, Wallet, Filter, Download, Eye, CheckCircle, XCircle, Calendar, MapPin, Phone, Mail, User } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CalendarView from './CalendarView';

export default function BookingManagement() {
  const { props } = usePage();
  const { bookingDetails, stats, flash } = props;
  const successMessage = flash?.success;
  const [activeTab, setActiveTab] = useState('all');

  // State for managing bookings locally
  const [bookings, setBookings] = useState(bookingDetails.data || []);

  // Filter bookings based on status
  const filteredBookings = useMemo(() => {
    switch (activeTab) {
      case 'accepted':
        return bookings.filter(booking => booking.status === 'Accepted' || booking.status === 'Confirmed');
      case 'cancelled':
        return bookings.filter(booking => booking.status === 'Cancelled');
      case 'pending':
        return bookings.filter(booking => booking.status === 'Pending' || !booking.status);
      default:
        return bookings;
    }
  }, [bookings, activeTab]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`/vendor/booking/${bookingId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking.id === bookingId ? { ...booking, status: newStatus } : booking
          )
        );

        // Show success notification
        alert(`Booking ${newStatus.toLowerCase()} successfully!`);
      } else {
        throw new Error('Failed to update booking status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      alert(`Failed to ${newStatus.toLowerCase()} booking.`);
    }
  };

  const tabCounts = useMemo(() => ({
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'Pending' || !b.status).length,
    accepted: bookings.filter(b => b.status === 'Accepted' || b.status === 'Confirmed').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled').length,
  }), [bookings]);

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 px-4">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}

        <a href="/vendor/dashboard" className="mb-6">
            <button>
                <div className="flex items-center justify-between mb-6 text-gray-800 font-semibold text-lg">
                    <h2> ⬅️ Back</h2>
                </div>
            </button>
          </a>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Management</h1>
              <p className="text-gray-600">Manage and track all your vehicle bookings</p>
            </div>
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg shadow-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {successMessage}
              </div>
            )}
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard
              icon={<UserCheck className="w-6 h-6" />}
              label="Active Drivers"
              value={stats.activeDrivers}
              gradient="from-blue-500 to-blue-600"
            />
            <StatCard
              icon={<User2 className="w-6 h-6" />}
              label="Active Customers"
              value={stats.activeCustomers}
              gradient="from-purple-500 to-purple-600"
            />
            <StatCard
              icon={<Car className="w-6 h-6" />}
              label="Active Bookings"
              value={stats.activeBookings}
              gradient="from-green-500 to-green-600"
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              label="Ongoing Trips"
              value={stats.ongoingTrips}
              gradient="from-orange-500 to-orange-600"
            />
            <StatCard
              icon={<Wallet className="w-6 h-6" />}
              label="Total Earnings"
              value={`LKR ${stats.totalEarnings.toLocaleString()}`}
              gradient="from-emerald-500 to-emerald-600"
            />
          </div>

          {/* Booking Tables Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Vehicle Bookings</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.open('/vendor/booking-report-download', '_blank')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Export Report
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'all', label: 'All Bookings', count: tabCounts.all },
                  { id: 'pending', label: 'Pending', count: tabCounts.pending },
                  { id: 'accepted', label: 'Accepted', count: tabCounts.accepted },
                  { id: 'cancelled', label: 'Cancelled', count: tabCounts.cancelled },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Table Content */}
            <div className="p-6">
              <BookingsTable
                bookings={filteredBookings}
                onStatusChange={handleStatusChange}
                showActions={activeTab === 'all' || activeTab === 'pending'}
              />
            </div>
          </div>

          {/* Calendar and Reports Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar View */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Calendar View
                </h2>
              </div>
              <div className="p-6">
                <CalendarView />
              </div>
            </div>

            {/* Reports Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
                <h2 className="text-xl font-bold text-gray-900">Analytics & Reports</h2>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-600">
                  Monitor performance, track trip statuses, and generate comprehensive reports.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Revenue Tracking</h3>
                    <p className="text-blue-700 text-sm">Monitor daily, weekly, and monthly earnings</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Performance Metrics</h3>
                    <p className="text-green-700 text-sm">Track booking success rates and trends</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

// Enhanced StatCard Component
const StatCard = ({ icon, label, value, gradient }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-r ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  </div>
);

// Enhanced Status Badge
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Confirmed: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-400' },
    Accepted: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-400' },
    Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
    Completed: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-400' },
    Cancelled: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-400' },
  };

  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-400' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {status || 'Pending'}
    </span>
  );
};

// Enhanced Bookings Table
const BookingsTable = ({ bookings, onStatusChange, showActions = true }) => {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No bookings found</p>
        <p className="text-gray-400 text-sm">Bookings will appear here once customers make reservations</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip Details</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            {showActions && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.first_name} {booking.last_name}
                    </div>
                    <div className="text-sm text-gray-500">ID: #{booking.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 flex items-center gap-1 mb-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {booking.email}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {booking.phone}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Car className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    {booking.vehicle?.model || 'N/A'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 mb-2">
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="font-medium">From:</span> {booking.pickup_location}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="font-medium">To:</span> {booking.dropoff_location}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {booking.pickup_date} → {booking.dropoff_date}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={booking.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-bold text-green-600">
                  {booking.total_amount ? `LKR ${booking.total_amount.toLocaleString()}` : 'LKR 0'}
                </div>
              </td>
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onStatusChange(booking.id, 'Accepted')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Accept
                    </button>
                    <button
                      onClick={() => onStatusChange(booking.id, 'Cancelled')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <XCircle className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
