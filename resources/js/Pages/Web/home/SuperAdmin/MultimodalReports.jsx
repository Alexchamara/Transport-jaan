import React from 'react';
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';

const MultimodalReports = ({ bookings = [], stats = {} }) => {
  return (
    <div className='flex flex-row bg-[#081028] min-h-screen sm:flex-col md:flex-row lg:flex-row poppins'>
      <div className='sm:w-full md:w-auto lg:w-auto'>
        <SideMenu />
      </div>
      <div className='flex-1 p-8'>
        <div className='max-w-7xl mx-auto'>
          <h1 className='text-white text-3xl font-bold mb-6'>Multimodal Bookings Report</h1>
          <p className='text-gray-400 mb-8'>Comprehensive report of all multimodal bookings.</p>
          
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-[#181A2A] rounded-lg p-6 border border-gray-700'>
              <h3 className='text-gray-400 text-sm mb-2'>Total Bookings</h3>
              <p className='text-white text-2xl font-bold'>{stats.totalBookings || 0}</p>
            </div>
            <div className='bg-[#181A2A] rounded-lg p-6 border border-gray-700'>
              <h3 className='text-gray-400 text-sm mb-2'>Total Revenue</h3>
              <p className='text-white text-2xl font-bold'>LKR {(stats.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className='bg-[#181A2A] rounded-lg p-6 border border-gray-700'>
              <h3 className='text-gray-400 text-sm mb-2'>Confirmed</h3>
              <p className='text-white text-2xl font-bold'>{stats.confirmedBookings || 0}</p>
            </div>
          </div>
          
          <div className='bg-[#181A2A] rounded-lg p-6 border border-gray-700'>
            <h3 className='text-white text-lg font-semibold mb-4'>Recent Bookings</h3>
            {bookings && bookings.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='w-full text-left'>
                  <thead>
                    <tr className='border-b border-gray-700'>
                      <th className='text-gray-400 pb-3 px-2'>Booking Ref</th>
                      <th className='text-gray-400 pb-3 px-2'>Passenger</th>
                      <th className='text-gray-400 pb-3 px-2'>Journeys</th>
                      <th className='text-gray-400 pb-3 px-2'>Status</th>
                      <th className='text-gray-400 pb-3 px-2'>Amount</th>
                      <th className='text-gray-400 pb-3 px-2'>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, index) => (
                      <tr key={index} className='border-b border-gray-800'>
                        <td className='text-white py-3 px-2'>{booking.booking_reference}</td>
                        <td className='text-gray-300 py-3 px-2'>{booking.passenger_name || 'N/A'}</td>
                        <td className='text-gray-300 py-3 px-2'>{booking.journey_count || 0} journeys</td>
                        <td className='py-3 px-2'>
                          <span className={`px-2 py-1 rounded text-xs ${
                            booking.status === 'confirmed' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className='text-white py-3 px-2'>LKR {booking.total_amount.toLocaleString()}</td>
                        <td className='text-gray-400 py-3 px-2'>{new Date(booking.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className='text-gray-400'>No booking data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultimodalReports;
