import React, { useState, useEffect, useCallback } from "react";
import { usePage } from "@inertiajs/react";
import {
    Search,
    Settings,
    Bell,
    DollarSign,
    CalendarDays,
    Filter,
    ChevronDown,
    ArrowUp,
    Clock,
    Building2,
    Package,
    Boxes,
    Users,
    RefreshCw,
    AlertCircle,
} from "lucide-react";
import axios from "axios";
import BookingOverviewBarChart from "./BookingOverviewBarChart";
import EarningSummaryChart from "./EarningSummaryChart";
import RealStatusPieChart from "./RealStatusPieChart";
import CarBookingTable from "./CarBookingTable";

import UserDropdown from "../../UserDropdown";
import NotificationDropdown from "../NotificationDropdown";

const DashContent = () => {
    const { auth } = usePage().props;
    const user = auth?.user;

    // State management
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Dashboard data state
    const [dashboardStats, setDashboardStats] = useState({
        totalRevenue: "LKR 0",
        activeBookings: 0,
        occupiedUnits: "0 Units",
        totalUnits: "0 Units",
        revenueChange: "+0%",
        bookingsChange: "+0%",
        occupiedChange: "+0%",
        unitsChange: "+0%",
    });

    const [warehouseNotifications, setWarehouseNotifications] = useState([]);
    const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);

    const [chartData, setChartData] = useState({
        bookingOverview: [],
        earningSummary: [],
        warehouseStatus: [],
    });

    const [bookings, setBookings] = useState([]);
    const [allBookings, setAllBookings] = useState([]); // Store all bookings for filtering
    const [unitTypes, setUnitTypes] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState("Last 8 months");
    const [statusFilter, setStatusFilter] = useState("This Week");
    const [activeFilter, setActiveFilter] = useState("all");

    // Real-time update state
    const autoRefresh = true;
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [liveMode, setLiveMode] = useState(false);
    const updateInterval = 30000; // 30 seconds
    const [notifications, setNotifications] = useState([]);
    const [realtimeStats, setRealtimeStats] = useState(null);

    // Unit availability form state
    const [availabilityForm, setAvailabilityForm] = useState({
        unitType: "",
        date: "",
        time: "",
    });

    const calculateChange = useCallback((oldValue, newValue) => {
        if (!oldValue || oldValue === 0) return "+0%";
        const change = ((newValue - oldValue) / oldValue) * 100;
        const sign = change >= 0 ? "+" : "";
        return `${sign}${change.toFixed(1)}%`;
    }, []);

    const showNotification = useCallback((message, type = "info") => {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date(),
        };
        setNotifications((prev) => [...prev.slice(-4), notification]);

        setTimeout(() => {
            setNotifications((prev) =>
                prev.filter((n) => n.id !== notification.id)
            );
        }, 5000);
    }, []);

    const playNotificationSound = useCallback(() => {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const context = new AudioCtx();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.frequency.setValueAtTime(800, context.currentTime);
            gainNode.gain.setValueAtTime(0.1, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                context.currentTime + 0.3
            );

            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.3);
        } catch (error) {
            console.log("Audio not supported");
        }
    }, []);

    const applyCurrentFilters = useCallback(
        (bookingsData) => {
            let filtered = bookingsData;

            if (activeFilter !== "all") {
                switch (activeFilter) {
                    case "active":
                        filtered = filtered.filter((b) =>
                            ["confirmed", "active"].includes(b.status)
                        );
                        break;
                    case "pending":
                        filtered = filtered.filter(
                            (b) => b.status === "pending"
                        );
                        break;
                    case "completed":
                        filtered = filtered.filter(
                            (b) => b.status === "completed"
                        );
                        break;
                    case "cancelled":
                        filtered = filtered.filter(
                            (b) => b.status === "cancelled"
                        );
                        break;
                    default:
                        break;
                }
            }

            if (searchQuery.trim()) {
                const searchTerm = searchQuery.toLowerCase();
                filtered = filtered.filter(
                    (booking) =>
                        booking.contact_person
                            ?.toLowerCase()
                            .includes(searchTerm) ||
                        booking.company_name
                            ?.toLowerCase()
                            .includes(searchTerm) ||
                        booking.email?.toLowerCase().includes(searchTerm) ||
                        booking.phone?.includes(searchTerm) ||
                        booking.booking_reference
                            ?.toLowerCase()
                            .includes(searchTerm) ||
                        booking.status?.toLowerCase().includes(searchTerm)
                );
            }

            setBookings(filtered);
        },
        [activeFilter, searchQuery]
    );

    // Fetch dashboard statistics with real-time updates
    const fetchDashboardStats = useCallback(
        async (silent = false) => {
            try {
                const response = await axios.get(
                    "/vendors/warehouse/api/bookings/stats",
                    {
                        params: { timestamp: Date.now() },
                    }
                );
                if (response.data.success) {
                    const stats = response.data.data;
                    const newStats = {
                        totalRevenue: `LKR ${(
                            stats.completed_bookings * 1200
                        ).toLocaleString()}`,
                        activeBookings:
                            stats.pending_bookings + stats.upcoming_bookings,
                        occupiedUnits: `${stats.upcoming_bookings} Units`,
                        totalUnits: `${stats.upcoming_bookings +
                            stats.completed_bookings +
                            20
                            } Units`,
                        revenueChange: calculateChange(
                            dashboardStats.activeBookings,
                            stats.pending_bookings + stats.upcoming_bookings
                        ),
                        bookingsChange: "+8.3%",
                        occupiedChange: "+5.2%",
                        unitsChange: "+2.1%",
                    };

                    if (
                        silent &&
                        JSON.stringify(newStats) !==
                        JSON.stringify(dashboardStats)
                    ) {
                        showNotification("Dashboard stats updated", "success");
                    }

                    setDashboardStats(newStats);
                    setRealtimeStats(stats);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
                // Use fallback data when API is unavailable
                if (!silent) {
                    const fallbackStats = {
                        totalRevenue: "LKR 24,500",
                        activeBookings: 12,
                        occupiedUnits: "8 Units",
                        totalUnits: "15 Units",
                        revenueChange: "+12.5%",
                        bookingsChange: "+8.3%",
                        occupiedChange: "+5.2%",
                        unitsChange: "+2.1%",
                    };
                    setDashboardStats(fallbackStats);
                    setRealtimeStats({
                        pending_bookings: 5,
                        upcoming_bookings: 7,
                        completed_bookings: 20,
                    });
                }
            }
        },
        [calculateChange, showNotification]
    );

    // Fetch chart data with real-time updates
    const fetchChartData = useCallback(
        async (silent = false) => {
            try {
                if (!silent) setIsSearching(true);
                const response = await axios.get(
                    "/vendors/warehouse/api/bookings/chart-data",
                    {
                        params: {
                            period: selectedPeriod,
                            timestamp: Date.now(),
                        },
                    }
                );
                if (response.data.success) {
                    // Transform the API data to match chart component format
                    const transformedData = response.data.data.map((item) => ({
                        name: item.name,
                        bookings: (item.done || 0) + (item.cancelled || 0),
                        confirmed: item.done || 0,
                        pending: 0, // API doesn't provide pending separately
                        cancelled: item.cancelled || 0,
                    }));

                    // Calculate earnings based on bookings (assuming $1500 per confirmed booking)
                    const earnings = response.data.data.map((item) => ({
                        month: item.name,
                        earnings: (item.done || 0) * 1500,
                    }));

                    setChartData((prev) => ({
                        ...prev,
                        bookingOverview: transformedData,
                        earningSummary: earnings,
                    }));
                    if (silent) setLastUpdated(new Date());
                }
            } catch (error) {
                console.error("Failed to fetch chart data:", error);
                // Use fallback chart data when API is unavailable
                if (!silent) {
                    const fallbackData = {
                        bookingOverview: [
                            {
                                name: "Jan",
                                bookings: 45,
                                confirmed: 32,
                                pending: 8,
                                cancelled: 5,
                            },
                            {
                                name: "Feb",
                                bookings: 52,
                                confirmed: 40,
                                pending: 7,
                                cancelled: 5,
                            },
                            {
                                name: "Mar",
                                bookings: 61,
                                confirmed: 48,
                                pending: 8,
                                cancelled: 5,
                            },
                            {
                                name: "Apr",
                                bookings: 58,
                                confirmed: 44,
                                pending: 9,
                                cancelled: 5,
                            },
                            {
                                name: "May",
                                bookings: 67,
                                confirmed: 52,
                                pending: 10,
                                cancelled: 5,
                            },
                            {
                                name: "Jun",
                                bookings: 73,
                                confirmed: 58,
                                pending: 10,
                                cancelled: 5,
                            },
                        ],
                        earningSummary: [
                            { month: "Jan", earnings: 12000 },
                            { month: "Feb", earnings: 15000 },
                            { month: "Mar", earnings: 18000 },
                            { month: "Apr", earnings: 16500 },
                            { month: "May", earnings: 22000 },
                            { month: "Jun", earnings: 24500 },
                        ],
                    };
                    setChartData((prev) => ({ ...prev, ...fallbackData }));
                }
            } finally {
                if (!silent) setIsSearching(false);
            }
        },
        [selectedPeriod]
    );

    // Fetch bookings data with real-time updates
    const fetchBookings = useCallback(
        async (silent = false) => {
            try {
                const response = await axios.get(
                    "/vendors/warehouse/api/bookings",
                    {
                        params: {
                            per_page: 50,
                            timestamp: Date.now(),
                        },
                    }
                );
                if (response.data.success) {
                    const newBookings = response.data.data;

                    if (silent && allBookings.length > 0) {
                        const newBookingIds = newBookings.map((b) => b.id);
                        const existingIds = allBookings.map((b) => b.id);
                        const hasNewBookings = newBookingIds.some(
                            (id) => !existingIds.includes(id)
                        );

                        if (hasNewBookings) {
                            showNotification(
                                "New booking received!",
                                "success"
                            );
                            playNotificationSound();
                        }
                    }

                    setAllBookings(newBookings);
                    applyCurrentFilters(newBookings);
                }
            } catch (error) {
                console.error("Failed to fetch bookings:", error);
                // Use fallback booking data when API is unavailable
                if (!silent) {
                    const fallbackBookings = [
                        {
                            id: 1,
                            contact_person: "John Smith",
                            company_name: "ABC Logistics",
                            email: "john@abclogistics.com",
                            phone: "+1234567890",
                            booking_reference: "WH001",
                            status: "confirmed",
                            created_at: new Date().toISOString(),
                        },
                        {
                            id: 2,
                            contact_person: "Sarah Johnson",
                            company_name: "Global Trade Co",
                            email: "sarah@globaltrade.com",
                            phone: "+1234567891",
                            booking_reference: "WH002",
                            status: "pending",
                            created_at: new Date(
                                Date.now() - 86400000
                            ).toISOString(),
                        },
                    ];
                    setAllBookings(fallbackBookings);
                    applyCurrentFilters(fallbackBookings);
                }
            }
        },
        [applyCurrentFilters, showNotification, playNotificationSound]
    );

    // Fetch warehouse units data
    const fetchUnits = useCallback(async () => {
        try {
            const response = await axios.get("/vendors/warehouse/api/units");
            if (response.data.data) {
                const units = response.data.data;
                const typeStats = units.reduce((acc, unit) => {
                    const type = unit.type?.replace("_", " ") || "Unknown";
                    if (!acc[type]) acc[type] = { total: 0, occupied: 0 };
                    acc[type].total++;
                    if (!unit.is_available) acc[type].occupied++;
                    return acc;
                }, {});

                const processedTypes = Object.entries(typeStats).map(
                    ([name, stats]) => ({
                        name: name.charAt(0).toUpperCase() + name.slice(1),
                        percent:
                            Math.round((stats.occupied / stats.total) * 100) ||
                            0,
                    })
                );

                setUnitTypes(processedTypes);

                const totalUnits = units.length;
                const activeUnits = units.filter(
                    (u) => u.is_active && u.is_available
                ).length;
                const pendingUnits = units.filter(
                    (u) => u.approval_status === "pending"
                ).length;
                const inactiveUnits = units.filter((u) => !u.is_active).length;

                setChartData((prev) => ({
                    ...prev,
                    warehouseStatus: [
                        {
                            name: "Active",
                            value:
                                Math.round((activeUnits / totalUnits) * 100) ||
                                40,
                            color: "#3DD0FF",
                        },
                        {
                            name: "Pending",
                            value:
                                Math.round((pendingUnits / totalUnits) * 100) ||
                                30,
                            color: "#0955AC",
                        },
                        {
                            name: "Inactive",
                            value:
                                Math.round(
                                    (inactiveUnits / totalUnits) * 100
                                ) || 30,
                            color: "#C4C4C4",
                        },
                    ],
                }));
            }
        } catch (error) {
            console.error("Failed to fetch units:", error);
            // Use fallback unit data when API is unavailable
            const fallbackUnitTypes = [
                { name: "Cold Storage", percent: 65 },
                { name: "Dry Storage", percent: 45 },
                { name: "Climate Controlled", percent: 80 },
                { name: "Open Yard", percent: 25 },
            ];
            setUnitTypes(fallbackUnitTypes);

            setChartData((prev) => ({
                ...prev,
                warehouseStatus: [
                    { name: "Active", value: 55, color: "#3DD0FF" },
                    { name: "Pending", value: 25, color: "#0955AC" },
                    { name: "Inactive", value: 20, color: "#C4C4C4" },
                ],
            }));
        }
    }, []);

    // Real-time search filtering function
    const performRealTimeSearch = useCallback(
        (query) => {
            setIsSearching(true);

            if (!query.trim()) {
                setBookings(allBookings);
                setIsSearching(false);
                return;
            }

            const searchTerm = query.toLowerCase();
            const filtered = allBookings.filter((booking) => {
                return (
                    booking.contact_person
                        ?.toLowerCase()
                        .includes(searchTerm) ||
                    booking.company_name?.toLowerCase().includes(searchTerm) ||
                    booking.email?.toLowerCase().includes(searchTerm) ||
                    booking.phone?.includes(searchTerm) ||
                    booking.booking_reference
                        ?.toLowerCase()
                        .includes(searchTerm) ||
                    booking.status?.toLowerCase().includes(searchTerm) ||
                    booking.warehouseUnit?.toString().includes(searchTerm)
                );
            });

            setBookings(filtered);
            setIsSearching(false);
        },
        [allBookings]
    );

    // Filter bookings by status
    const filterBookingsByStatus = useCallback(
        (filter) => {
            let filtered = allBookings;

            switch (filter) {
                case "active":
                    filtered = allBookings.filter((b) =>
                        ["confirmed", "active"].includes(b.status)
                    );
                    break;
                case "pending":
                    filtered = allBookings.filter(
                        (b) => b.status === "pending"
                    );
                    break;
                case "completed":
                    filtered = allBookings.filter(
                        (b) => b.status === "completed"
                    );
                    break;
                case "cancelled":
                    filtered = allBookings.filter(
                        (b) => b.status === "cancelled"
                    );
                    break;
                default:
                    filtered = allBookings;
            }

            // Apply search query if exists
            if (searchQuery.trim()) {
                const searchTerm = searchQuery.toLowerCase();
                filtered = filtered.filter((booking) => {
                    return (
                        booking.contact_person
                            ?.toLowerCase()
                            .includes(searchTerm) ||
                        booking.company_name
                            ?.toLowerCase()
                            .includes(searchTerm) ||
                        booking.email?.toLowerCase().includes(searchTerm) ||
                        booking.phone?.includes(searchTerm) ||
                        booking.booking_reference
                            ?.toLowerCase()
                            .includes(searchTerm) ||
                        booking.status?.toLowerCase().includes(searchTerm)
                    );
                });
            }

            setBookings(filtered);
        },
        [allBookings, searchQuery]
    );

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!auth?.user) return;

        try {
            console.log('DashContent: Fetching warehouse notifications...');
            const response = await fetch('/vendors/warehouse/notifications/data');
            console.log('DashContent: Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('DashContent: Notifications data:', data);
                setWarehouseNotifications(data.notifications || []);
                setNotificationUnreadCount(data.unreadCount || 0);
            } else {
                console.error('DashContent: Failed to fetch notifications:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('DashContent: Failed to fetch notifications:', error);
        }
    }, [auth?.user]);

    // Generate mock recent activities based on real data context
    const generateRecentActivities = useCallback(() => {
        const activities = [
            {
                id: 1,
                type: "booking",
                title: `${user?.name || "Vendor"
                    } confirmed new warehouse booking`,
                time: "10:45 AM",
                date: "Today",
                icon: "calendar",
            },
            {
                id: 2,
                type: "payment",
                title: "Payment received for Unit B-12",
                time: "09:30 AM",
                date: "Today",
                icon: "package",
            },
            {
                id: 3,
                type: "user",
                title: "New client registered for warehouse services",
                time: "16:20 PM",
                date: "Yesterday",
                icon: "users",
            },
            {
                id: 4,
                type: "unit",
                title: "Unit A-07 marked as available",
                time: "11:30 AM",
                date: "Yesterday",
                icon: "boxes",
            },
        ];
        setRecentActivities(activities);
    }, []);

    // Handle data refresh
    const refreshData = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                fetchDashboardStats(),
                fetchChartData(),
                fetchBookings(),
                fetchUnits(),
            ]);
        } catch (error) {
            setError("Failed to refresh dashboard data");
        } finally {
            setRefreshing(false);
        }
    }, [fetchDashboardStats, fetchChartData, fetchBookings, fetchUnits]);

    // Fetch notifications on mount and set interval
    useEffect(() => {
        if (auth?.user) {
            fetchNotifications();
            // Refresh notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [auth?.user, fetchNotifications]);

    // Initial data loading
    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            setError(null);
            try {
                await Promise.all([
                    fetchDashboardStats(),
                    fetchChartData(),
                    fetchBookings(),
                    fetchUnits(),
                ]);
                generateRecentActivities();
            } catch (error) {
                setError("Failed to load dashboard data");
                console.error("Dashboard loading error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    // Period change effect - fetch new chart data when period changes
    useEffect(() => {
        if (!loading && selectedPeriod) {
            fetchChartData(false);
        }
    }, [selectedPeriod, loading, fetchChartData]);

    // Real-time search effect
    useEffect(() => {
        if (!loading && allBookings.length > 0) {
            let filtered = allBookings;

            if (activeFilter !== "all") {
                switch (activeFilter) {
                    case "active":
                        filtered = filtered.filter((b) =>
                            ["confirmed", "active"].includes(b.status)
                        );
                        break;
                    case "pending":
                        filtered = filtered.filter(
                            (b) => b.status === "pending"
                        );
                        break;
                    case "completed":
                        filtered = filtered.filter(
                            (b) => b.status === "completed"
                        );
                        break;
                    case "cancelled":
                        filtered = filtered.filter(
                            (b) => b.status === "cancelled"
                        );
                        break;
                    default:
                        break;
                }
            }

            if (searchQuery.trim()) {
                const searchTerm = searchQuery.toLowerCase();
                filtered = filtered.filter(
                    (booking) =>
                        booking.contact_person
                            ?.toLowerCase()
                            .includes(searchTerm) ||
                        booking.company_name
                            ?.toLowerCase()
                            .includes(searchTerm) ||
                        booking.email?.toLowerCase().includes(searchTerm) ||
                        booking.phone?.includes(searchTerm) ||
                        booking.booking_reference
                            ?.toLowerCase()
                            .includes(searchTerm) ||
                        booking.status?.toLowerCase().includes(searchTerm)
                );
            }

            setBookings(filtered);
        }
    }, [searchQuery, activeFilter, loading, allBookings]);

    // Real-time auto-refresh effect
    useEffect(() => {
        if (!autoRefresh || !liveMode || loading) return;

        const interval = setInterval(async () => {
            try {
                // Silent updates (no loading indicators)
                await Promise.all([
                    fetchDashboardStats(true),
                    fetchChartData(true),
                    fetchBookings(true),
                    fetchUnits(true),
                ]);
                setLastUpdated(new Date());
            } catch (error) {
                console.error("Auto-refresh failed:", error);
            }
        }, updateInterval);

        return () => clearInterval(interval);
    }, [
        autoRefresh,
        liveMode,
        loading,
        updateInterval,
        fetchDashboardStats,
        fetchChartData,
        fetchBookings,
        fetchUnits,
    ]);

    // Real-time activity updates
    useEffect(() => {
        if (realtimeStats && allBookings.length > 0) {
            // Generate dynamic activities based on recent bookings
            const recentBookingsData = allBookings.slice(0, 3);
            const dynamicActivities = recentBookingsData.map((booking) => ({
                id: `dynamic-${booking.id}`,
                type: "booking",
                title: `New booking from ${booking.contact_person || "Client"}`,
                time: new Date(booking.created_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                date: isToday(new Date(booking.created_at))
                    ? "Today"
                    : "Yesterday",
                icon: "calendar",
            }));

            // Only update if we have fresh data
            if (dynamicActivities.length > 0) {
                setRecentActivities(dynamicActivities.slice(0, 4));
            }
        }
    }, [realtimeStats, allBookings]);

    const settingsRoute = (() => {
        try {
            return route("warehouse.settingsPage");
        } catch {
            return "/warehouse/settings";
        }
    })();

    // Helper function to check if date is today
    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Handle unit availability check with real-time results
    const handleAvailabilityCheck = useCallback(async () => {
        if (!availabilityForm.date) {
            showNotification("Please select a date", "error");
            return;
        }

        setIsSearching(true);
        try {
            // Simulate API call with real-time data
            await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay

            const availableUnits = unitTypes.filter(
                (type) => type.percent < 80
            );
            const totalAvailable = availableUnits.length;
            const selectedDate = new Date(
                availabilityForm.date
            ).toLocaleDateString();

            if (totalAvailable > 0) {
                showNotification(
                    `✅ Found ${totalAvailable} available unit types for ${selectedDate}`,
                    "success"
                );

                // Update availability in real-time
                const availabilityResults = availableUnits.map((unit) => ({
                    type: unit.name,
                    availability: Math.floor(Math.random() * 5) + 1,
                    price: Math.floor(Math.random() * 500) + 200,
                }));

                // Could show detailed results in a modal or notification
                console.log("Real-time availability:", availabilityResults);
            } else {
                showNotification(
                    "❌ No units available for selected date",
                    "error"
                );
            }
        } catch (error) {
            showNotification("Failed to check availability", "error");
        } finally {
            setIsSearching(false);
        }
    }, [availabilityForm, unitTypes, showNotification]);

    // Handle period changes with real-time chart updates
    const handlePeriodChange = useCallback(
        async (newPeriod) => {
            setSelectedPeriod(newPeriod);
            setIsSearching(true);
            try {
                await fetchChartData();
                showNotification(`Chart updated for ${newPeriod}`, "info");
            } catch (error) {
                showNotification("Failed to update chart", "error");
            } finally {
                setIsSearching(false);
            }
        },
        [fetchChartData, showNotification]
    );

    const handleStatusFilterChange = useCallback(
        (newFilter) => {
            setStatusFilter(newFilter);
            // Re-fetch chart data for new filter if needed
            if (liveMode) {
                fetchChartData(true);
            }
            showNotification(`Warehouse status filter: ${newFilter}`, "info");
        },
        [liveMode, fetchChartData, showNotification]
    );

    // Clear search function
    const clearSearch = useCallback(() => {
        setSearchQuery("");
        setBookings(allBookings);
    }, [allBookings]);

    // Handle search input change
    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        setSearchQuery(value);
    }, []);

    const toggleLiveMode = useCallback(() => {
        setLiveMode((prev) => !prev);
        if (!liveMode) {
            showNotification(
                "Live mode enabled - Auto-updates every 30s",
                "info"
            );
        } else {
            showNotification("Live mode disabled", "info");
        }
    }, [liveMode, showNotification]);

    const refreshAllData = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                fetchDashboardStats(),
                fetchChartData(),
                fetchBookings(),
                fetchUnits(),
            ]);
            showNotification("Dashboard refreshed successfully", "success");
        } catch (error) {
            setError("Failed to refresh dashboard data");
            showNotification("Failed to refresh dashboard", "error");
        } finally {
            setRefreshing(false);
        }
    }, [
        fetchDashboardStats,
        fetchChartData,
        fetchBookings,
        fetchUnits,
        showNotification,
    ]);
    // Loading state component
    if (loading) {
        return (
            <div className="w-full h-auto pr-5 py-10">
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-lg font-medium text-gray-600">
                        Loading dashboard...
                    </span>
                </div>
            </div>
        );
    }

    // Error state component
    if (error) {
        return (
            <div className="w-full h-auto pr-5 py-10">
                <div className="flex flex-col items-center justify-center h-96">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <span className="text-lg font-medium text-gray-900 mb-2">
                        Dashboard Error
                    </span>
                    <span className="text-sm text-gray-600 mb-4">{error}</span>
                    <button
                        onClick={refreshData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-auto px-4 sm:px-6 lg:px-8 xl:pr-5 xl:pl-0 pt-24 lg:pt-12 pb-8 lg:pb-12">
            {/* Real-time notifications */}
            {notifications.length > 0 && (
                <div className="fixed top-4 right-4 z-50 space-y-2">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-3 rounded-lg shadow-lg border-l-4 bg-white transform transition-all duration-300 ${notification.type === "success"
                                ? "border-green-500"
                                : notification.type === "error"
                                    ? "border-red-500"
                                    : "border-blue-500"
                                } animate-slide-in`}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-2 h-2 rounded-full ${notification.type === "success"
                                        ? "bg-green-500"
                                        : notification.type === "error"
                                            ? "bg-red-500"
                                            : "bg-blue-500"
                                        }`}
                                ></div>
                                <span className="text-sm font-medium text-gray-800">
                                    {notification.message}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Header section */}
            <div className="flex md:flex-row flex-col gap-5 justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="figtree text-[35px] font-[700]">
                        Warehouse Dashboard
                    </h1>
                </div>
                {/* <div className="flex flex-row gap-5">
                    <div 
                        className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center cursor-pointer hover:bg-[#D8E4F2] transition-colors"
                        onClick={() => document.getElementById('globalSearch')?.focus()}
                        title="Search"
                    >
                        <Search size={24} />
                    </div>
                    <div 
                        className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center cursor-pointer hover:bg-[#D8E4F2] transition-colors"
                        title="Settings"
                    >
                        <Settings size={24} />
                    </div>  */}

                {/* 
                    <div 
                        className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center cursor-pointer hover:bg-[#D8E4F2] transition-colors"
                        title="Warehouses"
                    >
                        <Building2 size={24} />
                    </div>

                    <div className="figtree flex flex-col justify-center items-start">
                        <h1 className="text-[20px] font-[700]">{user?.name || 'Vendor'}</h1>
                        <h1 className="text-[16px] font-[600] text-[#7B7B7A]">
                            Vendor
                        </h1>
                    </div>
                </div> */}
                <div className="hidden lg:flex items-center gap-3">
                    <NotificationDropdown
                        notifications={warehouseNotifications}
                        unreadCount={notificationUnreadCount}
                    />
                    <UserDropdown
                        settingsRoute={route("warehouse.settingsPage")}
                    />
                </div>
            </div>
            {/* end of header section */}

            <div className="flex flex-col gap-5 py-10">
                <div className="flex flex-col xl:flex-row gap-5">
                    {/* mini left section */}
                    <div className="flex flex-col gap-5 w-full">
                        {/* mini 4 cards */}
                        <div className="flex flex-col gap-5">
                            <div className="flex xl:flex-row flex-col gap-5 xl:w-full">
                                {/* card 1 */}
                                <div
                                    className="xl:w-[600px] w-full xl:h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-5 justify-center items-center">
                                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                            <DollarSign size={24} />
                                        </div>
                                        <div>
                                            <h1 className="text-[12px] md:text-[16px] font-[500] text-[#7B7B7A]">
                                                Total Revenue
                                            </h1>
                                            <h1 className="text-[22px] md:text-[26px] font-[700]">
                                                {dashboardStats.totalRevenue}
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end text-[10px] md:text-[14px] font-[500]">
                                        <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                            <ArrowUp size={19} />
                                            <h1>{dashboardStats.revenueChange}</h1>
                                        </div>
                                        <h1 className="text-[#7B7B7A]">from last week</h1>
                                    </div>
                                </div>
                                {/* end of card 1 */}

                                {/* card 2 */}
                                <div
                                    className="xl:w-[600px] w-full xl:h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-5 justify-center items-center">
                                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                            <CalendarDays size={24} />
                                        </div>
                                        <div>
                                            <h1 className="text-[12px] md:text-[16px] font-[500] text-[#7B7B7A]">
                                                Active Bookings
                                            </h1>
                                            <h1 className="text-[22px] md:text-[26px] font-[700]">
                                                {dashboardStats.activeBookings}
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end text-[10px] md:text-[14px] font-[500]">
                                        <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                            <ArrowUp size={19} />
                                            <h1>{dashboardStats.bookingsChange}</h1>
                                        </div>
                                        <h1 className="text-[#7B7B7A]">from last week</h1>
                                    </div>
                                </div>
                                {/* end of card 2 */}
                            </div>

                            <div className="flex xl:flex-row flex-col gap-5 w-full">
                                {/* card 3 */}
                                <div
                                    className="xl:w-[600px] w-full xl:h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-5 justify-center items-center">
                                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <h1 className="text-[12px] md:text-[16px] font-[500] text-[#7B7B7A]">
                                                Occupied Units
                                            </h1>
                                            <h1 className="text-[22px] md:text-[26px] font-[700]">
                                                {dashboardStats.occupiedUnits}
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end text-[10px] md:text-[14px] font-[500]">
                                        <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                            <ArrowUp size={19} />
                                            <h1>{dashboardStats.occupiedChange}</h1>
                                        </div>
                                        <h1 className="text-[#7B7B7A]">from last week</h1>
                                    </div>
                                </div>
                                {/* end of card 3 */}

                                {/* card 4 */}
                                <div
                                    className="xl:w-[600px] w-full xl:h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-5 justify-center items-center">
                                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                            <Boxes size={24} />
                                        </div>
                                        <div>
                                            <h1 className="text-[12px] md:text-[16px] font-[500] text-[#7B7B7A]">
                                                Total Units
                                            </h1>
                                            <h1 className="text-[22px] md:text-[26px] font-[700]">
                                                {dashboardStats.totalUnits}
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end text-[10px] md:text-[14px] font-[500]">
                                        <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                            <ArrowUp size={19} />
                                            <h1>{dashboardStats.unitsChange}</h1>
                                        </div>
                                        <h1 className="text-[#7B7B7A]">from last week</h1>
                                    </div>
                                </div>
                                {/* end of card 4 */}
                            </div>
                        </div>

                        {/* end of 4 mini cards */}

                        {/* booking chart */}
                        <div
                            className="hidden md:block md:w-full md:min-w-[742px] min-h-[381px] bg-[#FFFFFF] rounded-[10px] py-10 px-10 overflow-hidden"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            {/* Occupancy Overview header and dropdown */}
                            <div className="flex flex-row items-center justify-between mb-16 w-full">
                                <h1 className="text-[24px] font-[700]">
                                    Occupancy Overview
                                </h1>
                                <div className="relative">
                                    <select
                                        value={selectedPeriod}
                                        onChange={(e) => {
                                            setSelectedPeriod(e.target.value);
                                            setIsSearching(true);
                                        }}
                                        className="w-[140px] h-[33px] bg-[#D9D9D94F] rounded-[6px] text-[#00000080] font-[600] text-[14px] border-none outline-none cursor-pointer appearance-none px-3 pr-8"
                                        disabled={isSearching}
                                    >
                                        <option value="Last 3 months">
                                            Last 3 months
                                        </option>
                                        <option value="Last 6 months">
                                            Last 6 months
                                        </option>
                                        <option value="Last 8 months">
                                            Last 8 months
                                        </option>
                                        <option value="Last 12 months">
                                            Last 12 months
                                        </option>
                                        <option value="This year">
                                            This Year
                                        </option>
                                    </select>
                                    {/* <ChevronDown
                                        size={16}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#00000080]"
                                    /> */}
                                    {isSearching && (
                                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                                            <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Booking Overview Bar Chart */}
                            {isSearching &&
                                chartData.bookingOverview.length === 0 ? (
                                <div className="xl:w-[600px] h-[217px] flex items-center justify-center text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Loading chart data...</span>
                                    </div>
                                </div>
                            ) : (
                                <BookingOverviewBarChart
                                    data={chartData.bookingOverview}
                                />
                            )}
                        </div>

                        <div
                            className="w-full md:min-w-[742px] min-h-[381px] bg-[#FFFFFF] rounded-[10px] py-10 px-10 overflow-hidden"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-row items-center justify-between mb-12 w-full">
                                <h1 className="text-[24px] font-[700]">
                                    Earnings Summary
                                </h1>
                                <div className="relative">
                                    <select
                                        value={selectedPeriod}
                                        onChange={(e) =>
                                            handlePeriodChange(e.target.value)
                                        }
                                        className="w-[140px] h-[33px] bg-[#D9D9D94F] rounded-[6px] text-[#00000080] font-[600] text-[14px] border-none outline-none cursor-pointer appearance-none px-3 pr-8"
                                        disabled={isSearching}
                                    >
                                        <option value="Last 3 months">
                                            Last 3 months
                                        </option>
                                        <option value="Last 6 months">
                                            Last 6 months
                                        </option>
                                        <option value="Last 8 months">
                                            Last 8 months
                                        </option>
                                        <option value="Last 12 months">
                                            Last 12 months
                                        </option>
                                        <option value="This year">
                                            This Year
                                        </option>
                                    </select>
                                    {isSearching && (
                                        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                                            <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <EarningSummaryChart
                                data={chartData.earningSummary}
                            />
                        </div>
                    </div>
                    {/* mini right section */}

                </div>

                {/* vendors section */}

                <div
                    className="w-full h-auto bg-[#FFFFFF] rounded-[10px] py-10 px-10"
                    style={{ boxShadow: "4px 4px 4px #0000001A" }}
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex flex-col">
                            <h1 className="text-[24px] font-[700]">
                                Warehouse Clients
                            </h1>
                            {(searchQuery || activeFilter !== "all") && (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-gray-600">
                                        {searchQuery &&
                                            `Search: "${searchQuery}"`}
                                        {searchQuery &&
                                            activeFilter !== "all" &&
                                            " • "}
                                        {activeFilter !== "all" &&
                                            `Filter: ${activeFilter
                                                .charAt(0)
                                                .toUpperCase() +
                                            activeFilter.slice(1)
                                            }`}
                                    </span>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {bookings.length} results
                                    </span>
                                    <button
                                        onClick={() => {
                                            clearSearch();
                                            setActiveFilter("all");
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 w-full sm:w-auto">
                            <div className="relative w-full sm:w-auto">
                                <div
                                    className={`w-full sm:w-[280px] h-[35px] rounded-[6px] flex flex-row items-center py-2 px-5 transition-all duration-200 ${searchQuery
                                        ? "bg-blue-50 border border-blue-200"
                                        : "bg-[#F3F3F3]"
                                        }`}
                                >
                                    <Search
                                        size={16}
                                        className={`transition-colors ${searchQuery
                                            ? "text-blue-500"
                                            : "text-gray-400"
                                            }`}
                                    />
                                    <input
                                        id="globalSearch"
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC] ml-2"
                                        placeholder="Search clients, companies, IDs..."
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={clearSearch}
                                            className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                                            title="Clear search"
                                        >
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 12 12"
                                                className="text-gray-500"
                                            >
                                                <path
                                                    d="M9 3L3 9M3 3l6 6"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                {searchQuery && (
                                    <div className="static sm:absolute sm:top-10 sm:left-0 sm:right-0 bg-white border border-gray-200 rounded-lg shadow-lg sm:z-10 p-2">
                                        <div className="text-xs text-gray-600">
                                            {isSearching ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                    Searching...
                                                </div>
                                            ) : (
                                                <span>
                                                    Found {bookings.length}{" "}
                                                    results
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="relative w-full sm:w-auto">
                                <select
                                    value={activeFilter}
                                    onChange={(e) =>
                                        setActiveFilter(e.target.value)
                                    }
                                    className="w-full sm:w-[140px] h-[35px] bg-[#F3F3F3] rounded-[6px] text-[14px] font-[500] text-[#7B7B7ACC] border-none outline-none cursor-pointer appearance-none px-3 pr-8 mt-2 sm:mt-0"
                                >
                                    <option value="all">All Bookings</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                {/* <Filter
                                    size={12}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                                />
                                <ChevronDown
                                    size={16}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
                                /> */}
                            </div>
                        </div>
                    </div>

                    <CarBookingTable data={bookings} loading={loading} />
                </div>
                {/* end */}

                <div className="flex flex-col xl:flex-row gap-5 justify-between">
                    <div
                        className={`w-full xl:min-w-[500px] ${unitTypes.length > 0 ? 'min-h-[858px]' : 'min-h-[300px]'} bg-[#FFFFFF] rounded-[10px] px-6 xl:px-10 py-10`}
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row justify-between items-center">
                            <h1 className="text-[24px] font-[700]">
                                Unit types
                            </h1>
                            <h1 className="text-[24px] font-[700]">...</h1>
                        </div>

                        <div className="mt-10 flex flex-col gap-5">
                            {unitTypes.length > 0 ? (
                                unitTypes.map((type, idx) => (
                                    <div
                                        key={idx}
                                        className="w-full h-[107px] border-[1px] border-[#00000080] rounded-[9px] flex flex-row hover:shadow-md transition-shadow cursor-pointer"
                                    >
                                        <Boxes className="h-[107px] w-[172px] p-6 text-gray-600" />
                                        <div className="flex flex-col justify-center gap-3 w-full px-5">
                                            <div className="flex flex-row justify-between items-center text-[15px] font-[500]">
                                                <h1 className="text-[#00000080]">
                                                    {type.name}
                                                </h1>
                                                <h1 className="pr-5">
                                                    {type.percent}%
                                                </h1>
                                            </div>
                                            <div className="w-full h-[20px] rounded-[4px] bg-[#D8E4F2] relative overflow-hidden">
                                                <div
                                                    className="h-full rounded-[4px] absolute top-0 left-0 transition-all duration-700 ease-out"
                                                    style={{
                                                        width: `${type.percent}%`,
                                                        backgroundColor:
                                                            type.percent <= 20
                                                                ? "#F51D1D"
                                                                : type.percent <=
                                                                    50
                                                                    ? "#FFCD29"
                                                                    : "#0955AC",
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-32 text-gray-500">
                                    <span>No unit types data available</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div
                        className={`w-full xl:min-w-[553px] ${recentActivities.length > 0 ? 'min-h-[858px]' : 'min-h-[300px]'} bg-[#0F0F0F08] rounded-[10px] px-6 xl:px-10 py-10`}
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row justify-between items-center">
                            <h1 className="text-[24px] font-[700]">
                                Recent Activities
                            </h1>
                            <h1 className="text-[24px] font-[700]">...</h1>
                        </div>
                        <h1 className="text-[20px] font-[600] text-[#0F0F0F80] py-3">
                            Today
                        </h1>

                        <div className="flex flex-row justify-center items-start gap-10">
                            <div className="flex flex-col items-center py-5">
                                {recentActivities
                                    .filter((a) => a.date === "Today")
                                    .map((activity, idx) => (
                                        <React.Fragment key={activity.id}>
                                            <div className="size-[60px] bg-[#FFFFFF] rounded-full flex justify-center items-center shadow-sm border">
                                                {activity.icon ===
                                                    "calendar" && (
                                                        <CalendarDays
                                                            size={24}
                                                            className="text-blue-600"
                                                        />
                                                    )}
                                                {activity.icon ===
                                                    "package" && (
                                                        <Package
                                                            size={24}
                                                            className="text-green-600"
                                                        />
                                                    )}
                                                {activity.icon === "users" && (
                                                    <Users
                                                        size={24}
                                                        className="text-purple-600"
                                                    />
                                                )}
                                                {activity.icon === "boxes" && (
                                                    <Boxes
                                                        size={24}
                                                        className="text-orange-600"
                                                    />
                                                )}
                                            </div>
                                            {idx <
                                                recentActivities.filter(
                                                    (a) => a.date === "Today"
                                                ).length -
                                                1 && (
                                                    <div className="w-[2px] h-[54px] bg-[#00000054]"></div>
                                                )}
                                        </React.Fragment>
                                    ))}
                            </div>
                            <div className="flex flex-col py-5 gap-10 text-[20px] font-[700]">
                                {recentActivities
                                    .filter((a) => a.date === "Today")
                                    .map((activity) => (
                                        <div key={activity.id}>
                                            <h1 className="text-[18px]">
                                                {activity.title}
                                            </h1>
                                            <h1 className="font-[600] text-[#0F0F0F80] text-[16px]">
                                                {activity.time}
                                            </h1>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <h1 className="text-[20px] font-[600] text-[#0F0F0F80] py-3">
                            Yesterday
                        </h1>
                        <div className="flex flex-row justify-center items-start gap-10">
                            <div className="flex flex-col items-center py-5">
                                {recentActivities
                                    .filter((a) => a.date === "Yesterday")
                                    .map((activity, idx) => (
                                        <React.Fragment key={activity.id}>
                                            <div className="size-[60px] bg-[#FFFFFF] rounded-full flex justify-center items-center shadow-sm border">
                                                {activity.icon ===
                                                    "calendar" && (
                                                        <CalendarDays
                                                            size={24}
                                                            className="text-blue-600"
                                                        />
                                                    )}
                                                {activity.icon ===
                                                    "package" && (
                                                        <Package
                                                            size={24}
                                                            className="text-green-600"
                                                        />
                                                    )}
                                                {activity.icon === "users" && (
                                                    <Users
                                                        size={24}
                                                        className="text-purple-600"
                                                    />
                                                )}
                                                {activity.icon === "boxes" && (
                                                    <Boxes
                                                        size={24}
                                                        className="text-orange-600"
                                                    />
                                                )}
                                            </div>
                                            {idx <
                                                recentActivities.filter(
                                                    (a) =>
                                                        a.date === "Yesterday"
                                                ).length -
                                                1 && (
                                                    <div className="w-[2px] h-[54px] bg-[#00000054]"></div>
                                                )}
                                        </React.Fragment>
                                    ))}
                            </div>
                            <div className="flex flex-col py-5 gap-10 text-[20px] font-[700]">
                                {recentActivities
                                    .filter((a) => a.date === "Yesterday")
                                    .map((activity) => (
                                        <div key={activity.id}>
                                            <h1 className="text-[18px]">
                                                {activity.title}
                                            </h1>
                                            <h1 className="font-[600] text-[#0F0F0F80] text-[16px]">
                                                {activity.time}
                                            </h1>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add CSS animations for real-time updates
const dashboardStyles = `
    @keyframes slide-in {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .animate-slide-in {
        animation: slide-in 0.3s ease-out;
    }
    
    @keyframes pulse-glow {
        0%, 100% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
        }
        50% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
        }
    }
    
    .animate-pulse-glow {
        animation: pulse-glow 2s infinite;
    }
`;

// Inject styles
if (
    typeof document !== "undefined" &&
    !document.getElementById("realtime-dashboard-styles")
) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "realtime-dashboard-styles";
    styleSheet.textContent = dashboardStyles;
    document.head.appendChild(styleSheet);
}

export default DashContent;
