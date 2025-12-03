import React, { useState, useEffect } from "react";
import SideMenu from "../../../components/vendors/warehouse/SideMenu";
import BookingContent from "../../../components/vendors/warehouse/bookings/BookingContent";
import UserDropdown from "../../../components/vendors/UserDropdown";
import NotificationDropdown from "../../../components/vendors/warehouse/NotificationDropdown";
import { Menu } from "lucide-react";
import { usePage } from "@inertiajs/react";

const Booking = () => {
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [warehouseNotifications, setWarehouseNotifications] = useState([]);
    const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);

    // Track scroll position
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!auth?.user) return;

            try {
                const response = await fetch(
                    "/vendors/warehouse/notifications/data"
                );
                if (response.ok) {
                    const data = await response.json();
                    setWarehouseNotifications(data.notifications || []);
                    setNotificationUnreadCount(data.unread_count || 0);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        if (auth?.user) {
            fetchNotifications();
            // Refresh notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [auth?.user]);
    return (
        <div className="bg-[#E5E5E5] min-h-screen">
            <div className="flex flex-row gap-10 h-auto">
                {/* Mobile Header Bar with Toggle Button, Notifications and UserDropdown */}
                <div
                    className={`lg:hidden fixed left-0 right-0 top-0 z-50 flex justify-between items-center px-2 py-2 transition-all duration-300 ${
                        isScrolled
                            ? "bg-black/10 backdrop-blur-sm shadow-md"
                            : ""
                    }`}
                >
                    <button
                        className="p-2 bg-white rounded-full shadow"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        {!isOpen && (
                            <div className="scale-75">
                                <NotificationDropdown
                                    notifications={warehouseNotifications}
                                    unreadCount={notificationUnreadCount}
                                />
                            </div>
                        )}
                        <div className="scale-75">
                            <UserDropdown />
                        </div>
                    </div>
                </div>

                {/* Side Menu */}
                <div
                    className={`fixed lg:static top-0 left-0 h-screen w-64 z-40 transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 bg-white shadow lg:shadow-none overflow-hidden`}
                >
                    <SideMenu isOpen={isOpen} />
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto h-screen">
                    <div>No content yet</div>{" "}
                </div>
            </div>
        </div>
    );
};

export default Booking;
