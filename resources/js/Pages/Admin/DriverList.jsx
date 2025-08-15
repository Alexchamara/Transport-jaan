import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

function handleApprove(id) {
    if (confirm('Are you sure you want to approve this driver?')) {
        router.post(`/driver/${id}/approve`);
    }
}

function handleReject(id) {
    if (confirm('Are you sure you want to reject this driver?')) {
        router.post(`/driver/${id}/reject`);
    }
}

function handleSuspend(id) {
    if (confirm('Are you sure you want to suspend this driver?')) {
        router.post(`/driver/${id}/suspend`);
    }
}

function handleBan(id) {
    if (confirm('Are you sure you want to permanently ban this driver?')) {
        router.post(`/driver/${id}/ban`);
    }
}

function handleReactivate(id) {
    if (confirm('Are you sure you want to reactivate this driver?')) {
        router.post(`/driver/${id}/reactivate`);
    }
}

export default function DriverList({ driver_lists }) {
    const [filter, setFilter] = useState('all');

    const filteredDrivers = driver_lists.filter(driver => {
        if (filter === 'all') return true;
        return driver.status === filter;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Driver List" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Driver List</h2>

                        <div className="flex gap-2">
                            {['all', 'pending', 'accepted', 'rejected', 'suspended', 'banned'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded ${
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
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="px-4 py-2 border">#</th>
                                    <th className="px-4 py-2 border">Name</th>
                                    <th className="px-4 py-2 border">Email</th>
                                    <th className="px-4 py-2 border">Phone</th>
                                    <th className="px-4 py-2 border">NIC</th>
                                    <th className="px-4 py-2 border">License</th>
                                    <th className="px-4 py-2 border">Police Clearance</th>
                                    <th className="px-4 py-2 border">Certifications</th>
                                    <th className="px-4 py-2 border">Status</th>
                                    <th className="px-4 py-2 border">Actions</th>
                                </tr>
                            </thead>
                          <tbody>
                            {filteredDrivers.length > 0 ? (
                                filteredDrivers.map((driver, index) => (
                                    <tr key={driver.id} className="border-t">
                                        <td className="px-4 py-2 border">{index + 1}</td>
                                        <td className="px-4 py-2 border">{driver.user?.name ?? 'N/A'}</td>
                                        <td className="px-4 py-2 border">{driver.user?.email ?? 'N/A'}</td>
                                        <td className="px-4 py-2 border">{driver.user?.phone ?? 'N/A'}</td>
                                        <td className="px-4 py-2 border">
                                            <a href={`/storage/${driver.nic_path}`} target="_blank" className="text-blue-600 underline">
                                                <FontAwesomeIcon icon={faFilePdf} />
                                            </a>
                                        </td>
                                        <td className="px-4 py-2 border">
                                            <a href={`/storage/${driver.license_path}`} target="_blank" className="text-blue-600 underline">
                                                <FontAwesomeIcon icon={faFilePdf} />
                                            </a>
                                        </td>
                                        <td className="px-4 py-2 border">
                                            <a href={`/storage/${driver.police_clearance_path}`} target="_blank" className="text-blue-600 underline">
                                                <FontAwesomeIcon icon={faFilePdf} />
                                            </a>
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {driver.certifications ? (
                                                <a href={`/storage/${driver.certifications}`} target="_blank" className="text-blue-600 underline">
                                                    <FontAwesomeIcon icon={faFilePdf} />
                                                </a>
                                            ) : (
                                                'Not Available'
                                            )}
                                        </td>
                                        <td className={`px-4 py-2 border capitalize ${
                                            driver.status === 'accepted' ? 'text-green-600' : 
                                            driver.status === 'rejected' ? 'text-red-600' : 
                                            driver.status === 'suspended' ? 'text-orange-600 font-semibold' : 
                                            driver.status === 'banned' ? 'text-gray-800 font-semibold' : 
                                            'text-yellow-600'
                                        }`}>
                                            {driver.status}
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {driver.status === 'pending' ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleApprove(driver.id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                                                        Approve
                                                    </button>
                                                    <button onClick={() => handleReject(driver.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : driver.status === 'accepted' ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleSuspend(driver.id)} className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600">
                                                        Suspend
                                                    </button>
                                                    <button onClick={() => handleBan(driver.id)} className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-900">
                                                        Ban
                                                    </button>
                                                </div>
                                            ) : (driver.status === 'suspended' || driver.status === 'banned') ? (
                                                <button onClick={() => handleReactivate(driver.id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                                                    Reactivate
                                                </button>
                                            ) : (
                                                <span className="font-semibold text-red-600">
                                                    {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center text-gray-500 py-6">
                                        No drivers found for selected filter.
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