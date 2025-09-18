import React from "react";
import { usePage } from "@inertiajs/react";
import SideMenu from "../../components/vendors/SideMenu";
import BookingContent from "../../components/vendors/bookings/BookingContent";

const Booking = () => {
  const {
    initialBookings = [],
    bookingData = [],
    vendorUser = { name: "Vendor", role: "Vendor" },
    server_error = null,
  } = usePage().props || {};

  return (
    <div className="bg-[#E5E5E5] h-auto">
      <div className="flex flex-row gap-10 h-auto">
        <SideMenu />
        <div className="flex-1">
          {server_error && (
            <div className="m-4 p-3 rounded bg-red-100 text-red-700 text-sm">
              {server_error}
            </div>
          )}
          <BookingContent
            initialBookings={initialBookings}
            bookingData={bookingData}
            vendorUser={vendorUser}
          />
        </div>
      </div>
    </div>
  );
};

export default Booking;
