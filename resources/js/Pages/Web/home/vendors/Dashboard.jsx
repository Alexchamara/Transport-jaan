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
    <div className="bg-[#E5E5E5] h-auto min-h-screen">
      <div className="flex flex-row gap-10 h-auto">
        <button
          className="lg:hidden p-2 m-2 fixed left-2 top-2 z-50 bg-white rounded-full shadow"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          type="button"
        >
          <MenuIcon size={22} />
        </button>

        <div
          className={`fixed lg:static top-0 left-0 h-full z-40 transition-transform duration-300 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 bg-white shadow lg:shadow-none`}
        >
          <SideMenu />
        </div>

        <div className="flex-1">
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
    </div>
  );
};

export default Dashboard;
