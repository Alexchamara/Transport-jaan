import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

const AvailabilityPicker = ({ vendorId }) => {
    const [selectedDates, setSelectedDates] = useState([]);
    const [bookedDates, setBookedDates] = useState([]);
    const [bookingsInfo, setBookingInfo] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
  
    useEffect(()=> {
      const fetchBookedDates = async () => {
        try{
          const response = await axios.get(`/vendors/${vendorId}/bookings`);
          const bookings = response.data;

          const dates = bookings.map(booking => new Date(booking.date));
          setBookedDates(dates);

          const infoMap = {};
          bookings.forEach(booking => {
            infoMap[ new Date(booking.date).toDateString()] = booking;
          });
          setBookingInfo(infoMap);
        } catch (err){
          console.error('Failed to fetch bookings', err);
        }
      };
      fetchBookedDates();
    }, [vendorId]);
    // Toggle date selection
    const handleDateChange = (date) => {
      const isBooked = bookedDates.some(
        (d) => d.toDateString() === date.toDateString()
      );

      if (isBooked) {
        // Show booking details if date is booked
        setCurrentBooking(bookingsInfo[date.toDateString()]);
        setShowModal(true);
        return;
    }

    const exists = selectedDates.some(
       (d) => d.toDateString() === date.toDateString()
    );

    setSelectedDates((prev) =>
      exists
         ? prev.filter((d) => d.toDateString() !== date.toDateString())
         : [...prev, date]
    );

  };

    const handleSubmit = async () => {
      const formattedDates = selectedDates.map((d) =>
        d.toISOString().split('T')[0]
      );
      try {
        await axios.post(`/vendors/${vendorId}/available_dates`, {
            vendor_id: vendorId,
            available_dates: formattedDates,
        });
        alert('Availability updated!');
        setSelectedDates([]);
    } catch (err) {
        alert('Failed to save availability.');
        console.error(err);
    }
};

// Custom date styling
const dayClassName = (date) => {
    const isBooked = bookedDates.some(
        (d) => d.toDateString() === date.toDateString()
    );
    
    const isSelected = selectedDates.some(
        (d) => d.toDateString() === date.toDateString()
    );

    if (isBooked) return 'bg-red-100 text-red-600';
    if (isSelected) return 'bg-blue-100 text-blue-600';
    return '';
};

return (
    <div className="max-w-md mx-auto p-4 rounded-xl shadow-md border bg-white">
        <h2 className="text-xl font-semibold mb-4 text-center">Manage Your Availability</h2>

        <div className="mb-2 text-sm">
            <span className="inline-block w-3 h-3 bg-red-100 mr-1"></span> Booked dates
            <span className="inline-block w-3 h-3 bg-blue-100 ml-3 mr-1"></span> Selected dates
        </div>

        <DatePicker
            inline
            onChange={handleDateChange}
            selected={null}
            highlightDates={[...selectedDates, ...bookedDates]}
            minDate={new Date()}
            dayClassName={dayClassName}
            placeholderText="Select dates"
        />

        {selectedDates.length > 0 && (
            <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Selected Dates:</h4>
                <ul className="list-disc list-inside text-sm">
                    {selectedDates.map((date, i) => (
                        <li key={i}>{date.toDateString()}</li>
                    ))}
                </ul>
            </div>
        )}

        <button
            onClick={handleSubmit}
            disabled={selectedDates.length === 0}
            className={`mt-4 w-full py-2 px-4 rounded ${selectedDates.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
            Save Availability
        </button>

        {/* Booking Details Modal */}
        {showModal && currentBooking && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
                    
                    <div className="space-y-2">
                        <p><span className="font-medium">Date:</span> {new Date(currentBooking.date).toDateString()}</p>
                        <p><span className="font-medium">Customer:</span> {currentBooking.user?.name || 'N/A'}</p>
                        <p><span className="font-medium">Pickup Location:</span> {currentBooking.pick_up_location}</p>
                        <p><span className="font-medium">Vehicle Type:</span> {currentBooking.vehicletype?.name || 'N/A'}</p>
                        <p><span className="font-medium">Contact:</span> {currentBooking.user?.email || 'N/A'}</p>
                    </div>
                    
                    <button
                        onClick={() => setShowModal(false)}
                        className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                    >
                        Close
                    </button>
                </div>
            </div>
        )}
    </div>
);
};

export default AvailabilityPicker;
    