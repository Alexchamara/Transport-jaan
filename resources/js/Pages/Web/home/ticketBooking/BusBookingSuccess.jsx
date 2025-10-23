import React from 'react';
import { Link } from '@inertiajs/react';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';

const BusBookingSuccess = ({ booking }) => {
    return (
        <div>
            <Header />

            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                    {/* Success header */}
                    <div className="bg-[#0955AC] text-white px-6 py-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                        <p className="text-xl opacity-90">Thank you for your booking</p>
                    </div>

                    {/* Booking reference */}
                    <div className="border-b px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-600">Booking Reference</h2>
                            <span className="text-xl font-bold text-[#0955AC]">{booking.reference}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Please save this reference number for your records. You'll need it for any booking inquiries.
                        </p>
                    </div>

                    {/* Passenger details */}
                    <div className="border-b px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">Passenger Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Name</p>
                                <p>{booking.passengerName}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Contact</p>
                                <p>{booking.passengerPhone}</p>
                            </div>
                            {booking.passengerEmail && (
                                <div className="md:col-span-2">
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p>{booking.passengerEmail}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Trip details */}
                    <div className="border-b px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">Trip Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                            <div>
                                <p className="text-sm font-medium text-gray-500">From</p>
                                <p>{booking.departureStation}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">To</p>
                                <p>{booking.arrivalStation}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Date</p>
                                <p>{booking.departureDate}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Time</p>
                                <p>{booking.departureTime} - {booking.arrivalTime}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Bus Type</p>
                                <p>{booking.busType}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Bus Number</p>
                                <p>{booking.busNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Operator</p>
                                <p>{booking.busOperator}</p>
                            </div>
                        </div>
                    </div>

                    {/* Seat & Payment */}
                    <div className="border-b px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700 mb-2">Seat Information</h2>
                                <p className="text-gray-600">
                                    <span className="font-medium">Seat Numbers:</span>{' '}
                                    {Array.isArray(booking.seats)
                                        ? booking.seats.sort((a, b) => a - b).join(', ')
                                        : booking.seats}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Total Seats:</span>{' '}
                                    {Array.isArray(booking.seats) ? booking.seats.length : 0}
                                </p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-700 mb-2">Payment</h2>
                                <p className="text-gray-600">
                                    <span className="font-medium">Status:</span>{' '}
                                    <span className="text-green-600 font-semibold">{booking.status.toUpperCase()}</span>
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Total Amount:</span>{' '}
                                    <span className="text-[#0955AC] font-bold">LKR {booking.totalPrice.toLocaleString()}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-6 flex flex-wrap gap-4 justify-between">
                        <div className="space-x-4">
                            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium">
                                Print Ticket
                            </button>
                            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium">
                                Email Ticket
                            </button>
                        </div>

                        <div>
                            <Link
                                href="/flight-booking"
                                className="bg-[#0955AC] hover:bg-[#074489] text-white px-6 py-2 rounded-lg font-medium"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Important Notes */}
                <div className="max-w-3xl mx-auto mt-8 px-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Important Information:</h3>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1 text-sm">
                        <li>Please arrive at the bus station at least 30 minutes before departure time.</li>
                        <li>You must present your booking reference number when boarding.</li>
                        <li>Luggage allowance: 2 pieces per passenger, not exceeding 20kg total.</li>
                        <li>For cancellations and refunds, please contact customer service at least 24 hours before departure.</li>
                    </ul>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default BusBookingSuccess;
