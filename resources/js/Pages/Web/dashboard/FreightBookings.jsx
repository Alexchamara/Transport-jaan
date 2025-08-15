import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function FreightBookings({ auth, bookings }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="My Freight Bookings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6">My Freight Bookings</h2>

                        <div className="space-y-6">
                            {bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <div key={booking.id} className="bg-gray-50 p-4 rounded-lg shadow">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <h3 className="font-semibold">Booking #{booking.id}</h3>
                                                <p className="text-sm text-gray-600">Date: {new Date(booking.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p><span className="font-semibold">Origin:</span> {booking.origin.address}</p>
                                                <p><span className="font-semibold">Destination:</span> {booking.destination.address}</p>
                                            </div>
                                            <div>
                                                <p><span className="font-semibold">Status:</span> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : booking.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{booking.status}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>You have no freight bookings.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}