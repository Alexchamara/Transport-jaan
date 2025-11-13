import React, { useEffect, useState } from "react";
import ClientHeader from "./ClientHeader";

const ClientVehicleDashboard = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Auto-refresh the page EVERY time it's visited to prevent stale CSRF token
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const justRefreshed = urlParams.get('refreshed');

        if (!justRefreshed) {
            setIsRefreshing(true);
            setTimeout(() => {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('refreshed', '1');
                window.location.href = currentUrl.toString();
            }, 500);
        } else {
            // Fetch data after refresh
            fetchDashboardData();
        }
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Add your API calls here to fetch bookings and vehicles
            // const bookingsResponse = await fetch('/api/client/bookings');
            // const vehiclesResponse = await fetch('/api/client/vehicles');

            // Mock data for now
            setBookings([
                {
                    id: 1,
                    vehicle: "Toyota Camry",
                    date: "2024-11-15",
                    status: "Confirmed",
                    type: "Bus",
                    route: "Colombo - Kandy"
                },
                {
                    id: 2,
                    vehicle: "Express Train",
                    date: "2024-11-20",
                    status: "Pending",
                    type: "Train",
                    route: "Colombo - Galle"
                }
            ]);

            setVehicles([
                {
                    id: 1,
                    name: "Toyota Camry",
                    type: "Bus",
                    availability: "Available",
                    rating: 4.5
                },
                {
                    id: 2,
                    name: "Express Train",
                    type: "Train",
                    availability: "Booked",
                    rating: 4.8
                }
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Simple loader overlay
    if (isRefreshing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getAvailabilityColor = (availability) => {
        return availability === 'Available'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';
    };

    return (
        <div className="bg-[#E5E5E5] min-h-screen">
            <ClientHeader />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Vehicle Dashboard</h1>
                    <p className="text-gray-600">Manage your bookings and explore available vehicles</p>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('bookings')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'bookings'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                My Bookings
                            </button>
                            <button
                                onClick={() => setActiveTab('vehicles')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'vehicles'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Available Vehicles
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'history'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Booking History
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-md">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading dashboard data...</p>
                        </div>
                    ) : (
                        <>
                            {/* My Bookings Tab */}
                            {activeTab === 'bookings' && (
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold text-gray-800">Current Bookings</h2>
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                            New Booking
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {bookings.map((booking) => (
                                            <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <h3 className="text-lg font-medium text-gray-900 mr-3">{booking.vehicle}</h3>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                                {booking.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 mb-1">
                                                            <span className="font-medium">Route:</span> {booking.route}
                                                        </p>
                                                        <p className="text-gray-600 mb-1">
                                                            <span className="font-medium">Type:</span> {booking.type}
                                                        </p>
                                                        <p className="text-gray-600">
                                                            <span className="font-medium">Date:</span> {booking.date}
                                                        </p>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button className="text-blue-600 hover:text-blue-800 font-medium">
                                                            View Details
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-800 font-medium">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Available Vehicles Tab */}
                            {activeTab === 'vehicles' && (
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold text-gray-800">Available Vehicles</h2>
                                        <div className="flex space-x-2">
                                            <select className="border border-gray-300 rounded-lg px-3 py-2">
                                                <option>All Types</option>
                                                <option>Bus</option>
                                                <option>Train</option>
                                                <option>Flight</option>
                                            </select>
                                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                                Search
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {vehicles.map((vehicle) => (
                                            <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-lg font-medium text-gray-900">{vehicle.name}</h3>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(vehicle.availability)}`}>
                                                            {vehicle.availability}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 mb-2">Type: {vehicle.type}</p>
                                                    <div className="flex items-center">
                                                        <span className="text-yellow-400">★</span>
                                                        <span className="ml-1 text-gray-600">{vehicle.rating}</span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                                        Book Now
                                                    </button>
                                                    <button className="flex-1 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Booking History Tab */}
                            {activeTab === 'history' && (
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Booking History</h2>

                                    <div className="space-y-4">
                                        <div className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center mb-2">
                                                        <h3 className="text-lg font-medium text-gray-900 mr-3">Luxury Bus Service</h3>
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            Completed
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 mb-1">Route: Colombo - Matara</p>
                                                    <p className="text-gray-600 mb-1">Type: Bus</p>
                                                    <p className="text-gray-600">Date: 2024-10-15</p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                                                        View Receipt
                                                    </button>
                                                    <button className="text-green-600 hover:text-green-800 font-medium">
                                                        Rate Trip
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientVehicleDashboard;
