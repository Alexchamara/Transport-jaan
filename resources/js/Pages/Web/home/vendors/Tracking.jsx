// resources/js/Pages/Web/components/vendors/tracking/Tracking.jsx
import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import SideMenu from "../../components/vendors/SideMenu";
import TrackingContent from "../../components/vendors/tracking/TrackingContent";
import { Menu } from "lucide-react";
import UserDropdown from "../../components/vendors/UserDropdown.jsx";

const Tracking = () => {
  const { auth, unreadNotifications = 0 } = usePage().props;
  const user = auth?.user;

  const [isOpen, setIsOpen] = useState(false); // Mobile sidebar toggle

  return (
    <div className="bg-[#E5E5E5] min-h-screen">
      <div className="flex flex-row gap-10">
        {/* Toggle Button for mobile */}
        <button
          className="lg:hidden p-2 m-2 fixed left-2 top-2 z-50 bg-white rounded-full shadow"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu size={22} />
        </button>

        {/* Side Menu */}
        <div
          className={`fixed lg:static top-0 left-0 h-full z-40 transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 bg-white shadow lg:shadow-none`}
        >
          <SideMenu />
        </div>

        {/* Main Content */}
        <div className="flex-1 pr-5 py-10">
          {/* ==================== HEADER WITH DROPDOWN ==================== */}
          {/* Uncomment if needed
          <div className="flex flex-row gap-5 justify-between items-center mb-10">
            <h1 className="figtree text-[35px] font-[700]">
              Vehicle Rental Tracking
            </h1>

            <div className="flex flex-row gap-5 relative items-center">
              <UserDropdown settingsRoute={route("settingsPage")} />
            </div>
          </div>
          */}

          {/* ==================== TRACKING CONTENT ==================== */}
          <TrackingContent />
        </div>
      </div>
    </div>
  );
};

export default Tracking;
