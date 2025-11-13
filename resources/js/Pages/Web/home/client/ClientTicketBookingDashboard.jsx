import React, { useEffect, useState } from "react";
import ClientHeader from "./ClientHeader";
import { Link } from "@inertiajs/react";

const ClientTicketBookingDashboard = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [bookings, setBookings] = useState({
        flights: [],
        trains: [],
        buses: []
    });
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
            fetchBookingData();
        }
    }, []);

    const fetchBookingData = async () => {
        try {
            setLoading(true);
            // Add your API calls here to fetch bookings
            // const flightResponse = await fetch('/api/client/flight-bookings');
            // const trainResponse = await fetch('/api/client/train-bookings');
            // const busResponse = await fetch('/api/client/bus-bookings');

            // Mock data for now
            setBookings({
                flights: [
                    {
                        id: 1,
                        flightNumber: "UL455",
                        airline: "SriLankan Airlines",
                        from: "Colombo (CMB)",
                        to: "Dubai (DXB)",
                        date: "2024-11-20",
                        time: "14:30",
                        status: "Confirmed",
                        price: "$450",
                        seat: "12A"
                    },
                    {
                        id: 2,
                        flightNumber: "EK649",
                        airline: "Emirates",
                        from: "Dubai (DXB)",
                        to: "London (LHR)",
                        date: "2024-11-25",
                        time: "08:15",
                        status: "Pending",
                        price: "$650",
                        seat: "15C"
                    }
                ],
                trains: [
                    {
                        id: 1,
                        trainNumber: "1005",
                        trainName: "Udarata Menike",
                        from: "Colombo Fort",
                        to: "Badulla",
                        date: "2024-11-18",
                        time: "05:55",
                        status: "Confirmed",
                        price: "Rs. 600",
                        seat: "2nd Class - 45"
                    },
                    {
                        id: 2,
                        trainNumber: "8055",
                        trainName: "Intercity Express",
                        from: "Colombo Fort",
                        to: "Kandy",
                        date: "2024-11-22",
                        time: "07:00",
                        status: "Confirmed",
                        price: "Rs. 300",
                        seat: "1st Class - 12"
                    }
                ],
                buses: [
                    {
                        id: 1,
                        busNumber: "NB-1234",
                        company: "SLTB Express",
                        from: "Colombo Central",
                        to: "Galle",
                        date: "2024-11-16",
                        time: "06:30",
                        status: "Confirmed",
                        price: "Rs. 250",
                        seat: "15A"
                    },
                    {
                        id: 2,
                        busNumber: "AC-5678",
                        company: "Luxury Coach",
                        from: "Colombo",
                        to: "Jaffna",
                        date: "2024-11-28",
                        time: "22:00",
                        status: "Pending",
                        price: "Rs. 800",
                        seat: "10B"
                    }
                ]
            });
        } catch (error) {
            console.error('Error fetching booking data:', error);
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

    const getTabIcon = (tab) => {
        switch (tab) {
            case 'overview': return '📊';
            case 'flights': return '✈️';
            case 'trains': return '🚂';
            case 'buses': return '🚌';
            default: return '📋';
        }
    };

    const getTotalBookings = () => {
        return bookings.flights.length + bookings.trains.length + bookings.buses.length;
    };

    const renderOverviewTab = () => (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100">Total Bookings</p>
                            <p className="text-3xl font-bold">{getTotalBookings()}</p>
                        </div>
                        <div className="text-4xl">📋</div>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100">Flight Tickets</p>
                            <p className="text-3xl font-bold">{bookings.flights.length}</p>
                        </div>
                        <div className="text-4xl">✈️</div>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100">Train Tickets</p>
                            <p className="text-3xl font-bold">{bookings.trains.length}</p>
                        </div>
                        <div className="text-4xl">🚂</div>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100">Bus Tickets</p>
                            <p className="text-3xl font-bold">{bookings.buses.length}</p>
                        </div>
                        <div className="text-4xl">🚌</div>
                    </div>
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Bookings</h3>
                <div className="space-y-4">
                    {/* Mix recent bookings from all types */}
                    {[...bookings.flights.slice(0, 1), ...bookings.trains.slice(0, 1), ...bookings.buses.slice(0, 1)].map((booking, index) => (
                        <div key={`recent-${index}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <h4 className="text-lg font-medium text-gray-900 mr-3">
                                            {booking.flightNumber || booking.trainNumber || booking.busNumber}
                                        </h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-1">
                                        <span className="font-medium">Route:</span> {booking.from} → {booking.to}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Date:</span> {booking.date} at {booking.time}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold text-gray-900">{booking.price}</p>
                                    <p className="text-sm text-gray-500">Seat: {booking.seat}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderBookingsList = (bookingType, bookings) => (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 capitalize">{bookingType} Bookings</h2>
                <Link
                    href="/ticketBooking"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Book New {bookingType.slice(0, -1)}
                </Link>
            </div>

            <div className="space-y-4">
                {bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <h3 className="text-lg font-medium text-gray-900 mr-3">
                                            {booking.flightNumber || booking.trainNumber || booking.busNumber}
                                            {booking.airline && ` - ${booking.airline}`}
                                            {booking.trainName && ` - ${booking.trainName}`}
                                            {booking.company && ` - ${booking.company}`}
                                        </h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                        <div>
                                            <p className="text-gray-600">
                                                <span className="font-medium">From:</span> {booking.from}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">
                                                <span className="font-medium">To:</span> {booking.to}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">
                                                <span className="font-medium">Date:</span> {booking.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <p className="text-gray-600">
                                            <span className="font-medium">Time:</span> {booking.time}
                                        </p>
                                        <p className="text-gray-600">
                                            <span className="font-medium">Seat:</span> {booking.seat}
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">{booking.price}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                                        View Details
                                    </button>
                                    <button className="text-green-600 hover:text-green-800 font-medium">
                                        Download Ticket
                                    </button>
                                    {booking.status === 'Pending' && (
                                        <button className="text-red-600 hover:text-red-800 font-medium">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">{getTabIcon(bookingType)}</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No {bookingType} bookings yet</h3>
                        <p className="text-gray-600 mb-4">Start planning your journey by booking your first {bookingType.slice(0, -1).toLowerCase()}!</p>
                        <Link
                            href="/ticketBooking"
                            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Book {bookingType.slice(0, -1)} Now
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-[#E5E5E5] min-h-screen">
            <ClientHeader />

            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href="/client/dashboard"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Main Dashboard
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Ticket Booking Dashboard</h1>
                    <p className="text-gray-600">Manage your flight, train, and bus tickets all in one place</p>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {['overview', 'flights', 'trains', 'buses'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                                        activeTab === tab
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="mr-2">{getTabIcon(tab)}</span>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-md">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading booking data...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && renderOverviewTab()}
                            {activeTab === 'flights' && renderBookingsList('flights', bookings.flights)}
                            {activeTab === 'trains' && renderBookingsList('trains', bookings.trains)}
                            {activeTab === 'buses' && renderBookingsList('buses', bookings.buses)}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientTicketBookingDashboard;
