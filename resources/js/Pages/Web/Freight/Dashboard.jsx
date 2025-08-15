import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import { router } from '@inertiajs/react';

const Dashboard = ({ auth, freightCompany, bookings }) => {

    const handleStatusUpdate = (bookingId, status) => {
        router.put(route('freight.bookings.updateStatus', { booking: bookingId }), { status });
    };

    if (freightCompany.status === 'pending') {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Freight Dashboard" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <div className="text-center">
                                    <h2 className="text-2xl font-semibold mb-4">Welcome, {freightCompany.business_name}</h2>
                                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                                        <p className="font-bold">Your registration is pending approval</p>
                                        <p>Please wait while our administrators review your application. We will notify you once your account has been approved.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (freightCompany.status === 'rejected') {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title="Freight Dashboard" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <div className="text-center">
                                    <h2 className="text-2xl font-semibold mb-4">Welcome, {freightCompany.business_name}</h2>
                                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                                        <p className="font-bold">Your registration has been rejected</p>
                                        <p>Please contact our support team for more information about the rejection.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Freight Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold">Welcome, {freightCompany.business_name}</h2>
                            <div className="flex items-center space-x-4">
                                {freightCompany.logo && (
                                    <img
                                        src={`/storage/${freightCompany.logo}`}
                                        alt="Company Logo"
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {/* Company Information Card */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold mb-4">Company Information</h3>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Business Type:</span> {freightCompany.business_type}</p>
                                    <p><span className="font-medium">Registration Number:</span> {freightCompany.registration_number}</p>
                                    <p><span className="font-medium">Location:</span> {freightCompany.location}</p>
                                    <p><span className="font-medium">Email:</span> {freightCompany.email}</p>
                                    <p><span className="font-medium">Phone:</span> {freightCompany.phone}</p>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-semibold mb-6">Freight Bookings</h2>

                        <div className="space-y-6">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="bg-gray-50 p-4 rounded-lg shadow">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <h3 className="font-semibold">Booking #{booking.id}</h3>
                                            <p className="text-sm text-gray-600">User: {booking.user.name}</p>
                                        </div>
                                        <div>
                                            <p><span className="font-semibold">Origin:</span> {booking.origin.address}</p>
                                            <p><span className="font-semibold">Destination:</span> {booking.destination.address}</p>
                                        </div>
                                        <div>
                                            <p><span className="font-semibold">Status:</span> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : booking.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{booking.status}</span></p>
                                            {booking.status === 'pending' && (
                                                <div className="mt-2 space-x-2">
                                                    <button onClick={() => handleStatusUpdate(booking.id, 'approved')} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Approve</button>
                                                    <button onClick={() => handleStatusUpdate(booking.id, 'rejected')} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Dashboard; 