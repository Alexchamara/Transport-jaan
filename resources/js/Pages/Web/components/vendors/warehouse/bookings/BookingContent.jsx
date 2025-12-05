import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import WarehouseBookingService from "../../../../../../services/WarehouseBookingService";

import search from "../../../../assets/vendors/dashboard/searchIcon.svg";
import filterIcon from "../../../../assets/vendors/dashboard/icons/filterIcon.svg";
import miniSearchIcon from "../../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";
import upArrow from "../../../../assets/vendors/dashboard/icons/upArrow.svg";

import icon1 from "../../../../assets/vendors/booking/icons/icon1.svg";
import icon2 from "../../../../assets/vendors/booking/icons/icon2.svg";
import icon3 from "../../../../assets/vendors/booking/icons/icon3.svg";
import icon4 from "../../../../assets/vendors/booking/icons/icon4.svg";

import WarehouseBookingTable from "./WarehouseBookingTable";
import BookingBarChart from "./BookingBarChart";
import UserDropdown from "../../UserDropdown";
import NotificationDropdown from "../NotificationDropdown";

const BookingContent = () => {
  const { auth } = usePage().props;
  const user = auth?.user;

  const paymentStatusColors = {
    Paid: { color: "#3B8F31", bg: "#ACE199" },
    Pending: { color: "#FF60608C", bg: "#FF60608C" },
  };

  const statusColors = {
    Ongoing: { bg: "#FFCD29", text: "#000000" },
    Returned: { bg: "#3B8F31", text: "#FFCD29" },
  };

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    upcoming_bookings: 0,
    pending_bookings: 0,
    cancelled_bookings: 0,
    completed_bookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    warehouseType: "",
    status: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseNotifications, setWarehouseNotifications] = useState([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);

  // Fetch bookings and stats
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, statsRes] = await Promise.all([
          WarehouseBookingService.getBookings({ page: 1, per_page: 10 }),
          WarehouseBookingService.getBookingStats(),
        ]);

        if (!isMounted) return;

        if (bookingsRes?.success) {
          const formatted = (bookingsRes.data || []).map((b) =>
            WarehouseBookingService.formatBookingForDisplay(b)
          );
          setBookings(formatted);
        } else {
          setBookings([]);
          setError(bookingsRes?.message || "Failed to load bookings");
        }

        if (statsRes?.success) {
          setStats({
            upcoming_bookings: statsRes.data?.upcoming_bookings ?? 0,
            pending_bookings: statsRes.data?.pending_bookings ?? 0,
            cancelled_bookings: statsRes.data?.cancelled_bookings ?? 0,
            completed_bookings: statsRes.data?.completed_bookings ?? 0,
          });
        } else {
          setStats({
            upcoming_bookings: 0,
            pending_bookings: 0,
            cancelled_bookings: 0,
            completed_bookings: 0,
          });
        }
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError("Failed to load booking data");
        setBookings([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => (prev.search === searchTerm ? prev : { ...prev, search: searchTerm }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!auth?.user) return;

      try {
        const response = await fetch('/vendors/warehouse/notifications/data');
        if (response.ok) {
          const data = await response.json();
          setWarehouseNotifications(data.notifications || []);
          setNotificationUnreadCount(data.unread_count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    if (auth?.user) {
      fetchNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [auth?.user]);

  const handleWarehouseTypeChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => (prev.warehouseType === value ? prev : { ...prev, warehouseType: value }));
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => (prev.status === value ? prev : { ...prev, status: value }));
  };

  const warehouseTypeOptions = [
    { value: "", label: "All warehouse types" },
    { value: "cold_storage", label: "Cold Storage" },
    { value: "dry_storage", label: "Dry Storage" },
    { value: "hazardous_material", label: "Hazardous Material" },
    { value: "bonded", label: "Bonded" },
  ];

  const statusOptions = [
    { value: "", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div>no</div>
  );
};

export default BookingContent;
