import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import SideMenu from "../../components/vendors/SideMenu";
import DashContent from "../../components/vendors/dashboard/DashContent";

const MenuIcon = ({ size = 22, stroke = "#111" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    cards = { totalRevenue: 0, newBookings: 0, rentedCars: 0, totalCars: 0 },
    bookingOverview = [],
    earningSummary = [],
    realStatus = [],
    carTypes = [],
    bookings = [],
    bookings_meta = {},
    filters = {},
    vendorUser = { name: "", role: "Vendor" },
    recentActivities = [],
  } = usePage().props || {};

  const normalizedBookings = Array.isArray(bookings) ? bookings : (bookings?.data || []);

  return (
    <div className="bg-[#E5E5E5] min-h-screen w-full flex">
      {/* Toggle Button (only visible on mobile) */}
      <button
        className="lg:hidden p-2 m-2 fixed left-2 top-2 z-50 bg-white rounded-full shadow"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        type="button"
      >
        <MenuIcon size={22} />
      </button>

      {/* Side Menu - Fixed, does not scroll */}
      <div
        className={`fixed lg:static top-0 left-0 h-screen lg:h-screen w-64 z-40 transition-transform duration-300 overflow-hidden
                ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                lg:translate-x-0 bg-white shadow lg:shadow-none flex-shrink-0`}
      >
        <SideMenu />
      </div>

      {/* Main Content - Only vertical scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden h-screen">
        <DashContent
          cards={cards}
          bookingOverview={bookingOverview}
          earningSummary={earningSummary}
          realStatus={realStatus}
          carTypes={carTypes}
          bookings={normalizedBookings}
          bookingsMeta={bookings_meta}
          filters={filters}
          vendorUser={vendorUser}
          recentActivities={recentActivities}
        />
      </div>
    </div>
  );
};

export default Dashboard;
