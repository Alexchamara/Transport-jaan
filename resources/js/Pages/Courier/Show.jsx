import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ auth, courier }) {
    const { flash } = usePage().props;
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };
    
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'picked_up':
                return 'bg-blue-100 text-blue-800';
            case 'in_transit':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Courier Details
                </h2>
            }
        >
            <Head title="Courier Details" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {flash.success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
                            {flash.success}
                        </div>
                    )}
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold">Courier Pickup Details</h2>
                            <div className="inline-block px-4 py-2 mt-2 rounded-lg bg-blue-50 border border-blue-200">
                                <span className="text-sm text-gray-600">Tracking Number</span>
                                <div className="text-xl font-bold">{courier.tracking_number}</div>
                            </div>
                        </div>

                        <div className="mb-6 flex justify-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium uppercase ${getStatusBadgeClass(courier.status)}`}>
                                {courier.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-2 border-b pb-2">Sender Details</h3>
                                <p className="py-1"><strong>Name:</strong> {courier.sender_name}</p>
                                <p className="py-1"><strong>Telephone:</strong> {courier.sender_telephone}</p>
                                <p className="py-1"><strong>Address:</strong> {courier.sender_address}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-lg mb-2 border-b pb-2">Parcel Details</h3>
                                <p className="py-1">
                                    <strong>Type:</strong>{" "}
                                    {courier.parcel_type === "other"
                                        ? courier.custom_parcel_type
                                        : courier.parcel_type.replace(/_/g, " ")}
                                </p>
                                <p className="py-1"><strong>Count:</strong> {courier.parcel_count}</p>
                                <p className="py-1"><strong>Weight:</strong> {courier.parcel_weight} kg</p>
                                <p className="py-1"><strong>Payment Method:</strong> {courier.payment_method.replace(/_/g, " ")}</p>
                                <p className="py-1"><strong>Date Created:</strong> {formatDate(courier.created_at)}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-semibold text-lg mb-4 border-b pb-2">Delivery Locations</h3>
                            <div className="space-y-4">
                                {courier.receivers.map((receiver, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium mb-2">Location {index + 1}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <p><strong>Name:</strong> {receiver.receiver_name}</p>
                                            <p><strong>Telephone:</strong> {receiver.receiver_telephone}</p>
                                            <p className="md:col-span-2"><strong>Address:</strong> {receiver.receiver_address}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between">
                            <a 
                                href={route("admin.couriers")} 
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Back to List
                            </a>
                            
                            <a 
                                href={`${route("couriers.track-form")}?tracking=${courier.tracking_number}`} 
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Track This Courier
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}