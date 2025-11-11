// resources/js/Pages/Web/components/vendors/SideMenu.jsx
import React, { useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  Calendar,
  Users,
  Wallet,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";

const SideMenu = () => {
  const [showFinancialDropdown, setShowFinancialDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const currentPath = window.location.pathname;

  return (
    <>
      {/* Scrollbar Styling */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
      `}</style>

      <div className="poppins min-w-[279px] h-screen bg-[#FFFFFF] flex flex-col py-4 px-6 rounded-tr-[10px] rounded-br-[10px] sticky top-0 left-0 shadow-lg overflow-hidden">
        {/* Logo - Fixed at top */}
        <div className="flex-shrink-0 mb-4">
          <h1
            className="text-[20px] font-[700] text-center uppercase leading-tight cursor-pointer"
            onClick={() => (window.location.href = "/mainDashboard")}
          >
            Company <br />
            <span className="text-[#0955AC]">Logo</span>
          </h1>
        </div>

        {/* Scrollable menu container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full pr-2 sidebar-scroll pb-4">
          <div className="figtree flex flex-col items-start gap-4 text-[18px] font-[500] text-[#00000066]">
            {/* Dashboard */}
            <div
              className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                currentPath === "/vendors/ticketBooking/dashboard" ||
                currentPath === "/ticketBooking/dashboard"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() =>
                (window.location.href = "/ticketBooking/dashboard")
              }
            >
              <LayoutDashboard className="w-[22px] h-[22px]" />
              <h1>Dashboard</h1>
            </div>

            {/* Bookings */}
            <div
              className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                currentPath === "/vendors/ticketBooking/bookings" ||
                currentPath === "/ticketBooking/bookings"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() =>
                (window.location.href = "/ticketBooking/bookings")
              }
            >
              <Ticket className="w-[22px] h-[22px]" />
              <h1>Bookings</h1>
            </div>

            {/* Calendar */}
            <div
              className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                currentPath === "/vendors/ticketBooking/calendar" ||
                currentPath === "/ticketBooking/calendar"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() =>
                (window.location.href = "/ticketBooking/calendar")
              }
            >
              <Calendar className="w-[22px] h-[22px]" />
              <h1>Calendar</h1>
            </div>

            {/* Clients */}
            <div
              className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                currentPath === "/vendors/ticketBooking/clients" ||
                currentPath === "/ticketBooking/clients"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
              onClick={() =>
                (window.location.href = "/ticketBooking/clients")
              }
            >
              <Users className="w-[22px] h-[22px]" />
              <h1>Clients</h1>
            </div>

            {/* Financial Dropdown */}
            <div
              className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                [
                  "/vendors/ticketBooking/payment",
                  "/ticketBooking/payment",
                  "/vendors/ticketBooking/expenses",
                  "/ticketBooking/expenses",
                ].includes(currentPath)
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
            >
              <Wallet className="w-[22px] h-[22px]" />
              <h1
                onClick={() =>
                  setShowFinancialDropdown((prev) => !prev)
                }
              >
                Financial
              </h1>
            </div>

            {showFinancialDropdown && (
              <div className="ml-8 mb-2 w-40 bg-white flex flex-col text-[18px] font-[500]">
                <div
                  className={`px-3 py-1.5 cursor-pointer rounded-lg ${
                    currentPath === "/vendors/ticketBooking/payment" ||
                    currentPath === "/ticketBooking/payment"
                      ? "bg-[#0955AC29] text-[#000000] font-[700]"
                      : "text-[#00000066]"
                  }`}
                  onClick={() =>
                    (window.location.href = "/ticketBooking/payment")
                  }
                >
                  Payment
                </div>
                <div
                  className={`px-3 py-1.5 cursor-pointer rounded-lg ${
                    currentPath === "/vendors/ticketBooking/expenses" ||
                    currentPath === "/ticketBooking/expenses"
                      ? "bg-[#0955AC29] text-[#000000] font-[700]"
                      : "text-[#00000066]"
                  }`}
                  onClick={() =>
                    (window.location.href = "/ticketBooking/expenses")
                  }
                >
                  Expenses
                </div>
              </div>
            )}

            {/* Settings with Notifications
            <div
              className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-3 py-1.5 ${
                currentPath === "/vendors/ticketBooking/settingsPage" ||
                currentPath === "/ticketBooking/settingsPage" ||
                currentPath === "/vendors/ticketBooking/notifications"
                  ? "bg-[#0955AC29] text-[#000000] font-[700]"
                  : "text-[#00000066]"
              }`}
            >
              <Settings className="w-[22px] h-[22px]" />
              <h1
                onClick={() =>
                  setShowSettingsDropdown((prev) => !prev)
                }
              >
                Settings
              </h1>
            </div> */}

            {showSettingsDropdown && (
              <div className="ml-8 mb-2 w-48 bg-white flex flex-col text-[18px] font-[500]">
                <div
                  className={`px-3 py-1.5 cursor-pointer rounded-lg flex items-center gap-2 ${
                    currentPath === "/vendors/ticketBooking/notifications"
                      ? "bg-[#0955AC29] text-[#000000] font-[700]"
                      : "text-[#00000066]"
                  }`}
                  onClick={() =>
                    (window.location.href =
                      "/ticketBooking/notifications")
                  }
                >
                  <Bell className="w-[16px] h-[16px]" />
                  <span>Notifications</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout - Fixed at bottom (commented as in original) */}
        {/* <div className="flex-shrink-0 mt-2 pt-4 border-t border-gray-200 w-full">
          <div className="figtree flex flex-row justify-start items-center gap-5 cursor-pointer text-[18px] font-[500] text-[#00000066] px-3 py-2.5 hover:bg-[#FEF2F2] hover:text-[#DC2626] rounded-lg w-full transition-all duration-200 group">
            <LogOut className="w-[22px] h-[22px] group-hover:text-red-600 transition-colors" />
            <h1>Logout</h1>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default SideMenu;