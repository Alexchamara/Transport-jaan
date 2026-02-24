import React, { useState, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import { Download, ChevronDown as DropdownIcon, Plane, Car, Search as SearchIcon, Filter as FilterIcon, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import dollarIcon from "../../../assets/vendors/dashboard/icons/dollarIcon.svg";
import carIcon from "../../../assets/vendors/dashboard/icons/carIcon.svg";
import bookingIcon from "../../../assets/vendors/dashboard/icons/bookingIcon.svg";
import wheelIcon from "../../../assets/vendors/dashboard/icons/wheelIcon.svg";
import upArrow from "../../../assets/vendors/dashboard/icons/upArrow.svg";
import UserDropdown from "../../../components/vendors/UserDropdown";
import NotificationDropdown from "../../../components/vendors/warehouse/NotificationDropdown";
import UnverifiedBanner from "./UnverifiedBanner";
import { API_BASE_URL } from "../../../../../config/api";

const VendorAllBookings = ({
    allBookings = [],
    statistics = {},
    monthlyData = []
}) => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isVerified = user?.vendor_status === 'verified' || user?.is_verified;

    // Dummy data for unverified vendors
    const dummyBookings = [
        {
            id: 1,
            booking_code: "BK-001",
            booking_type: "vehicle",
            customer_name: "John Doe",
            service_name: "Vehicle Rental",
            total_amount: 5000,
            status: "Confirmed",
            booking_date: "2025-02-20"
        },
        {
            id: 2,
            booking_code: "BK-002",
            booking_type: "flight",
            customer_name: "Jane Smith",
            service_name: "Ticket Booking",
            total_amount: 15000,
            status: "Paid",
            booking_date: "2025-02-19"
        },
        {
            id: 3,
            booking_code: "BK-003",
            booking_type: "vehicle",
            customer_name: "Ahmed Khan",
            service_name: "Warehouse Rental",
            total_amount: 8500,
            status: "Pending",
            booking_date: "2025-02-18"
        },
        {
            id: 4,
            booking_code: "BK-004",
            booking_type: "flight",
            customer_name: "Sara Williams",
            service_name: "Courier Service",
            total_amount: 3200,
            status: "Completed",
            booking_date: "2025-02-17"
        },
        {
            id: 5,
            booking_code: "BK-005",
            booking_type: "vehicle",
            customer_name: "Mike Johnson",
            service_name: "Freight Rental",
            total_amount: 12000,
            status: "Confirmed",
            booking_date: "2025-02-16"
        }
    ];

    const dummyStatistics = {
        total_bookings: 45,
        active_bookings: 12,
        total_earned: 235000,
        this_month: 35
    };

    // Use dummy data if unverified, real data if verified
    const displayBookings = isVerified ? allBookings : dummyBookings;
    const displayStatistics = isVerified ? statistics : dummyStatistics;

    const [isMobile, setIsMobile] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [dateFromFilter, setDateFromFilter] = useState("");
    const [dateToFilter, setDateToFilter] = useState("");

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (!auth?.user) return;
        const fetchNotifications = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}vendors/warehouse/notifications/data`);
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || []);
                    setUnreadCount(data.unread_count || 0);
                }
            } catch (e) { console.error("Failed to fetch notifications:", e); }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [auth?.user]);

    // Export bookings to CSV
    const exportToCSV = () => {
        try {
            const headers = ["Booking Code", "Type", "Customer", "Service", "Amount", "Status", "Date"];
            const data = filteredBookings.map(booking => [
                booking.booking_code || booking.id,
                booking.booking_type,
                booking.customer_name,
                booking.service_name,
                booking.total_amount,
                booking.status,
                booking.booking_date
            ]);

            const csvContent = [
                headers.join(","),
                ...data.map(row => row.map(cell => `"${cell}"`).join(","))
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `vendor-bookings-${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error exporting to CSV:", error);
            alert("Error exporting to CSV. Please try again.");
        }
        setShowExportMenu(false);
    };

    // Export bookings to PDF
    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            const data = filteredBookings.map(booking => [
                booking.booking_code || booking.id,
                booking.booking_type,
                booking.customer_name,
                booking.service_name,
                booking.total_amount,
                booking.status,
                booking.booking_date
            ]);

            const headers = [["Booking Code", "Type", "Customer", "Service", "Amount", "Status", "Date"]];
            
            doc.setFontSize(16);
            doc.text("All Bookings Report", 14, 10);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 18);

            autoTable(doc, {
                head: headers,
                body: data,
                startY: 25,
                margin: { top: 20, right: 10, bottom: 10, left: 10 },
                headStyles: { fillColor: [9, 85, 172], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [230, 240, 250] },
                columnStyles: { 0: { halign: 'center' } },
                didDrawPage: (data) => {
                    const pageCount = doc.getNumberOfPages();
                    doc.setFontSize(9);
                    doc.text(
                        `Page ${data.pageNumber} of ${pageCount}`,
                        doc.internal.pageSize.getWidth() / 2,
                        doc.internal.pageSize.getHeight() - 10,
                        { align: 'center' }
                    );
                }
            });

            doc.save(`vendor-bookings-${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            console.error("Error exporting to PDF:", error);
            alert("Error exporting to PDF. Please try again.");
        }
        setShowExportMenu(false);
    };

    // Export bookings to XLSX
    const exportToXLSX = () => {
        try {
            const data = [
                ["Booking Code", "Type", "Customer", "Service", "Amount", "Status", "Date"]
            ];
            
            filteredBookings.forEach(booking => {
                data.push([
                    booking.booking_code || booking.id,
                    booking.booking_type,
                    booking.customer_name,
                    booking.service_name,
                    booking.total_amount,
                    booking.status,
                    booking.booking_date
                ]);
            });

            const worksheet = XLSX.utils.aoa_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "All Bookings");
            
            const colWidths = [
                { wch: 15 },
                { wch: 12 },
                { wch: 18 },
                { wch: 20 },
                { wch: 12 },
                { wch: 12 },
                { wch: 15 }
            ];
            worksheet['!cols'] = colWidths;
            
            XLSX.writeFile(workbook, `vendor-bookings-${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (error) {
            console.error("Error exporting to XLSX:", error);
            alert("Error exporting to XLSX. Please try again.");
        }
        setShowExportMenu(false);
    };

    // Reset filters
    const handleResetFilters = () => {
        setSearchQuery("");
        setStatusFilter("All");
        setTypeFilter("All");
        setDateFromFilter("");
        setDateToFilter("");
    };

    // Apply filters to bookings
    const filteredBookings = (displayBookings || []).filter((booking) => {
        // Search filter
        const matchesSearch = !searchQuery || 
            (booking.booking_code && booking.booking_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (booking.customer_name && booking.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (booking.service_name && booking.service_name.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Type filter
        const matchesType = typeFilter === "All" || booking.booking_type === typeFilter;
        
        // Status filter
        const matchesStatus = statusFilter === "All" || booking.status?.toLowerCase() === statusFilter.toLowerCase();
        
        // Date filters
        const bookingDate = new Date(booking.booking_date);
        const matchesFromDate = !dateFromFilter || bookingDate >= new Date(dateFromFilter);
        const matchesToDate = !dateToFilter || bookingDate <= new Date(dateToFilter);
        
        return matchesSearch && matchesType && matchesStatus && matchesFromDate && matchesToDate;
    });

    // Get status styling
    const getStatusStyle = (status) => {
        const statusLower = status?.toLowerCase() || '';
        const styles = {
            'confirmed': { bg: '#D8E4F2', text: '#000000', border: '#0000004D' },
            'paid': { bg: '#ACE19957', text: '#3B8F31', border: '#3B8F314D' },
            'pending': { bg: '#FFF7ED', text: '#EA580C', border: '#EA580C4D' },
            'completed': { bg: '#D1FAE5', text: '#059669', border: '#06B6D44D' },
            'cancelled': { bg: '#F87171', text: '#FFFFFF', border: '#B91C1C' },
            'active': { bg: '#E8F5E9', text: '#2E7D32', border: '#2E7D324D' }
        };
        return styles[statusLower] || styles['pending'];
    };

    const services = [
        { name: 'Vehicle Rental', route: route('vendors.dashboard') },
        { name: 'Ticket Booking', route: route('ticketBooking.dashboard') },
        { name: 'Courier Service', route: route('courierService.dashboard') },
        { name: 'Warehouse Rental', route: route('vendors.warehouse.dashboard') },
        { name: 'Freight Rental', route: route('freight.dashboard') },
        { name: 'Multimodal', route: route('multiModelHomepage.home') }
    ];

    return (
        <div className="w-full h-auto px-4 sm:px-6 lg:px-8 xl:pr-8 xl:pl-6 pt-24 lg:pt-12 pb-8 lg:pb-12">
            {/* Header section */}
            <div className="flex md:flex-row flex-col gap-5 justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="figtree text-[24px] md:text-[30px] font-[700] text-center md:text-left">
                        All Bookings Dashboard
                    </h1>
                </div>
                <div className="hidden lg:flex items-center gap-3">
                    <NotificationDropdown notifications={notifications} unreadCount={unreadCount} />
                    <UserDropdown settingsRoute={route("settingsPage")} />
                </div>
            </div>

            {/* Unverified Warning */}
            <UnverifiedBanner />

            {/* Service Navigation Bar */}
            <div className="w-full bg-[#FFFFFF] rounded-[10px] mt-8 overflow-x-auto sticky top-10 z-40 p-2 sm:p-3" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
                <div className="flex flex-row gap-0 min-w-max lg:min-w-full">
                    {services.map((service, idx) => (
                        <Link
                            key={idx}
                            href={service.route}
                            className="flex-1 lg:flex-none px-6 py-4 lg:px-8 lg:py-4 text-center font-[500] text-[14px] whitespace-nowrap border-b-4 border-transparent hover:bg-[#F3F3F3] hover:border-b-4 hover:border-[#0955AC] transition-all"
                        >
                            {service.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="flex flex-col gap-5 py-10">
                {/* KPI Cards */}
                <div className="flex flex-col gap-5">
                    <div className="flex xl:flex-row flex-col gap-5 justify-between w-full">
                        {/* Card 1 - Total Bookings */}
                        <div
                            className="w-full xl:min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-10 py-8"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-row gap-5 justify-center items-center px-2">
                                <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                    <img src={bookingIcon} alt="booking" />
                                </div>
                                <div>
                                    <h1 className="text-[14px] font-[500] text-[#7B7B7A]">
                                        Total Bookings
                                    </h1>
                                    <h1 className="text-[20px] font-[700]">
                                        {displayStatistics.total_bookings || 0}
                                    </h1>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end text-[12px] font-[500]">
                                <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                    <img src={upArrow} className="size-[19px]" alt="trend" />
                                    <h1>+2.86%</h1>
                                </div>
                                <h1 className="text-[#7B7B7A]">from last month</h1>
                            </div>
                        </div>

                        {/* Card 2 - Active Bookings */}
                        <div
                            className="w-full xl:min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-10 py-8"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-row gap-5 justify-center items-center">
                                <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                    <img src={wheelIcon} alt="active" />
                                </div>
                                <div>
                                    <h1 className="text-[14px] font-[500] text-[#7B7B7A]">
                                        Active Bookings
                                    </h1>
                                    <h1 className="text-[20px] font-[700]">
                                        {displayStatistics.active_bookings || 0}
                                    </h1>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end text-[12px] font-[500]">
                                <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                    <img src={upArrow} className="size-[19px]" alt="trend" />
                                    <h1>+1.73%</h1>
                                </div>
                                <h1 className="text-[#7B7B7A]">from last month</h1>
                            </div>
                        </div>
                    </div>

                    <div className="flex xl:flex-row flex-col gap-5 w-full">
                        {/* Card 3 - Total Earned */}
                        <div
                            className="w-full xl:min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-10 py-8"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-row gap-5 justify-center items-center">
                                <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                    <img src={dollarIcon} alt="earned" />
                                </div>
                                <div>
                                    <h1 className="text-[14px] font-[500] text-[#7B7B7A]">
                                        Total Earned
                                    </h1>
                                    <h1 className="text-[20px] font-[700]">
                                        Rs. {(displayStatistics.total_earned || 0).toLocaleString()}
                                    </h1>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end text-[12px] font-[500]">
                                <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                    <img src={upArrow} className="size-[19px]" alt="trend" />
                                    <h1>+2.86%</h1>
                                </div>
                                <h1 className="text-[#7B7B7A]">from last month</h1>
                            </div>
                        </div>

                        {/* Card 4 - This Month */}
                        <div
                            className="w-full xl:min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-10 py-8"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-row gap-5 justify-center items-center">
                                <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                    <img src={carIcon} alt="month" />
                                </div>
                                <div>
                                    <h1 className="text-[14px] font-[500] text-[#7B7B7A]">
                                        This Month
                                    </h1>
                                    <h1 className="text-[20px] font-[700]">
                                        {displayStatistics.this_month || 0}
                                    </h1>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end text-[12px] font-[500]">
                                <div className="w-[81px] h-[26px] bg-[#FF888880] rounded-[5px] flex flex-row justify-center items-center">
                                    <img src={upArrow} className="size-[19px] rotate-180" alt="down" />
                                    <h1>0%</h1>
                                </div>
                                <h1 className="text-[#7B7B7A]">from last month</h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bookings Table Section */}
                <div className="w-full max-w-full overflow-hidden">
                    <div
                        className="w-full max-w-full h-auto bg-[#FFFFFF] rounded-[10px] py-12 px-10 sm:px-16"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-col gap-4 w-full">
                            <div className="flex md:flex-row flex-col justify-between">
                                <h1 className="text-[24px] font-[700]">
                                    All Bookings
                                </h1>
                                <div className="flex md:flex-row flex-col gap-3 mt-5 lg:mt-0">
                                    <div className="xl:w-[253px] xl:h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
                                        <SearchIcon className="size-[16px]" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                                            placeholder="Search booking code, customer, service..."
                                        />
                                    </div>
                                    <button onClick={() => setShowFilters(!showFilters)} className="w-full lg:w-auto xl:w-[115px] xl:h-[35px] text-gray-700 rounded-[6px] flex flex-row items-center justify-center gap-2 py-2 px-4 hover:bg-[#0955AC] hover:text-white transition font-[500] text-[14px] bg-white border border-gray-300">
                                        <FilterIcon className="size-[14px]" />
                                        <span>Filter</span>
                                    </button>
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowExportMenu(!showExportMenu)} 
                                            className="w-full lg:w-auto xl:w-[115px] xl:h-[35px] text-gray-700 rounded-[6px] flex flex-row items-center justify-center gap-2 py-2 px-4 hover:bg-[#0955AC] hover:text-white transition font-[500] text-[14px] bg-white border border-gray-300"
                                        >
                                            <Download size={14} />
                                            <span>Export</span>
                                            <DropdownIcon size={12} />
                                        </button>
                                        {showExportMenu && (
                                            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-[6px] shadow-lg z-50">
                                                <button
                                                    onClick={exportToCSV}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 font-[500] text-[14px] border-b border-gray-200"
                                                >
                                                    Export to CSV
                                                </button>
                                                <button
                                                    onClick={exportToPDF}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 font-[500] text-[14px] border-b border-gray-200"
                                                >
                                                    Export to PDF
                                                </button>
                                                <button
                                                    onClick={exportToXLSX}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 font-[500] text-[14px]"
                                                >
                                                    Export to XLSX
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Filter Panel */}
                            {showFilters && (
                                <div className="border border-gray-300 rounded-[8px] p-4 bg-gray-50 w-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-[600] text-[16px]">Filters</h3>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleResetFilters}
                                                className="px-2 py-2 text-[14px] text-gray-700 border border-gray-300 rounded-[6px] hover:bg-blue-700 hover:text-white transition font-[500]"
                                            >
                                                Reset Filters
                                            </button>
                                            <button
                                                onClick={() => setShowFilters(false)}
                                                className="text-gray-500 hover:text-blue-700 text-[24px] font-bold"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[12px] font-[600] text-gray-700">Search</label>
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Booking code, customer..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-[6px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[12px] font-[600] text-gray-700">Type</label>
                                            <select
                                                value={typeFilter}
                                                onChange={(e) => setTypeFilter(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-[6px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                            >
                                                <option value="All">All</option>
                                                <option value="vehicle">Vehicle</option>
                                                <option value="flight">Flight</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[12px] font-[600] text-gray-700">Status</label>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-[6px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                            >
                                                <option value="All">All</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Pending">Pending</option>
                                                <option value="Paid">Paid</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[12px] font-[600] text-gray-700">From Date</label>
                                            <input
                                                type="date"
                                                value={dateFromFilter}
                                                onChange={(e) => setDateFromFilter(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-[6px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[12px] font-[600] text-gray-700">To Date</label>
                                            <input
                                                type="date"
                                                value={dateToFilter}
                                                onChange={(e) => setDateToFilter(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-[6px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bookings Table */}
                        <div className="overflow-x-auto rounded-[8px] border border-gray-200">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-8 py-4 text-left text-[12px] font-[600] text-gray-700 uppercase">Booking Code</th>
                                        <th className="px-8 py-4 text-left text-[12px] font-[600] text-gray-700 uppercase">Type</th>
                                        <th className="px-8 py-4 text-left text-[12px] font-[600] text-gray-700 uppercase">Customer</th>
                                        <th className="px-8 py-4 text-left text-[12px] font-[600] text-gray-700 uppercase">Service</th>
                                        <th className="px-8 py-4 text-left text-[12px] font-[600] text-gray-700 uppercase">Amount</th>
                                        <th className="px-8 py-4 text-left text-[12px] font-[600] text-gray-700 uppercase">Status</th>
                                        <th className="px-8 py-4 text-left text-[12px] font-[600] text-gray-700 uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredBookings.length > 0 ? (
                                        filteredBookings.map((booking, idx) => {
                                            const statusStyle = getStatusStyle(booking.status);
                                            return (
                                                <tr key={idx} className="hover:bg-gray-50 transition">
                                                    <td className="px-8 py-5 text-[14px] font-[500] text-gray-900">
                                                        {booking.booking_code || booking.id}
                                                    </td>
                                                    <td className="px-8 py-5 text-[14px] text-gray-600 capitalize">
                                                        <span className="flex items-center gap-2">
                                                            {booking.booking_type === 'vehicle' ? <Car size={16} /> : <Plane size={16} />}
                                                            {booking.booking_type}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-[14px] text-gray-600">{booking.customer_name || 'N/A'}</td>
                                                    <td className="px-8 py-5 text-[14px] text-gray-600">{booking.service_name}</td>
                                                    <td className="px-8 py-5 text-[14px] font-[500] text-gray-900">
                                                        Rs. {(booking.total_amount || 0).toLocaleString()}
                                                    </td>
                                                    <td className="px-8 py-5 text-[12px]">
                                                        <span 
                                                            className="px-3 py-1 rounded-[5px] font-[500]"
                                                            style={{
                                                                backgroundColor: statusStyle.bg,
                                                                color: statusStyle.text,
                                                                border: `1px solid ${statusStyle.border}`
                                                            }}
                                                        >
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-[14px] text-gray-600">{booking.booking_date}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-8 py-14 text-center text-gray-500 text-[14px]">
                                                No bookings found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Info */}
                        <div className="mt-6 flex items-center justify-between text-[14px]">
                            <p className="text-gray-600">
                                Showing {filteredBookings.length} of {displayBookings.length} bookings
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorAllBookings;