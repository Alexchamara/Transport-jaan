import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function View({ auth }) {
    const user = auth.user;

    return (
        <AuthenticatedLayout user={user}>
            <Head title="User Dashboard" />

            <div className="max-w-3xl mx-auto mt-10 bg-white p-8 shadow rounded">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Welcome, {user?.name} 👋
                </h1>

                <p className="text-gray-600 mb-6">
                    You are logged in as <span className="font-semibold">{user?.role_type}</span>.
                </p>

                <div className="bg-blue-100 p-4 rounded">
                    <p>This is your personal dashboard. You can manage your profile, view activity, or access available features based on your role.</p>
                </div>

            <div className="mt-6 flex flex-wrap gap-4">
  <Link
    href={route('user.fight_view')} // Replace with your actual route name
    className="inline-block text-center bg-rose-600 text-white px-5 py-2 rounded hover:bg-rose-700 transition duration-200"
  >
    Flights Section
  </Link>

  <Link
    href={route('user.booking_view')} // Replace with your actual route name
    className="inline-block text-center bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition duration-200"
  >
    Booking Summary
  </Link>
    <Link
        href={route('user.freight_bookings')}
        className="inline-block text-center bg-purple-600 text-white px-5 py-2 rounded hover:bg-purple-700 transition duration-200"
    >
        My Freight Bookings
    </Link>
    <Link
     href={route('warehouses.search')}
     className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
   >
     <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
     </svg>
     Find Warehouses
   </Link>
    <Link
        href={route('freight.booking.create')}
        className="inline-block text-center bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition duration-200"
    >
        New Freight Booking
    </Link>

      <Link
  href={route('user.airticket_book')}
  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
>
  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 12l9.5-2.5-1-4-9.5 2.5L4 4 2 6l5.5 5.5L5 18l2 1 5-5.5 3.5 3.5 1.5-1.5-3.5-3.5z" />
  </svg>
  Air Ticket Book
</Link>
</div>


            </div>
        </AuthenticatedLayout>
    );
}
