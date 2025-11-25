import React, {useState} from "react";
import SideMenu from "../../../components/vendors/ticketBooking/SideMenu";
import Settings from "../../../components/vendors/ticketBooking/Settings";
import { Menu } from "lucide-react"; // simple clean icon

const SettingsPage = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-[#E5E5E5] h-auto min-h-screen w-full">
            <div className="flex flex-row h-auto">
                {/* Toggle Button (only visible on mobile) */}
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
                <div className="flex-1 overflow-x-hidden">
                    <Settings />
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
