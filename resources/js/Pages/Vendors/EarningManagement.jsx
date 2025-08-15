import { usePage } from '@inertiajs/react';
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function EarningManagement() {
  const { props } = usePage();
  const successMessage = props.flash?.success;

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-400 py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded w-full">
                ✅ {successMessage}
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-800">💰 Earnings & Payouts</h1>
          </div>

          {/* Earnings Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard title="Total Earnings" value="LKR 450,000.00" />
            <SummaryCard title="This Month's Earnings" value="LKR 340,000.00" />
            <SummaryCard title="Pending Payouts" value="LKR 120,000.00" />
            <SummaryCard title="Last Payout" value="2025-04-15" />
          </div>

          {/* Earnings Breakdown Table */}
          <Section title="📋 Earnings Breakdown">
            <table className="min-w-full table-auto border-collapse text-sm text-left text-gray-600">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Booking ID</th>
                  <th className="px-4 py-2">Vehicle</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr className="border-b">
                  <td className="px-4 py-2">1</td>
                  <td className="px-4 py-2">BK001</td>
                  <td className="px-4 py-2">Toyota Voxy</td>
                  <td className="px-4 py-2">2025-05-23</td>
                  <td className="px-4 py-2">LKR 56,000.00</td>
                  <td className="px-4 py-2 text-yellow-600">Pending</td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Payout History */}
          <Section title="📄 Payout History">
            <table className="min-w-full table-auto border-collapse text-sm text-left text-gray-600">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Method</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr className="border-b">
                  <td className="px-4 py-2">1</td>
                  <td className="px-4 py-2">2025-04-15</td>
                  <td className="px-4 py-2">LKR 40,000.00</td>
                  <td className="px-4 py-2">Bank Transfer</td>
                  <td className="px-4 py-2 text-green-600">Completed</td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Request Payout */}
          <Section title="📤 Request Payout">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  className="w-full mt-1 border rounded px-4 py-2 text-gray-800"
                  placeholder="Enter amount to withdraw"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Bank Account</label>
                <select className="w-full mt-1 border rounded px-4 py-2 text-gray-800">
                  <option>BOC - 123456789</option>
                  <option>Commercial Bank - 987654321</option>
                </select>
              </div>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition">
                Submit Request
              </button>
            </form>
          </Section>

          {/* Bank Account Info */}
          <Section title="🏦 Linked Bank Account">
            <table className="min-w-full table-auto text-sm text-left text-gray-600">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Bank</th>
                  <th className="px-4 py-2">Account Holder</th>
                  <th className="px-4 py-2">Account No.</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr className="border-b">
                  <td className="px-4 py-2">BOC</td>
                  <td className="px-4 py-2">Sample User</td>
                  <td className="px-4 py-2">123456789</td>
                  <td className="px-4 py-2">
                    <button className="text-blue-600 hover:underline">Edit</button>
                    <span className="mx-2">|</span>
                    <button className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}

// Reusable Summary Card
const SummaryCard = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow p-5">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
  </div>
);

// Reusable Section Wrapper
const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow p-6 space-y-4">
    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    {children}
  </div>
);
