import React, { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Calendar,
  Users,
  Wallet,
  MapPin,
  MessageSquare,
  LogOut,
  Settings,
  Bell,
} from "lucide-react";

const SideMenu = () => {
  const [showFinancialDropdown, setShowFinancialDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const currentPath = window.location.pathname;

  return (
    <>
      {/* Custom Scrollbar – EXACTLY like first component */}
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
            onClick={() => (window.location.href = "/vendorAllBookings")}
          >
            Company <br />
            <span className="text-[#0955AC]">Logo</span>
          </h1>
        </div>

        {/* Scrollable Menu – same structure & styles */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full pr-2 sidebar-scroll pb-4">
          <div className="figtree flex flex-col items-start gap-4 text-[18px] font-[500] text-[#00000066]">

            {/* Dashboard */}
            <div
              className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                currentPath === "/vendors/courierService/dashboard" ||
                currentPath === "/courierService/dashboard"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => (window.location.href = "/courierService/dashboard")}
            >
              <LayoutDashboard className="w-[22px] h-[22px]" />
              <h1>Dashboard</h1>
            </div>

            {/* Bookings */}
            <div
              className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                currentPath === "/vendors/courierService/bookings" ||
                currentPath === "/courierService/bookings"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => (window.location.href = "/courierService/bookings")}
            >
              <Package className="w-[22px] h-[22px]" />
              <h1>Bookings</h1>
            </div>

            {/* Units */}
            <div
              className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                currentPath === "/vendors/courierService/units" ||
                currentPath === "/courierService/units"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => (window.location.href = "/courierService/units")}
            >
              <Boxes className="w-[22px] h-[22px]" />
              <h1>Units</h1>
            </div>

            {/* Calendar */}
            <div
              className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                currentPath === "/vendors/courierService/calendar" ||
                currentPath === "/courierService/calendar"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => (window.location.href = "/courierService/calendar")}
            >
              <Calendar className="w-[22px] h-[22px]" />
              <h1>Calendar</h1>
            </div>

            {/* Clients */}
            <div
              className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                currentPath === "/vendors/courierService/clients" ||
                currentPath === "/courierService/clients"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => (window.location.href = "/courierService/clients")}
            >
              <Users className="w-[22px] h-[22px]" />
              <h1>Clients</h1>
            </div>

            {/* Financial Dropdown */}
            <div
              className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                [
                  "/vendors/courierService/payment",
                  "/courierService/payment",
                  "/vendors/courierService/expenses",
                  "/courierService/expenses",
                ].includes(currentPath)
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => setShowFinancialDropdown((prev) => !prev)}
            >
              <Wallet className="w-[22px] h-[22px]" />
              <h1>Financial</h1>
            </div>

            {showFinancialDropdown && (
              <div className="ml-8 mb-2 w-40 bg-white flex flex-col text-[18px] font-[500]">
                <div
                  className={`px-3 py-1.5 cursor-pointer rounded-lg ${
                    currentPath === "/vendors/courierService/payment" ||
                    currentPath === "/courierService/payment"
                      ? "bg-[#0955AC29] text-[#000000] font-[700]"
                      : "text-[#00000066]"
                  }`}
                  onClick={() => (window.location.href = "/courierService/payment")}
                >
                  Payment
                </div>
                <div
                  className={`px-3 py-1.5 cursor-pointer rounded-lg ${
                    currentPath === "/vendors/courierService/expenses" ||
                    currentPath === "/courierService/expenses"
                      ? "bg-[#0955AC29] text-[#000000] font-[700]"
                      : "text-[#00000066]"
                  }`}
                  onClick={() => (window.location.href = "/courierService/expenses")}
                >
                  Expenses
                </div>
              </div>
            )}

            {/* Tracking */}
            <div
              className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                currentPath === "/vendors/courierService/tracking" ||
                currentPath === "/courierService/tracking"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => (window.location.href = "/courierService/tracking")}
            >
              <MapPin className="w-[22px] h-[22px]" />
              <h1>Tracking</h1>
            </div>

            {/* Message
            <div
              className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                currentPath === "/vendors/courierService/message" ||
                currentPath === "/courierService/message"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => (window.location.href = "/courierService/message")}
            >
              <MessageSquare className="w-[22px] h-[22px]" />
              <h1>Message</h1>
            </div> */}

            {/* Settings Dropdown
            <div
              className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                currentPath === "/vendors/courierService/settingsPage" ||
                currentPath === "/courierService/settingsPage"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() => setShowSettingsDropdown((prev) => !prev)}
            >
              <Settings className="w-[22px] h-[22px]" />
              <h1>Settings</h1>
            </div> */}
{/* 
            {showSettingsDropdown && (
              <div className="ml-8 mb-2 w-48 bg-white flex flex-col text-[18px] font-[500]">
                <div
                  className={`px-3 py-1.5 cursor-pointer rounded-lg flex items-center gap-2 ${
                    currentPath === "/vendors/courierService/notifications" ||
                    currentPath === "/courierService/notifications"
                      ? "bg-[#0955AC29] text-[#000000] font-[700]"
                      : "text-[#00000066]"
                  }`}
                  onClick={() => (window.location.href = "/courierService/notifications")}
                >
                  <Bell className="w-[16px] h-[16px]" />
                  <span>Notifications</span>
                </div>
              </div>
            )} */}
          </div>
        </div>

        {/* Logout – fixed bottom, same hover red effect
        <div className="flex-shrink-0 mt-2 pt-4 border-t border-gray-200 w-full">
          <div
            className="figtree flex flex-row justify-start items-center gap-5 cursor-pointer text-[18px] font-[500] text-[#00000066] px-3 py-2.5 hover:bg-[#FEF2F2] hover:text-[#DC2626] rounded-lg w-full transition-all duration-200 group"
            onClick={() => (window.location.href = "/logout")}
          >
            <LogOut
              className="w-[22px] h-[22px] group-hover:fill-[#DC2626] transition-all duration-200"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(20%) sepia(90%) saturate(5000%) hue-rotate(340deg)",
              }}
            />
            <h1>Logout</h1>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default SideMenu;