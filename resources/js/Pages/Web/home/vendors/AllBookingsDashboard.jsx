import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import SideMenu from "./allBookings/SideMenu";
import VendorAllBookings from "./allBookings/VendorAllBookings";
import { Menu } from "lucide-react";

const AllBookingsDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Extract props from Inertia
  const { props } = usePage();
  const {
    allBookings,
    statistics,
    monthlyData
  } = props;

  return (
    <div className="bg-[#E5E5E5] min-h-screen">
      <div className="flex flex-row gap-0 min-h-screen">
        {/* Toggle Button (only visible on mobile) */}
        <button
          className="lg:hidden p-2 m-2 fixed left-2 top-2 z-50 bg-white rounded-full shadow"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu size={22} />
        </button>

        {/* Side Menu */}
        <div
          className={`fixed lg:sticky top-0 left-0 h-screen flex-shrink-0 z-40 transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
        >
          <SideMenu />
        </div>

        {/* Overlay for mobile */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <VendorAllBookings
            allBookings={allBookings}
            statistics={statistics}
            monthlyData={monthlyData}
          />
        </div>
      </div>
    </div>
  );
};

export default AllBookingsDashboard;
