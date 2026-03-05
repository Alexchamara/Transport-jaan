import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, router } from '@inertiajs/react';
import jsPDF from "jspdf";
import {
    Package,
    FileText,
    Truck,
    Calendar,
    MapPin,
    Search,
    Filter,
    Plus,
    Download,
    ChevronRight,
    ChevronRight as ChevronRightIcon,
    Star,
    CreditCard,
    Clock,
    ShieldCheck,
    Weight,
    Eye,
    RefreshCw,
    Info,
    X,
    File,
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
} from "recharts";

// ---------- Helpers ----------
const ModeIcon = ({ mode, className }) => {
    if (mode === "document") return <FileText className={className} />;
    if (mode === "freight") return <Truck className={className} />;
    return <Package className={className} />; // parcel default
};

const statusMap = {
    pending: {
        label: "Pending",
        tone: "bg-amber-50 text-amber-700 border-amber-200",
    },
    confirmed: {
        label: "Confirmed",
        tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    in_transit: {
        label: "In Transit",
        tone: "bg-blue-50 text-blue-700 border-blue-200",
    },
    delivered: {
        label: "Delivered",
        tone: "bg-green-50 text-green-700 border-green-200",
    },
    cancelled: {
        label: "Cancelled",
        tone: "bg-rose-50 text-rose-700 border-rose-200",
    },
};

const Hero = ({ shipments = [], statistics = {}, monthlyData = [] }) => {
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sort, setSort] = useState("recent");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showExportModal, setShowExportModal] = useState(false);

    // Calculate statistics from props or use defaults
    const stats = {
        document: statistics.document || 0,
        parcel: statistics.parcel || 0,
        freight: statistics.freight || 0,
        total: statistics.total || 0,
        confirmed: statistics.confirmed || 0,
        inTransit: statistics.inTransit || 0,
        delivered: statistics.delivered || 0,
        pending: statistics.pending || 0,
        cancelled: statistics.cancelled || 0,
    };

    // Format monthly data for charts
    const chartMonthlyData = useMemo(() => {
        if (monthlyData && monthlyData.length > 0) {
            return monthlyData;
        }
        // Default empty data
        return Array.from({ length: 12 }, (_, i) => ({
            month: new Date(0, i).toLocaleString('default', { month: 'short' }),
            document: 0,
            parcel: 0,
            freight: 0,
        }));
    }, [monthlyData]);

    // Pie chart data
    const pieData = useMemo(() => [
        { name: "Document", value: stats.document },
        { name: "Parcel", value: stats.parcel },
        { name: "Freight", value: stats.freight },
    ].filter(item => item.value > 0), [stats]);

    // Filter and sort shipments
    const filteredShipments = useMemo(() => {
        let filtered = [...shipments];

        // Search filter
        if (q) {
            const query = q.toLowerCase();
            filtered = filtered.filter(s =>
                s.code?.toLowerCase().includes(query) ||
                s.from?.city?.toLowerCase().includes(query) ||
                s.to?.city?.toLowerCase().includes(query) ||
                s.from?.full?.toLowerCase().includes(query) ||
                s.to?.full?.toLowerCase().includes(query) ||
                s.packageTypes?.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(s => s.status === statusFilter);
        }

        // Sort
        filtered.sort((a, b) => {
            if (sort === "recent") {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            if (sort === "oldest") {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
            if (sort === "cost") {
                return (b.totalCost || 0) - (a.totalCost || 0);
            }
            return 0;
        });

        return filtered;
    }, [shipments, q, statusFilter, sort]);

    // Upcoming deliveries (confirmed or in transit)
    const upcoming = useMemo(() =>
        filteredShipments.filter(s =>
            ['confirmed', 'in_transit', 'pending'].includes(s.status)
        ).slice(0, 3),
        [filteredShipments]
    );

    // Handle new booking
    const handleNewBooking = () => {
        router.visit('/couriers/create');
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setQ("");
        setStatusFilter("all");
        setSort("recent");
        setStartDate("");
        setEndDate("");
    };

    // Handle export
    const handleExport = () => {
        setShowExportModal(true);
    };

    const formatExportDate = (value) => {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toISOString().split("T")[0];
    };

    const escapeCsvValue = (value) => {
        const text = String(value ?? "");
        if (/[",\n]/.test(text)) {
            return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
    };

    const downloadTextFile = (content, fileName, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const downloadCsv = (rows, fileName) => {
        if (rows.length === 0) {
            alert("No shipments to export for the selected filters.");
            return;
        }
        const headers = Object.keys(rows[0]);
        const csvLines = [
            headers.join(","),
            ...rows.map((row) =>
                headers.map((key) => escapeCsvValue(row[key])).join(",")
            ),
        ];
        downloadTextFile(
            `${csvLines.join("\n")}\n`,
            fileName,
            "text/csv;charset=utf-8;"
        );
    };

    const downloadPdf = (rows, fileName) => {
        if (rows.length === 0) {
            alert("No shipments to export for the selected filters.");
            return;
        }

        const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
        const margin = 36;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const lineHeight = 16;

        const columns = [
            { key: "Code", label: "Code", width: 120 },
            { key: "From", label: "From", width: 170 },
            { key: "To", label: "To", width: 170 },
            { key: "Status", label: "Status", width: 80 },
            { key: "Pickup", label: "Pickup", width: 90 },
            { key: "Packages", label: "Packages", width: 80 },
            { key: "Weight", label: "Weight", width: 80 },
            { key: "Cost", label: "Cost", width: 70 },
            { key: "Currency", label: "Currency", width: 60 },
        ];

        const maxWidth = pageWidth - margin * 2;
        const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
        const scale = totalWidth > maxWidth ? maxWidth / totalWidth : 1;
        columns.forEach((col) => {
            col.width = col.width * scale;
        });

        let y = margin;

        const drawHeader = () => {
            pdf.setFontSize(11);
            let x = margin;
            columns.forEach((col) => {
                pdf.text(col.label, x, y);
                x += col.width;
            });
            y += lineHeight;
            pdf.setDrawColor(220);
            pdf.line(margin, y - 10, margin + maxWidth, y - 10);
        };

        const drawRow = (row) => {
            pdf.setFontSize(9);
            let x = margin;
            columns.forEach((col) => {
                const value = String(row[col.key] ?? "");
                const clipped = value.length > 32 ? `${value.slice(0, 29)}...` : value;
                pdf.text(clipped, x, y);
                x += col.width;
            });
            y += lineHeight;
            if (y > pageHeight - margin) {
                pdf.addPage();
                y = margin;
                drawHeader();
            }
        };

        drawHeader();
        rows.forEach(drawRow);
        pdf.save(fileName);
    };

    // Handle export format
    const handleExportFormat = (format) => {
        const rows = filteredShipments.map((shipment) => ({
            Code: shipment.code || shipment.id || "",
            From: shipment.from?.full || shipment.from?.city || "",
            To: shipment.to?.full || shipment.to?.city || "",
            Status: shipment.status || "",
            Pickup: formatExportDate(shipment.pickupDate),
            Packages: shipment.packages?.length ?? 0,
            Weight: Number(shipment.totalWeight || 0).toFixed(2),
            Cost: Number(shipment.totalCost || 0).toFixed(2),
            Currency: "USD",
        }));

        const dateStamp = new Date().toISOString().split("T")[0];
        const baseName = `courier-shipments-${dateStamp}`;

        if (format === "PDF") {
            downloadPdf(rows, `${baseName}.pdf`);
        } else if (format === "Excel") {
            downloadCsv(rows, `${baseName}.xlsx`);
        } else {
            downloadCsv(rows, `${baseName}.csv`);
        }

        setShowExportModal(false);
    };

    // Handle refresh
    const handleRefresh = () => {
        window.location.reload();
    };

    // Handle view shipment
    const handleViewShipment = (id) => {
        router.visit(`/courier-shipment/${id}`);
    };

    return (
        <div className="min-h-screen w-full bg-[#E5E5E5] md:px-20 md:pt-2 md:pb-20 poppins">
            <div className="mx-auto max-w-[1300px]">
                {/* Header */}
                <div className="mb-3 flex flex-col gap-4 md:mb-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold tracking-tight md:text-[35px]">
                            <span className="text-[#0955AC]">
                                Courier Booking
                            </span>{" "}
                            Dashboard
                        </h1>
                        <p className="text-slate-600 text-[14px]">
                            Manage and track your courier shipments • Documents • Parcels • Freight
                        </p>
                    </div>
                    <div className="flex gap-2 justify-center items-center">
                        {/* <button
                            onClick={handleExport}
                            className="inline-flex items-center h-10 px-6 py-6 rounded-2xl border border-slate-200 text-[16px] font-medium hover:bg-slate-50"
                        >
                            <Download className="mr-2 h-7 w-7" /> Export
                        </button> */}
                        <button
                            onClick={handleNewBooking}
                            className="inline-flex items-center h-10 px-6 py-6 rounded-2xl bg-[#0955AC] text-white text-[16px] font-medium hover:bg-[#074a94]"
                        >
                            <Plus className="mr-2 h-6 w-6" /> New Booking
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="mb-3 md:mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="px-5 pt-5 pb-2">
                            <p className="flex items-center gap-3 text-[#7B7B7A] text-[16px] font-[700]">
                                <FileText className="h-8 w-8" /> Documents
                            </p>
                            <h3 className="text-[26px] font-[700] text-[#0955AC]">
                                {stats.document}
                            </h3>
                        </div>
                        <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
                            Total document shipments
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="px-5 pt-5 pb-2">
                            <p className="flex items-center gap-3 text-[#7B7B7A] text-[16px] font-[700]">
                                <Package className="h-8 w-8" /> Parcels
                            </p>
                            <h3 className="text-[26px] font-[700] text-[#0955AC]">
                                {stats.parcel}
                            </h3>
                        </div>
                        <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
                            Total parcel shipments
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="px-5 pt-5 pb-2">
                            <p className="flex items-center gap-3 text-[#7B7B7A] text-[16px] font-[700]">
                                <Truck className="h-8 w-8" /> Freight
                            </p>
                            <h3 className="text-[26px] font-[700] text-[#0955AC]">
                                {stats.freight}
                            </h3>
                        </div>
                        <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
                            Total freight shipments
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="mb-3 md:mb-4 bg-white rounded-2xl shadow-sm">
                    <div className="px-6 py-6">
                        {/* Main Filter Row - Search and Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[250px]">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search shipments, locations…"
                                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
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

                            {/* Action Buttons */}
                            <div className="flex gap-2 items-center flex-wrap">
                                <button 
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className={`inline-flex items-center h-11 px-4 rounded-lg text-[14px] font-medium transition whitespace-nowrap ${
                                        showAdvancedFilters 
                                            ? "bg-[#0955AC] text-white border border-[#0955AC]" 
                                            : "border border-slate-300 hover:bg-slate-50"
                                    }`}>
                                    <Filter className="mr-2 h-4 w-4" /> Filters
                                </button>
                                <button 
                                    onClick={handleExport}
                                    className="inline-flex items-center h-11 px-4 rounded-lg border border-slate-300 text-[14px] font-medium hover:bg-slate-50 transition whitespace-nowrap">
                                    <Download className="mr-2 h-4 w-4" /> Export
                                </button>
                                <button 
                                    onClick={handleRefresh}
                                    className="inline-flex items-center h-11 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 transition">
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Advanced Filters Panel (Collapsible) */}
                        <AnimatePresence>
                            {showAdvancedFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                                        {/* Status */}
                                        <div>
                                            <label className="block text-[12px] text-slate-600 mb-1.5 font-medium">Status</label>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent appearance-none cursor-pointer"
                                            >
                                                <option value="all">All Status</option>
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="in_transit">In Transit</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>

                                        {/* Sort */}
                                        <div>
                                            <label className="block text-[12px] text-slate-600 mb-1.5 font-medium">Sort By</label>
                                            <select
                                                value={sort}
                                                onChange={(e) => setSort(e.target.value)}
                                                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent appearance-none cursor-pointer"
                                            >
                                                <option value="recent">Most Recent</option>
                                                <option value="oldest">Oldest First</option>
                                                <option value="cost">Highest Cost</option>
                                            </select>
                                        </div>

                                        {/* Start Date */}
                                        <div>
                                            <label className="block text-[12px] text-slate-600 mb-1.5 font-medium">Start Date</label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent cursor-pointer"
                                            />
                                        </div>

                                        {/* End Date */}
                                        <div>
                                            <label className="block text-[12px] text-slate-600 mb-1.5 font-medium">End Date</label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent cursor-pointer"
                                            />
                                        </div>

                                        {/* Clear Filters Button */}
                                        <div className="flex items-end">
                                            <button
                                                onClick={handleClearFilters}
                                                className="h-10 w-full inline-flex items-center justify-center px-4 rounded-lg border border-slate-200 text-[14px] font-medium hover:bg-slate-50 transition"
                                            >
                                                <X className="mr-2 h-4 w-4" /> Clear
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Showing count */}
                                    <div className="mt-4 flex items-center gap-2 text-[14px] text-slate-600">
                                        <Info className="h-4 w-4" />
                                        <span>Showing {filteredShipments.length} of {shipments.length} shipments</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Shipments & Upcoming */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-[20px] font-[600]">
                                Your Shipments ({filteredShipments.length})
                            </h2>
                        </div>

                        {/* Shipments list */}
                        {filteredShipments.length > 0 ? (
                            <div className="space-y-4">
                                {filteredShipments.map((shipment) => (
                                    <motion.div
                                        key={shipment.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <div className="group rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="px-10 pt-8 pb-5">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-[18px] font-semibold leading-none tracking-tight">
                                                            {shipment.code}
                                                        </h3>
                                                        <p className="mt-2 flex items-center gap-2 text-[12px] text-slate-500">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            {shipment.from?.full || 'N/A'} → {shipment.to?.full || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-semibold ${statusMap[shipment.status]?.tone || 'bg-slate-50 text-slate-700'}`}>
                                                        {statusMap[shipment.status]?.label || shipment.status}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4 text-[14px]">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Package className="h-4 w-4" />
                                                        <span>{shipment.packages?.length || 0} package(s)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Weight className="h-4 w-4" />
                                                        <span>{Number(shipment.totalWeight || 0).toFixed(2)} kg</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{shipment.pickupDate || 'Not scheduled'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                        <CreditCard className="h-4 w-4" />
                                                        <span>${Number(shipment.totalCost || 0).toFixed(2)}</span>
                                                    </div>
                                                </div>

                                                {shipment.serviceLevel && (
                                                    <div className="mb-4 text-[12px] text-slate-500">
                                                        Service: {shipment.serviceLevel}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="px-10 pb-8 flex items-center justify-between gap-2 border-t pt-4">
                                                <div className="text-[12px] text-slate-500">
                                                    Created: {new Date(shipment.createdAt).toLocaleDateString()}
                                                </div>
                                                <button
                                                    onClick={() => handleViewShipment(shipment.id)}
                                                    className="h-10 px-4 rounded-xl bg-[#0955AC] text-white text-[14px] font-medium hover:bg-[#074a94] inline-flex items-center gap-2"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border-dashed border-2 border-slate-200 bg-white">
                                <div className="px-4 py-16 text-center text-slate-500">
                                    <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                    <p className="text-lg mb-2">No shipments found</p>
                                    <p className="text-sm mb-4">
                                        {q || statusFilter !== 'all'
                                            ? 'Try adjusting your filters'
                                            : 'Create your first courier booking to get started'}
                                    </p>
                                    {!q && statusFilter === 'all' && (
                                        <button
                                            onClick={handleNewBooking}
                                            className="mt-2 px-6 py-2 rounded-xl bg-[#0955AC] text-white hover:bg-[#074a94]"
                                        >
                                            Create Booking
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Upcoming + Quick Actions */}
                    <div className="space-y-4">
                        {/* Upcoming */}
                        <div className="rounded-2xl bg-white shadow-sm">
                            <div className="px-10 pt-10 pb-5">
                                <h3 className="font-semibold leading-none tracking-tight text-[18px]">
                                    Upcoming Deliveries
                                </h3>
                                <p className="text-[14px] text-slate-500 mt-1">
                                    Active shipments
                                </p>
                            </div>
                            <div className="px-10 pb-10 space-y-6 text-[14px]">
                                {upcoming.length > 0 ? upcoming.map((shipment) => (
                                    <div key={shipment.id} className="rounded-2xl border p-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <Package className="h-7 w-7" />
                                                <span className="font-medium text-[12px]">
                                                    {shipment.from?.city || 'N/A'} → {shipment.to?.city || 'N/A'}
                                                </span>
                                            </div>
                                            <span className={`rounded-full border px-2 py-0.5 text-[10px] ${statusMap[shipment.status]?.tone}`}>
                                                {statusMap[shipment.status]?.label}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-[12px] text-slate-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>{shipment.pickupDate || 'TBD'}</span>
                                        </div>
                                        <div className="mt-1 text-sm text-slate-500">
                                            {shipment.packages?.length || 0} package(s)
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-[12px]">
                                            <span className="text-slate-500">Ref: {shipment.code}</span>
                                            <button
                                                onClick={() => handleViewShipment(shipment.id)}
                                                className="h-8 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-slate-400">
                                        <p>No active shipments</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm">
                            <div className="px-10 pt-10 pb-5">
                                <h3 className="font-semibold leading-none tracking-tight text-[18px]">
                                    Quick Actions
                                </h3>
                                <p className="text-[14px] text-slate-500 mt-1">
                                    Common tasks
                                </p>
                            </div>
                            <div className="px-10 pb-10 grid grid-cols-1 gap-2 font-[500]">
                                <Link
                                    href="/couriers/create"
                                    className="h-12 px-3 rounded-2xl border border-slate-200 text-left text-[12px] hover:bg-slate-100 inline-flex items-center"
                                >
                                    <Plus className="mr-2 h-7 w-7" /> New Shipment
                                </Link>
                                <button
                                    onClick={() => setStatusFilter('in_transit')}
                                    className="h-12 px-3 rounded-2xl border border-slate-200 text-left text-[12px] hover:bg-slate-100 inline-flex items-center"
                                >
                                    <Truck className="mr-2 h-7 w-7" /> Track Shipments
                                </button>
                                <button
                                    onClick={() => setStatusFilter('delivered')}
                                    className="h-12 px-3 rounded-2xl border border-slate-200 text-left text-[12px] hover:bg-slate-100 inline-flex items-center"
                                >
                                    <FileText className="mr-2 h-7 w-7" /> View History
                                </button>
                                {/* <button
                                    onClick={handleExport}
                                    className="h-12 px-3 rounded-2xl border border-slate-200 text-left text-[12px] hover:bg-slate-100 inline-flex items-center"
                                >
                                    <Download className="mr-2 h-7 w-7" /> Export Data
                                </button> */}
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
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                            onClick={() => setShowExportModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-2xl shadow-xl max-w-md w-full"
                            >
                                <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                                    <h2 className="text-[18px] font-semibold text-slate-900">Export Shipments</h2>
                                    <button
                                        onClick={() => setShowExportModal(false)}
                                        className="text-slate-400 hover:text-slate-600 transition"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="px-6 py-4">
                                    <p className="text-[14px] text-slate-600 mb-4">
                                        Export all {filteredShipments.length} filtered shipments
                                    </p>

                                    <div className="space-y-2">
                                        {/* PDF Option */}
                                        <button
                                            onClick={() => handleExportFormat('PDF')}
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-[#0955AC] transition group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-red-600" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[14px] font-medium text-slate-900">Export as PDF</p>
                                                    <p className="text-[12px] text-slate-500">Printable document format</p>
                                                </div>
                                            </div>
                                            <ChevronRightIcon className="h-5 w-5 text-slate-400 group-hover:text-[#0955AC]" />
                                        </button>

                                        {/* Excel Option */}
                                        <button
                                            onClick={() => handleExportFormat('Excel')}
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-[#0955AC] transition group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                                    <File className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[14px] font-medium text-slate-900">Export as Excel</p>
                                                    <p className="text-[12px] text-slate-500">Spreadsheet format (.xlsx)</p>
                                                </div>
                                            </div>
                                            <ChevronRightIcon className="h-5 w-5 text-slate-400 group-hover:text-[#0955AC]" />
                                        </button>

                                        {/* CSV Option */}
                                        <button
                                            onClick={() => handleExportFormat('CSV')}
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-[#0955AC] transition group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[14px] font-medium text-slate-900">Export as CSV</p>
                                                    <p className="text-[12px] text-slate-500">Comma-separated values</p>
                                                </div>
                                            </div>
                                            <ChevronRightIcon className="h-5 w-5 text-slate-400 group-hover:text-[#0955AC]" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} Courier Portal · Manage your shipments with ease
                </div>
            </div>
        </div>
    );
};

export default Hero;
