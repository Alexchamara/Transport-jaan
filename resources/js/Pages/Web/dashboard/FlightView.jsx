import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const FlightView = ({ auth, flights }) => {
  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="My Flight Details" />

      <div className="max-w-6xl mx-auto mt-10 bg-white p-6 shadow rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Flight Details</h1>

        {Array.isArray(flights) && flights.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm text-left text-gray-600">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">#</th>
                  <th className="px-4 py-2 border">User</th>
                  <th className="px-4 py-2 border">Airline</th>
                  <th className="px-4 py-2 border">Class</th>
                  <th className="px-4 py-2 border">Price (LKR)</th>
                  <th className="px-4 py-2 border">Departure</th>
                  <th className="px-4 py-2 border">Arrival</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((f, index) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{index + 1}</td>
                    <td className="px-4 py-2 border">{f.user?.name ?? 'N/A'}</td>
                    <td className="px-4 py-2 border">{f.airline}</td>
                    <td className="px-4 py-2 border">{f.class}</td>
                    <td className="px-4 py-2 border">{parseFloat(f.price).toLocaleString()}</td>
                    <td className="px-4 py-2 border">{f.departure_time}</td>
                    <td className="px-4 py-2 border">{f.arrival_time ?? 'N/A'}</td>
                    <td className="px-4 py-2 border">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          f.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : f.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">No flight data found for your account.</p>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default FlightView;
