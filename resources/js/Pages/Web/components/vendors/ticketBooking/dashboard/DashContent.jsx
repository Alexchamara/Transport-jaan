import React, { useState, useRef, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import { Download, ChevronDown as DropdownIcon } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";
import logOutLogo from "../../../../assets/vendors/dashboard/logOutLogo.svg"; // Add this import
import { ChevronDown } from "lucide-react";
import dollarIcon from "../../../../assets/vendors/dashboard/icons/dollarIcon.svg";
import carIcon from "../../../../assets/vendors/dashboard/icons/carIcon.svg";
import icon from "../../../../assets/vendors/dashboard/icons/icon.svg";
import icon2 from "../../../../assets/vendors/dashboard/icons/icon2.svg";
import bookingIcon from "../../../../assets/vendors/dashboard/icons/bookingIcon.svg";
import wheelIcon from "../../../../assets/vendors/dashboard/icons/wheelIcon.svg";
import upArrow from "../../../../assets/vendors/dashboard/icons/upArrow.svg";
import BookingOverviewBarChart from "./BookingOverviewBarChart";
import EarningSummaryChart from "./EarningSummaryChart";
import RealStatusPieChart from "./RealStatusPieChart";
import CarBookingTable from "./CarBookingTable";
import ServiceNavBar from "../../../../../../Components/vendors/ServiceNavBar";

import UserDropdown from "../../UserDropdown";

import {
    Plane,
    Ticket,
    TicketCheck,
    DollarSign,
    Search as SearchIcon,
    Settings as SettingsIcon,
    Bell as BellIcon,
    Calendar as CalendarIcon,
    Clock as ClockIcon,
    Filter as FilterIcon,
    ArrowUp,
    ArrowDown,
} from "lucide-react";

const getTransportIcon = (name, size = 18) => {
    return <Plane size={size} />;
};

const transportTypes = [
    { name: "Economy", percent: 45 },
    { name: "Business", percent: 35 },
    { name: "First Class", percent: 20 },
    { name: "Economy", percent: 55 },
    { name: "Business", percent: 65 },
    { name: "First Class", percent: 40 },
];

const DashContent = () => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isVerified = user?.status === 'verified' || user?.status === 'Verified';
    const activeService = 'Ticket Booking';

    const [isMobile, setIsMobile] = useState(true);
    const [showExportMenu, setShowExportMenu] = useState(false);
    
    // Filter state for Flight Bookings
    const [showFlightFilters, setShowFlightFilters] = useState(false);
    const [flightSearchQuery, setFlightSearchQuery] = useState("");
    const [flightStatusFilter, setFlightStatusFilter] = useState("All");
    const [flightPaymentFilter, setFlightPaymentFilter] = useState("All");
    const [flightDateFromFilter, setFlightDateFromFilter] = useState("");
    const [flightDateToFilter, setFlightDateToFilter] = useState("");

      const services = [
        { name: 'All Bookings', route: route('vendorAllBookings') },
        { name: 'Vehicle Rental', route: route('vendors.dashboard') },
        { name: 'Ticket Booking', route: route('ticketBooking.dashboard') },
        { name: 'Courier Service', route: route('courierService.dashboard') },
        { name: 'Warehousing', route: route('vendors.warehouse.dashboard') },
        { name: 'Freight', route: route('freight.dashboard') },
        { name: 'Multimodal', route: route('multiModelHomepage.home') }
    ];

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640); // sm breakpoint
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Export flight bookings to CSV
    const exportToCSV = () => {
        try {
            const headers = ["Booking ID", "Booking Date", "Passenger", "Flight Route", "Cabin/Duration", "Start Date", "End Date", "Price", "Payment Status", "Status"];
            const data = filteredFlightBookings.map(booking => [
                booking.id,
                booking.date,
                booking.customer,
                booking.transport,
                booking.details + " / " + booking.duration,
                booking.startDate,
                booking.endDate,
                booking.price,
                booking.paymentStatus,
                booking.status
            ]);

            const csvContent = [
                headers.join(","),
                ...data.map(row => row.map(cell => `"${cell}"`).join(","))
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `flight-bookings-${new Date().toISOString().slice(0, 10)}.csv`);
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

    // Export flight bookings to PDF
    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            const data = filteredFlightBookings.map(booking => [
                booking.id,
                booking.date,
                booking.customer,
                booking.transport,
                booking.details,
                booking.duration,
                booking.price,
                booking.paymentStatus,
                booking.status
            ]);

            const headers = [["Booking ID", "Date", "Passenger", "Flight Route", "Cabin", "Duration", "Price", "Payment", "Status"]];
            
            doc.setFontSize(16);
            doc.text("Flight Bookings Report", 14, 10);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 18);

            autoTable(doc, {
                head: headers,
                body: data,
                startY: 25,
                margin: { top: 20, right: 10, bottom: 10, left: 10 },
                headStyles: { fillColor: [9, 85, 172], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [230, 240, 250] },
                columnStyles: { 0: { halign: 'center' }, 5: { halign: 'center' } },
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

            doc.save(`flight-bookings-${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            console.error("Error exporting to PDF:", error);
            alert("Error exporting to PDF. Please try again.");
        }
        setShowExportMenu(false);
    };

    // Export flight bookings to XLSX
    const exportToXLSX = () => {
        try {
            const data = [
                ["Booking ID", "Booking Date", "Passenger", "Flight Route", "Cabin/Duration", "Start Date", "End Date", "Price", "Payment Status", "Status"]
            ];
            
            filteredFlightBookings.forEach(booking => {
                data.push([
                    booking.id,
                    booking.date,
                    booking.customer,
                    booking.transport,
                    booking.details + " / " + booking.duration,
                    booking.startDate,
                    booking.endDate,
                    booking.price,
                    booking.paymentStatus,
                    booking.status
                ]);
            });

            const worksheet = XLSX.utils.aoa_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Flight Bookings");
            
            // Auto-size columns
            const colWidths = [
                { wch: 15 }, // Booking ID
                { wch: 15 }, // Booking Date
                { wch: 18 }, // Passenger
                { wch: 20 }, // Flight Route
                { wch: 22 }, // Cabin/Duration
                { wch: 15 }, // Start Date
                { wch: 15 }, // End Date
                { wch: 12 }, // Price
                { wch: 15 }, // Payment Status
                { wch: 12 }  // Status
            ];
            worksheet['!cols'] = colWidths;
            
            XLSX.writeFile(workbook, `flight-bookings-${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (error) {
            console.error("Error exporting to XLSX:", error);
            alert("Error exporting to XLSX. Please try again.");
        }
        setShowExportMenu(false);
    };

    // Reset flight filters
    const handleResetFlightFilters = () => {
        setFlightSearchQuery("");
        setFlightStatusFilter("All");
        setFlightPaymentFilter("All");
        setFlightDateFromFilter("");
        setFlightDateToFilter("");
    };

    // Filtered flight bookings data
    const flightBookingsData = [
        {
            id: "BKG-1001",
            date: "Aug 28, 2025",
            customer: "Alice Johnson",
            transport: "UL 215 (CMB → DXB)",
            details: "Economy Class",
            duration: "5h 10m",
            startDate: "Aug 30, 2025",
            endDate: "Aug 30, 2025",
            price: "$350",
            paymentStatus: "Paid",
            paymentColor: "#3B8F314D",
            paymentBg: "#ACE19957",
            status: "Confirmed",
            statusBg: "#D8E4F2",
            statusBorder: "#0000004D",
            statusText: "#000000",
        },
        {
            id: "BKG-1002",
            date: "Sep 01, 2025",
            customer: "Bob Smith",
            transport: "UL 123 (CMB → SIN)",
            details: "Business Class",
            duration: "3h 35m",
            startDate: "Sep 03, 2025",
            endDate: "Sep 03, 2025",
            price: "$520",
            paymentStatus: "Pending",
            paymentColor: "#FF6060",
            paymentBg: "#FF60608C",
            status: "Confirmed",
            statusBg: "#D8E4F2",
            statusBorder: "#0000004D",
            statusText: "#000000",
        },
        {
            id: "BKG-1003",
            date: "Sep 05, 2025",
            customer: "Clara Lee",
            transport: "SQ 469 (CMB → SIN)",
            details: "Economy Flexi",
            duration: "3h 45m",
            startDate: "Sep 07, 2025",
            endDate: "Sep 07, 2025",
            price: "$410",
            paymentStatus: "Paid",
            paymentColor: "#3B8F314D",
            paymentBg: "#ACE19957",
            status: "Completed",
            statusBg: "transparent",
            statusBorder: "#D8E4F2",
            statusText: "#3B82F6",
        },
        {
            id: "BKG-1004",
            date: "Sep 10, 2025",
            customer: "David Kim",
            transport: "QR 669 (CMB → DOH)",
            details: "Business Class",
            duration: "5h 15m",
            startDate: "Sep 12, 2025",
            endDate: "Sep 12, 2025",
            price: "$780",
            paymentStatus: "Paid",
            paymentColor: "#3B8F314D",
            paymentBg: "#ACE19957",
            status: "Confirmed",
            statusBg: "#D8E4F2",
            statusBorder: "#0000004D",
            statusText: "#000000",
        },
        {
            id: "BKG-1005",
            date: "Sep 15, 2025",
            customer: "Eva Green",
            transport: "UL 403 (CMB → BKK)",
            details: "Premium Economy",
            duration: "3h 20m",
            startDate: "Sep 17, 2025",
            endDate: "Sep 17, 2025",
            price: "$460",
            paymentStatus: "Paid",
            paymentColor: "#3B8F314D",
            paymentBg: "#ACE19957",
            status: "Cancelled",
            statusBg: "#F87171",
            statusBorder: "#B91C1C",
            statusText: "#FFFFFF",
        },
    ];

    // Apply filters to flight bookings
    const filteredFlightBookings = flightBookingsData.filter((booking) => {
        // Search filter
        const matchesSearch = !flightSearchQuery || 
            booking.id?.toLowerCase().includes(flightSearchQuery.toLowerCase()) ||
            booking.customer?.toLowerCase().includes(flightSearchQuery.toLowerCase()) ||
            booking.transport?.toLowerCase().includes(flightSearchQuery.toLowerCase());
        
        // Status filter
        const matchesStatus = flightStatusFilter === "All" || booking.status?.toLowerCase() === flightStatusFilter.toLowerCase();
        
        // Payment filter
        const matchesPayment = flightPaymentFilter === "All" || booking.paymentStatus?.toLowerCase() === flightPaymentFilter.toLowerCase();
        
        // Date filters
        const bookingDate = new Date(booking.date);
        const matchesFromDate = !flightDateFromFilter || bookingDate >= new Date(flightDateFromFilter);
        const matchesToDate = !flightDateToFilter || bookingDate <= new Date(flightDateToFilter);
        
        return matchesSearch && matchesStatus && matchesPayment && matchesFromDate && matchesToDate;
    });

    return (
        <>
        <div className="sticky top-0 z-30">
            <ServiceNavBar 
                services={services}
                isVerified={isVerified}
                activeService={activeService}
                settingsRoute={route("settingsPage")}
            />
        </div>
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 xl:pr-8 xl:pl-6 pt-6 pb-12">
            {/* Header section */}
            <div className="flex xl:flex-row flex-col gap-5 justify-between items-center mb-6">
                <h1 className="figtree text-[35px] sm:text-[28px] font-[700] text-center md:text-left">
                    Flight Booking Dashboard
                </h1>
            </div>
            {/* end of header section */}

            {/* === REST OF THE DASHBOARD (UNCHANGED) === */}
            <div className="flex flex-col gap-5">
                {/* Top Section: Cards + Seat Availability */}
                <div className="flex flex-col xl:flex-row gap-5 w-full">
                    {/* Left - Cards */}
                    <div className="flex flex-col gap-10 w-full xl:w-1/2">
                        {/* mini 4 cards */}
                        <div className="flex flex-col gap-5">
                            <div className="flex xl:flex-row flex-col gap-5 justify-between w-full">
                                {/* card 1 */}
                                <div
                                    className="w-full xl:min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-5 justify-center items-center">
                                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                            <img src={dollarIcon} />
                                        </div>
                                        <div>
                                            <h1 className="text-[14px] font-[500] text-[#7B7B7A]">
                                                Total Revenue
                                            </h1>
                                            <h1 className="text-[20px] font-[700]">
                                                $8,450
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end text-[12px] font-[500]">
                                        <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                            <img
                                                src={upArrow}
                                                className="size-[19px]"
                                            />
                                            <h1 className="">+2.86%</h1>
                                        </div>
                                        <h1 className="text-[#7B7B7A]">
                                            from last week
                                        </h1>
                                    </div>
                                </div>
                                {/* end of card 1 */}

                                {/* card 2 */}
                                <div
                                    className="w-full xl:min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-5 justify-center items-center">
                                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                            <img src={bookingIcon} />
                                        </div>
                                        <div>
                                            <h1 className="text-[14px] font-[500] text-[#7B7B7A]">
                                                New Bookings
                                            </h1>
                                            <h1 className="text-[20px] font-[700]">
                                                350
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end text-[12px] font-[500]">
                                        <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                            <img
                                                src={upArrow}
                                                className="size-[19px]"
                                            />
                                            <h1 className="">+1.73%</h1>
                                        </div>
                                        <h1 className="text-[#7B7B7A]">
                                            from last week
                                        </h1>
                                    </div>
                                </div>
                                {/* end of card 2 */}
                            </div>
                            <div className="flex xl:flex-row flex-col gap-5 w-full">
                                {/* card 3 */}
                                <div
                                    className="w-full xl:min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-5 justify-center items-center">
                                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                            <img src={wheelIcon} />
                                        </div>
                                        <div>
                                            <h1 className="text-[14px] font-[500] text-[#7B7B7A]">
                                                Rented Cars
                                            </h1>
                                            <h1 className="text-[20px] font-[700]">
                                                24 Units
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end text-[12px] font-[500]">
                                        <div className="w-[81px] h-[26px] bg-[#FF888880] rounded-[5px] flex flex-row justify-center items-center">
                                            <img
                                                src={upArrow}
                                                className="size-[19px] rotate-180"
                                            />
                                            <h1 className="">+2.86%</h1>
                                        </div>
                                        <h1 className="text-[#7B7B7A]">
                                            from last week
                                        </h1>
                                    </div>
                                </div>
                                {/* end of card 3 */}
                                {/* card 4 */}
                                <div
                                    className="w-full xl:min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-5 justify-center items-center">
                                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                            <img src={carIcon} />
                                        </div>
                                        <div>
                                            <h1 className="text-[14px] font-[500] text-[#7B7B7A]">
                                                Total Revenue
                                            </h1>
                                            <h1 className="text-[20px] font-[700]">
                                                89 Units
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end text-[12px] font-[500]">
                                        <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                            <img
                                                src={upArrow}
                                                className="size-[19px]"
                                            />
                                            <h1 className="">+2.86%</h1>
                                        </div>
                                        <h1 className="text-[#7B7B7A]">
                                            from last week
                                        </h1>
                                    </div>
                                </div>
                                {/* end of card 4 */}
                            </div>
                        </div>
                    </div>

                    {/* Right - Seat Availability */}
                    <div className="flex flex-col w-full xl:w-1/2">
                        <div
                            className="w-full xl:h-[206px] bg-[#D8E4F2] flex flex-col px-5 py-5 justify-center items-center rounded-[10px]"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <h1 className="text-[24px] font-[700] mb-3">
                                Seat Availability
                            </h1>

                            <div className="flex flex-col gap-3">
                                <div className="w-full xl:max-w-[283px] xl:h-[35px] flex flex-row justify-center items-center gap-2 rounded-[6px] px-3 py-2 bg-[#FFFFFF] placeholder:text-[#7B7B7ACC] placeholder:text-[14px] placeholder:font-[500]">
                                    <Plane size={20} />
                                    <input
                                        type="text"
                                        className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none"
                                        placeholder="Flight"
                                    />
                                    <ChevronDown />
                                </div>

                                <div className="flex flex-row gap-3">
                                    <div className="w-full xl:max-w-[137px] xl:h-[35px] bg-[#FFFFFF] rounded-[6px] flex flex-row justify-center items-center gap-2 py-2 px-3">
                                        <CalendarIcon size={20} />
                                        <input
                                            type="text"
                                            className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none"
                                            placeholder="Date"
                                        />
                                    </div>
                                    <div className="w-full xl:max-w-[137px] xl:h-[35px] bg-[#FFFFFF] rounded-[6px]">
                                        <div className="w-full xl:h-[35px] bg-[#FFFFFF] rounded-[6px] flex flex-row justify-center gap-2 items-center py-2 px-3">
                                            <ClockIcon size={16} />
                                            <input
                                                type="text"
                                                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none"
                                                placeholder="Time"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full xl:max-w-[283px] xl:h-[40px] bg-[#0955AC] rounded-[6px] flex justify-center items-center text-[16px] font-[700] text-[#FFFFFF] cursor-pointer py-2 px-4">
                                    Check Availability
                                </button>
                            </div>
                        </div>
                        {/* <div
                            className="xl:w-[339px] w-full xl:min-h-[427px] bg-[#FFFFFF] rounded-[10px] py-5 px-5"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-col xl:flex-row items-center justify-between w-full">
                                <h1 className="text-[24px] font-[700]">
                                    Flight Status
                                </h1>
                                <div className="xl:w-[120px] xl:h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-3 p-2">
                                    <h1 className="text-[#00000080] font-[600] text-[14px]">
                                        This Week
                                    </h1>
                                    <ChevronDown />
                                </div>
                            </div>
                            {isMobile ? (
                                <div className="flex flex-col gap-2 mt-4">
                                    {[
                                        {
                                            name: "Hired",
                                            value: 46,
                                            color: "#3DD0FF",
                                        },
                                        {
                                            name: "Pending",
                                            value: 27,
                                            color: "#0955AC",
                                        },
                                        {
                                            name: "Cancelled",
                                            value: 14,
                                            color: "#C4C4C4",
                                        },
                                    ].map((item, index) => {
                                        const total = 46 + 27 + 14;
                                        const percent = Math.round(
                                            (item.value / total) * 100
                                        );
                                        return (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-md"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="w-4 h-4 rounded"
                                                        style={{
                                                            backgroundColor:
                                                                item.color,
                                                        }}
                                                    ></span>
                                                    <span className="font-medium text-gray-700">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <span className="font-bold text-gray-800">
                                                    {percent}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <RealStatusPieChart />
                            )}
                        </div> */}

                        {/* Reminder section  */}
                        {/* <div
                            className="xl:w-[339px] w-full xl:min-h-[335px] h-full bg-[#FFFFFF] rounded-[10px] py-5 px-5"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-row items-center justify-between w-full">
                                <h1 className="text-[24px] font-[700]">
                                    Reminders
                                </h1>
                                <div className="w-[39px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex justify-center items-center gap-3 text-[#00000080] font-[600] text-[30px]">
                                    +
                                </div>
                            </div>
                            <div className="py-5 flex flex-col justify-center items-center gap-2">
                                <div className="w-full xl:max-w-[286px] xl:h-[68px] bg-[#D8E4F2] rounded-[10px] flex flex-row justify-center items-center gap-5 px-3 py-2">
                                    <div className="size-[24px] border-[1px] border-[#FF0000] rounded-full bg-[#FFFFFF] flex justify-center items-center text-[18px] font-[600] text-[#FF0000]">
                                        !
                                    </div>
                                    <h1 className="text-[14px] font-[500] flex-1">
                                        Confirm airline allotments for next
                                        week.
                                    </h1>
                                </div>
                                <div className="w-full xl:max-w-[286px] xl:h-[68px] bg-[#D8E4F2] rounded-[10px] flex flex-row justify-center items-center gap-5 px-3 py-2">
                                    <div className="size-[24px] border-[1px] border-[#FF0000] rounded-full bg-[#FFFFFF] flex justify-center items-center text-[18px] font-[600] text-[#FF0000]">
                                        !
                                    </div>
                                    <h1 className="text-[14px] font-[500] flex-1">
                                        Update fare rules for partner airlines.
                                    </h1>
                                </div>
                                <div className="w-full xl:max-w-[286px] xl:h-[68px] bg-[#D8E4F2] rounded-[10px] flex flex-row justify-center items-center gap-5 px-3 py-2">
                                    <div className="size-[24px] border-[1px] border-[#FF0000] rounded-full bg-[#FFFFFF] flex justify-center items-center text-[18px] font-[600] text-[#FF0000]">
                                        !
                                    </div>
                                    <h1 className="text-[14px] font-[500] flex-1">
                                        Reconcile August flight invoices.
                                    </h1>
                                </div>
                            </div>
                        </div> */}
                        {/* end */}
                    </div>
                </div>

                {/* Bottom Section: Flight Bookings, Overview & Earnings */}
                <div className="flex flex-col gap-10 w-full">
                    {/* Flight Bookings */}
                    <div className="w-full max-w-full overflow-hidden">
                        <div
                            className="w-full max-w-full h-auto bg-[#FFFFFF] rounded-[10px] py-10 px-5 sm:px-10"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-col gap-4 w-full">
                                <div className="flex md:flex-row flex-col justify-between">
                                    <h1 className="text-[24px] font-[700]">
                                        Flight Bookings
                                    </h1>
                                    <div className="flex md:flex-row flex-col gap-3 mt-5 lg:mt-0">
                                        <div className="xl:w-[253px] xl:h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
                                            <SearchIcon className="size-[16px]" />
                                            <input
                                                type="text"
                                                value={flightSearchQuery}
                                                onChange={(e) => setFlightSearchQuery(e.target.value)}
                                                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                                                placeholder="Search passenger, flight no., route..."
                                            />
                                        </div>
                                        <button onClick={() => setShowFlightFilters(!showFlightFilters)} className="w-full lg:w-auto xl:w-[115px] xl:h-[35px] text-white-700 rounded-[6px] flex flex-row items-center justify-center gap-2 py-2 px-4 hover:bg-[#0955AC] transition font-[500] text-[14px]">
                                            <FilterIcon className="size-[14px]" />
                                            <span>Filter</span>
                                        </button>
                                        <div className="relative">
                                            <button 
                                                onClick={() => setShowExportMenu(!showExportMenu)} 
                                                className="w-full lg:w-auto xl:w-[115px] xl:h-[35px] text-white-700 rounded-[6px] flex flex-row items-center justify-center gap-2 py-2 px-4 hover:bg-[#0955AC] transition font-[500] text-[14px]"
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
                                {showFlightFilters && (
                                    <div className="border border-gray-300 rounded-[8px] p-4 bg-gray-50 w-full">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-[600] text-[16px]">Filters</h3>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleResetFlightFilters}
                                                    className="px-2 py-2 text-[14px] text-gray-700 border border-gray-300 rounded-[6px] hover:bg-blue-700 transition font-[500]"
                                                >
                                                    Reset Filters
                                                </button>
                                                <button
                                                    onClick={() => setShowFlightFilters(false)}
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
                                                    value={flightSearchQuery}
                                                    onChange={(e) => setFlightSearchQuery(e.target.value)}
                                                    placeholder="Passenger, flight no..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-[6px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[12px] font-[600] text-gray-700">Status</label>
                                                <select
                                                    value={flightStatusFilter}
                                                    onChange={(e) => setFlightStatusFilter(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-[6px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                                >
                                                    <option value="All">All</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Pending">Pending</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[12px] font-[600] text-gray-700">Payment</label>
                                                <select
                                                    value={flightPaymentFilter}
                                                    onChange={(e) => setFlightPaymentFilter(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-[6px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                                >
                                                    <option value="All">All</option>
                                                    <option value="Paid">Paid</option>
                                                    <option value="Pending">Pending</option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[12px] font-[600] text-gray-700">From Date</label>
                                                <input
                                                    type="date"
                                                    value={flightDateFromFilter}
                                                    onChange={(e) => setFlightDateFromFilter(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-[6px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[12px] font-[600] text-gray-700">To Date</label>
                                                <input
                                                    type="date"
                                                    value={flightDateToFilter}
                                                    onChange={(e) => setFlightDateToFilter(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-[6px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <CarBookingTable bookings={filteredFlightBookings} />
                        </div>
                    </div>

                    {/* Flight Booking Overview */}
                    <div className="overflow-x-auto w-full">
                        <div
                            className="w-full max-w-full mx-auto overflow-auto h-auto bg-[#FFFFFF] flex flex-col justify-center items-center rounded-[10px] py-8 px-3"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            {isMobile ? (
                                <div className="w-full">
                                    <div className="figtree text-[24px] font-[700] mb-4">
                                        Flight Booking Overview
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {[
                                            { name: "Jan", bookings: 450 },
                                            { name: "Feb", bookings: 670 },
                                            { name: "Mar", bookings: 540 },
                                            { name: "Apr", bookings: 900 },
                                            { name: "May", bookings: 800 },
                                            { name: "Jun", bookings: 200 },
                                            { name: "Jul", bookings: 340 },
                                            { name: "Aug", bookings: 859 },
                                            { name: "Sep", bookings: 670 },
                                            { name: "Oct", bookings: 570 },
                                            { name: "Nov", bookings: 400 },
                                            { name: "Dec", bookings: 900 },
                                        ].map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-md"
                                            >
                                                <span className="font-medium text-gray-700">
                                                    {item.name} 2025
                                                </span>
                                                <span className="font-bold text-blue-600">
                                                    {item.bookings} bookings
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <BookingOverviewBarChart />
                            )}
                        </div>
                    </div>

                    {/* Earnings Summary */}
                    <div className="overflow-x-auto w-full mx-auto">
                        <div
                            className="w-full max-w-full xl:h-[381px] bg-[#FFFFFF] flex flex-col justify-center items-center rounded-[10px] py-10 px-5 sm:px-10"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-col xl:flex-row items-center justify-between mb-12 w-full">
                                <h1 className="text-[24px] font-[700]">
                                    Earnings Summary
                                </h1>
                                <div className="xl:w-[132px] xl:h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-3 p-2">
                                    <h1 className="text-[#00000080] font-[600] text-[14px]">
                                        Last 8 months
                                    </h1>
                                    <ChevronDown />
                                </div>
                            </div>
                            {isMobile ? (
                                <div className="flex flex-col gap-2">
                                    {[
                                        { name: "Jan", value: 5000 },
                                        { name: "Feb", value: 7000 },
                                        { name: "Mar", value: 6000 },
                                        { name: "Apr", value: 23456 },
                                        { name: "May", value: 8000 },
                                        { name: "Jun", value: 4000 },
                                        { name: "Jul", value: 9000 },
                                        { name: "Aug", value: 12000 },
                                        { name: "Sep", value: 10000 },
                                        { name: "Oct", value: 9500 },
                                        { name: "Nov", value: 15000 },
                                        { name: "Dec", value: 21000 },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-md"
                                        >
                                            <span className="font-medium text-gray-700">
                                                {item.name} 2025
                                            </span>
                                            <span className="font-bold text-green-600">
                                                $
                                                {Number(
                                                    item.value
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EarningSummaryChart />
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-5 justify-between">
                    {/* <div
                        className="xl:w-[500px] w-full h-auto xl:h-[858px] bg-[#FFFFFF] rounded-[10px] px-5 sm:px-10 py-10 flex flex-col gap-5"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row justify-between items-center">
                            <h1 className="text-[24px] font-[700]">
                                Cabin classes
                            </h1>
                            <h1 className="text-[24px] font-[700]">...</h1>
                        </div>

                        {transportTypes.map((type, idx) => (
                            <div
                                key={idx}
                                className="w-full h-[107px] border-[1px] border-[#00000080] rounded-[9px] flex flex-row"
                            >
                                <div className="h-[107px] w-[80px] sm:w-[172px] flex items-center justify-center">
                                    {getTransportIcon(type.name, 36)}
                                </div>
                                <div className="flex flex-col justify-center gap-3 flex-1 px-5">
                                    <div className="flex flex-col md:flex-row justify-between items-center text-[15px] font-[500]">
                                        <h1 className="text-[#00000080] flex items-center gap-2">
                                            {type.name}
                                        </h1>
                                        <h1 className="pr-5">
                                            {type.percent}%
                                        </h1>
                                    </div>
                                    <div className="w-full h-[20px] rounded-[4px] bg-[#D8E4F2] relative overflow-hidden">
                                        <div
                                            className="h-full rounded-[4px] absolute top-0 left-0"
                                            style={{
                                                width: `${type.percent}%`,
                                                backgroundColor:
                                                    type.percent <= 20
                                                        ? "#F51D1D"
                                                        : "#0955AC",
                                                transition: "width 0.5s",
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div> */}
                    {/* <div
                        className="w-full h-auto xl:w-[553px] xl:h-[858px] bg-[#0F0F0F08] rounded-[10px] px-5 md:px-10 py-10"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row justify-between items-center">
                            <h1 className="text-[22px] font-[700]">
                                Recent Activities
                            </h1>
                            <h1 className="text-[22px] font-[700]">...</h1>
                        </div>
                        <h1 className="text-[18px] font-[600] text-[#0F0F0F80] py-3">
                            Today
                        </h1>

                        <div className="flex flex-row justify-center items-start gap-5 md:gap-10">
                            <div className="flex flex-col items-center py-5">
                                <div className="size-[60px] bg-[#FFFFFF] rounded-full flex justify-center items-center">
                                    <CalendarIcon />
                                </div>
                                <div className="w-[2px] h-[54px] bg-[#00000054]"></div>
                                <div className="size-[60px] bg-[#FFFFFF] rounded-full flex justify-center items-center">
                                    <Plane />
                                </div>
                            </div>
                            <div className="flex flex-col py-5 gap-10 md:text-[20px] text-[16px] font-[700]">
                                <div>
                                    <h1>
                                        Alice Johnson completed a flight booking
                                        (UL 215, CMB → DXB)
                                    </h1>
                                    <h1 className="font-[600] text-[#0F0F0F80]">
                                        10:45 AM
                                    </h1>
                                </div>
                                <div>
                                    <h1>
                                        Bob Smith's flight booking (UL 123, CMB
                                        → SIN) is pending payment
                                    </h1>
                                    <h1 className="font-[600] text-[#0F0F0F80]">
                                        15:45 PM
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
        </>
    );
};

export default DashContent;
