import React from "react";
import { usePage } from "@inertiajs/react";
import VendorLayout from "./VendorLayout";
import BookingContent from "../../components/vendors/bookings/BookingContent";

const Booking = () => {
  const {
    initialBookings = [],
    bookingData = [],
    vendorUser = { name: "Service Provider", role: "Service Provider" },
    drivers = [],
    server_error = null,
  } = usePage().props || {};

  return (
    <VendorLayout activeService="Vehicle Rental">
      {server_error && (
        <div className="m-4 p-3 rounded bg-red-100 text-red-700 text-sm">
          {server_error}
        </div>
      )}
      <BookingContent
        initialBookings={initialBookings}
        bookingData={bookingData}
        vendorUser={vendorUser}
        drivers={drivers}
      />
    </VendorLayout>
  );
};

export default Booking;
