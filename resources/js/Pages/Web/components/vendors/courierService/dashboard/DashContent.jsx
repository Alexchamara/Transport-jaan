import React, { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { CalendarDays, ChevronDown, Download, Filter, Search } from "lucide-react";

import BookingOverviewBarChart from "./BookingOverviewBarChart";
import EarningSummaryChart from "./EarningSummaryChart";
import RealStatusPieChart from "./RealStatusPieChart";

const METRIC_CARD_CLASSES = {
    delayed: "bg-[#FFE9E9] text-[#8A1C1C]",
    exceptions: "bg-[#FFF2E5] text-[#8A4A00]",
    labelCreated: "bg-[#EAF1FF] text-[#0F3D8A]",
    pendingPickups: "bg-[#F2EEFF] text-[#3F2472]",
    delivered: "bg-[#E8FAEF] text-[#1B6C3A]",
    onTime: "bg-[#E9F8FF] text-[#0F5270]",
    early: "bg-[#ECFBF2] text-[#1B6C3A]",
};

const EMPTY_DASHBOARD = {
    metrics: {
        delayed: 0,
        exceptions: 0,
        labelCreated: 0,
        pendingPickups: 0,
        delivered: 0,
        onTime: 0,
        early: 0,
    },
    rows: [],
    filters: {
        q: "",
        status: "",
        service: "",
        category: "",
        fromDate: "",
        toDate: "",
        page: 1,
    },
    pagination: {
        page: 1,
        pageSize: 12,
        total: 0,
        totalPages: 1,
    },
    filterOptions: {
        statuses: [],
        services: [],
        categories: [
            { value: "domestic", label: "Domestic" },
            { value: "logistic", label: "Logistic" },
        ],
    },
};

const statusBadgeCls = (status) => {
    switch (status) {
        case "delivered":
            return "bg-[#E8FAEF] text-[#1B6C3A]";
        case "in_transit":
            return "bg-[#EAF1FF] text-[#0F3D8A]";
        case "confirmed":
            return "bg-[#F2EEFF] text-[#3F2472]";
        case "cancelled":
            return "bg-[#FFE9E9] text-[#8A1C1C]";
        default:
            return "bg-[#F3F3F3] text-[#4F4F4F]";
    }
};

const metricCards = [
    { key: "delayed", label: "Delayed" },
    { key: "exceptions", label: "Exceptions" },
    { key: "labelCreated", label: "Label Created" },
    { key: "pendingPickups", label: "Pending Pickups" },
    { key: "delivered", label: "Delivered" },
    { key: "onTime", label: "On Time" },
    { key: "early", label: "Early" },
];

const DashContent = ({ mode = "dashboard" }) => {
    const pageProps = usePage().props;
    const dashboard = pageProps.courierDashboard || EMPTY_DASHBOARD;

    const [localFilters, setLocalFilters] = useState({
        q: dashboard.filters.q || "",
        status: dashboard.filters.status || "",
        service: dashboard.filters.service || "",
        category: dashboard.filters.category || "",
        fromDate: dashboard.filters.fromDate || "",
        toDate: dashboard.filters.toDate || "",
    });

    const heading = mode === "bookings" ? "Courier Bookings" : "Courier Service Dashboard";

    const baseRoute = mode === "bookings" ? "courierService.bookings" : "courierService.dashboard";

    const submitFilters = (nextPage = 1) => {
        router.get(
            route(baseRoute),
            {
                ...localFilters,
                page: nextPage,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const reportUrl = useMemo(
        () =>
            route("courierService.dashboard.report", {
                ...dashboard.filters,
                ...localFilters,
                page: 1,
                export: "csv",
            }),
        [dashboard.filters, localFilters],
    );

    return (
        <div className="w-full h-auto px-4 lg:px-6 pt-6 pb-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
                <div>
                    <h1 className="figtree text-[30px] lg:text-[34px] font-[700] text-[#111827]">{heading}</h1>
                    <p className="text-[14px] text-[#6B7280] mt-1">
                        Operational courier overview for Domestic and Logistic shipments.
                    </p>
                </div>
                <a
                    href={reportUrl}
                    className="inline-flex items-center justify-center gap-2 h-[40px] px-4 rounded-[8px] bg-[#0955AC] text-white text-[14px] font-[600]"
                >
                    <Download size={16} />
                    Generate Report
                </a>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
                <div className="xl:col-span-2 flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {metricCards.map((item) => (
                            <div
                                key={item.key}
                                className={`rounded-[10px] px-4 py-3 shadow-sm ${METRIC_CARD_CLASSES[item.key] || "bg-[#F4F4F5] text-[#1F2937]"}`}
                            >
                                <p className="text-[13px] font-[600]">{item.label}</p>
                                <p className="text-[26px] font-[700] leading-tight mt-1">
                                    {dashboard.metrics[item.key] ?? 0}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-[10px] shadow-sm py-8 px-6">
                        <div className="flex flex-row items-center justify-between mb-8 w-full">
                            <h2 className="text-[24px] font-[700]">Booking Overview</h2>
                            <div className="w-[113px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-2">
                                <h3 className="text-[#00000080] font-[600] text-[14px]">This Year</h3>
                                <ChevronDown className="size-[16px]" />
                            </div>
                        </div>
                        <BookingOverviewBarChart data={dashboard.charts?.bookingOverview || []} />
                    </div>

                    <div className="bg-white rounded-[10px] shadow-sm py-8 px-6">
                        <div className="flex flex-row items-center justify-between mb-8 w-full">
                            <h2 className="text-[24px] font-[700]">Earning Summary</h2>
                            <div className="w-[132px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-2">
                                <h3 className="text-[#00000080] font-[600] text-[14px]">Last 12 Months</h3>
                                <ChevronDown className="size-[16px]" />
                            </div>
                        </div>
                        <EarningSummaryChart data={dashboard.charts?.earningSummary || []} />
                    </div>
                </div>

                <div className="xl:col-span-1">
                    <div className="bg-white rounded-[10px] shadow-sm py-6 px-6 min-h-[420px]">
                        <div className="flex flex-row items-center justify-between w-full mb-4">
                            <h2 className="text-[24px] font-[700]">Real Status</h2>
                            <div className="w-[113px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-2">
                                <h3 className="text-[#00000080] font-[600] text-[14px]">This Week</h3>
                                <ChevronDown className="size-[16px]" />
                            </div>
                        </div>
                        <RealStatusPieChart data={dashboard.charts?.statusBreakdown || []} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[10px] shadow-sm p-4 lg:p-6">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-4">
                    <h2 className="text-[22px] font-[700] text-[#111827]">All Bookings</h2>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="h-[38px] min-w-[280px] bg-[#F3F4F6] rounded-[8px] px-3 flex items-center gap-2">
                            <Search size={16} className="text-[#6B7280]" />
                            <input
                                type="text"
                                value={localFilters.q}
                                onChange={(e) => setLocalFilters((prev) => ({ ...prev, q: e.target.value }))}
                                placeholder="Search Booking No. or Tracking No."
                                className="w-full bg-transparent border-none focus:ring-0 outline-none text-[14px]"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => submitFilters(1)}
                            className="h-[38px] px-4 rounded-[8px] bg-[#0955AC] text-white text-[14px] font-[600]"
                        >
                            Search
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-2 mb-4">
                    <select
                        value={localFilters.status}
                        onChange={(e) => setLocalFilters((prev) => ({ ...prev, status: e.target.value }))}
                        className="h-[38px] rounded-[8px] border border-[#E5E7EB] px-3 text-[14px]"
                    >
                        <option value="">All Statuses</option>
                        {dashboard.filterOptions.statuses.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={localFilters.service}
                        onChange={(e) => setLocalFilters((prev) => ({ ...prev, service: e.target.value }))}
                        className="h-[38px] rounded-[8px] border border-[#E5E7EB] px-3 text-[14px]"
                    >
                        <option value="">All Services</option>
                        {dashboard.filterOptions.services.map((service) => (
                            <option key={service} value={service}>
                                {service}
                            </option>
                        ))}
                    </select>

                    <select
                        value={localFilters.category}
                        onChange={(e) => setLocalFilters((prev) => ({ ...prev, category: e.target.value }))}
                        className="h-[38px] rounded-[8px] border border-[#E5E7EB] px-3 text-[14px]"
                    >
                        <option value="">All Categories</option>
                        {dashboard.filterOptions.categories.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>

                    <div className="h-[38px] rounded-[8px] border border-[#E5E7EB] px-3 text-[14px] flex items-center gap-2">
                        <CalendarDays size={14} className="text-[#6B7280]" />
                        <input
                            type="date"
                            value={localFilters.fromDate}
                            onChange={(e) => setLocalFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
                            className="w-full border-none focus:ring-0 outline-none"
                        />
                    </div>

                    <div className="h-[38px] rounded-[8px] border border-[#E5E7EB] px-3 text-[14px] flex items-center gap-2">
                        <CalendarDays size={14} className="text-[#6B7280]" />
                        <input
                            type="date"
                            value={localFilters.toDate}
                            onChange={(e) => setLocalFilters((prev) => ({ ...prev, toDate: e.target.value }))}
                            className="w-full border-none focus:ring-0 outline-none"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => submitFilters(1)}
                        className="h-[38px] rounded-[8px] bg-[#F3F4F6] text-[#111827] text-[14px] font-[600] flex items-center justify-center gap-2"
                    >
                        <Filter size={14} />
                        Apply Filters
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-[13px]">
                        <thead className="bg-[#D8E4F2] text-[#1F2937]">
                            <tr>
                                <th className="px-4 py-3 font-[700]">Booking Number</th>
                                <th className="px-4 py-3 font-[700]">Booking Date</th>
                                <th className="px-4 py-3 font-[700]">Tracking Number</th>
                                <th className="px-4 py-3 font-[700]">Service</th>
                                <th className="px-4 py-3 font-[700]">Status</th>
                                <th className="px-4 py-3 font-[700]">Estimated Delivery</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboard.rows.length > 0 ? (
                                dashboard.rows.map((row) => (
                                    <tr key={row.id} className="border-b border-[#E5E7EB]">
                                        <td className="px-4 py-3 font-[600]">{row.bookingNumber}</td>
                                        <td className="px-4 py-3">{row.bookingDate || "-"}</td>
                                        <td className="px-4 py-3">{row.trackingNumber}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span>{row.service}</span>
                                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-[700] bg-[#F3F4F6] text-[#4B5563]">
                                                    {row.category}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-[700] ${statusBadgeCls(row.status)}`}
                                            >
                                                {row.statusLabel}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{row.estimatedDelivery || "-"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-[#6B7280]">
                                        No courier bookings found for the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                    <p className="text-[13px] text-[#6B7280]">
                        Showing page {dashboard.pagination.page} of {dashboard.pagination.totalPages} ({dashboard.pagination.total} records)
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={dashboard.pagination.page <= 1}
                            onClick={() => submitFilters(dashboard.pagination.page - 1)}
                            className="h-[34px] px-3 rounded-[8px] border border-[#D1D5DB] text-[13px] disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            disabled={dashboard.pagination.page >= dashboard.pagination.totalPages}
                            onClick={() => submitFilters(dashboard.pagination.page + 1)}
                            className="h-[34px] px-3 rounded-[8px] border border-[#D1D5DB] text-[13px] disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashContent;
