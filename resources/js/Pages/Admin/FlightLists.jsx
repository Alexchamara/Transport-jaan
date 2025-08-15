import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function FlightLists({ flights, pendingComplaints, totalComplaints }) {
    const [filter, setFilter] = useState('all');

    const filteredFlights = flights.filter(flight => {
        if (filter === 'all') return true;
        return flight.status === filter;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Flight Search List" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">

                    <div className="mb-6">
                        <h2 className="text-xl font-bold">Flight Search List</h2>
                        <p className="text-sm text-gray-600">Pending: {pendingComplaints} | Total: {totalComplaints}</p>
                    </div>

                    <div className="flex gap-2 mb-4">
                        {['all', 'pending', 'accepted', 'rejected', 'suspended', 'banned'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded capitalize ${
                                    filter === status
                                        ? status === 'accepted'
                                            ? 'bg-green-600 text-white'
                                            : status === 'rejected'
                                            ? 'bg-red-600 text-white'
                                            : status === 'pending'
                                            ? 'bg-yellow-500 text-white'
                                            : status === 'suspended'
                                            ? 'bg-orange-500 text-white'
                                            : status === 'banned'
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-blue-600 text-white'
                                        : 'bg-gray-200'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 border">#</th>
                                    <th className="px-4 py-2 border">Source</th>
                                    <th className="px-4 py-2 border">Destination</th>
                                    <th className="px-4 py-2 border">Travel Date</th>
                                    <th className="px-4 py-2 border">Passengers</th>
                                    <th className="px-4 py-2 border">Status</th>
                                   
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFlights.length > 0 ? (
                                    filteredFlights.map((flight, index) => (
                                        <tr key={flight.id} className="border-t">
                                            <td className="px-4 py-2 border">{index + 1}</td>
                                            <td className="px-4 py-2 border">{flight.source}</td>
                                            <td className="px-4 py-2 border">{flight.destination}</td>
                                            <td className="px-4 py-2 border">{flight.travel_date}</td>
                                            <td className="px-4 py-2 border">{flight.passenger_count}</td>
                                            <td className={`px-4 py-2 border capitalize ${
                                                flight.status === 'accepted' ? 'text-green-600' :
                                                flight.status === 'rejected' ? 'text-red-600' :
                                                flight.status === 'suspended' ? 'text-orange-600 font-semibold' :
                                                flight.status === 'banned' ? 'text-gray-800 font-semibold' :
                                                'text-yellow-600'
                                            }`}>
                                                {flight.status}
                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center text-gray-500 py-6">
                                            No flights found for selected filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
