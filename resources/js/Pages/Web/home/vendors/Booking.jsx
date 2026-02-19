import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import SideMenu from "../../components/vendors/SideMenu";
import BookingContent from "../../components/vendors/bookings/BookingContent";
import { Menu } from "lucide-react";

const Booking = () => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    initialBookings = [],
    bookingData = [],
    vendorUser = { name: "Service Provider", role: "Service Provider" },
    server_error = null,
  } = usePage().props || {};

  return (
    <div className="bg-[#E5E5E5] min-h-screen h-auto">
      <div className="flex flex-row gap-10 h-auto">

        {/* Mobile Toggle Button */}
        <button
          className="lg:hidden p-2 m-2 fixed left-2 top-2 z-50 bg-white rounded-full shadow"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu size={22} />
        </button>

        {/* Sidebar */}
        <div
          className={`fixed lg:static top-0 left-0 min-h-full z-40 transition-transform duration-300 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 bg-white shadow lg:shadow-none`}
        >
          <SideMenu />
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-[#E5E5E5]">
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
