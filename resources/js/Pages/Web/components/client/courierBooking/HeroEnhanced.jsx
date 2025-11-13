import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, router } from '@inertiajs/react';
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
    Star,
    CreditCard,
    Clock,
    ShieldCheck,
    Weight,
    Eye,
    RefreshCw,
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

    // Handle view shipment
    const handleViewShipment = (id) => {
        router.visit(`/courier-shipment/${id}`);
    };

    // Handle export
    const handleExport = () => {
        // TODO: Implement export functionality
        alert('Export functionality coming soon!');
    };

    return (
        <div className="min-h-screen w-full bg-[#E5E5E5] md:p-20 poppins">
            <div className="mx-auto max-w-[1300px]">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 md:mb-10 md:flex-row md:items-center md:justify-between">
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
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
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

                {/* Top Row: Filters + Charts */}
                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Area chart card */}
                    <div className="lg:col-span-2 bg-white rounded-[10px] shadow-sm">
                        <div className="px-10 pt-10 pb-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold leading-none tracking-tight text-[16px]">
                                        Bookings by Month
                                    </h3>
                                    <p className="text-[14px] text-slate-500 pt-1">
                                        Documents • Parcels • Freight (last 12 months)
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-10 pb-10 pt-10">
                            {chartMonthlyData.some(d => d.document + d.parcel + d.freight > 0) ? (
                                <div className="h-[350px] w-full focus:outline-none"
                                    style={{ WebkitTapHighlightColor: "transparent", outline: "none" }}
                                >
                                    <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" tabIndex={-1}>
                                        <AreaChart data={chartMonthlyData} margin={{ left: 8, right: 8, top: 10 }}>
                                            <defs>
                                                <linearGradient id="gDoc" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                                                </linearGradient>
                                                <linearGradient id="gParcel" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0955AC" stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor="#0955AC" stopOpacity={0.02} />
                                                </linearGradient>
                                                <linearGradient id="gFreight" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid vertical={false} horizontal={true} />
                                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                            <YAxis tickLine={false} axisLine={false} />
                                            <RTooltip />
                                            <Area type="monotone" dataKey="document" name="Document" stroke="#3b82f6" fill="url(#gDoc)" strokeWidth={4} />
                                            <Area type="monotone" dataKey="parcel" name="Parcel" stroke="#0955AC" fill="url(#gParcel)" strokeWidth={4} />
                                            <Area type="monotone" dataKey="freight" name="Freight" stroke="#6366f1" fill="url(#gFreight)" strokeWidth={4} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[350px] flex items-center justify-center text-slate-400">
                                    <div className="text-center">
                                        <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                        <p>No shipment data yet</p>
                                        <button onClick={handleNewBooking} className="mt-4 text-[#0955AC] hover:underline">
                                            Create your first shipment
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pie card */}
                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="px-10 pt-10">
                            <h3 className="font-semibold leading-none tracking-tight text-[16px]">
                                Category Mix
                            </h3>
                            <p className="text-[14px] text-slate-500 mt-1">
                                Share of total bookings
                            </p>
                        </div>
                        <div className="px-10 pb-10">
                            {pieData.length > 0 ? (
                                <>
                                    <div className="h-[350px] w-full"
                                        style={{ WebkitTapHighlightColor: "transparent", outline: "none" }}
                                    >
                                        <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" tabIndex={-1}>
                                            <PieChart>
                                                <Pie data={pieData} innerRadius={90} outerRadius={140} paddingAngle={5} dataKey="value" nameKey="name" cornerRadius={8}>
                                                    {pieData.map((_, i) => (
                                                        <Cell key={i} fill={["#3b82f6", "#0955AC", "#6366f1"][i]} />
                                                    ))}
                                                </Pie>
                                                <RTooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 flex items-center justify-center gap-4 text-[14px] text-slate-600">
                                        {stats.document > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="h-5 w-5 rounded-full bg-[#3b82f6]" /> Document
                                            </div>
                                        )}
                                        {stats.parcel > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="h-5 w-5 rounded-full bg-[#0955AC]" /> Parcel
                                            </div>
                                        )}
                                        {stats.freight > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="h-5 w-5 rounded-full bg-indigo-500" /> Freight
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="h-[350px] flex items-center justify-center text-slate-400">
                                    <div className="text-center">
                                        <p>No data to display</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="mb-8 rounded-2xl">
                    <div className="px-4 pb-4 pt-6">
                        <div className="grid items-center gap-3 md:grid-cols-2 lg:grid-cols-3 font-[600]">
                            {/* Search */}
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search shipments, locations…"
                                    className="h-12 w-full rounded-[10px] border border-slate-300 bg-white pl-9 px-3 text-[14px] placeholder:text-slate-400 focus:outline-none"
                                />
                            </div>

                            {/* Status select */}
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="h-12 w-full rounded-[10px] border border-slate-300 bg-white px-3 text-[14px] focus:outline-none"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="in_transit">In Transit</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Sort select */}
                            <div>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="h-12 w-full rounded-[10px] border border-slate-300 bg-white px-3 text-[14px] focus:outline-none"
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="cost">Highest Cost</option>
                                </select>
                            </div>
                        </div>
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

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} Courier Portal · Manage your shipments with ease
                </div>
            </div>
        </div>
    );
};

export default Hero;
