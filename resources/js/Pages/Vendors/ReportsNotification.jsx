import { usePage } from '@inertiajs/react';
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  FaBullhorn,
  FaBell,
  FaChartBar,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClipboardList,
} from 'react-icons/fa';

export default function ReportsNotification() {
  const { props } = usePage();
  const successMessage = props.flash?.success;

  const notifications = props.notifications || []; // Replace with real data
  const stats = props.stats || {
    totalBookings: 120,
    totalEarnings: 'LKR 1,234,000',
    cancelledBookings: 8,
    activePromotions: 3,
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-500 to-gray-700 py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Header */}
          <div className="bg-white shadow-xl rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <FaBullhorn className="text-indigo-500 text-4xl" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                Reports & Notifications
              </h1>
            </div>
          </div>

          {/* Flash Message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow">
              ✅ {successMessage}
            </div>
          )}

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<FaClipboardList />} label="Total Bookings" value={stats.totalBookings} />
            <StatCard icon={<FaMoneyBillWave />} label="Total Earnings" value={stats.totalEarnings} />
            <StatCard icon={<FaCalendarAlt />} label="Cancelled Bookings" value={stats.cancelledBookings} />
            <StatCard icon={<FaChartBar />} label="Active Promotions" value={stats.activePromotions} />
          </div>

          {/* Chart Area Placeholder */}
          <div className="bg-white rounded-3xl shadow p-6 text-center text-gray-600">
            📊 <strong>Reports</strong> with charts coming soon! You'll be able to visualize earnings, bookings, and vehicle performance.
          </div>

          {/* Notifications Feed */}
          <div className="bg-white rounded-3xl shadow p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaBell className="text-yellow-500" />
              Recent Notifications
            </h2>
            {notifications.length > 0 ? (
              <ul className="space-y-3">
                {notifications.map((notification, index) => (
                  <li
                    key={index}
                    className="bg-gray-100 hover:bg-gray-200 transition p-4 rounded-xl shadow flex justify-between items-center"
                  >
                    <span className="text-gray-700">{notification.message}</span>
                    <span className="text-sm text-gray-500">{notification.date}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No recent notifications available.</p>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

// 📦 StatCard Component
function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4 hover:shadow-lg transition">
      <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h3 className="text-xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );
}
