import React, { useState } from "react";
import { router } from "@inertiajs/react";
import {
    Car,
    Plane,
    Ship,
    TrendingUp,
    DollarSign,
    CalendarCheck,
    Clock,
    XCircle,
    CheckCircle,
    AlertTriangle,
    Star,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    LayoutDashboard,
    List,
    Ban,
    Truck,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import VehicleListTab from "./VehicleListTab";

const TABS = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "vehicles", label: "Vehicles", icon: List },
];

const CHART_COLORS = {
    primary: "#0E43FB",
    secondary: "#00C2FF",
    success: "#14CA74",
    warning: "#FDB52A",
    danger: "#FF5A65",
    orange: "#FF9800",
    purple: "#AB47BC",
    teal: "#26A69A",
};

const TYPE_COLORS = {
    land: "#0E43FB",
    air: "#AB47BC",
    sea: "#00C2FF",
};

const STATUS_COLORS = {
    confirmed: "#14CA74",
    pending: "#FDB52A",
    cancelled: "#FF5A65",
    completed: "#0E43FB",
};

const formatCurrency = (value) => {
    if (value >= 1000000) return `LKR ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `LKR ${(value / 1000).toFixed(1)}K`;
    return `LKR ${Number(value).toLocaleString()}`;
};

const formatNumber = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value?.toString() ?? "0";
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1A2233] border border-[#343B4F] rounded-lg p-3 shadow-xl">
                <p className="text-white text-xs font-medium mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: {entry.name === "revenue" || entry.name === "land" || entry.name === "air" || entry.name === "sea" ? formatCurrency(entry.value) : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const VehicleDashboardRightSide = ({
    vehicles = {},
    filters = {},
    stats = {},
    error,
    dashboardData = {},
}) => {
    const [activeTab, setActiveTab] = useState("dashboard");

    const overview = dashboardData?.overview || {};
    const bookingTrends = dashboardData?.bookingTrends || [];
    const revenueTrends = dashboardData?.revenueTrends || [];
    const revenueByType = dashboardData?.revenueByType || [];
    const typeDistribution = dashboardData?.typeDistribution || [];
    const statusDistribution = dashboardData?.statusDistribution || [];
    const bookingsByType = dashboardData?.bookingsByType || [];
    const topVehicles = dashboardData?.topVehicles || [];
    const recentBookings = dashboardData?.recentBookings || [];
    const pendingApprovals = dashboardData?.pendingApprovals || [];
    const cancellation = dashboardData?.cancellationAnalytics || {};
    const manufacturerDistribution = dashboardData?.manufacturerDistribution || [];

    const handleRefresh = () => {
        router.reload({ only: ["dashboardData", "vehicles", "stats"] });
    };

    const handleApprove = (vehicleId) => {
        router.put(`/superadmin/vehicles/${vehicleId}/approval`, { approval_status: "approved" });
    };

    const handleReject = (vehicleId) => {
        const reason = prompt("Rejection reason:");
        if (reason) {
            router.put(`/superadmin/vehicles/${vehicleId}/approval`, { approval_status: "rejected", rejection_reason: reason });
        }
    };

    const StatCard = ({ icon: Icon, label, value, change, color, subLabel }) => (
        <div className="flex flex-col gap-2 border border-[#343B4F] bg-[#0B1739] rounded-lg p-4 hover:border-[#0E43FB]/50 transition-all duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                        <Icon size={16} style={{ color }} />
                    </div>
                    <span className="text-[#AEB9E1] text-xs">{label}</span>
                </div>
                {change !== undefined && change !== null && (
                    <div className={`flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded ${
                        change >= 0 ? "bg-[#05C16820] text-[#14CA74]" : "bg-[#FF5A6520] text-[#FF5A65]"
                    }`}>
                        {change >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-white text-2xl font-bold">{value}</span>
                {subLabel && <span className="text-[#AEB9E1] text-[10px]">{subLabel}</span>}
            </div>
        </div>
    );

    const StatusBadge = ({ status }) => {
        const styles = {
            approved: { bg: "bg-[#05C16833]", border: "border-[#05C16880]", text: "text-[#14CA74]", dot: "bg-[#14CA74]" },
            pending: { bg: "bg-[#FFB01633]", border: "border-[#FFB01680]", text: "text-[#FDB52A]", dot: "bg-[#FDB52A]" },
            confirmed: { bg: "bg-[#05C16833]", border: "border-[#05C16880]", text: "text-[#14CA74]", dot: "bg-[#14CA74]" },
            cancelled: { bg: "bg-[#FF5A6533]", border: "border-[#FF5A6580]", text: "text-[#FF5A65]", dot: "bg-[#FF5A65]" },
            rejected: { bg: "bg-[#FF572233]", border: "border-[#FF572280]", text: "text-[#FF5722]", dot: "bg-[#FF5722]" },
            completed: { bg: "bg-[#0E43FB33]", border: "border-[#0E43FB80]", text: "text-[#0E43FB]", dot: "bg-[#0E43FB]" },
        };
        const s = styles[status] || styles.pending;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${s.bg} ${s.border} ${s.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {status}
            </span>
        );
    };

    const TypeIcon = ({ type, size = 14 }) => {
        const icons = { land: Car, air: Plane, sea: Ship };
        const Icon = icons[type] || Car;
        return <Icon size={size} style={{ color: TYPE_COLORS[type] || CHART_COLORS.primary }} />;
    };

    const VehicleTypeBadge = ({ type }) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border"
            style={{
                backgroundColor: `${TYPE_COLORS[type] || CHART_COLORS.primary}20`,
                borderColor: `${TYPE_COLORS[type] || CHART_COLORS.primary}80`,
                color: TYPE_COLORS[type] || CHART_COLORS.primary,
            }}>
            <TypeIcon type={type} size={10} />
            {type?.charAt(0).toUpperCase() + type?.slice(1)}
        </span>
    );

    return (
        <div className="flex flex-col gap-6 poppins min-h-screen p-6 lg:px-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-white text-2xl font-semibold">Vehicle Rental Management</h1>
                    <p className="text-[#AEB9E1] text-sm mt-1">Complete overview of land, air & sea vehicle operations</p>
                </div>
                
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-[#0B1739] border border-[#343B4F] rounded-lg p-1 w-fit">
                {TABS.map(({ key, label, icon: TabIcon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            activeTab === key
                                ? "bg-[#0E43FB] text-white shadow-lg"
                                : "text-[#AEB9E1] hover:text-white hover:bg-[#181A2A]"
                        }`}
                    >
                        <TabIcon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
                <div className="flex flex-col gap-6">
                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={Truck}
                            label="Total Vehicles"
                            value={formatNumber(overview.totalVehicles)}
                            color={CHART_COLORS.primary}
                            subLabel={`${overview.activeVehicles || 0} active`}
                        />
                        <StatCard
                            icon={CalendarCheck}
                            label="Total Bookings"
                            value={formatNumber(overview.totalBookings)}
                            change={overview.bookingsChange}
                            color={CHART_COLORS.success}
                            subLabel={`${overview.activeBookings || 0} active`}
                        />
                        <StatCard
                            icon={DollarSign}
                            label="Total Revenue"
                            value={formatCurrency(overview.totalRevenue || 0)}
                            change={overview.revenueChange}
                            color={CHART_COLORS.secondary}
                            subLabel="all time"
                        />
                        <StatCard
                            icon={DollarSign}
                            label="Monthly Revenue"
                            value={formatCurrency(overview.monthlyRevenue || 0)}
                            change={overview.revenueChange}
                            color={CHART_COLORS.teal}
                            subLabel="this month"
                        />
                    </div>

                    {/* Second Row - Vehicle Type Breakdown + Mini Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
                        <div className="flex items-center gap-3 bg-[#0B1739] border border-[#343B4F] rounded-lg p-3">
                            <Car size={18} className="text-[#0E43FB]" />
                            <div>
                                <p className="text-white text-lg font-bold">{overview.landVehicles || 0}</p>
                                <p className="text-[#AEB9E1] text-[10px]">Land</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-[#0B1739] border border-[#343B4F] rounded-lg p-3">
                            <Plane size={18} className="text-[#AB47BC]" />
                            <div>
                                <p className="text-white text-lg font-bold">{overview.airVehicles || 0}</p>
                                <p className="text-[#AEB9E1] text-[10px]">Air</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-[#0B1739] border border-[#343B4F] rounded-lg p-3">
                            <Ship size={18} className="text-[#00C2FF]" />
                            <div>
                                <p className="text-white text-lg font-bold">{overview.seaVehicles || 0}</p>
                                <p className="text-[#AEB9E1] text-[10px]">Sea</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-[#0B1739] border border-[#343B4F] rounded-lg p-3">
                            <CheckCircle size={18} className="text-[#14CA74]" />
                            <div>
                                <p className="text-white text-lg font-bold">{overview.approvedVehicles || 0}</p>
                                <p className="text-[#AEB9E1] text-[10px]">Approved</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-[#0B1739] border border-[#343B4F] rounded-lg p-3">
                            <Clock size={18} className="text-[#FDB52A]" />
                            <div>
                                <p className="text-white text-lg font-bold">{overview.pendingVehicles || 0}</p>
                                <p className="text-[#AEB9E1] text-[10px]">Pending</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-[#0B1739] border border-[#343B4F] rounded-lg p-3">
                            <Star size={18} className="text-[#FDB52A]" />
                            <div>
                                <p className="text-white text-lg font-bold">{overview.avgRating || 0}</p>
                                <p className="text-[#AEB9E1] text-[10px]">Avg Rating</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-[#0B1739] border border-[#343B4F] rounded-lg p-3">
                            <Ban size={18} className="text-[#FF5A65]" />
                            <div>
                                <p className="text-white text-lg font-bold">{overview.cancelledBookings || 0}</p>
                                <p className="text-[#AEB9E1] text-[10px]">Cancelled</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 1: Revenue Trend + Booking Trends */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue by Vehicle Type - Stacked Area Chart */}
                        <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-white text-sm font-medium">Revenue by Vehicle Type</h3>
                                    <p className="text-[#AEB9E1] text-xs mt-0.5">Last 12 months</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1 text-[10px] text-[#0E43FB]">
                                        <span className="w-2 h-2 rounded-full bg-[#0E43FB]" /> Land
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] text-[#AB47BC]">
                                        <span className="w-2 h-2 rounded-full bg-[#AB47BC]" /> Air
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] text-[#00C2FF]">
                                        <span className="w-2 h-2 rounded-full bg-[#00C2FF]" /> Sea
                                    </span>
                                </div>
                            </div>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueByType}>
                                        <defs>
                                            <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={TYPE_COLORS.land} stopOpacity={0.4} />
                                                <stop offset="100%" stopColor={TYPE_COLORS.land} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="airGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={TYPE_COLORS.air} stopOpacity={0.4} />
                                                <stop offset="100%" stopColor={TYPE_COLORS.air} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={TYPE_COLORS.sea} stopOpacity={0.4} />
                                                <stop offset="100%" stopColor={TYPE_COLORS.sea} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#343B4F" />
                                        <XAxis dataKey="month" stroke="#AEB9E1" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#AEB9E1" tick={{ fontSize: 10 }} axisLine={false} tickLine={false}
                                            tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="land" stroke={TYPE_COLORS.land} fill="url(#landGrad)" strokeWidth={2} stackId="1" />
                                        <Area type="monotone" dataKey="air" stroke={TYPE_COLORS.air} fill="url(#airGrad)" strokeWidth={2} stackId="1" />
                                        <Area type="monotone" dataKey="sea" stroke={TYPE_COLORS.sea} fill="url(#seaGrad)" strokeWidth={2} stackId="1" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Booking Trends Bar Chart */}
                        <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-white text-sm font-medium">Booking Trends</h3>
                                    <p className="text-[#AEB9E1] text-xs mt-0.5">Last 12 months by status</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1 text-[10px] text-[#14CA74]">
                                        <span className="w-2 h-2 rounded-full bg-[#14CA74]" /> Confirmed
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] text-[#FDB52A]">
                                        <span className="w-2 h-2 rounded-full bg-[#FDB52A]" /> Pending
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] text-[#FF5A65]">
                                        <span className="w-2 h-2 rounded-full bg-[#FF5A65]" /> Cancelled
                                    </span>
                                </div>
                            </div>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bookingTrends}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#343B4F" />
                                        <XAxis dataKey="month" stroke="#AEB9E1" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#AEB9E1" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="confirmed" fill={CHART_COLORS.success} radius={[2, 2, 0, 0]} barSize={12} />
                                        <Bar dataKey="pending" fill={CHART_COLORS.warning} radius={[2, 2, 0, 0]} barSize={12} />
                                        <Bar dataKey="cancelled" fill={CHART_COLORS.danger} radius={[2, 2, 0, 0]} barSize={12} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 2: Type Distribution + Booking Status + Bookings by Type */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Vehicle Type Distribution */}
                        <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-5">
                            <h3 className="text-white text-sm font-medium mb-4">Vehicle Type Distribution</h3>
                            <div className="h-[200px] flex items-center justify-center">
                                {typeDistribution.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={typeDistribution}
                                                dataKey="count"
                                                nameKey="label"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={45}
                                                outerRadius={75}
                                                strokeWidth={0}
                                            >
                                                {typeDistribution.map((entry, index) => (
                                                    <Cell key={index} fill={TYPE_COLORS[entry.type] || CHART_COLORS.primary} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-[#AEB9E1] text-xs">No data available</p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                                {typeDistribution.map((item, index) => (
                                    <span key={index} className="flex items-center gap-1 text-[10px] text-[#AEB9E1]">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[item.type] || CHART_COLORS.primary }} />
                                        {item.label} ({item.count})
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Booking Status Distribution */}
                        <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-5">
                            <h3 className="text-white text-sm font-medium mb-4">Booking Status</h3>
                            <div className="h-[200px] flex items-center justify-center">
                                {statusDistribution.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusDistribution}
                                                dataKey="count"
                                                nameKey="status"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={45}
                                                outerRadius={75}
                                                strokeWidth={0}
                                            >
                                                {statusDistribution.map((entry, index) => (
                                                    <Cell key={index} fill={STATUS_COLORS[entry.status] || CHART_COLORS.primary} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-[#AEB9E1] text-xs">No data available</p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                                {statusDistribution.map((item, index) => (
                                    <span key={index} className="flex items-center gap-1 text-[10px] text-[#AEB9E1]">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.status] || CHART_COLORS.primary }} />
                                        {item.status} ({item.count})
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Bookings & Revenue by Type */}
                        <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-5">
                            <h3 className="text-white text-sm font-medium mb-4">Bookings & Revenue by Type</h3>
                            {bookingsByType.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {bookingsByType.map((item, index) => {
                                        const maxBookings = Math.max(...bookingsByType.map(d => d.count), 1);
                                        const width = (item.count / maxBookings) * 100;
                                        const typeKey = item.type.toLowerCase();
                                        return (
                                            <div key={index} className="p-3 bg-[#081028] rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <TypeIcon type={typeKey} size={16} />
                                                        <span className="text-white text-xs font-medium">{item.type}</span>
                                                    </div>
                                                    <span className="text-[#14CA74] text-xs font-medium">{formatCurrency(item.revenue)}</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] text-[#AEB9E1] mb-1">
                                                    <span>{item.count} bookings</span>
                                                </div>
                                                <div className="w-full h-2 bg-[#343B4F] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${width}%`,
                                                            backgroundColor: TYPE_COLORS[typeKey] || CHART_COLORS.primary
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-[#AEB9E1] text-xs text-center py-8">No booking data yet</p>
                            )}
                        </div>
                    </div>

                    {/* Row 3: Manufacturer Distribution + Cancellation Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Manufacturer Distribution */}
                        <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-5">
                            <h3 className="text-white text-sm font-medium mb-4">Top Manufacturers</h3>
                            {manufacturerDistribution.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {manufacturerDistribution.map((item, index) => {
                                        const maxCount = Math.max(...manufacturerDistribution.map(d => d.count), 1);
                                        const width = (item.count / maxCount) * 100;
                                        const colors = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.purple, CHART_COLORS.teal, CHART_COLORS.orange, CHART_COLORS.danger];
                                        return (
                                            <div key={index} className="flex flex-col gap-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-[#AEB9E1]">{item.manufacturer}</span>
                                                    <span className="text-white font-medium">{item.count}</span>
                                                </div>
                                                <div className="w-full h-2 bg-[#343B4F] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${width}%`,
                                                            backgroundColor: colors[index % colors.length]
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-[#AEB9E1] text-xs text-center py-8">No manufacturer data</p>
                            )}
                        </div>

                        {/* Cancellation Analytics */}
                        <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-5">
                            <h3 className="text-white text-sm font-medium mb-4">Cancellation Overview</h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between p-3 bg-[#081028] rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <XCircle size={14} className="text-[#FF5A65]" />
                                        <span className="text-[#AEB9E1] text-xs">Total Cancellations</span>
                                    </div>
                                    <span className="text-white text-sm font-bold">{cancellation.totalCancellations || 0}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-[#081028] rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={14} className="text-[#AB47BC]" />
                                        <span className="text-[#AEB9E1] text-xs">Total Refunded</span>
                                    </div>
                                    <span className="text-white text-sm font-bold">{formatCurrency(cancellation.totalRefunded || 0)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-[#081028] rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle size={14} className="text-[#FF9800]" />
                                        <span className="text-[#AEB9E1] text-xs">Cancellation Rate</span>
                                    </div>
                                    <span className="text-white text-sm font-bold">
                                        {overview.totalBookings > 0
                                            ? `${((overview.cancelledBookings / overview.totalBookings) * 100).toFixed(1)}%`
                                            : "0%"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-[#081028] rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <XCircle size={14} className="text-[#FF5722]" />
                                        <span className="text-[#AEB9E1] text-xs">Rejected Vehicles</span>
                                    </div>
                                    <span className="text-white text-sm font-bold">{overview.rejectedVehicles || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 4: Top Vehicles + Pending Approvals */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Performing Vehicles */}
                        <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white text-sm font-medium">Top Performing Vehicles</h3>
                                <TrendingUp size={16} className="text-[#AEB9E1]" />
                            </div>
                            {topVehicles.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-[#343B4F]">
                                                <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2 pr-2">#</th>
                                                <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2">Vehicle</th>
                                                <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2">Owner</th>
                                                <th className="text-[#AEB9E1] text-[10px] font-normal text-right pb-2">Bookings</th>
                                                <th className="text-[#AEB9E1] text-[10px] font-normal text-right pb-2">Revenue</th>
                                                <th className="text-[#AEB9E1] text-[10px] font-normal text-right pb-2">Rating</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topVehicles.map((vh, index) => (
                                                <tr key={vh.id} className="border-b border-[#343B4F]/50 hover:bg-[#081028] transition-colors">
                                                    <td className="py-2.5 pr-2">
                                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                            index === 0 ? "bg-[#FDB52A20] text-[#FDB52A]" :
                                                            index === 1 ? "bg-[#AEB9E120] text-[#AEB9E1]" :
                                                            index === 2 ? "bg-[#8D6E6320] text-[#8D6E63]" :
                                                            "bg-[#343B4F] text-[#AEB9E1]"
                                                        }`}>
                                                            {index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5">
                                                        <div>
                                                            <p className="text-white text-[11px] font-medium">{vh.name}</p>
                                                            <VehicleTypeBadge type={vh.type} />
                                                        </div>
                                                    </td>
                                                    <td className="text-[#0955AC] text-[10px] py-2.5">{vh.owner}</td>
                                                    <td className="text-white text-[11px] text-right py-2.5">{vh.bookings}</td>
                                                    <td className="text-[#14CA74] text-[11px] text-right py-2.5">{formatCurrency(vh.revenue)}</td>
                                                    <td className="text-right py-2.5">
                                                        <span className="flex items-center justify-end gap-0.5 text-[#FDB52A] text-[11px]">
                                                            <Star size={10} fill="#FDB52A" /> {vh.rating}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-[#AEB9E1] text-xs text-center py-8">No vehicle performance data yet</p>
                            )}
                        </div>

                        {/* Pending Approvals */}
                        <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white text-sm font-medium">Pending Approvals</h3>
                                <span className="bg-[#FDB52A20] text-[#FDB52A] text-[10px] font-medium px-2 py-0.5 rounded-full">
                                    {pendingApprovals.length} pending
                                </span>
                            </div>
                            {pendingApprovals.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {pendingApprovals.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-[#081028] rounded-lg hover:border hover:border-[#343B4F] transition-all">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-white text-xs font-medium">{item.name}</p>
                                                    <VehicleTypeBadge type={item.type} />
                                                </div>
                                                <p className="text-[#AEB9E1] text-[10px] mt-1">
                                                    {item.owner} &bull; LKR {Number(item.price_per_day).toLocaleString()}/day &bull; {item.created_at}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleApprove(item.id)}
                                                    className="flex items-center gap-1 bg-[#05C16833] hover:bg-[#05C1684D] text-[#14CA74] text-[10px] px-3 py-1.5 rounded border border-[#05C16880] transition-colors"
                                                >
                                                    <CheckCircle size={10} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(item.id)}
                                                    className="flex items-center gap-1 bg-[#FF572233] hover:bg-[#FF57224D] text-[#FF5722] text-[10px] px-3 py-1.5 rounded border border-[#FF572280] transition-colors"
                                                >
                                                    <XCircle size={10} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <CheckCircle size={32} className="text-[#14CA74] mb-2" />
                                    <p className="text-[#AEB9E1] text-xs">All caught up! No pending approvals.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Row 5: Recent Bookings Table */}
                    <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white text-sm font-medium">Recent Bookings (All Types)</h3>
                            <button
                                onClick={() => setActiveTab("vehicles")}
                                className="text-[#0E43FB] text-xs hover:text-[#00C2FF] transition-colors flex items-center gap-1"
                            >
                                View All <ArrowUpRight size={12} />
                            </button>
                        </div>
                        {recentBookings.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[#343B4F]">
                                            <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2">ID</th>
                                            <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2">Type</th>
                                            <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2">Customer</th>
                                            <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2">Vehicle</th>
                                            <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2">Days</th>
                                            <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2">Status</th>
                                            <th className="text-[#AEB9E1] text-[10px] font-normal text-right pb-2">Amount</th>
                                            <th className="text-[#AEB9E1] text-[10px] font-normal text-right pb-2">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentBookings.map((booking) => (
                                            <tr key={`${booking.vehicle_type}-${booking.id}`} className="border-b border-[#343B4F]/30 hover:bg-[#081028] transition-colors">
                                                <td className="py-2.5">
                                                    <span className="text-[#0955AC] text-[11px] font-medium">#{booking.id}</span>
                                                </td>
                                                <td className="py-2.5">
                                                    <VehicleTypeBadge type={booking.vehicle_type.toLowerCase()} />
                                                </td>
                                                <td className="py-2.5">
                                                    <div>
                                                        <p className="text-white text-[11px]">{booking.customer}</p>
                                                        <p className="text-[#AEB9E1] text-[9px]">{booking.email}</p>
                                                    </div>
                                                </td>
                                                <td className="py-2.5">
                                                    <p className="text-white text-[11px]">{booking.vehicle}</p>
                                                </td>
                                                <td className="py-2.5 text-[#AEB9E1] text-[11px]">{booking.rental_days}</td>
                                                <td className="py-2.5"><StatusBadge status={booking.status} /></td>
                                                <td className="py-2.5 text-right">
                                                    <span className="text-white text-[11px] font-medium">{formatCurrency(booking.amount)}</span>
                                                </td>
                                                <td className="py-2.5 text-right">
                                                    <span className="text-[#AEB9E1] text-[10px]">{booking.created_at}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-[#AEB9E1] text-xs text-center py-8">No bookings yet</p>
                        )}
                    </div>
                </div>
            )}

            {/* Vehicles List Tab */}
            {activeTab === "vehicles" && (
                <VehicleListTab vehicles={vehicles} filters={filters} stats={stats} />
            )}
        </div>
    );
};

export default VehicleDashboardRightSide;
