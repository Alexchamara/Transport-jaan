import React, { useState } from "react";
import SideMenu from "../../components/vendors/SideMenu";
import ClientContent from "../../components/vendors/clients/ClientContent";
import { Menu } from "lucide-react";

const Client = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile sidebar toggle

  return (
    <div className="bg-[#E5E5E5] min-h-screen">
      <div className="flex flex-row gap-10 h-auto">
        {/* Toggle Button for mobile */}
        <button
          className="lg:hidden p-2 m-2 fixed left-2 top-2 z-50 bg-white rounded-full shadow"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu size={22} />
        </button>

        {/* Side Menu */}
        <div
          className={`fixed lg:static top-0 left-0 min-h-full z-40 transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 bg-white shadow lg:shadow-none`}
        >
          <SideMenu />
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-[#E5E5E5]">
          <ClientContent />
        </div>
      </div>
    </div>
  );
};

export default Client;
