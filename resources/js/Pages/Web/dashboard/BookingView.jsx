import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

const BookingView = ({ auth, bookings, flights, flash }) => {
  const userType = auth?.user_type || auth?.user?.role_type || '';

  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({
    flight_id: '',
    seat_number: '',
    price: '',
    tax: '',
    baggage: '',
    departure_time: '',
    arrival_time: '',
    status: 'pending',
  });

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      router.delete(route('user.booking_view.destroy', id));
    }
  };

  const handleEdit = (id) => {
    const booking = bookings.find((b) => b.id === id);
    if (booking) {
      setEditingBooking(booking);
      setFormData({
        flight_id: booking.flight_id,
        seat_number: booking.seat_number,
        price: booking.price,
        tax: booking.tax,
        baggage: booking.baggage || '',
        departure_time: booking.departure_time,
        arrival_time: booking.arrival_time || '',
        status: booking.status,
      });
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const closeEditModal = () => {
    setEditingBooking(null);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    router.post(route('user.booking_view.edit', editingBooking.id), formData, {
      onSuccess: () => closeEditModal(),
    });
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Booking Summary" />

      <div className="max-w-6xl mx-auto mt-10 bg-white p-6 shadow rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Booking Summary</h1>

        {flash?.success && (
          <div className="mb-4 text-green-600 font-medium">{flash.success}</div>
        )}

        {bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">#</th>
                  <th className="px-4 py-2 border">Airline</th>
                  <th className="px-4 py-2 border">Seat</th>
                  <th className="px-4 py-2 border">Price</th>
                  <th className="px-4 py-2 border">Tax</th>
                  <th className="px-4 py-2 border">Baggage</th>
                  <th className="px-4 py-2 border">Departure</th>
                  <th className="px-4 py-2 border">Arrival</th>
                  <th className="px-4 py-2 border">Status</th>
                  {userType === 'user' && (
                    <>
                      <th className="px-4 py-2 border">E-Ticket</th>
                      <th className="px-4 py-2 border">Action</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{index + 1}</td>
                    <td className="px-4 py-2 border">{booking.flight?.airline ?? 'N/A'}</td>
                    <td className="px-4 py-2 border">{booking.seat_number}</td>
                    <td className="px-4 py-2 border">LKR {booking.price.toLocaleString()}</td>
                    <td className="px-4 py-2 border">LKR {booking.tax.toLocaleString()}</td>
                    <td className="px-4 py-2 border">{booking.baggage ?? 'N/A'}</td>
                    <td className="px-4 py-2 border">{booking.departure_time}</td>
                    <td className="px-4 py-2 border">{booking.arrival_time ?? 'N/A'}</td>
                    <td className="px-4 py-2 border capitalize">{booking.status}</td>

                    {userType === 'user' && (
                      <>
                        <td className="px-4 py-2 border capitalize">
                          {(booking.status === 'completed' || booking.status === 'confirmed') ? (
                            <a
                              href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                              PDF
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">Pending</span>
                          )}
                        </td>

                        <td className="px-4 py-2 border">
                          <button
                            onClick={() => handleEdit(booking.id)}
                            className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">No bookings found.</p>
        )}
      </div>

      {/* Edit Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4">Edit Booking</h2>


<form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Flight ID */}
  <div>
    <label className="block mb-1 text-sm">Flight  </label>
   <select
  name="flight_id"
  value={formData.flight_id}
  onChange={handleFormChange}
  className="w-full px-3 py-2 border rounded"
  required
>
  <option value="">-- Select a Flight --</option>
  {flights && flights.map((flight) => (
    <option key={flight.id} value={flight.id}>
      {flight.airline} ({flight.class}) - LKR {flight.price}
    </option>
  ))}
</select>

  </div>

  {/* Seat Number */}
  <div>
    <label className="block mb-1 text-sm">Seat Number</label>
    <input
      type="text"
      name="seat_number"
      value={formData.seat_number}
      onChange={handleFormChange}
      className="w-full px-3 py-2 border rounded"
      required
    />
  </div>

  {/* Price */}
  <div>
    <label className="block mb-1 text-sm">Price</label>
    <input
      type="number"
      name="price"
      value={formData.price}
      onChange={handleFormChange}
      step="0.01"
      className="w-full px-3 py-2 border rounded"
      required
    />
  </div>

  {/* Tax */}
  <div>
    <label className="block mb-1 text-sm">Tax</label>
    <input
      type="number"
      name="tax"
      value={formData.tax}
      onChange={handleFormChange}
      step="0.01"
      className="w-full px-3 py-2 border rounded"
      required
    />
  </div>

  {/* Baggage */}
  <div>
    <label className="block mb-1 text-sm">Baggage</label>
    <input
      type="text"
      name="baggage"
      value={formData.baggage}
      onChange={handleFormChange}
      className="w-full px-3 py-2 border rounded"
    />
  </div>

  {/* Departure Time */}
  <div>
    <label className="block mb-1 text-sm">Departure Time</label>
    <input
      type="time"
      name="departure_time"
      value={formData.departure_time}
      onChange={handleFormChange}
      className="w-full px-3 py-2 border rounded"
      required
    />
  </div>

  {/* Arrival Time */}
  <div>
    <label className="block mb-1 text-sm">Arrival Time</label>
    <input
      type="time"
      name="arrival_time"
      value={formData.arrival_time}
      onChange={handleFormChange}
      className="w-full px-3 py-2 border rounded"
    />
  </div>

  {/* Status */}
  <div>
    <label className="block mb-1 text-sm">Status</label>
    <select
      name="status"
      value={formData.status}
      onChange={handleFormChange}
      className="w-full px-3 py-2 border rounded"
      required
    >
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  </div>

  {/* Buttons span full width */}
  <div className="col-span-1 md:col-span-2 flex justify-end space-x-3 mt-4">
    <button
      type="button"
      onClick={closeEditModal}
      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Save
    </button>
  </div>
</form>




          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
};

export default BookingView;
