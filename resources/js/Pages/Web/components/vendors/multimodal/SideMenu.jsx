import React, { useState } from "react";
import dashLogo from "../../../assets/vendors/dashboard/dashLogo.svg";
import bookLogo from "../../../assets/vendors/dashboard/bookLogo.svg";
import uniLogo from "../../../assets/vendors/dashboard/uniLogo.svg";
import calendarLogo from "../../../assets/vendors/dashboard/calendarLogo.svg";
import clientsLogo from "../../../assets/vendors/dashboard/clientsLogo.svg";
import finLogo from "../../../assets/vendors/dashboard/finLogo.svg";
import trackLogo from "../../../assets/vendors/dashboard/trackLogo.svg";
import messgLogo from "../../../assets/vendors/dashboard/messgLogo.svg";
import logOutLogo from "../../../assets/vendors/dashboard/logOutLogo.svg";
import { Settings, Bell } from "lucide-react";

const SideMenu = () => {
  const [showFinancialDropdown, setShowFinancialDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const currentPath = window.location.pathname;

  return (
    <>
      {/* Custom Scrollbar – same as first */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        .sidebar-scroll { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
      `}</style>

      <div className="poppins min-w-[279px] h-screen bg-[#FFFFFF] flex flex-col py-4 px-6 rounded-tr-[10px] rounded-br-[10px] sticky top-0 left-0 shadow-lg overflow-hidden">

        {/* Logo – same as first */}
        <div className="flex-shrink-0 mb-4">
          <h1
            className="text-[20px] font-[700] text-center uppercase leading-tight cursor-pointer"
            onClick={() => (window.location.href = "/mainDashboard")}
          >
            Company <br />
            <span className="text-[#0955AC]">Logo</span>
          </h1>
        </div>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full pr-2 sidebar-scroll pb-4">
          <div className="figtree flex flex-col items-start gap-4 text-[18px] font-[500] text-[#00000066]">

            {/* Dashboard */}
            <div
              className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                currentPath === "/vendors/multimodal/dashboard" ||
                currentPath === "/multimodal/dashboard"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => (window.location.href = "/multimodal/dashboard")}
            >
              <img src={dashLogo} className="w-[22px]" alt="Dashboard" />
              <span>Dashboard</span>
            </div>

            {/* Bookings */}
            <div
              className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                currentPath === "/vendors/multimodal/bookings" ||
                currentPath === "/multimodal/bookings"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => (window.location.href = "/multimodal/bookings")}
            >
              <img src={bookLogo} className="w-[22px]" alt="Bookings" />
              <span>Bookings</span>
            </div>

            {/* Units */}
            <div
              className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                currentPath === "/vendors/multimodal/units" ||
                currentPath === "/multimodal/units"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => (window.location.href = "/multimodal/units")}
            >
              <img src={uniLogo} className="w-[22px]" alt="Units" />
              <span>Units</span>
            </div>

            {/* Calendar */}
            <div
              className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                currentPath === "/vendors/multimodal/calendar" ||
                currentPath === "/multimodal/calendar"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => (window.location.href = "/multimodal/calendar")}
            >
              <img src={calendarLogo} className="w-[22px]" alt="Calendar" />
              <span>Calendar</span>
            </div>

            {/* Clients */}
            <div
              className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                currentPath === "/vendors/multimodal/clients" ||
                currentPath === "/multimodal/clients"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => (window.location.href = "/multimodal/clients")}
            >
              <img src={clientsLogo} className="w-[22px]" alt="Clients" />
              <span>Clients</span>
            </div>

            {/* Financial Dropdown */}
            <div
              className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                [
                  "/vendors/multimodal/payment",
                  "/multimodal/payment",
                  "/vendors/multimodal/expenses",
                  "/multimodal/expenses",
                ].includes(currentPath)
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => setShowFinancialDropdown((prev) => !prev)}
            >
              <img src={finLogo} className="w-[22px]" alt="Financial" />
              <span>Financial</span>
            </div>

            {showFinancialDropdown && (
              <div className="ml-8 mb-2 w-40 bg-white flex flex-col text-[18px] font-[500]">
                <div
                  className={`px-3 py-1.5 cursor-pointer rounded-lg ${
                    currentPath === "/vendors/multimodal/payment" ||
                    currentPath === "/multimodal/payment"
                      ? "bg-[#0955AC29] text-[#000000] font-[700]"
                      : "text-[#00000066]"
                  }`}
                  onClick={() => (window.location.href = "/multimodal/payment")}
                >
                  Payment
                </div>
                <div
                  className={`px-3 py-1.5 cursor-pointer rounded-lg ${
                    currentPath === "/vendors/multimodal/expenses" ||
                    currentPath === "/multimodal/expenses"
                      ? "bg-[#0955AC29] text-[#000000] font-[700]"
                      : "text-[#00000066]"
                  }`}
                  onClick={() => (window.location.href = "/multimodal/expenses")}
                >
                  Expenses
                </div>
              </div>
            )}

            {/* Tracking */}
            <div
              className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                currentPath === "/vendors/multimodal/tracking" ||
                currentPath === "/multimodal/tracking"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => (window.location.href = "/multimodal/tracking")}
            >
              <img src={trackLogo} className="w-[22px]" alt="Tracking" />
              <span>Tracking</span>
            </div>

            {/* Message
            <div
              className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                currentPath === "/vendors/multimodal/message" ||
                currentPath === "/multimodal/message"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => (window.location.href = "/multimodal/message")}
            >
              <img src={messgLogo} className="w-[22px]" alt="Message" />
              <span>Message</span>
            </div> */}

            {/* Settings Dropdown
            <div
              className={`flex items-center gap-5 w-full rounded-lg px-3 py-1.5 cursor-pointer ${
                currentPath === "/vendors/multimodal/settingsPage" ||
                currentPath === "/multimodal/settingsPage"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => setShowSettingsDropdown((prev) => !prev)}
            >
              <Settings className="w-[22px] h-[22px]" />
              <span>Settings</span>
            </div> */}

            {showSettingsDropdown && (
              <div className="ml-8 mb-2 w-48 bg-white flex flex-col text-[18px] font-[500]">
                <div
                  className={`px-3 py-1.5 cursor-pointer rounded-lg flex items-center gap-2 ${
                    currentPath === "/vendors/multimodal/notifications" ||
                    currentPath === "/multimodal/notifications"
                      ? "bg-[#0955AC29] text-[#000000] font-[700]"
                      : "text-[#00000066]"
                  }`}
                  onClick={() => (window.location.href = "/multimodal/notifications")}
                >
                  <Bell className="w-[16px] h-[16px]" />
                  <span>Notifications</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout – fixed bottom
        <div className="flex-shrink-0 mt-2 pt-4 border-t border-gray-200 w-full">
          <div
            className="figtree flex items-center gap-5 text-[18px] font-[500] text-[#00000066] px-3 py-2.5 hover:bg-[#FEF2F2] hover:text-[#DC2626] rounded-lg w-full transition-all duration-200 group cursor-pointer"
            onClick={() => (window.location.href = "/logout")}
          >
            <img
              src={logOutLogo}
              className="w-[22px] h-[22px] group-hover:brightness-0 group-hover:invert group-hover:sepia group-hover:saturate-[5000%] group-hover:hue-rotate-[340deg] transition-all duration-200"
              alt="Logout"
            />
            <span>Logout</span>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default SideMenu;