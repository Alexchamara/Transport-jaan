import React, { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@inertiajs/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import BookingCancellationModal from "./BookingCancellationModal";
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
    const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [showCancellationModal, setShowCancellationModal] = useState(false);
    const [bookingToCancell, setBookingToCancell] = useState(null);
    const receiptRef = useRef(null);

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
        const totalRevenue = filteredBookings.reduce((sum, b) => {
            const amount = parseFloat(b.total_amount || b.amount || 0);
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        const avgBookingValue = filteredBookings.length > 0 ? totalRevenue / filteredBookings.length : 0;
        const cancelledBookings = filteredBookings.filter(b => b.status?.toLowerCase() === 'cancelled').length;
        const completedBookings = filteredBookings.filter(b => ['completed', 'delivered'].includes(b.status?.toLowerCase())).length;
        const cancellationRate = filteredBookings.length > 0 ? (cancelledBookings / filteredBookings.length) * 100 : 0;
        const completionRate = filteredBookings.length > 0 ? (completedBookings / filteredBookings.length) * 100 : 0;
        
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
        setSelectedBookingDetails(booking);
    };

    const downloadReceipt = async () => {
        if (!receiptRef.current || !selectedBookingDetails) return;

        try {
            const canvas = await html2canvas(receiptRef.current, {
                scale: Math.min(3, window.devicePixelRatio || 2),
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 12;
            const imgWidth = pageWidth - (2 * margin);
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = margin;

            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - 2 * margin);

            while (heightLeft > 0) {
                position = heightLeft - imgHeight + margin;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
                heightLeft -= (pageHeight - 2 * margin);
            }

            const bookingType = selectedBookingDetails.booking_type || 'booking';
            const reference = selectedBookingDetails.reference_number || selectedBookingDetails.id || 'receipt';
            const date = new Date().toISOString().split('T')[0];
            const fileName = `receipt_${bookingType}_${reference}_${date}.pdf`;
            
            pdf.save(fileName);
            setShowReceiptModal(false);
        } catch (error) {
            console.error('Error generating receipt:', error);
            alert('Failed to generate receipt. Please try again.');
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#E5E5E5]">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12 poppins">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 md:mb-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight md:text-[35px]">
                                    <span className="text-[#0955AC]">All Bookings</span>{" "}
                                    Dashboard
                                </h1>
                                <p className="text-slate-600 text-[14px]">
                                    Manage all your bookings: Vehicles, Tickets, Warehouse, Courier & Freight
                                </p>
                            </div>
                            
                            {/* Service Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/clientVehicleDashboard"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-[13px] font-medium transition-colors"
                                >
                                    <Car className="w-4 h-4" /> Vehicle Rental
                                </Link>
                                <Link
                                    href="/clientTicketBookingDashboard"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-[13px] font-medium transition-colors"
                                >
                                    <Plane className="w-4 h-4" /> Ticket Booking
                                </Link>
                                <Link
                                    href="/courierBookingDashboard"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 rounded-lg text-[13px] font-medium transition-colors"
                                >
                                    <Package className="w-4 h-4" /> Courier Service
                                </Link>
                                <Link
                                    href="/warehouseBookingDashboard"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-lg text-[13px] font-medium transition-colors"
                                >
                                    <Warehouse className="w-4 h-4" /> Warehouse Services
                                </Link>
                                <Link
                                    href="/freightBookingDashboard"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-[13px] font-medium transition-colors"
                                >
                                    <Truck className="w-4 h-4" /> Freight Services
                                </Link>
                            </div>
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

                

                {/* Search & Filters */}
                <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="px-4 sm:px-6 py-4 sm:py-5">
                        <div className="flex flex-col gap-4">
                            {/* Action Buttons Row */}
                            <div className="flex gap-2 justify-end items-center flex-wrap">
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
                            </div>
                            
                            {/* Filter Inputs Row */}
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
                </div>

                {/* Main Content Grid */}
                <div className="mt-6 md:mt-8">
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
                                <span className="text-[12px] text-slate-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="h-10 px-3 rounded-lg border border-slate-300 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#0955AC] min-w-[120px]"
                                >
                                    <option value={5}>5 per page</option>
                                    <option value={10}>10 per page</option>
                                    <option value={20}>20 per page</option>
                                    <option value={50}>50 per page</option>
                                </select>
                            </div>
                        </div>

                        {/* Bookings Cards */}
                        <div className="space-y-4">
                            {paginatedBookings.length > 0 ? (
                                paginatedBookings.map((booking) => (
                                    <motion.div
                                        key={booking.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <div className="group rounded-xl md:rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                            <div className="p-4 sm:p-6">
                                                <div className="flex items-start gap-2 sm:gap-4 mb-3 sm:mb-4">
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
                                                                ${(parseFloat(booking.total_amount || booking.amount || 0) || 0).toFixed(2)}
                                                            </div>
                                                            <div className="text-[11px] text-slate-500 mt-1">
                                                                {booking.currency || 'LKR'}
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
                                                    {booking.booking_type === 'vehicle' && ['confirmed', 'paid', 'active'].includes(booking.status?.toLowerCase()) && (
                                                        <button 
                                                            onClick={() => {
                                                                setBookingToCancell(booking);
                                                                setShowCancellationModal(true);
                                                            }}
                                                            className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl border border-red-200 text-red-600 text-[12px] sm:text-[13px] font-medium hover:bg-red-50 inline-flex items-center gap-2 touch-manipulation"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                            <span className="hidden sm:inline">Booking Cancel</span>
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => {
                                                            handleViewDetails(booking);
                                                            setTimeout(() => setShowReceiptModal(true), 300);
                                                        }}
                                                        className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl border border-slate-200 text-slate-700 text-[12px] sm:text-[13px] font-medium hover:bg-slate-50 touch-manipulation"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white">
                                    <div className="px-4 py-40 text-center">
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

                    {/* Sidebar: Quick Actions */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Quick Actions */}
                        <div className="rounded-xl md:rounded-2xl bg-white border border-slate-200 shadow-sm">
                            <div className="px-4 sm:px-6 pt-5 sm:pt-7 pb-4 sm:pb-5">
                                <h3 className="font-semibold leading-none tracking-tight text-[16px] sm:text-[18px]">
                                    Quick Actions
                                </h3>
                                <p className="text-[12px] sm:text-[13px] text-slate-500 mt-1">
                                    Book new services
                                </p>
                            </div>
                            <div className="px-4 sm:px-6 pb-6 sm:pb-8 space-y-2 font-medium">
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
                </div>

                {/* Charts Row */}
                <div className="mt-6 md:mt-8">
                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                    {/* Bar Chart */}
                    <div className="bg-white rounded-xl shadow-sm">
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
                            {/* Chart for md and up */}
                            <div className="hidden md:block h-[250px] sm:h-[300px] md:h-[350px] w-full">
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
                            {/* Cards for mobile */}
                            <div className="block md:hidden space-y-3">
                                {chartData.map((item, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                                        <h4 className="font-semibold text-gray-800 mb-2">{item.month}</h4>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-blue-600">Vehicles:</span>
                                                <span className="font-medium">{item.vehicle}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#0955AC]">Tickets:</span>
                                                <span className="font-medium">{item.tickets}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-purple-600">Logistics:</span>
                                                <span className="font-medium">{item.logistics}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
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

                {/* Booking Details Modal - Type-Specific */}
                <AnimatePresence>
                    {selectedBookingDetails && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
                            onClick={() => setSelectedBookingDetails(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                            >
                                {/* Modal Header */}
                                <div className="bg-gradient-to-r from-[#0955AC] to-[#0744a0] text-white px-4 sm:px-8 py-4 sm:py-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
                                                <BookingTypeIcon 
                                                    type={selectedBookingDetails.booking_type} 
                                                    className="h-6 w-6 sm:h-7 sm:w-7 text-white" 
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h2 className="text-[20px] sm:text-[26px] font-bold mb-2 break-words">
                                                    {selectedBookingDetails.service_name || selectedBookingDetails.vehicle_name || selectedBookingDetails.title || 'Booking Details'}
                                                </h2>
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[12px] sm:text-[13px]">
                                                    <span className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full font-medium">
                                                        {selectedBookingDetails.booking_type?.toUpperCase() || 'BOOKING'}
                                                    </span>
                                                    <span
                                                        className={`px-2 sm:px-3 py-1 rounded-full font-medium border ${
                                                            statusMap[selectedBookingDetails.status?.toLowerCase()]?.tone || statusMap.pending.tone
                                                        } bg-white`}
                                                    >
                                                        {statusMap[selectedBookingDetails.status?.toLowerCase()]?.label || selectedBookingDetails.status || 'Pending'}
                                                    </span>
                                                    {(selectedBookingDetails.booking_code || selectedBookingDetails.reference_number) && (
                                                        <span className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full font-mono text-[11px] sm:text-[12px]">
                                                            #{selectedBookingDetails.booking_code || selectedBookingDetails.reference_number}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedBookingDetails(null)}
                                            className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                                        >
                                            <X className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Content - Type-Specific Scrollable */}
                                <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6">
                                    {/* Payment Summary Card - Universal */}
                                    <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-br from-[#0955AC]/5 to-transparent rounded-xl border-2 border-[#0955AC]/20">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div>
                                                <p className="text-[12px] sm:text-[13px] text-slate-600 mb-1">Total Amount</p>
                                                <p className="text-[28px] sm:text-[36px] font-bold text-[#0955AC]">
                                                    ${(parseFloat(selectedBookingDetails.total_amount || selectedBookingDetails.amount || 0) || 0).toFixed(2)}
                                                </p>
                                                <p className="text-[11px] sm:text-[12px] text-slate-500 mt-1">
                                                    {selectedBookingDetails.currency || 'LKR'} • {selectedBookingDetails.payment_method || 'Payment Method Not Specified'}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                                                <button 
                                                    onClick={() => setShowReceiptModal(true)}
                                                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-[#0955AC] text-white rounded-xl text-[13px] font-medium hover:bg-[0744a0] transition-colors inline-flex items-center justify-center gap-2"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download Receipt
                                                </button>
                                                {['confirmed', 'paid', 'active'].includes(selectedBookingDetails.status?.toLowerCase()) && (
                                                    <button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border-2 border-slate-200 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-slate-50 transition-colors">
                                                        Modify Booking
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Type-Specific Content Sections */}
                                    {selectedBookingDetails.booking_type === 'vehicle' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                                            {/* Vehicle Details */}
                                            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                    <Car className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                    Vehicle Information
                                                </h3>
                                                <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Vehicle:</span>
                                                        <span className="font-semibold text-slate-900">{selectedBookingDetails.vehicle_name || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Category:</span>
                                                        <span className="font-semibold text-slate-900 capitalize">{selectedBookingDetails.vehicle_category?.name || selectedBookingDetails.vehicle_category || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Booking ID:</span>
                                                        <span className="font-semibold text-slate-900">#{selectedBookingDetails.id}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Reference:</span>
                                                        <span className="font-semibold text-slate-900 font-mono text-[12px]">{selectedBookingDetails.booking_code || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rental Period */}
                                            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                    Rental Period
                                                </h3>
                                                <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                    {selectedBookingDetails.start_date && (
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-slate-600">Start Date:</span>
                                                            <span className="font-semibold text-slate-900">{new Date(selectedBookingDetails.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                    )}
                                                    {selectedBookingDetails.end_date && (
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-slate-600">End Date:</span>
                                                            <span className="font-semibold text-slate-900">{new Date(selectedBookingDetails.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                    )}
                                                    {selectedBookingDetails.rental_days && (
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-slate-600">Duration:</span>
                                                            <span className="font-semibold text-slate-900">{selectedBookingDetails.rental_days} {selectedBookingDetails.rental_days === 1 ? 'day' : 'days'}</span>
                                                        </div>
                                                    )}
                                                    {selectedBookingDetails.price_per_day && (
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-slate-600">Daily Rate:</span>
                                                            <span className="font-semibold text-slate-900">${(parseFloat(selectedBookingDetails.price_per_day) || 0).toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Pickup/Dropoff Locations */}
                                            {(selectedBookingDetails.pickup_location || selectedBookingDetails.dropoff_location) && (
                                                <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                    <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                        Locations
                                                    </h3>
                                                    <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                        {selectedBookingDetails.pickup_location && (
                                                            <div>
                                                                <span className="text-slate-600 block mb-1">Pickup:</span>
                                                                <span className="font-semibold text-slate-900 text-[12px]">{selectedBookingDetails.pickup_location}</span>
                                                            </div>
                                                        )}
                                                        {selectedBookingDetails.dropoff_location && (
                                                            <div>
                                                                <span className="text-slate-600 block mb-1">Dropoff:</span>
                                                                <span className="font-semibold text-slate-900 text-[12px]">{selectedBookingDetails.dropoff_location}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Customer Info */}
                                            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                    Customer Details
                                                </h3>
                                                <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Name:</span>
                                                        <span className="font-semibold text-slate-900">{selectedBookingDetails.customer_name || selectedBookingDetails.user?.name || 'Not provided'}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Email:</span>
                                                        <span className="font-semibold text-slate-900 text-[12px] break-all">{selectedBookingDetails.customer_email || selectedBookingDetails.user?.email || 'Not provided'}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Phone:</span>
                                                        <span className="font-semibold text-slate-900">{selectedBookingDetails.customer_phone || selectedBookingDetails.user?.phone || 'Not provided'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Provider Info */}
                                            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                    Vehicle Provider
                                                </h3>
                                                <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Company:</span>
                                                        <span className="font-semibold text-slate-900">{selectedBookingDetails.vendor_name || selectedBookingDetails.provider_name || 'Not specified'}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Email:</span>
                                                        <span className="font-semibold text-slate-900 text-[12px]">{selectedBookingDetails.vendor_email || selectedBookingDetails.provider_email || 'Not provided'}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Phone:</span>
                                                        <span className="font-semibold text-slate-900">{selectedBookingDetails.vendor_phone || selectedBookingDetails.provider_phone || 'Not provided'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description/Notes */}
                                            {selectedBookingDetails.description && (
                                                <div className="md:col-span-2 bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-200">
                                                    <h3 className="font-bold text-[15px] sm:text-[16px] mb-2 flex items-center gap-2 text-slate-800">
                                                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                                        Booking Notes
                                                    </h3>
                                                    <p className="text-[13px] sm:text-[14px] text-slate-700 leading-relaxed">{selectedBookingDetails.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : selectedBookingDetails.booking_type === 'train' || selectedBookingDetails.booking_type === 'bus' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                                        {/* Ticket Details */}
                                        <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                            <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                {selectedBookingDetails.booking_type === 'train' ? (
                                                    <Train className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                ) : (
                                                    <Bus className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                )}
                                                {selectedBookingDetails.booking_type === 'train' ? 'Train' : 'Bus'} Journey Details
                                            </h3>
                                            <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-slate-600">Booking Ref:</span>
                                                    <span className="font-semibold text-slate-900 font-mono text-[12px]">{selectedBookingDetails.booking_code || selectedBookingDetails.reference_number || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-slate-600">Journey Date:</span>
                                                    <span className="font-semibold text-slate-900">{selectedBookingDetails.start_date ? new Date(selectedBookingDetails.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-slate-600">Service:</span>
                                                    <span className="font-semibold text-slate-900">{selectedBookingDetails.service_name || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Passenger Information */}
                                        <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                            <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                Passenger Details
                                            </h3>
                                            <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-slate-600">Name:</span>
                                                    <span className="font-semibold text-slate-900">{selectedBookingDetails.customer_name || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-slate-600">Email:</span>
                                                    <span className="font-semibold text-slate-900 text-[12px]">{selectedBookingDetails.customer_email || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-slate-600">Phone:</span>
                                                    <span className="font-semibold text-slate-900">{selectedBookingDetails.customer_phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Booking Info */}
                                        {selectedBookingDetails.notes && (
                                            <div className="md:col-span-2 bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-200">
                                                <h3 className="font-bold text-[15px] sm:text-[16px] mb-2 flex items-center gap-2 text-slate-800">
                                                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                                    Booking Information
                                                </h3>
                                                <p className="text-[13px] sm:text-[14px] text-slate-700">{selectedBookingDetails.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                    ) : selectedBookingDetails.booking_type === 'flight' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                                            {/* Flight Details */}
                                            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                    <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                    Flight Information
                                                </h3>
                                                <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Booking Ref:</span>
                                                        <span className="font-semibold text-slate-900 font-mono text-[12px]">{selectedBookingDetails.booking_code || selectedBookingDetails.reference_number || 'N/A'}</span>
                                                    </div>
                                                    {selectedBookingDetails.departure_date && (
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-slate-600">Departure:</span>
                                                            <span className="font-semibold text-slate-900">{new Date(selectedBookingDetails.departure_date || selectedBookingDetails.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                    )}
                                                    {selectedBookingDetails.return_date && (
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-slate-600">Return:</span>
                                                            <span className="font-semibold text-slate-900">{new Date(selectedBookingDetails.return_date || selectedBookingDetails.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Route Information */}
                                            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                    Route
                                                </h3>
                                                <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                    {selectedBookingDetails.pickup_location && (
                                                        <div>
                                                            <span className="text-slate-600 block mb-1">From:</span>
                                                            <span className="font-semibold text-slate-900 text-[12px]">{selectedBookingDetails.pickup_location}</span>
                                                        </div>
                                                    )}
                                                    {selectedBookingDetails.dropoff_location && (
                                                        <div>
                                                            <span className="text-slate-600 block mb-1">To:</span>
                                                            <span className="font-semibold text-slate-900 text-[12px]">{selectedBookingDetails.dropoff_location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Passenger Details */}
                                            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                    Passenger Details
                                                </h3>
                                                <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Name:</span>
                                                        <span className="font-semibold text-slate-900">{selectedBookingDetails.customer_name || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Email:</span>
                                                        <span className="font-semibold text-slate-900 text-[12px]">{selectedBookingDetails.customer_email || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Phone:</span>
                                                        <span className="font-semibold text-slate-900">{selectedBookingDetails.customer_phone || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Special Requests */}
                                            {selectedBookingDetails.notes && (
                                                <div className="md:col-span-2 bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-200">
                                                    <h3 className="font-bold text-[15px] sm:text-[16px] mb-2 flex items-center gap-2 text-slate-800">
                                                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                                        Special Requests
                                                    </h3>
                                                    <p className="text-[13px] sm:text-[14px] text-slate-700">{selectedBookingDetails.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : selectedBookingDetails.booking_type === 'courier' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                                            {/* Shipment Details */}
                                            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                    Shipment Details
                                                </h3>
                                                <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Tracking Ref:</span>
                                                        <span className="font-semibold text-slate-900 font-mono text-[12px]">{selectedBookingDetails.reference_number || selectedBookingDetails.tracking_reference || 'N/A'}</span>
                                                    </div>
                                                    {selectedBookingDetails.service_level && (
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-slate-600">Service Level:</span>
                                                            <span className="font-semibold text-slate-900 capitalize">{selectedBookingDetails.service_level}</span>
                                                        </div>
                                                    )}
                                                    {selectedBookingDetails.pickup_date && (
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-slate-600">Pickup Date:</span>
                                                            <span className="font-semibold text-slate-900">{new Date(selectedBookingDetails.pickup_date || selectedBookingDetails.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                    )}
                                                    {selectedBookingDetails.package_count && (
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-slate-600">Packages:</span>
                                                            <span className="font-semibold text-slate-900">{selectedBookingDetails.package_count} {selectedBookingDetails.package_count === 1 ? 'package' : 'packages'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Sender Information */}
                                            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                    Sender Details
                                                </h3>
                                                <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Name:</span>
                                                        <span className="font-semibold text-slate-900">{selectedBookingDetails.customer_name || selectedBookingDetails.user?.name || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Email:</span>
                                                        <span className="font-semibold text-slate-900 text-[12px]">{selectedBookingDetails.customer_email || selectedBookingDetails.user?.email || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Phone:</span>
                                                        <span className="font-semibold text-slate-900">{selectedBookingDetails.customer_phone || selectedBookingDetails.user?.phone || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pickup Location */}
                                            {selectedBookingDetails.pickup_location && (
                                                <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                    <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                        Pickup Location
                                                    </h3>
                                                    <p className="text-[13px] sm:text-[14px] text-slate-700 font-semibold leading-relaxed">{selectedBookingDetails.pickup_location}</p>
                                                </div>
                                            )}

                                            {/* Delivery Location */}
                                            {selectedBookingDetails.dropoff_location && (
                                                <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                    <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                                        Delivery Location
                                                    </h3>
                                                    <p className="text-[13px] sm:text-[14px] text-slate-700 font-semibold leading-relaxed">{selectedBookingDetails.dropoff_location}</p>
                                                </div>
                                            )}

                                            {/* Delivery Instructions */}
                                            {selectedBookingDetails.notes && (
                                                <div className="md:col-span-2 bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-200">
                                                    <h3 className="font-bold text-[15px] sm:text-[16px] mb-2 flex items-center gap-2 text-slate-800">
                                                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                                        Delivery Instructions
                                                    </h3>
                                                    <p className="text-[13px] sm:text-[14px] text-slate-700">{selectedBookingDetails.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : selectedBookingDetails.booking_type === 'warehouse' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                                            {/* Warehouse Details */}
                                            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                    <Warehouse className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                    Storage Details
                                                </h3>
                                                <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Booking Ref:</span>
                                                        <span className="font-semibold text-slate-900 font-mono text-[12px]">{selectedBookingDetails.booking_code || selectedBookingDetails.reference_number || 'N/A'}</span>
                                                    </div>
                                                    {selectedBookingDetails.start_date && (
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-slate-600">Start Date:</span>
                                                            <span className="font-semibold text-slate-900">{new Date(selectedBookingDetails.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                    )}
                                                    {selectedBookingDetails.end_date && (
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-slate-600">End Date:</span>
                                                            <span className="font-semibold text-slate-900">{new Date(selectedBookingDetails.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                    )}
                                                    {selectedBookingDetails.duration && (
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-slate-600">Duration:</span>
                                                            <span className="font-semibold text-slate-900">{selectedBookingDetails.duration}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Company Information */}
                                            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                    Company Details
                                                </h3>
                                                <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Company:</span>
                                                        <span className="font-semibold text-slate-900">{selectedBookingDetails.company_name || selectedBookingDetails.customer_name || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Contact:</span>
                                                        <span className="font-semibold text-slate-900">{selectedBookingDetails.customer_name || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Email:</span>
                                                        <span className="font-semibold text-slate-900 text-[12px]">{selectedBookingDetails.customer_email || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Phone:</span>
                                                        <span className="font-semibold text-slate-900">{selectedBookingDetails.customer_phone || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Warehouse Provider */}
                                            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                    Warehouse Provider
                                                </h3>
                                                <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Provider:</span>
                                                        <span className="font-semibold text-slate-900">{selectedBookingDetails.vendor_name || 'Not specified'}</span>
                                                    </div>
                                                    {selectedBookingDetails.vendor_email && (
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-slate-600">Email:</span>
                                                            <span className="font-semibold text-slate-900 text-[12px]">{selectedBookingDetails.vendor_email}</span>
                                                        </div>
                                                    )}
                                                    {selectedBookingDetails.vendor_phone && (
                                                        <div className="flex justify-between gap-2">
                                                            <span className="text-slate-600">Phone:</span>
                                                            <span className="font-semibold text-slate-900">{selectedBookingDetails.vendor_phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Storage Notes */}
                                            {selectedBookingDetails.notes && (
                                                <div className="md:col-span-2 bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-200">
                                                    <h3 className="font-bold text-[15px] sm:text-[16px] mb-2 flex items-center gap-2 text-slate-800">
                                                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                                        Storage Requirements & Notes
                                                    </h3>
                                                    <p className="text-[13px] sm:text-[14px] text-slate-700">{selectedBookingDetails.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                                            {/* Generic fallback - existing sections continue below */}
                                            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                    Booking Information
                                                </h3>
                                                <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Booking ID:</span>
                                                        <span className="font-semibold text-slate-900">#{selectedBookingDetails.id}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Reference:</span>
                                                        <span className="font-semibold text-slate-900 font-mono text-[12px] break-all">{selectedBookingDetails.booking_code || selectedBookingDetails.reference_number || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                                <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                    Customer Details
                                                </h3>
                                                <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Name:</span>
                                                        <span className="font-semibold text-slate-900">{selectedBookingDetails.customer_name || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Email:</span>
                                                        <span className="font-semibold text-slate-900 text-[12px]">{selectedBookingDetails.customer_email || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Breakdown - Common for all types */}
                                    <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                        <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                            Payment Summary
                                        </h3>
                                        <div className="space-y-2 text-[13px] sm:text-[14px]">
                                            {selectedBookingDetails.base_price && (
                                                <div className="flex justify-between py-2">
                                                    <span className="text-slate-600">Base Price:</span>
                                                    <span className="font-semibold text-slate-900">${(parseFloat(selectedBookingDetails.base_price) || 0).toFixed(2)}</span>
                                                </div>
                                            )}
                                            {selectedBookingDetails.tax_amount && (
                                                <div className="flex justify-between py-2">
                                                    <span className="text-slate-600">Tax:</span>
                                                    <span className="font-semibold text-slate-900">${(parseFloat(selectedBookingDetails.tax_amount) || 0).toFixed(2)}</span>
                                                </div>
                                            )}
                                            {selectedBookingDetails.discount && (
                                                <div className="flex justify-between py-2 text-green-600">
                                                    <span>Discount:</span>
                                                    <span className="font-semibold">-${(parseFloat(selectedBookingDetails.discount) || 0).toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="border-t-2 border-slate-300 pt-3 mt-2">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-800 font-bold text-[15px] sm:text-[16px]">Total Amount:</span>
                                                    <span className="font-bold text-[17px] sm:text-[18px] text-[#0955AC]">
                                                        ${(parseFloat(selectedBookingDetails.total_amount || selectedBookingDetails.amount || 0) || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Generic Description - shown if not shown in type-specific section */}
                                    {selectedBookingDetails.description && !selectedBookingDetails.notes && (
                                        <div className="mt-4 sm:mt-6 bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-200">
                                            <h3 className="font-bold text-[15px] sm:text-[16px] mb-2 flex items-center gap-2 text-slate-800">
                                                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                                Description / Notes
                                            </h3>
                                            <p className="text-[13px] sm:text-[14px] text-slate-700 leading-relaxed">{selectedBookingDetails.description}</p>
                                        </div>
                                    )}

                                    {/* Keep existing vendor/customer sections hidden here since shown in type-specific sections */}
                                    {false && (
                                        <div className="hidden">
                                            {/* Customer/User Information - Always visible */}
                                        <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                            <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                Customer Information
                                            </h3>
                                            <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-slate-600">Name:</span>
                                                    <span className="font-semibold text-slate-900">
                                                        {selectedBookingDetails.customer_name || 
                                                         selectedBookingDetails.user?.name || 
                                                         selectedBookingDetails.user_name ||
                                                         'Not provided'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-slate-600">Email:</span>
                                                    <span className="font-semibold text-slate-900 text-[12px] break-all">
                                                        {selectedBookingDetails.customer_email || 
                                                         selectedBookingDetails.user?.email || 
                                                         selectedBookingDetails.user_email ||
                                                         'Not provided'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-slate-600">Phone:</span>
                                                    <span className="font-semibold text-slate-900">
                                                        {selectedBookingDetails.customer_phone || 
                                                         selectedBookingDetails.user?.phone || 
                                                         selectedBookingDetails.user_phone ||
                                                         selectedBookingDetails.phone ||
                                                         'Not provided'}
                                                    </span>
                                                </div>
                                                {(selectedBookingDetails.user?.address || selectedBookingDetails.customer_address) && (
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Address:</span>
                                                        <span className="font-semibold text-slate-900 text-right text-[12px]">
                                                            {selectedBookingDetails.user?.address || selectedBookingDetails.customer_address}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Service Provider Information - Always visible */}
                                        <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
                                            <h3 className="font-bold text-[15px] sm:text-[16px] mb-3 sm:mb-4 flex items-center gap-2 text-slate-800">
                                                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-[#0955AC]" />
                                                Service Provider Information
                                            </h3>
                                            <div className="space-y-2 sm:space-y-3 text-[13px] sm:text-[14px]">
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-slate-600">Company:</span>
                                                    <span className="font-semibold text-slate-900">
                                                        {selectedBookingDetails.vendor?.name || 
                                                         selectedBookingDetails.provider?.name || 
                                                         selectedBookingDetails.vendor_name ||
                                                         selectedBookingDetails.provider_name ||
                                                         selectedBookingDetails.company_name ||
                                                         'Not specified'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-slate-600">Contact Email:</span>
                                                    <span className="font-semibold text-slate-900 text-[12px] break-all">
                                                        {selectedBookingDetails.vendor?.email || 
                                                         selectedBookingDetails.provider?.email ||
                                                         selectedBookingDetails.vendor_email ||
                                                         selectedBookingDetails.provider_email ||
                                                         'Not provided'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between gap-2">
                                                    <span className="text-slate-600">Contact Phone:</span>
                                                    <span className="font-semibold text-slate-900">
                                                        {selectedBookingDetails.vendor?.phone || 
                                                         selectedBookingDetails.provider?.phone || 
                                                         selectedBookingDetails.vendor_phone ||
                                                         selectedBookingDetails.provider_phone ||
                                                         selectedBookingDetails.contact_number ||
                                                         'Not provided'}
                                                    </span>
                                                </div>
                                                {(selectedBookingDetails.vendor?.address || 
                                                  selectedBookingDetails.provider?.address ||
                                                  selectedBookingDetails.vendor_address ||
                                                  selectedBookingDetails.provider_address) && (
                                                    <div className="flex justify-between gap-2">
                                                        <span className="text-slate-600">Address:</span>
                                                        <span className="font-semibold text-slate-900 text-right text-[12px]">
                                                            {selectedBookingDetails.vendor?.address || 
                                                             selectedBookingDetails.provider?.address ||
                                                             selectedBookingDetails.vendor_address ||
                                                             selectedBookingDetails.provider_address}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="bg-slate-50 px-4 sm:px-8 py-4 sm:py-5 border-t border-slate-200">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <div className="text-[12px] sm:text-[13px] text-slate-600 text-center sm:text-left">
                                            <p>Need help? <a href="mailto:support@transportjaan.com" className="text-[#0955AC] font-medium hover:underline">Contact support</a></p>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <button 
                                                onClick={() => setSelectedBookingDetails(null)}
                                                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 border-2 border-slate-300 text-slate-700 rounded-xl text-[13px] font-medium hover:bg-white transition-colors"
                                            >
                                                Close
                                            </button>
                                            <button 
                                                onClick={() => setShowReceiptModal(true)}
                                                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-[#0955AC] text-white rounded-xl text-[13px] font-medium hover:bg-[#0744a0] transition-colors inline-flex items-center justify-center gap-2"
                                            >
                                                <Download className="h-4 w-4" />
                                                <span className="hidden sm:inline">Download PDF</span>
                                                <span className="sm:hidden">PDF</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Receipt Modal */}
                <AnimatePresence>
                    {showReceiptModal && selectedBookingDetails && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
                            onClick={() => setShowReceiptModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ type: "spring", duration: 0.3 }}
                                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Receipt Content */}
                                <div ref={receiptRef} className="bg-white p-8 sm:p-12">
                                    {/* Receipt Header */}
                                    <div className="border-b-2 border-slate-200 pb-6 mb-6">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                            <div>
                                                <h1 className="text-3xl font-bold text-[#0955AC]">Leo Transport</h1>
                                                <p className="text-sm text-slate-600 mt-1">Your Trusted Transport Partner</p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <h2 className="text-2xl font-bold text-slate-900">RECEIPT</h2>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    {selectedBookingDetails.reference_number || `#${selectedBookingDetails.id}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="font-semibold text-slate-900">Leo Transport</p>
                                                <p className="text-slate-600">123 Transport Street</p>
                                                <p className="text-slate-600">Colombo, Sri Lanka</p>
                                                <p className="text-slate-600">info@leotransport.com</p>
                                                <p className="text-slate-600">+94 11 234 5678</p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-slate-600">
                                                    <span className="font-semibold text-slate-900">Date:</span>{" "}
                                                    {new Date(selectedBookingDetails.created_at || selectedBookingDetails.booking_date).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    })}
                                                </p>
                                                <p className="text-slate-600">
                                                    <span className="font-semibold text-slate-900">Type:</span>{" "}
                                                    {selectedBookingDetails.booking_type?.charAt(0).toUpperCase() + selectedBookingDetails.booking_type?.slice(1) || 'Booking'}
                                                </p>
                                                <p className="text-slate-600">
                                                    <span className="font-semibold text-slate-900">Status:</span>{" "}
                                                    <span className={`font-medium ${
                                                        ['paid', 'completed', 'delivered'].includes(selectedBookingDetails.status?.toLowerCase()) ? 'text-green-600' :
                                                        ['confirmed', 'active', 'in_transit'].includes(selectedBookingDetails.status?.toLowerCase()) ? 'text-blue-600' :
                                                        ['pending'].includes(selectedBookingDetails.status?.toLowerCase()) ? 'text-yellow-600' :
                                                        'text-slate-600'
                                                    }`}>
                                                        {selectedBookingDetails.status?.toUpperCase() || 'N/A'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bill To Section */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-slate-900 mb-3">Bill To:</h3>
                                        <div className="bg-slate-50 p-4 rounded-lg">
                                            <p className="font-semibold text-slate-900">
                                                {selectedBookingDetails.customer?.name || 
                                                 selectedBookingDetails.client?.name ||
                                                 selectedBookingDetails.passenger_name ||
                                                 selectedBookingDetails.sender_name ||
                                                 selectedBookingDetails.company_name ||
                                                 'Customer'}
                                            </p>
                                            <p className="text-sm text-slate-600 mt-1">
                                                {selectedBookingDetails.customer?.email || 
                                                 selectedBookingDetails.client?.email ||
                                                 selectedBookingDetails.passenger_email ||
                                                 selectedBookingDetails.sender_email ||
                                                 selectedBookingDetails.company_email ||
                                                 'N/A'}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                {selectedBookingDetails.customer?.phone || 
                                                 selectedBookingDetails.client?.phone ||
                                                 selectedBookingDetails.passenger_phone ||
                                                 selectedBookingDetails.sender_phone ||
                                                 selectedBookingDetails.company_phone ||
                                                 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Booking Details - Type Specific */}
                                    {selectedBookingDetails.booking_type === 'vehicle' && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-bold text-slate-900 mb-3">Vehicle Rental Details:</h3>
                                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-slate-100">
                                                        <tr>
                                                            <th className="text-left p-3 font-semibold text-slate-700">Description</th>
                                                            <th className="text-right p-3 font-semibold text-slate-700">Details</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-200">
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Vehicle</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {selectedBookingDetails.vehicle_name || 
                                                                 selectedBookingDetails.vehicle?.name ||
                                                                 'Vehicle Rental'}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Category</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {selectedBookingDetails.vehicle_category?.name || 
                                                                 selectedBookingDetails.category ||
                                                                 'N/A'}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Rental Period</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {new Date(selectedBookingDetails.start_date).toLocaleDateString()} - {new Date(selectedBookingDetails.end_date).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Duration</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {selectedBookingDetails.rental_days || 
                                                                 Math.ceil((new Date(selectedBookingDetails.end_date) - new Date(selectedBookingDetails.start_date)) / (1000 * 60 * 60 * 24)) || 
                                                                 'N/A'} days
                                                            </td>
                                                        </tr>
                                                        {selectedBookingDetails.pickup_location && (
                                                            <tr>
                                                                <td className="p-3 text-slate-600">Pickup Location</td>
                                                                <td className="p-3 text-right font-medium text-slate-900">
                                                                    {selectedBookingDetails.pickup_location}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {selectedBookingDetails.dropoff_location && (
                                                            <tr>
                                                                <td className="p-3 text-slate-600">Dropoff Location</td>
                                                                <td className="p-3 text-right font-medium text-slate-900">
                                                                    {selectedBookingDetails.dropoff_location}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {(selectedBookingDetails.booking_type === 'train' || selectedBookingDetails.booking_type === 'bus') && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-bold text-slate-900 mb-3">Journey Details:</h3>
                                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-slate-100">
                                                        <tr>
                                                            <th className="text-left p-3 font-semibold text-slate-700">Description</th>
                                                            <th className="text-right p-3 font-semibold text-slate-700">Details</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-200">
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Route</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {selectedBookingDetails.from_station || selectedBookingDetails.departure_station || 'N/A'} → {selectedBookingDetails.to_station || selectedBookingDetails.arrival_station || 'N/A'}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Date & Time</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {new Date(selectedBookingDetails.departure_date || selectedBookingDetails.travel_date).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Passenger</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {selectedBookingDetails.passenger_name || 'N/A'}
                                                            </td>
                                                        </tr>
                                                        {selectedBookingDetails.seat_numbers && (
                                                            <tr>
                                                                <td className="p-3 text-slate-600">Seat(s)</td>
                                                                <td className="p-3 text-right font-medium text-slate-900">
                                                                    {selectedBookingDetails.seat_numbers}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {selectedBookingDetails.ticket_class && (
                                                            <tr>
                                                                <td className="p-3 text-slate-600">Class</td>
                                                                <td className="p-3 text-right font-medium text-slate-900">
                                                                    {selectedBookingDetails.ticket_class}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {selectedBookingDetails.booking_type === 'flight' && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-bold text-slate-900 mb-3">Flight Details:</h3>
                                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-slate-100">
                                                        <tr>
                                                            <th className="text-left p-3 font-semibold text-slate-700">Description</th>
                                                            <th className="text-right p-3 font-semibold text-slate-700">Details</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-200">
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Flight Number</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {selectedBookingDetails.flight_number || 'N/A'}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Route</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {selectedBookingDetails.departure_airport || 'N/A'} → {selectedBookingDetails.arrival_airport || 'N/A'}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Departure</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {new Date(selectedBookingDetails.departure_date).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                        {selectedBookingDetails.arrival_date && (
                                                            <tr>
                                                                <td className="p-3 text-slate-600">Arrival</td>
                                                                <td className="p-3 text-right font-medium text-slate-900">
                                                                    {new Date(selectedBookingDetails.arrival_date).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Passenger</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {selectedBookingDetails.passenger_name || 'N/A'}
                                                            </td>
                                                        </tr>
                                                        {selectedBookingDetails.seat_number && (
                                                            <tr>
                                                                <td className="p-3 text-slate-600">Seat</td>
                                                                <td className="p-3 text-right font-medium text-slate-900">
                                                                    {selectedBookingDetails.seat_number}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {selectedBookingDetails.booking_class && (
                                                            <tr>
                                                                <td className="p-3 text-slate-600">Class</td>
                                                                <td className="p-3 text-right font-medium text-slate-900">
                                                                    {selectedBookingDetails.booking_class}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {selectedBookingDetails.booking_type === 'courier' && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-bold text-slate-900 mb-3">Shipment Details:</h3>
                                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-slate-100">
                                                        <tr>
                                                            <th className="text-left p-3 font-semibold text-slate-700">Description</th>
                                                            <th className="text-right p-3 font-semibold text-slate-700">Details</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-200">
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Tracking Number</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {selectedBookingDetails.tracking_number || selectedBookingDetails.reference_number || 'N/A'}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Package Type</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {selectedBookingDetails.package_type || 'Standard Package'}
                                                            </td>
                                                        </tr>
                                                        {selectedBookingDetails.weight && (
                                                            <tr>
                                                                <td className="p-3 text-slate-600">Weight</td>
                                                                <td className="p-3 text-right font-medium text-slate-900">
                                                                    {selectedBookingDetails.weight} kg
                                                                </td>
                                                            </tr>
                                                        )}
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Pickup Address</td>
                                                            <td className="p-3 text-right font-medium text-slate-900 text-xs">
                                                                {selectedBookingDetails.pickup_address || 'N/A'}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Delivery Address</td>
                                                            <td className="p-3 text-right font-medium text-slate-900 text-xs">
                                                                {selectedBookingDetails.delivery_address || 'N/A'}
                                                            </td>
                                                        </tr>
                                                        {selectedBookingDetails.pickup_date && (
                                                            <tr>
                                                                <td className="p-3 text-slate-600">Pickup Date</td>
                                                                <td className="p-3 text-right font-medium text-slate-900">
                                                                    {new Date(selectedBookingDetails.pickup_date).toLocaleDateString()}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {selectedBookingDetails.delivery_date && (
                                                            <tr>
                                                                <td className="p-3 text-slate-600">Expected Delivery</td>
                                                                <td className="p-3 text-right font-medium text-slate-900">
                                                                    {new Date(selectedBookingDetails.delivery_date).toLocaleDateString()}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {selectedBookingDetails.booking_type === 'warehouse' && (
                                        <div className="mb-6">
                                            <h3 className="text-lg font-bold text-slate-900 mb-3">Warehouse Storage Details:</h3>
                                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-slate-100">
                                                        <tr>
                                                            <th className="text-left p-3 font-semibold text-slate-700">Description</th>
                                                            <th className="text-right p-3 font-semibold text-slate-700">Details</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-200">
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Unit Number</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {selectedBookingDetails.unit_number || 'N/A'}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Storage Type</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {selectedBookingDetails.storage_type || 'Standard Storage'}
                                                            </td>
                                                        </tr>
                                                        {selectedBookingDetails.size && (
                                                            <tr>
                                                                <td className="p-3 text-slate-600">Size</td>
                                                                <td className="p-3 text-right font-medium text-slate-900">
                                                                    {selectedBookingDetails.size}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Storage Period</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {new Date(selectedBookingDetails.start_date).toLocaleDateString()} - {new Date(selectedBookingDetails.end_date).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Duration</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                {selectedBookingDetails.duration_months || 
                                                                 Math.ceil((new Date(selectedBookingDetails.end_date) - new Date(selectedBookingDetails.start_date)) / (1000 * 60 * 60 * 24 * 30)) || 
                                                                 'N/A'} months
                                                            </td>
                                                        </tr>
                                                        {selectedBookingDetails.warehouse_location && (
                                                            <tr>
                                                                <td className="p-3 text-slate-600">Location</td>
                                                                <td className="p-3 text-right font-medium text-slate-900">
                                                                    {selectedBookingDetails.warehouse_location}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Summary */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-slate-900 mb-3">Payment Summary:</h3>
                                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <tbody className="divide-y divide-slate-200">
                                                    <tr>
                                                        <td className="p-3 text-slate-600">Base Price</td>
                                                        <td className="p-3 text-right font-medium text-slate-900">
                                                            LKR {(parseFloat(selectedBookingDetails.base_price || selectedBookingDetails.subtotal || selectedBookingDetails.amount || 0) || 0).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                    {selectedBookingDetails.tax_amount && parseFloat(selectedBookingDetails.tax_amount) > 0 && (
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Tax</td>
                                                            <td className="p-3 text-right font-medium text-slate-900">
                                                                LKR {(parseFloat(selectedBookingDetails.tax_amount) || 0).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {selectedBookingDetails.discount_amount && parseFloat(selectedBookingDetails.discount_amount) > 0 && (
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Discount</td>
                                                            <td className="p-3 text-right font-medium text-green-600">
                                                                - LKR {(parseFloat(selectedBookingDetails.discount_amount) || 0).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    )}
                                                    <tr className="bg-slate-50">
                                                        <td className="p-3 font-bold text-slate-900">Total Amount</td>
                                                        <td className="p-3 text-right font-bold text-[#0955AC] text-lg">
                                                            LKR {(parseFloat(selectedBookingDetails.total_amount || selectedBookingDetails.amount || 0) || 0).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                    {selectedBookingDetails.amount_paid && parseFloat(selectedBookingDetails.amount_paid) > 0 && (
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Amount Paid</td>
                                                            <td className="p-3 text-right font-medium text-green-600">
                                                                LKR {(parseFloat(selectedBookingDetails.amount_paid) || 0).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {selectedBookingDetails.amount_due && parseFloat(selectedBookingDetails.amount_due) > 0 && (
                                                        <tr>
                                                            <td className="p-3 text-slate-600">Amount Due</td>
                                                            <td className="p-3 text-right font-medium text-red-600">
                                                                LKR {(parseFloat(selectedBookingDetails.amount_due) || 0).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Terms and Conditions */}
                                    <div className="border-t-2 border-slate-200 pt-6 mt-6">
                                        <h3 className="text-sm font-bold text-slate-900 mb-2">Terms & Conditions:</h3>
                                        <ul className="text-xs text-slate-600 space-y-1">
                                            <li>• Payment is due upon booking confirmation unless otherwise specified.</li>
                                            <li>• Cancellation policy applies as per the booking type and terms agreed upon.</li>
                                            <li>• This receipt is valid for the service(s) mentioned above only.</li>
                                            <li>• For any queries or concerns, please contact our customer support.</li>
                                        </ul>
                                    </div>

                                    {/* Footer */}
                                    <div className="text-center mt-8 pt-6 border-t border-slate-200">
                                        <p className="text-xs text-slate-500">
                                            Thank you for choosing Leo Transport!
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            This is a computer-generated receipt and does not require a signature.
                                        </p>
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowReceiptModal(false)}
                                        className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-white transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={downloadReceipt}
                                        className="px-6 py-2.5 bg-[#0955AC] text-white rounded-xl text-sm font-medium hover:bg-[#0744a0] transition-colors inline-flex items-center gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download PDF
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Booking Cancellation Modal */}
                <BookingCancellationModal
                    booking={bookingToCancell}
                    isOpen={showCancellationModal}
                    onClose={() => {
                        setShowCancellationModal(false);
                        setBookingToCancell(null);
                    }}
                    onSuccess={(data) => {
                        // Refresh the page or update booking status
                        window.location.reload();
                    }}
                />
            </div>
        </div>
    );
};

export default Hero;
