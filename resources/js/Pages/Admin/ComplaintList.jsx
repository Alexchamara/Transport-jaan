import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function ComplaintList({ complaints, currentFilter }) {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        investigating: 'bg-blue-100 text-blue-800',
        resolved: 'bg-green-100 text-green-800',
        dismissed: 'bg-gray-100 text-gray-800'
    };

    return (
        <AuthenticatedLayout>
            <Head title="Driver Complaints" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Driver Complaints</h2>

                        <div className="flex gap-2">
                            {['all', 'pending', 'investigating', 'resolved', 'dismissed'].map(status => (
                                <Link
                                    key={status}
                                    href={`/complaints?status=${status}`}
                                    className={`px-4 py-2 rounded ${
                                        currentFilter === status
                                            ? status === 'pending'
                                                ? 'bg-yellow-500 text-white'
                                                : status === 'investigating'
                                                ? 'bg-blue-500 text-white'
                                                : status === 'resolved'
                                                ? 'bg-green-600 text-white'
                                                : status === 'dismissed'
                                                ? 'bg-gray-600 text-white'
                                                : 'bg-blue-600 text-white'
                                            : 'bg-gray-200'
                                    }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="px-4 py-2 border">ID</th>
                                    <th className="px-4 py-2 border">Date</th>
                                    <th className="px-4 py-2 border">Complainant</th>
                                    <th className="px-4 py-2 border">Driver</th>
                                    <th className="px-4 py-2 border">Subject</th>
                                    <th className="px-4 py-2 border">Status</th>
                                    <th className="px-4 py-2 border">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.length > 0 ? (
                                    complaints.map(complaint => (
                                        <tr key={complaint.id} className="border-t">
                                            <td className="px-4 py-2 border">{complaint.id}</td>
                                            <td className="px-4 py-2 border">
                                                {new Date(complaint.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2 border">{complaint.user?.name ?? 'N/A'}</td>
                                            <td className="px-4 py-2 border">{complaint.driver?.user?.name ?? 'N/A'}</td>
                                            <td className="px-4 py-2 border">{complaint.subject}</td>
                                            <td className="px-4 py-2 border">
                                                <span className={`px-2 py-1 rounded-full text-xs ${statusColors[complaint.status]}`}>
                                                    {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 border">
                                                <Link 
                                                    href={`/complaints/${complaint.id}`} 
                                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center text-gray-500 py-6">
                                            No complaints found for selected filter.
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