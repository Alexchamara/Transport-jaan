// resources/js/Pages/Web/components/vendors/notifications/NotificationsPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { usePage, Link } from "@inertiajs/react";
import axios from "axios";
import VendorShellLayout from "../../../../Components/vendors/VendorShellLayout";
import bell from "../../assets/vendors/dashboard/bell.svg";
import proPic from "../../assets/vendors/dashboard/proPic.svg";
import logOutLogo from "../../assets/vendors/dashboard/logOutLogo.svg"; // ← NEW
import { ChevronDown } from "lucide-react"; // ← NEW
import NotificationDropdown from "../../components/vendors/NotificationDropdown";

const NotificationsPage = () => {
  const { auth, unreadNotifications: initialUnread = 0 } = usePage().props;
  const user = auth?.user;

  // USER DROPDOWN STATE
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowUserDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [activeService, setActiveService] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vendorActiveService") || "All Bookings";
    }
    return "All Bookings";
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/vendors/notifications/data");
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`/vendors/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post("/vendors/notifications/mark-all-read");

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      await axios.delete(`/vendors/notifications/${notificationId}`);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      const notification = notifications.find((n) => n.id === notificationId);
      if (notification && !notification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification. This feature may not be implemented yet.");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_booking":
        return (
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "booking_cancelled":
        return (
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "payment_received":
        return (
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <VendorShellLayout activeService={activeService}>
      <div className="w-full h-auto pr-5 py-10">
        {/* ==================== HEADER WITH DROPDOWN ==================== */}
        <div className="flex flex-row gap-5 justify-between items-center mb-10 ml-8">
          <h1 className="figtree text-[35px] font-[700]">Notifications</h1>

          <div className="flex flex-row gap-5 items-center">
            {/* Notification Bell
              <NotificationDropdown bellIcon={bell} unreadCount={unreadCount} /> */}
            
          </div>
        </div>

        {/* ==================== STATS & ACTIONS ==================== */}
        <div className="bg-white rounded-[10px] px-8 py-6 mb-6 ml-8 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex gap-8">
              <div>
                <p className="text-gray-500 text-sm">Total Notifications</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Unread</p>
                <p className="text-2xl font-bold text-red-500">{unreadCount}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Read</p>
                <p className="text-2xl font-bold text-green-500">
                  {notifications.length - unreadCount}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        {/* ==================== FILTER TABS ==================== */}
        <div className="bg-white rounded-[10px] px-8 py-4 mb-6 shadow-sm ml-8">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${filter === "all"
                  ? "bg-[#0955AC] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${filter === "unread"
                  ? "bg-[#0955AC] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${filter === "read"
                  ? "bg-[#0955AC] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* ==================== NOTIFICATIONS LIST ==================== */}
        <div className="bg-white rounded-[10px] shadow-sm ml-8">
          {loading ? (
            <div className="px-8 py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="px-8 py-20 text-center">
              <svg
                className="w-20 h-20 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p className="text-gray-500 text-lg font-semibold">
                {filter === "all" ? "No notifications yet" : `No ${filter} notifications`}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {filter === "all"
                  ? "When you receive notifications, they will appear here"
                  : `You don't have any ${filter} notifications at the moment`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-8 py-6 hover:bg-gray-50 transition-colors ${!notification.is_read ? "bg-blue-50" : ""
                    }`}
                >
                  <div className="flex items-start gap-4">
                    {getNotificationIcon(notification.type)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p
                            className={`text-base ${!notification.is_read
                                ? "font-semibold text-gray-900"
                                : "font-medium text-gray-700"
                              }`}
                          >
                            {notification.message}
                          </p>
                          {notification.vehicle_name && (
                            <p className="text-sm text-gray-500 mt-1">
                              Vehicle: {notification.vehicle_name}
                            </p>
                          )}
                          {notification.client_name && (
                            <p className="text-sm text-gray-500 mt-1">
                              Client: {notification.client_name}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.created_at}
                          </p>
                        </div>

                        {!notification.is_read && (
                          <div className="flex-shrink-0 w-3 h-3 bg-blue-600 rounded-full ml-4 mt-1"></div>
                        )}
                      </div>

                      <div className="flex gap-3 mt-4">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Mark as Read
                          </button>
                        )}
                        {notification.booking_id && (
                          <button
                            onClick={() => (window.location.href = "/vendors/bookings")}
                            className="text-sm text-gray-600 hover:text-gray-800 font-semibold"
                          >
                            View Booking
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-sm text-red-600 hover:text-red-800 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </VendorShellLayout>
  );
};

export default NotificationsPage;