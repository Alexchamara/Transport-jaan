import React, {useState} from 'react'
import SideMenu from '../../../components/vendors/ticketBooking/SideMenu';
import UnitContent from '../../../components/vendors/ticketBooking/units/UnitContent';
import { Menu } from "lucide-react"; // simple clean icon


const Unit = () => {
const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#E5E5E5] min-h-screen w-full flex gap-0">
      {/* Toggle Button (only visible on mobile) */}
      <button
        className="lg:hidden p-2 m-2 fixed left-2 top-2 z-50 bg-white rounded-full shadow"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={22} />
      </button>

      {/* Side Menu */}
      <div
        className={`fixed lg:static top-0 left-0 h-screen w-64 z-40 transition-transform duration-300 overflow-hidden
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 bg-white shadow-lg lg:shadow-lg flex-shrink-0`}
      >
        <SideMenu />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden h-screen bg-[#E5E5E5]">
        <UnitContent />
      </div>
    </div>
  );
};

export default Unit;