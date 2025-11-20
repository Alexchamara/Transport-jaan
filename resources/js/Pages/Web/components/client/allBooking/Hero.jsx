import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@inertiajs/react";
import {
    Car,
    Plane,
    Ship,
    Calendar,
    MapPin,
    Search,
    Filter,
    Download,
    ChevronRight,
    Clock,
    Package,
    Warehouse,
    Train,
    Bus,
    Truck,
    Eye,
    FileText,
    TrendingUp,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    MoreVertical,
    CheckSquare,
    Square,
    Trash2,
    Edit,
    RefreshCw,
    X,
    Check,
    AlertCircle,
    DollarSign,
    Users,
    Activity,
    BarChart3,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from "recharts";

// ---------- Helpers ----------
const BookingTypeIcon = ({ type, className }) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('vehicle') || lowerType.includes('car') || lowerType.includes('land')) return <Car className={className} />;
    if (lowerType.includes('air') || lowerType.includes('flight') || lowerType.includes('plane')) return <Plane className={className} />;
    if (lowerType.includes('sea') || lowerType.includes('boat') || lowerType.includes('ship')) return <Ship className={className} />;
    if (lowerType.includes('train')) return <Train className={className} />;
    if (lowerType.includes('bus')) return <Bus className={className} />;
    if (lowerType.includes('courier') || lowerType.includes('shipment')) return <Package className={className} />;
    if (lowerType.includes('warehouse') || lowerType.includes('storage')) return <Warehouse className={className} />;
    if (lowerType.includes('freight') || lowerType.includes('cargo')) return <Truck className={className} />;
    return <Calendar className={className} />;
};

const statusMap = {
    confirmed: {
        label: "Confirmed",
        tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    paid: { label: "Paid", tone: "bg-blue-50 text-blue-700 border-blue-200" },
    pending: {
        label: "Pending",
        tone: "bg-amber-50 text-amber-700 border-amber-200",
    },
    cancelled: {
        label: "Cancelled",
        tone: "bg-rose-50 text-rose-700 border-rose-200",
    },
    completed: {
        label: "Completed",
        tone: "bg-green-50 text-green-700 border-green-200",
    },
    in_transit: {
        label: "In Transit",
        tone: "bg-blue-50 text-blue-700 border-blue-200",
    },
    delivered: {
        label: "Delivered",
        tone: "bg-green-50 text-green-700 border-green-200",
    },
    active: {
        label: "Active",
        tone: "bg-green-50 text-green-700 border-green-200",
    },
};

const Hero = ({ 
    allBookings = [],
    statistics = {},
    monthlyData = []
}) => {
    const [bookingType, setBookingType] = useState("all");
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("recent");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState("card"); // card or table
    const [showExportModal, setShowExportModal] = useState(false);

    // Calculate comprehensive KPI metrics
    const kpiMetrics = useMemo(() => {
        const activeBookings = allBookings.filter(b => 
            ['confirmed', 'paid', 'pending', 'active', 'in_transit'].includes(b.status?.toLowerCase())
        ).length;

        const totalSpent = allBookings
            .filter(b => ['paid', 'completed', 'delivered'].includes(b.status?.toLowerCase()))
            .reduce((sum, b) => sum + (b.total_amount || b.amount || 0), 0);

        const thisMonthBookings = allBookings.filter(b => {
            const bookingDate = new Date(b.created_at || b.booking_date);
            const now = new Date();
            return bookingDate.getMonth() === now.getMonth() && 
                   bookingDate.getFullYear() === now.getFullYear();
        }).length;

        const upcomingTrips = allBookings.filter(b => {
            const startDate = new Date(b.start_date || b.departure_date || b.pickup_date);
            return startDate > new Date() && ['confirmed', 'paid'].includes(b.status?.toLowerCase());
        }).length;

        return {
            activeBookings,
            totalSpent,
            thisMonthBookings,
            upcomingTrips
        };
    }, [allBookings]);

    // Group bookings by type
    const bookingsByType = useMemo(() => {
        return {
            vehicle: allBookings.filter(b => b.booking_type === 'vehicle' || b.type === 'vehicle_rental'),
            warehouse: allBookings.filter(b => b.booking_type === 'warehouse' || b.type === 'warehouse'),
            courier: allBookings.filter(b => b.booking_type === 'courier' || b.type === 'courier' || b.type === 'shipment'),
            train: allBookings.filter(b => b.booking_type === 'train' || b.type === 'train_ticket'),
            bus: allBookings.filter(b => b.booking_type === 'bus' || b.type === 'bus_ticket'),
            flight: allBookings.filter(b => b.booking_type === 'flight' || b.type === 'flight_ticket'),
            freight: allBookings.filter(b => b.booking_type === 'freight' || b.type === 'freight' || b.type === 'cargo'),
        };
    }, [allBookings]);

    // Calculate pie chart data
    const pieData = useMemo(() => {
        return [
            { name: "Vehicle Rentals", value: bookingsByType.vehicle.length, color: "#3b82f6" },
            { name: "Warehouse", value: bookingsByType.warehouse.length, color: "#8b5cf6" },
            { name: "Courier", value: bookingsByType.courier.length, color: "#ec4899" },
            { name: "Train Tickets", value: bookingsByType.train.length, color: "#10b981" },
            { name: "Bus Tickets", value: bookingsByType.bus.length, color: "#f59e0b" },
            { name: "Flight Tickets", value: bookingsByType.flight.length, color: "#0955AC" },
            { name: "Freight", value: bookingsByType.freight.length, color: "#ef4444" },
        ].filter(item => item.value > 0);
    }, [bookingsByType]);

    // Process monthly data for charts
    const chartData = useMemo(() => {
        if (monthlyData && monthlyData.length > 0) {
            return monthlyData;
        }
        // Generate from bookings if no monthly data provided
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.map((month, index) => {
            const monthBookings = allBookings.filter(b => {
                const date = new Date(b.created_at || b.booking_date);
                return date.getMonth() === index && date.getFullYear() === new Date().getFullYear();
            });
            return {
                month,
                vehicle: monthBookings.filter(b => b.booking_type === 'vehicle').length,
                tickets: monthBookings.filter(b => ['train', 'bus', 'flight'].includes(b.booking_type)).length,
                logistics: monthBookings.filter(b => ['warehouse', 'courier', 'freight'].includes(b.booking_type)).length,
            };
        });
    }, [monthlyData, allBookings]);

    // Filter bookings
    const filteredBookings = useMemo(() => {
        return allBookings
            .filter(b => {
                // Type filter
                if (bookingType !== "all") {
                    if (bookingType === "tickets") {
                        return ['train', 'bus', 'flight'].includes(b.booking_type);
                    }
                    if (bookingType === "logistics") {
                        return ['warehouse', 'courier', 'freight'].includes(b.booking_type);
                    }
                    return b.booking_type === bookingType;
                }
                return true;
            })
            .filter(b => {
                // Status filter
                if (statusFilter !== "all") {
                    return b.status?.toLowerCase() === statusFilter;
                }
                return true;
            })
            .filter(b => {
                // Date range filter
                if (dateRange.start && dateRange.end) {
                    const bookingDate = new Date(b.created_at || b.booking_date);
                    const startDate = new Date(dateRange.start);
                    const endDate = new Date(dateRange.end);
                    return bookingDate >= startDate && bookingDate <= endDate;
                }
                return true;
            })
            .filter(b => {
                // Search filter
                if (q) {
                    const searchText = `${b.booking_code || ''} ${b.reference_number || ''} ${b.vehicle_name || ''} ${b.service_name || ''} ${b.description || ''}`.toLowerCase();
                    return searchText.includes(q.toLowerCase());
                }
                return true;
            })
            .sort((a, b) => {
                if (sortBy === "recent") {
                    return new Date(b.created_at || b.booking_date) - new Date(a.created_at || a.booking_date);
                }
                if (sortBy === "amount") {
                    return (b.total_amount || b.amount || 0) - (a.total_amount || a.amount || 0);
                }
                if (sortBy === "upcoming") {
                    return new Date(a.start_date || a.departure_date || a.pickup_date) - new Date(b.start_date || b.departure_date || b.pickup_date);
                }
                return 0;
            });
    }, [allBookings, bookingType, statusFilter, q, sortBy, dateRange]);

    const upcomingBookings = filteredBookings.filter((r) => {
        const startDate = new Date(r.start_date || r.departure_date || r.pickup_date);
        return startDate > new Date() && ['confirmed', 'paid', 'active'].includes(r.status?.toLowerCase());
    }).slice(0, 5);

    // Pagination
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const paginatedBookings = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredBookings, currentPage, itemsPerPage]);

    // Advanced analytics
    const analytics = useMemo(() => {
        const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.total_amount || b.amount || 0), 0);
        const avgBookingValue = totalRevenue / (filteredBookings.length || 1);
        const cancelledBookings = filteredBookings.filter(b => b.status?.toLowerCase() === 'cancelled').length;
        const completedBookings = filteredBookings.filter(b => ['completed', 'delivered'].includes(b.status?.toLowerCase())).length;
        const cancellationRate = (cancelledBookings / (filteredBookings.length || 1)) * 100;
        const completionRate = (completedBookings / (filteredBookings.length || 1)) * 100;
        
        return {
            totalRevenue,
            avgBookingValue,
            cancelledBookings,
            completedBookings,
            cancellationRate,
            completionRate
        };
    }, [filteredBookings]);

    // Bulk actions handlers
    const handleSelectAll = () => {
        if (selectedBookings.length === paginatedBookings.length) {
            setSelectedBookings([]);
        } else {
            setSelectedBookings(paginatedBookings.map(b => b.id));
        }
    };

    const handleSelectBooking = (bookingId) => {
        setSelectedBookings(prev => 
            prev.includes(bookingId) 
                ? prev.filter(id => id !== bookingId)
                : [...prev, bookingId]
        );
    };

    const handleBulkAction = (action) => {
        alert(`Bulk ${action} for ${selectedBookings.length} bookings`);
        setSelectedBookings([]);
        setShowBulkActions(false);
    };

    const handleExport = (format) => {
        const dataToExport = selectedBookings.length > 0 
            ? filteredBookings.filter(b => selectedBookings.includes(b.id))
            : filteredBookings;
        
        console.log(`Exporting ${dataToExport.length} bookings as ${format}`);
        alert(`Exporting ${dataToExport.length} bookings as ${format}`);
        setShowExportModal(false);
    };

    const clearFilters = () => {
        setBookingType("all");
        setStatusFilter("all");
        setDateRange({ start: "", end: "" });
        setQ("");
        setSortBy("recent");
    };

    const handleViewDetails = (booking) => {
        // Navigate to appropriate details page based on booking type
        const routes = {
            vehicle: `/booking/${booking.id}`,
            warehouse: `/warehouse-booking/${booking.id}`,
            courier: `/courier-shipment/${booking.id}`,
            train: `/train-booking/${booking.id}`,
            bus: `/bus-booking/${booking.id}`,
            flight: `/flight-booking/${booking.id}`,
            freight: `/freight-booking/${booking.id}`,
        };
        window.location.href = routes[booking.booking_type] || `/booking/${booking.id}`;
    };

    return (
        <div className="min-h-screen w-full bg-[#E5E5E5] px-3 sm:px-6 md:p-20 poppins">
            <div className="mx-auto max-w-[1400px]">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 md:mb-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold tracking-tight md:text-[35px]">
                                <span className="text-[#0955AC]">All Bookings</span>{" "}
                                Dashboard
                            </h1>
                            <p className="text-slate-600 text-[14px]">
                                Manage all your bookings: Vehicles, Tickets, Warehouse, Courier & Freight
                            </p>
                        </div>
                        <div className="flex gap-2 justify-center items-center flex-wrap">
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className={`inline-flex items-center h-10 px-4 rounded-xl border text-[14px] font-medium transition-colors ${
                                    showFilters ? 'bg-[#0955AC] text-white border-[#0955AC]' : 'border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <Filter className="mr-2 h-4 w-4" /> Filters
                            </button>
                            <button 
                                onClick={() => setShowExportModal(true)}
                                className="inline-flex items-center h-10 px-4 rounded-xl border border-slate-200 text-[14px] font-medium hover:bg-slate-50"
                            >
                                <Download className="mr-2 h-4 w-4" /> Export
                            </button>
                            <button 
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center h-10 px-4 rounded-xl border border-slate-200 text-[14px] font-medium hover:bg-slate-50"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>
                            <Link
                                href="/client/dashboard"
                                className="inline-flex items-center h-10 px-4 rounded-xl bg-[#0955AC] text-white text-[14px] font-medium hover:bg-[#0744a0]"
                            >
                                <Calendar className="mr-2 h-4 w-4" /> New Booking
                            </Link>
                        </div>
                    </div>

                    {/* Advanced Analytics Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
                        <div className="text-center p-2">
                            <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wide">Total Revenue</p>
                            <p className="text-[16px] sm:text-[18px] font-bold text-[#0955AC]">${analytics.totalRevenue.toFixed(0)}</p>
                        </div>
                        <div className="text-center p-2">
                            <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wide">Avg Value</p>
                            <p className="text-[16px] sm:text-[18px] font-bold text-slate-700">${analytics.avgBookingValue.toFixed(0)}</p>
                        </div>
                        <div className="text-center p-2">
                            <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wide">Completed</p>
                            <p className="text-[16px] sm:text-[18px] font-bold text-green-600">{analytics.completedBookings}</p>
                        </div>
                        <div className="text-center p-2">
                            <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wide">Cancelled</p>
                            <p className="text-[16px] sm:text-[18px] font-bold text-red-600">{analytics.cancelledBookings}</p>
                        </div>
                        <div className="text-center p-2">
                            <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wide">Success Rate</p>
                            <p className="text-[16px] sm:text-[18px] font-bold text-emerald-600">{analytics.completionRate.toFixed(1)}%</p>
                        </div>
                        <div className="text-center p-2">
                            <p className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wide">Cancel Rate</p>
                            <p className="text-[16px] sm:text-[18px] font-bold text-rose-600">{analytics.cancellationRate.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="mb-6 md:mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="px-5 pt-5 pb-2">
                            <p className="flex items-center gap-3 text-[#7B7B7A] text-[14px] font-[700]">
                                <TrendingUp className="h-6 w-6" /> Active Bookings
                            </p>
                            <h3 className="text-[26px] font-[700] text-[#0955AC]">
                                {kpiMetrics.activeBookings}
                            </h3>
                        </div>
                        <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
                            Currently active
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="px-5 pt-5 pb-2">
                            <p className="flex items-center gap-3 text-[#7B7B7A] text-[14px] font-[700]">
                                <FileText className="h-6 w-6" /> This Month
                            </p>
                            <h3 className="text-[26px] font-[700] text-[#0955AC]">
                                {kpiMetrics.thisMonthBookings}
                            </h3>
                        </div>
                        <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
                            New bookings
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="px-5 pt-5 pb-2">
                            <p className="flex items-center gap-3 text-[#7B7B7A] text-[14px] font-[700]">
                                <Calendar className="h-6 w-6" /> Upcoming
                            </p>
                            <h3 className="text-[26px] font-[700] text-[#0955AC]">
                                {kpiMetrics.upcomingTrips}
                            </h3>
                        </div>
                        <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
                            Future trips
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="px-5 pt-5 pb-2">
                            <p className="flex items-center gap-3 text-[#7B7B7A] text-[14px] font-[700]">
                                <Clock className="h-6 w-6" /> Total Spent
                            </p>
                            <h3 className="text-[26px] font-[700] text-[#0955AC]">
                                ${kpiMetrics.totalSpent.toFixed(0)}
                            </h3>
                        </div>
                        <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
                            All time
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="mb-6 md:mb-8 grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
                    {/* Bar Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
                        <div className="px-4 sm:px-6 md:px-10 pt-6 md:pt-10 pb-4 md:pb-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold leading-none tracking-tight text-[16px]">
                                        Monthly Booking Trends
                                    </h3>
                                    <p className="text-[14px] text-slate-500 pt-1">
                                        Vehicles • Tickets • Logistics (year to date)
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 md:px-10 pb-6 md:pb-10">
                            <div className="h-[250px] sm:h-[300px] md:h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ left: 0, right: 0, top: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                        <YAxis tickLine={false} axisLine={false} />
                                        <RTooltip />
                                        <Legend />
                                        <Bar dataKey="vehicle" name="Vehicles" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                        <Bar dataKey="tickets" name="Tickets" fill="#0955AC" radius={[8, 8, 0, 0]} />
                                        <Bar dataKey="logistics" name="Logistics" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white rounded-xl shadow-sm">
                        <div className="px-4 sm:px-6 md:px-10 pt-6 md:pt-10">
                            <h3 className="font-semibold leading-none tracking-tight text-[15px] md:text-[16px]">
                                Booking Distribution
                            </h3>
                            <p className="text-[13px] md:text-[14px] text-slate-500 mt-1">
                                By service type
                            </p>
                        </div>
                        <div className="px-4 sm:px-6 md:px-10 pb-6 md:pb-10">
                            <div className="h-[250px] sm:h-[280px] md:h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={3}
                                            dataKey="value"
                                            nameKey="name"
                                            cornerRadius={6}
                                        >
                                            {pieData.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-2 space-y-1 text-[11px]">
                                {pieData.map((entry, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span className="text-slate-600">{entry.name}</span>
                                        </div>
                                        <span className="font-semibold text-slate-700">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="px-4 sm:px-6 py-4 sm:py-5">
                        <div className="grid items-center gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-5 font-[600]">
                            {/* Search */}
                            <div className="relative lg:col-span-2">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search bookings, reference numbers…"
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 px-3 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                />
                                {q && (
                                    <button
                                        onClick={() => setQ("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Type select */}
                            <div>
                                <select
                                    value={bookingType}
                                    onChange={(e) => setBookingType(e.target.value)}
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                >
                                    <option value="all">All Services</option>
                                    <option value="vehicle">Vehicle Rentals</option>
                                    <option value="tickets">All Tickets</option>
                                    <option value="train">Train Tickets</option>
                                    <option value="bus">Bus Tickets</option>
                                    <option value="flight">Flight Tickets</option>
                                    <option value="logistics">Logistics</option>
                                    <option value="warehouse">Warehouse</option>
                                    <option value="courier">Courier</option>
                                    <option value="freight">Freight</option>
                                </select>
                            </div>

                            {/* Status select */}
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="in_transit">In Transit</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Sort select */}
                            <div>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="upcoming">Upcoming First</option>
                                    <option value="amount">Highest Amount</option>
                                </select>
                            </div>
                        </div>

                        {/* Advanced Filters Panel */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200">
                                        <div className="grid gap-2 sm:gap-3 md:grid-cols-3">
                                            <div>
                                                <label className="block text-[12px] font-medium text-slate-700 mb-1">
                                                    Start Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={dateRange.start}
                                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[12px] font-medium text-slate-700 mb-1">
                                                    End Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={dateRange.end}
                                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    onClick={clearFilters}
                                                    className="h-10 w-full inline-flex items-center justify-center gap-2 px-4 rounded-lg border border-slate-300 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                                                >
                                                    <X className="h-4 w-4" /> Clear Filters
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2 text-[12px] text-slate-600">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>
                                                Showing {filteredBookings.length} of {allBookings.length} bookings
                                                {dateRange.start && dateRange.end && ` between ${dateRange.start} and ${dateRange.end}`}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-4">
                    {/* Bookings List */}
                    <div className="lg:col-span-3">
                        <div className="mb-3 md:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                <h2 className="text-[18px] sm:text-[20px] font-[600]">
                                    All Bookings ({filteredBookings.length})
                                </h2>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button
                                        onClick={() => setViewMode('card')}
                                        className={`p-2 rounded-lg border ${viewMode === 'card' ? 'bg-[#0955AC] text-white border-[#0955AC]' : 'border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <BarChart3 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`p-2 rounded-lg border ${viewMode === 'table' ? 'bg-[#0955AC] text-white border-[#0955AC]' : 'border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <FileText className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] text-slate-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="h-9 px-3 rounded-lg border border-slate-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                >
                                    <option value={5}>5 per page</option>
                                    <option value={10}>10 per page</option>
                                    <option value={20}>20 per page</option>
                                    <option value={50}>50 per page</option>
                                </select>
                            </div>
                        </div>

                        {/* Bulk Actions Toolbar */}
                        <AnimatePresence>
                            {selectedBookings.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-3 md:mb-4 p-3 sm:p-4 bg-[#0955AC] text-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                                        <span className="font-medium text-[13px] sm:text-[14px]">
                                            {selectedBookings.length} booking{selectedBookings.length > 1 ? 's' : ''} selected
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => handleBulkAction('export')}
                                            className="px-4 py-2 bg-white text-[#0955AC] rounded-lg text-[13px] font-medium hover:bg-slate-100 inline-flex items-center gap-2"
                                        >
                                            <Download className="h-4 w-4" /> Export
                                        </button>
                                        <button
                                            onClick={() => handleBulkAction('cancel')}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-[13px] font-medium hover:bg-red-600 inline-flex items-center gap-2"
                                        >
                                            <X className="h-4 w-4" /> Cancel
                                        </button>
                                        <button
                                            onClick={() => setSelectedBookings([])}
                                            className="p-2 hover:bg-white/20 rounded-lg"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Bookings Cards */}
                        <div className="space-y-4">
                            {/* Select All */}
                            {paginatedBookings.length > 0 && (
                                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg">
                                    <button
                                        onClick={handleSelectAll}
                                        className="flex items-center gap-2 text-[13px] font-medium text-slate-700 hover:text-[#0955AC]"
                                    >
                                        {selectedBookings.length === paginatedBookings.length ? (
                                            <CheckSquare className="h-5 w-5 text-[#0955AC]" />
                                        ) : (
                                            <Square className="h-5 w-5" />
                                        )}
                                        Select All on Page
                                    </button>
                                </div>
                            )}

                            {paginatedBookings.length > 0 ? (
                                paginatedBookings.map((booking) => (
                                    <motion.div
                                        key={booking.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <div className={`group rounded-xl md:rounded-2xl bg-white border shadow-sm hover:shadow-md transition-all ${
                                            selectedBookings.includes(booking.id) ? 'border-[#0955AC] ring-2 ring-[#0955AC]/20' : 'border-slate-200'
                                        }`}>
                                            <div className="p-4 sm:p-6">
                                                <div className="flex items-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                                                    {/* Checkbox */}
                                                    <button
                                                        onClick={() => handleSelectBooking(booking.id)}
                                                        className="mt-1 flex-shrink-0 touch-manipulation"
                                                    >
                                                        {selectedBookings.includes(booking.id) ? (
                                                            <CheckSquare className="h-5 w-5 text-[#0955AC]" />
                                                        ) : (
                                                            <Square className="h-5 w-5 text-slate-400 hover:text-[#0955AC]" />
                                                        )}
                                                    </button>

                                                    <div className="flex flex-col sm:flex-row items-start justify-between flex-1 gap-3">
                                                        <div className="flex items-start gap-2 sm:gap-4 flex-1 w-full">
                                                            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-slate-50 flex-shrink-0">
                                                                <BookingTypeIcon type={booking.booking_type} className="h-5 w-5 sm:h-6 sm:w-6 text-[#0955AC]" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                    <h3 className="text-[14px] sm:text-[16px] font-semibold text-slate-900 break-words">
                                                                        {booking.service_name || booking.vehicle_name || booking.title || 'Booking'}
                                                                    </h3>
                                                                    <span
                                                                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                                                                            statusMap[booking.status?.toLowerCase()]?.tone || statusMap.pending.tone
                                                                        }`}
                                                                    >
                                                                        {statusMap[booking.status?.toLowerCase()]?.label || booking.status || 'Pending'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[13px] text-slate-600 mb-2">
                                                                    {booking.description || `${booking.booking_type?.toUpperCase()} Booking`}
                                                                </p>
                                                                <div className="flex items-center gap-4 text-[12px] text-slate-500 flex-wrap">
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar className="h-3.5 w-3.5" />
                                                                        <span>{new Date(booking.created_at || booking.booking_date).toLocaleDateString()}</span>
                                                                    </div>
                                                                    {(booking.booking_code || booking.reference_number) && (
                                                                        <div className="flex items-center gap-1">
                                                                            <FileText className="h-3.5 w-3.5" />
                                                                            <span>{booking.booking_code || booking.reference_number}</span>
                                                                        </div>
                                                                    )}
                                                                    {(booking.start_date || booking.departure_date || booking.pickup_date) && (
                                                                        <div className="flex items-center gap-1">
                                                                            <Clock className="h-3.5 w-3.5" />
                                                                            <span>From: {new Date(booking.start_date || booking.departure_date || booking.pickup_date).toLocaleDateString()}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[20px] font-bold text-[#0955AC]">
                                                                ${(booking.total_amount || booking.amount || 0).toFixed(2)}
                                                            </div>
                                                            <div className="text-[11px] text-slate-500 mt-1">
                                                                {booking.currency || 'USD'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex flex-wrap items-center gap-2 pt-3 sm:pt-4 border-t border-slate-100">
                                                    <button
                                                        onClick={() => handleViewDetails(booking)}
                                                        className="flex-1 min-w-[140px] h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-[#0955AC] text-white text-[12px] sm:text-[13px] font-medium hover:bg-[#0744a0] inline-flex items-center justify-center gap-2 touch-manipulation"
                                                    >
                                                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                        <span className="hidden sm:inline">View Details</span>
                                                        <span className="sm:hidden">View</span>
                                                    </button>
                                                    {['confirmed', 'paid', 'active'].includes(booking.status?.toLowerCase()) && (
                                                        <button className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl border border-slate-200 text-slate-700 text-[12px] sm:text-[13px] font-medium hover:bg-slate-50 inline-flex items-center gap-2 touch-manipulation">
                                                            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                            <span className="hidden sm:inline">Manage</span>
                                                        </button>
                                                    )}
                                                    <button className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl border border-slate-200 text-slate-700 text-[12px] sm:text-[13px] font-medium hover:bg-slate-50 touch-manipulation">
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white">
                                    <div className="px-4 py-16 text-center">
                                        <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 text-[16px] font-medium">No bookings found</p>
                                        <p className="text-slate-400 text-[13px] mt-1">Try adjusting your filters or make a new booking</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="text-[12px] sm:text-[13px] text-slate-600 text-center sm:text-left">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} results
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="h-9 px-3 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 inline-flex items-center gap-1 text-[13px] font-medium"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </button>
                                    
                                    <div className="flex items-center gap-1">
                                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = idx + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = idx + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + idx;
                                            } else {
                                                pageNum = currentPage - 2 + idx;
                                            }
                                            
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`h-9 w-9 rounded-lg text-[13px] font-medium ${
                                                        currentPage === pageNum
                                                            ? 'bg-[#0955AC] text-white'
                                                            : 'border border-slate-200 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="h-9 px-3 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 inline-flex items-center gap-1 text-[13px] font-medium"
                                    >
                                        Next
                                        <ChevronRightIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Upcoming + Quick Actions */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Upcoming Bookings */}
                        <div className="rounded-xl md:rounded-2xl bg-white border border-slate-200 shadow-sm">
                            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                                <h3 className="font-semibold leading-none tracking-tight text-[18px]">
                                    Upcoming Bookings
                                </h3>
                                <p className="text-[13px] text-slate-500 mt-1">
                                    Next {upcomingBookings.length} upcoming
                                </p>
                            </div>
                            <div className="px-6 pb-6 space-y-3 text-[13px]">
                                {upcomingBookings.length > 0 ? (
                                    upcomingBookings.slice(0, 5).map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <BookingTypeIcon 
                                                        type={booking.booking_type} 
                                                        className="h-5 w-5 text-[#0955AC]" 
                                                    />
                                                    <span className="font-medium text-slate-700">
                                                        {booking.service_name || booking.vehicle_name || 'Booking'}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                                                        statusMap[booking.status?.toLowerCase()]?.tone || statusMap.pending.tone
                                                    }`}
                                                >
                                                    {statusMap[booking.status?.toLowerCase()]?.label || booking.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[12px] text-slate-600 mb-2">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>
                                                    {new Date(booking.start_date || booking.departure_date || booking.pickup_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[13px] font-bold text-[#0955AC]">
                                                    ${(booking.total_amount || booking.amount || 0).toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => handleViewDetails(booking)}
                                                    className="text-[11px] text-slate-600 hover:text-[#0955AC] font-medium"
                                                >
                                                    View →
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-[13px]">No upcoming bookings</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="rounded-xl md:rounded-2xl bg-white border border-slate-200 shadow-sm">
                            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
                                <h3 className="font-semibold leading-none tracking-tight text-[16px] sm:text-[18px]">
                                    Quick Actions
                                </h3>
                                <p className="text-[12px] sm:text-[13px] text-slate-500 mt-1">
                                    Book new services
                                </p>
                            </div>
                            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 font-medium">
                                <Link
                                    href="/clientRent?type=land"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <Car className="h-5 w-5 text-[#0955AC]" />
                                    <span>Rent Vehicle</span>
                                </Link>
                                <Link
                                    href="/ticketBooking?type=train"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <Train className="h-5 w-5 text-[#0955AC]" />
                                    <span>Book Train</span>
                                </Link>
                                <Link
                                    href="/ticketBooking?type=bus"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <Bus className="h-5 w-5 text-[#0955AC]" />
                                    <span>Book Bus</span>
                                </Link>
                                <Link
                                    href="/ticketBooking?type=flight"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <Plane className="h-5 w-5 text-[#0955AC]" />
                                    <span>Book Flight</span>
                                </Link>
                                <Link
                                    href="/warehouse"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <Warehouse className="h-5 w-5 text-[#0955AC]" />
                                    <span>Book Warehouse</span>
                                </Link>
                                <Link
                                    href="/courier-service"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <Package className="h-5 w-5 text-[#0955AC]" />
                                    <span>Book Courier</span>
                                </Link>
                                <Link
                                    href="/cargo-freight"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <Truck className="h-5 w-5 text-[#0955AC]" />
                                    <span>Freight Quote</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export Modal */}
                <AnimatePresence>
                    {showExportModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                            onClick={() => setShowExportModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full mx-4"
                            >
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <h3 className="text-[18px] sm:text-[20px] font-bold">Export Bookings</h3>
                                    <button
                                        onClick={() => setShowExportModal(false)}
                                        className="p-2 hover:bg-slate-100 rounded-lg"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <p className="text-[14px] text-slate-600 mb-6">
                                    {selectedBookings.length > 0
                                        ? `Export ${selectedBookings.length} selected booking${selectedBookings.length > 1 ? 's' : ''}`
                                        : `Export all ${filteredBookings.length} filtered bookings`}
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleExport('PDF')}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 text-left hover:bg-slate-50 flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-red-500" />
                                            <div>
                                                <div className="font-medium text-[14px]">Export as PDF</div>
                                                <div className="text-[12px] text-slate-500">Printable document format</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                                    </button>
                                    <button
                                        onClick={() => handleExport('Excel')}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 text-left hover:bg-slate-50 flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-green-600" />
                                            <div>
                                                <div className="font-medium text-[14px]">Export as Excel</div>
                                                <div className="text-[12px] text-slate-500">Spreadsheet format (.xlsx)</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                                    </button>
                                    <button
                                        onClick={() => handleExport('CSV')}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 text-left hover:bg-slate-50 flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-blue-500" />
                                            <div>
                                                <div className="font-medium text-[14px]">Export as CSV</div>
                                                <div className="text-[12px] text-slate-500">Comma-separated values</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Hero;
