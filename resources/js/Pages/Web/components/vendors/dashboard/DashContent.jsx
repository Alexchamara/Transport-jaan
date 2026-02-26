import React, { useState, useEffect, useLayoutEffect } from "react";
import { Download, ChevronDown as DropdownIcon } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import dollarIcon from "../../../assets/vendors/dashboard/icons/dollarIcon.svg";
import carIcon from "../../../assets/vendors/dashboard/icons/carIcon.svg";
import bookingIcon from "../../../assets/vendors/dashboard/icons/bookingIcon.svg";
import wheelIcon from "../../../assets/vendors/dashboard/icons/wheelIcon.svg";
import upArrow from "../../../assets/vendors/dashboard/icons/upArrow.svg";
import miniDownArrow from "../../../assets/vendors/dashboard/icons/miniDownArrow.svg";
import BookingOverviewBarChart from "./BookingOverviewBarChart";
import EarningSummaryChart from "./EarningSummaryChart";
import RealStatusPieChart from "./RealStatusPieChart";
import CarBookingTable from "./CarBookingTable";
import RecentActivities from "./RecentActivities";

import car from "../../../assets/vendors/dashboard/icons/car.svg";
import date from "../../../assets/vendors/dashboard/icons/date.svg";
import clock from "../../../assets/vendors/dashboard/icons/clock.svg";

import filterIcon from "../../../assets/vendors/dashboard/icons/filterIcon.svg";
import miniSearchIcon from "../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";

import car1 from "../../../assets/vendors/dashboard/icons/car1.svg";
import car3 from "../../../assets/vendors/dashboard/icons/car3.svg";

import { Link } from "@inertiajs/react";
import UserDropdown from "../../../components/vendors/UserDropdown";

const DashContent = ({
    cards,
    bookingOverview,
    earningSummary,
    realStatus,
    carTypes,
    bookings,
    bookingsMeta,
    filters,
    vendorUser,
    recentActivities, // <— NEW (from controller)
    unreadNotifications = 0, // NEW
}) => {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

    // Filter state
    const [showFilters, setShowFilters] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
    const [dateFromFilter, setDateFromFilter] = useState("");
    const [dateToFilter, setDateToFilter] = useState("");

    useLayoutEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Export bookings to CSV
    const exportToCSV = () => {
        if (!bookings || bookings.length === 0) {
            alert("No bookings to export");
            return;
        }

        const headers = ["Booking Ref", "Customer", "Car", "Start Date", "End Date", "Status", "Payment Status", "Total"];
        const data = bookings.map(b => [
            b.bookingRef || "",
            b.customerName || "",
            b.carName || "",
            b.startDate || "",
            b.endDate || "",
            b.status || "",
            b.paymentStatus || "",
            b.totalPrice || ""
        ]);

        const csvContent = [
            headers.join(","),
            ...data.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `car-bookings-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
    };

    // Export bookings to PDF
    const exportToPDF = () => {
        if (!bookings || bookings.length === 0) {
            alert("No bookings to export");
            return;
        }

        const doc = new jsPDF();
        const data = bookings.map(b => [
            b.bookingRef || "",
            b.customerName || "",
            b.carName || "",
            b.startDate || "",
            b.endDate || "",
            b.status || "",
            b.paymentStatus || "",
            b.totalPrice || ""
        ]);

        const headers = [["Booking Ref", "Customer", "Car", "Start Date", "End Date", "Status", "Payment Status", "Total"]];

        doc.setFontSize(16);
        doc.text("Car Bookings Report", 14, 10);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 18);

        autoTable(doc, {
            head: headers,
            body: data,
            startY: 25,
            margin: { top: 20, right: 10, bottom: 10, left: 10 },
            headStyles: { fillColor: [9, 85, 172], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [230, 240, 250] },
            didDrawPage: (data) => {
                const pageCount = doc.internal.getPages().length;
                doc.setFontSize(9);
                doc.text(
                    `Page ${data.pageNumber} of ${pageCount}`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }
        });

        doc.save(`car-bookings-${new Date().toISOString().slice(0, 10)}.pdf`);
        setShowExportMenu(false);
    };

    // Export bookings to XLSX
    const exportToXLSX = () => {
        try {
            if (!bookings || bookings.length === 0) {
                alert("No bookings to export");
                return;
            }

            const data = [
                ["Booking Ref", "Customer", "Car", "Start Date", "End Date", "Status", "Payment Status", "Total"],
                ...bookings.map(b => [
                    b.bookingRef || "",
                    b.customerName || "",
                    b.carName || "",
                    b.startDate || "",
                    b.endDate || "",
                    b.status || "",
                    b.paymentStatus || "",
                    b.totalPrice || ""
                ])
            ];

            const worksheet = XLSX.utils.aoa_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Car Bookings");

            XLSX.writeFile(workbook, `car-bookings-${new Date().toISOString().slice(0, 10)}.xlsx`);
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
        setPaymentStatusFilter("All");
        setDateFromFilter("");
        setDateToFilter("");
    };

    // UserDropdown component handles its own open/close logic

    const computedCarTypes = (carTypes ?? []).map((t) => ({
        name: t.name ?? "Unknown",
        percent: Number(t.percent ?? 0),
        img: (t.name || "").toLowerCase().includes("suv") ? car3 : car1,
    }));

    const fmtMoney = (n) =>
        typeof n === "number"
            ? n.toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
              })
            : n;

    return (
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 xl:pr-8 xl:pl-6 pt-6 pb-12">
            {/* Header */}
            <div className="flex md:flex-row flex-col gap-5 justify-between xl:items-start items-center mb-6">
                <h1 className="figtree text-[24px] sm:text-[28px] md:text-[35px] font-[700] text-center">
                    Vehicle Rental Dashboard
                </h1>
            </div>

            <div className="flex flex-col gap-5 w-full">
                {/* Top Section: Cards + Car Availability */}
                <div className="flex flex-col xl:flex-row gap-5 w-full">
                    {/* Left - Cards */}
                    <div className="flex flex-col gap-10 w-full xl:w-1/2">
                        {/* Cards */}
                        <div className="flex flex-col gap-5">
                            <div className="flex xl:flex-row flex-col gap-5 justify-between w-full">
                                {/* Total Revenue */}
                                <div
                                    className="w-full xl:min-w-[300px] min-h-[91px] bg-white rounded-[8px] flex justify-between items-center gap-2 px-3 md:px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-2 md:gap-5 items-center min-w-0 flex-1">
                                        <div className="size-[40px] md:size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center shrink-0">
                                            <img
                                                src={dollarIcon}
                                                className="w-5 md:w-6"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h1 className="text-[12px] md:text-[14px] font-[500] text-[#7B7B7A]">
                                                Total Revenue
                                            </h1>
                                            <h1 className="text-[18px] md:text-[24px] font-[700] truncate">
                                                {fmtMoney(
                                                    cards?.totalRevenue ?? 0
                                                )}
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 md:gap-2 items-end text-[10px] md:text-[14px] font-[500] shrink-0">
                                        <div className="w-[60px] md:w-[81px] h-[22px] md:h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                            <img
                                                src={upArrow}
                                                className="size-[14px] md:size-[19px]"
                                            />
                                            <h1 className="text-[10px] md:text-sm">
                                                —
                                            </h1>
                                        </div>
                                        <h1 className="text-[10px] md:text-sm text-[#7B7B7A] hidden md:block">
                                            from last period
                                        </h1>
                                    </div>
                                </div>

                                {/* New Bookings */}
                                <div
                                    className="w-full xl:min-w-[300px] min-h-[91px] bg-white rounded-[8px] flex justify-between items-center gap-2 px-3 md:px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-2 md:gap-5 items-center min-w-0 flex-1">
                                        <div className="size-[40px] md:size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center shrink-0">
                                            <img
                                                src={bookingIcon}
                                                className="w-5 md:w-6"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h1 className="text-[12px] md:text-[14px] font-[500] text-[#7B7B7A]">
                                                New Bookings
                                            </h1>
                                            <h1 className="text-[18px] md:text-[24px] font-[700]">
                                                {cards?.newBookings ?? 0}
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 md:gap-2 items-end text-[10px] md:text-[14px] font-[500] shrink-0">
                                        <div className="w-[60px] md:w-[81px] h-[22px] md:h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                            <img
                                                src={upArrow}
                                                className="size-[14px] md:size-[19px]"
                                            />
                                            <h1 className="text-[10px] md:text-sm">
                                                —
                                            </h1>
                                        </div>
                                        <h1 className="text-[10px] md:text-sm text-[#7B7B7A] hidden md:block">
                                            from last week
                                        </h1>
                                    </div>
                                </div>
                            </div>

                            <div className="flex xl:flex-row flex-col gap-5 w-full">
                                {/* Rented Cars */}
                                <div
                                    className="w-full xl:min-w-[300px] min-h-[91px] bg-white rounded-[8px] flex justify-between items-center gap-2 px-3 md:px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-2 md:gap-5 items-center min-w-0 flex-1">
                                        <div className="size-[40px] md:size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center shrink-0">
                                            <img
                                                src={wheelIcon}
                                                className="w-5 md:w-6"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h1 className="text-[12px] md:text-[14px] font-[500] text-[#7B7B7A]">
                                                Rented Cars
                                            </h1>
                                            <h1 className="text-[18px] md:text-[24px] font-[700]">
                                                {cards?.rentedCars ?? 0} Units
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 md:gap-2 items-end text-[10px] md:text-[14px] font-[500] shrink-0">
                                        <div className="w-[60px] md:w-[81px] h-[22px] md:h-[26px] bg-[#FF888880] rounded-[5px] flex flex-row justify-center items-center">
                                            <img
                                                src={upArrow}
                                                className="size-[14px] md:size-[19px] rotate-180"
                                            />
                                            <h1 className="text-[10px] md:text-sm">
                                                —
                                            </h1>
                                        </div>
                                        <h1 className="text-[10px] md:text-sm text-[#7B7B7A] hidden md:block">
                                            from last week
                                        </h1>
                                    </div>
                                </div>

                                {/* Total Cars */}
                                <div
                                    className="w-full xl:min-w-[300px] md:max-w-none min-h-[91px] bg-white rounded-[8px] flex justify-between items-center gap-2 px-3 md:px-5 py-2"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <div className="flex flex-row gap-2 md:gap-5 items-center min-w-0 flex-1">
                                        <div className="size-[40px] md:size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center shrink-0">
                                            <img
                                                src={carIcon}
                                                className="w-5 md:w-6"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h1 className="text-[12px] md:text-[14px] font-[500] text-[#7B7B7A]">
                                                Total Cars
                                            </h1>
                                            <h1 className="text-[18px] md:text-[24px] font-[700]">
                                                {cards?.totalCars ?? 0} Units
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 md:gap-2 items-end text-[10px] md:text-[14px] font-[500] shrink-0">
                                        <div className="w-[60px] md:w-[81px] h-[22px] md:h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                            <img
                                                src={upArrow}
                                                className="size-[14px] md:size-[19px]"
                                            />
                                            <h1 className="text-[10px] md:text-sm">
                                                —
                                            </h1>
                                        </div>
                                        <h1 className="text-[10px] md:text-sm text-[#7B7B7A] hidden md:block">
                                            from last week
                                        </h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Car Availability */}
                    <div className="flex flex-col w-full xl:w-1/2">
                        <div
                            className="hidden xl:flex bg-[#D8E4F2] flex-col px-5 py-5 justify-center items-center rounded-[10px] w-full"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <h1 className="text-[20px] md:text-[24px] font-[700] mb-3">
                                Car Availability
                            </h1>
                            <div className="flex flex-col gap-3 w-full max-w-[283px] items-center">
                                <div className="w-full xl:w-[283px] xl:h-[35px] flex flex-row items-center gap-2 rounded-[6px] px-3 py-2 bg-white">
                                    <img src={car} className="size-[20px]" />
                                    <input
                                        className="w-full outline-none bg-transparent border-0 focus:ring-0"
                                        placeholder="Car Type"
                                    />
                                    <img src={miniDownArrow} />
                                </div>

                                <div className="flex flex-row gap-3 w-full">
                                    <div className="flex-1 xl:w-[137px] xl:h-[35px] bg-white rounded-[6px] flex flex-row items-center gap-2 py-2 px-3">
                                        <img
                                            src={date}
                                            className="size-[20px] shrink-0"
                                        />
                                        <input
                                            className="w-full outline-none bg-transparent border-0 focus:ring-0 text-sm"
                                            placeholder="Start date"
                                        />
                                    </div>
                                    <div className="flex-1 xl:w-[137px] h-[35px] bg-white rounded-[6px] flex flex-row items-center gap-2 py-2 px-3">
                                        <img
                                            src={clock}
                                            className="size-[16px] shrink-0"
                                        />
                                        <input
                                            className="w-full outline-none bg-transparent border-0 focus:ring-0 text-sm"
                                            placeholder="Start time"
                                        />
                                    </div>
                                </div>

                                <button className="w-full xl:w-[283px] xl:h-[40px] bg-[#0955AC] rounded-[6px] text-[14px] md:text-[16px] font-[700] text-white border-0 focus:ring-0 py-2">
                                    Check Availability
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Booking, Overview & Earning */}
                <div className="flex flex-col gap-10 w-full">
                        {/* Bookings table */}
                        <div
                            className="w-full max-w-full h-auto bg-white flex flex-col justify-center items-center rounded-[10px] py-6 md:py-15 px-3 md:px-10"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-col gap-4 w-full">
                                {/* Header and Buttons */}
                                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 w-full">
                                    <h1 className="text-[20px] md:text-[24px] font-[700]">
                                        Car Booking
                                    </h1>

                                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                        <div className="w-full sm:w-[253px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center py-2 px-4">
                                            <img
                                                src={miniSearchIcon}
                                                className="shrink-0"
                                            />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full outline-none bg-transparent placeholder:text-[#7B7B7ACC] border-0 focus:ring-0 text-sm"
                                                placeholder="Search client name, car, etc."
                                            />
                                        </div>

                                        <button onClick={() => setShowFilters(!showFilters)} 
                                            className="w-full lg:w-auto xl:w-[115px] xl:h-[35px] text-white-700 rounded-[6px] flex flex-row items-center justify-center gap-2 py-2 px-4 hover:bg-[#0955AC] transition font-[500] text-[14px]">
                                                    <img
                                                    src={filterIcon}
                                                    className="size-[14px] shrink-0 brightness-0 "
                                                />
                                            <span>Filter</span>
                                        </button>

                                        <div className="relative">
                                            <button 
                                                onClick={() => setShowExportMenu(!showExportMenu)} 
                                                className="w-full lg:w-auto xl:w-[115px] xl:h-[35px] text-white-700 rounded-[6px] flex flex-row items-center justify-center gap-2 py-2 px-4 hover:bg-[#0955AC] transition font-[500] text-[14px]">    
                                                <Download size={14} className="shrink-0" />
                                                <span>Export</span>
                                                <DropdownIcon size={12} />
                                            </button>
                                            {showExportMenu && (
                                                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-[6px] shadow-lg z-50">
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
                                                    className="px-2 py-2 text-[14px] text-gray-700 border border-gray-300 rounded-[6px] hover:bg-blue-700 transition font-[500]"
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
                                            {/* Search */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[12px] font-[600] text-gray-700">Search</label>
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Customer, vehicle, ref..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-[6px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                                />
                                            </div>

                                            {/* Status */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[12px] font-[600] text-gray-700">Status</label>
                                                <select
                                                    value={statusFilter}
                                                    onChange={(e) => setStatusFilter(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-[6px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                                >
                                                    <option value="All">All</option>
                                                    <option value="Pending">Pending</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Ongoing">Ongoing</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>

                                            {/* Payment */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[12px] font-[600] text-gray-700">Payment</label>
                                                <select
                                                    value={paymentStatusFilter}
                                                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-[6px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                                >
                                                    <option value="All">All</option>
                                                    <option value="Paid">Paid</option>
                                                    <option value="Pending">Pending</option>
                                                </select>
                                            </div>

                                            {/* From Date */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[12px] font-[600] text-gray-700">From Date</label>
                                                <input
                                                    type="date"
                                                    value={dateFromFilter}
                                                    onChange={(e) => setDateFromFilter(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-[6px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                                />
                                            </div>

                                            {/* To Date */}
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

                                        {/* Results count */}
                                        <div className="mt-3 text-[12px] text-gray-500">
                                            Showing {bookings?.length || 0} of {bookings?.length || 0} bookings
                                        </div>
                                    </div>
                                )}
                            </div>

                            <CarBookingTable
                                bookings={bookings ?? []}
                                bookingsMeta={bookingsMeta ?? {}}
                            />
                        </div>

                        {/* Booking Overview */}
                        <div
                            className="w-full max-w-full h-auto bg-[#FFFFFF] flex flex-col justify-center items-center rounded-[10px] py-10 px-10"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 md:mb-16 w-full gap-4">
                                <h1 className="text-[20px] md:text-[24px] font-[700]">
                                    Booking Overview
                                </h1>
                                <div className="w-[113px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-3">
                                    <h1 className="text-[#00000080] font-[600] text-[14px]">
                                        {filters?.bo_period === "month"
                                            ? "This Month"
                                            : "This Year"}
                                    </h1>
                                    <img src={miniDownArrow} />
                                </div>
                            </div>
                            <div className="w-full min-w-0 flex flex-col justify-center items-center">
                                {isMobile ? (
                                    <div className="flex flex-col gap-2">
                                        {(bookingOverview ?? []).map((item, index) => (
                                            <div key={index} className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-md">
                                                <span className="font-medium text-gray-700">{item.name}</span>
                                                <span className="font-bold text-blue-600">{item.bookings} bookings</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <BookingOverviewBarChart
                                        data={bookingOverview ?? []}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Earning Summary */}
                        <div
                            className="w-full max-w-full min-h-[381px] bg-[#FFFFFF] rounded-[10px] py-10 px-10"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 md:mb-12 w-full gap-4">
                                <h1 className="text-[20px] md:text-[24px] font-[700]">
                                    Earning Summary
                                </h1>
                                <div className="w-[132px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-3">
                                    <h1 className="text-[#00000080] font-[600] text-[14px]">
                                        {filters?.es_period === "month"
                                            ? "This Month"
                                            : "This Year"}
                                    </h1>
                                    <img src={miniDownArrow} />
                                </div>
                            </div>
                            <div className="w-full min-w-0">
                                {isMobile ? (
                                    <div className="flex flex-col gap-2">
                                        {(earningSummary ?? []).map((item, index) => (
                                            <div key={index} className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-md">
                                                <span className="font-medium text-gray-700">{item.name}</span>
                                                <span className="font-bold text-green-600">${Number(item.value || 0).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EarningSummaryChart
                                        data={earningSummary ?? []}
                                    />
                                )}
                            </div>
                        </div>
                        </div>
                    </div>


                        {/* <div 
                            className="w-full max-w-[320px] md:max-w-none min-h-[427px] bg-white rounded-[10px] py-5 px-3 md:px-10 overflow-x-auto"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                                <h1 className="text-[20px] md:text-[24px] font-[700]">
                                    Real Status
                                </h1>
                                <div className="w-[113px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-3">
                                    <h1 className="text-[#00000080] font-[600] text-[14px]">
                                        {filters?.rs_period === "month"
                                            ? "This Month"
                                            : "This Week"}
                                    </h1>
                                    <img src={miniDownArrow} />
                                </div>
                            </div>
                            <div className="w-full min-w-0">
                                {isMobile ? (
                                    <div className="flex flex-col gap-2 mt-4">
                                        {(realStatus ?? []).map((item, index) => (
                                            <div key={index} className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-md">
                                                <span className="font-medium text-gray-700">{item.name}</span>
                                                <span className="font-bold text-purple-600">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <RealStatusPieChart data={realStatus ?? []} />
                                )}
                            </div>
                        </div>  */}

           
                        {/* <div
                            className="hidden xl:block w-full min-w-[320px] xl:min-h-[400px] bg-white rounded-[10px] py-5 px-3 md:px-10"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex flex-row items-center justify-between w-full">
                                <h1 className="text-[20px] md:text-[24px] font-[700]">
                                    Reminders
                                </h1>
                                <button className="w-[39px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex justify-center items-center text-[#00000080] font-[600] text-[30px] border-0 focus:ring-0">
                                    +
                                </button>
                            </div>
                        </div> */}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full">
                    {/* Car Types - Full width on mobile */}
                    {/* <div className="w-full">
                        <div
                            className="w-full min-h-full bg-white rounded-[10px] py-6 px-4 md:px-8"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-[20px] md:text-[24px] font-bold">
                                    Car Types
                                </h2>
                                <span className="text-2xl font-bold text-gray-400">
                                    ...
                                </span>
                            </div>
                            <div className="space-y-4">
                                {computedCarTypes.length > 0 ? (
                                    computedCarTypes.slice(0, 4).map(
                                        (
                                            type,
                                            idx // Show only top 4
                                        ) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 border border-gray-300 rounded-lg overflow-hidden"
                                            >
                                                <img
                                                    src={type.img}
                                                    alt={type.name}
                                                    className="w-20 md:w-24 h-16 md:h-20 object-cover"
                                                />
                                                <div className="flex-1 pr-3">
                                                    <div className="flex justify-between text-sm font-medium mb-1">
                                                        <span className="text-gray-600 truncate">
                                                            {type.name}
                                                        </span>
                                                        <span>
                                                            {type.percent}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full transition-all duration-700"
                                                            style={{
                                                                width: `${type.percent}%`,
                                                                backgroundColor:
                                                                    type.percent <=
                                                                    30
                                                                        ? "#ef4444"
                                                                        : "#0955AC",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <p className="text-center text-gray-500 py-8">
                                        No car type data yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    {/* </div> */}

                    {/* Recent Activities - Compact & Reduced Size */}
                    {/* <div className="w-full mx-auto">
                        {" "}
                        <div
                            className="w-full bg-white rounded-[10px] py-5 px-4 md:px-6 h-96 md:h-[380px] overflow-y-auto"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-[20px] md:text-[22px] font-bold">
                                    Recent Activities
                                </h2>
                                {unreadNotifications > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {unreadNotifications}
                                    </span>
                                )}
                            </div>

                            <RecentActivities activities={recentActivities} />
                        </div>
                    </div> */}

                </div>
            </div>
    );
};

export default DashContent;
