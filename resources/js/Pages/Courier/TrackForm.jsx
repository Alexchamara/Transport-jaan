import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function TrackForm({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        tracking_number: new URLSearchParams(window.location.search).get('tracking') || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('couriers.track'));
    };

    const Layout = auth?.user ? 'AuthenticatedLayout' : GuestLayout;

    return (
        <Layout user={auth?.user}>
            <Head title="Track Your Courier" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-2xl font-bold text-center mb-8">Track Your Courier</h1>

                        <div className="mb-6 text-center">
                            <p className="text-gray-600">
                                Enter your tracking number to get real-time updates on your courier pickup status.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
                            <div className="mb-6">
                                <label htmlFor="tracking_number" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tracking Number
                                </label>
                                
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        id="tracking_number"
                                        name="tracking_number"
                                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                                        placeholder="Enter your tracking number (e.g. TRK202506020001123)"
                                        value={data.tracking_number}
                                        onChange={(e) => setData('tracking_number', e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        disabled={processing}
                                    >
                                        {processing ? 'Tracking...' : 'Track'}
                                    </button>
                                </div>
                                
                                {errors.tracking_number && (
                                    <p className="mt-2 text-sm text-red-600">{errors.tracking_number}</p>
                                )}
                            </div>
                        </form>

                        <div className="mt-8 text-center text-sm text-gray-600">
                            <p>Need to book a courier pickup? <a href={route('couriers.create')} className="text-blue-600 hover:text-blue-800">Book now</a></p>
                        </div>

                        <div className="mt-12 border-t pt-6">
                            <h2 className="text-lg font-semibold mb-4">How Tracking Works</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-center mb-2">
                                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600">
                                            1
                                        </span>
                                    </div>
                                    <h3 className="text-center font-medium mb-2">Enter Tracking Number</h3>
                                    <p className="text-sm text-gray-600">
                                        Enter the tracking number you received after booking your courier pickup.
                                    </p>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-center mb-2">
                                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600">
                                            2
                                        </span>
                                    </div>
                                    <h3 className="text-center font-medium mb-2">Get Real-Time Updates</h3>
                                    <p className="text-sm text-gray-600">
                                        See the current status and journey of your delivery in real time.
                                    </p>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-center mb-2">
                                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600">
                                            3
                                        </span>
                                    </div>
                                    <h3 className="text-center font-medium mb-2">Delivery Information</h3>
                                    <p className="text-sm text-gray-600">
                                        View all delivery locations and receiver details associated with your shipment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}