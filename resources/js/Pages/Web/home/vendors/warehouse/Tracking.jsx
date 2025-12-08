import React, { useState } from "react";
import SideMenu from "../../../components/vendors/warehouse/SideMenu";
import TrackingContent from "../../../components/vendors/warehouse/tracking/TrackingContent";
import { Menu } from "lucide-react";

const Tracking = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#E5E5E5] min-h-screen flex">

      {/* Mobile toggle button */}
      <button
        className="xl:hidden p-2 m-2 fixed left-2 top-2 z-50 bg-white rounded-full shadow"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={22} />
      </button>

      {/* Side Menu */}
      <div
        className={`fixed xl:static top-0 left-0 h-full z-40 transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        xl:translate-x-0 bg-white shadow xl:shadow-none`}
      >
        <SideMenu />
      </div>

      {/* Page Content */}
      <div className="flex-1 p-4 xl:p-10">
        <TrackingContent />
      </div>
    </div>
  );
};

export default Tracking;
