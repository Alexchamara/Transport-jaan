import React from 'react';
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';

const CourierReports = ({ bookings = [], stats = {} }) => {
  return (
    <div className='flex flex-row bg-[#081028] min-h-screen sm:flex-col md:flex-row lg:flex-row poppins'>
      <div className='sm:w-full md:w-auto lg:w-auto'>
        <SideMenu />
      </div>
      <div className='flex-1 p-8'>
        <div className='max-w-7xl mx-auto'>
          <h1 className='text-white text-3xl font-bold mb-6'>Courier Bookings Report</h1>
          <p className='text-gray-400 mb-8'>Comprehensive report of all courier bookings.</p>
          
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <div className='bg-[#181A2A] rounded-lg p-6 border border-gray-700'>
              <h3 className='text-gray-400 text-sm mb-2'>Total Shipments</h3>
              <p className='text-white text-2xl font-bold'>{stats.totalShipments || 0}</p>
            </div>
            <div className='bg-[#181A2A] rounded-lg p-6 border border-gray-700'>
              <h3 className='text-gray-400 text-sm mb-2'>Total Revenue</h3>
              <p className='text-white text-2xl font-bold'>LKR {(stats.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className='bg-[#181A2A] rounded-lg p-6 border border-gray-700'>
              <h3 className='text-gray-400 text-sm mb-2'>In Transit</h3>
              <p className='text-white text-2xl font-bold'>{stats.inTransit || 0}</p>
            </div>
            <div className='bg-[#181A2A] rounded-lg p-6 border border-gray-700'>
              <h3 className='text-gray-400 text-sm mb-2'>Delivered</h3>
              <p className='text-white text-2xl font-bold'>{stats.delivered || 0}</p>
            </div>
          </div>
          
          <div className='bg-[#181A2A] rounded-lg p-6 border border-gray-700'>
            <h3 className='text-white text-lg font-semibold mb-4'>Recent Shipments</h3>
            {bookings && bookings.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='w-full text-left'>
                  <thead>
                    <tr className='border-b border-gray-700'>
                      <th className='text-gray-400 pb-3 px-2'>Tracking #</th>
                      <th className='text-gray-400 pb-3 px-2'>Sender</th>
                      <th className='text-gray-400 pb-3 px-2'>Receiver</th>
                      <th className='text-gray-400 pb-3 px-2'>Status</th>
                      <th className='text-gray-400 pb-3 px-2'>Amount</th>
                      <th className='text-gray-400 pb-3 px-2'>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, index) => (
                      <tr key={index} className='border-b border-gray-800'>
                        <td className='text-white py-3 px-2'>{booking.tracking_number}</td>
                        <td className='text-gray-300 py-3 px-2'>{booking.sender_name || 'N/A'}</td>
                        <td className='text-gray-300 py-3 px-2'>{booking.receiver_name || 'N/A'}</td>
                        <td className='py-3 px-2'>
                          <span className={`px-2 py-1 rounded text-xs ${
                            booking.status === 'delivered' ? 'bg-green-600 text-white' :
                            booking.status === 'in_transit' ? 'bg-blue-600 text-white' :
                            'bg-yellow-600 text-white'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className='text-white py-3 px-2'>LKR {(booking.total_amount || 0).toLocaleString()}</td>
                        <td className='text-gray-400 py-3 px-2'>{new Date(booking.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className='text-gray-400'>No shipment data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierReports;
