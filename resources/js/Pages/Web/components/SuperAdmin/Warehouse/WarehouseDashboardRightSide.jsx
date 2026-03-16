import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import {
    BarChart3,
    Building2,
    TrendingUp,
    TrendingDown,
    DollarSign,
    CalendarCheck,
    Clock,
    XCircle,
    CheckCircle,
    AlertTriangle,
    ShieldAlert,
    Star,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    RefreshCw,
    LayoutDashboard,
    List,
    FileBarChart,
    Ban,
    Undo2,
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
    Legend,
} from "recharts";
import WarehouseListTab from "./WarehouseListTab";

const TABS = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "warehouses", label: "Warehouses", icon: List },
];

// Colors matching the app theme
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
    cold_storage: "#26A69A",
    dry: "#8D6E63",
    bonded: "#AB47BC",
    open_yard: "#2196F3",
    climate_controlled: "#4CAF50",
    hazmat: "#FF9800",
};

const STATUS_COLORS = {
    confirmed: "#14CA74",
    pending: "#FDB52A",
    cancelled: "#FF5A65",
    completed: "#0E43FB",
    expired: "#8D6E63",
};

const PAYMENT_COLORS = {
    paid: "#14CA74",
    pending: "#FDB52A",
    unpaid: "#FF5A65",
    refunded: "#AB47BC",
    partial: "#FF9800",
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

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1A2233] border border-[#343B4F] rounded-lg p-3 shadow-xl">
                <p className="text-white text-xs font-medium mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: {entry.name === "revenue" ? formatCurrency(entry.value) : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const WarehouseDashboardRightSide = ({
    warehouses = {},
    filters = {},
    error,
    dashboardData = {},
}) => {
    const [activeTab, setActiveTab] = useState("dashboard");

    const overview = dashboardData?.overview || {};
    const bookingTrends = dashboardData?.bookingTrends || [];
    const revenueTrends = dashboardData?.revenueTrends || [];
    const typeDistribution = dashboardData?.typeDistribution || [];
    const statusDistribution = dashboardData?.statusDistribution || [];
    const paymentDistribution = dashboardData?.paymentDistribution || [];
    const topWarehouses = dashboardData?.topWarehouses || [];
    const recentBookings = dashboardData?.recentBookings || [];
    const pendingApprovals = dashboardData?.pendingApprovals || [];
    const cancellation = dashboardData?.cancellationAnalytics || {};
    const storageTypeDemand = dashboardData?.storageTypeDemand || [];

    const handleRefresh = () => {
        router.reload({ only: ["dashboardData", "warehouses"] });
    };

    const handleApprove = (warehouseId) => {
        router.put(`/superadmin/warehouses/${warehouseId}/status`, { status: "approved" });
    };

    const handleReject = (warehouseId) => {
        router.put(`/superadmin/warehouses/${warehouseId}/status`, { status: "rejected" });
    };

    // Stat card component
    const StatCard = ({ icon: Icon, label, value, change, color, subLabel }) => (
        <div className="flex flex-col gap-2 border border-[#343B4F] bg-[#0B1739] rounded-lg p-4 hover:border-[#0E43FB]/50 transition-all duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-opacity-20`} style={{ backgroundColor: `${color}20` }}>
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

    // Approval status badge
    const StatusBadge = ({ status }) => {
        const styles = {
            approved: { bg: "bg-[#05C16833]", border: "border-[#05C16880]", text: "text-[#14CA74]", dot: "bg-[#14CA74]" },
            pending: { bg: "bg-[#FFB01633]", border: "border-[#FFB01680]", text: "text-[#FDB52A]", dot: "bg-[#FDB52A]" },
            confirmed: { bg: "bg-[#05C16833]", border: "border-[#05C16880]", text: "text-[#14CA74]", dot: "bg-[#14CA74]" },
            cancelled: { bg: "bg-[#FF5A6533]", border: "border-[#FF5A6580]", text: "text-[#FF5A65]", dot: "bg-[#FF5A65]" },
            rejected: { bg: "bg-[#FF572233]", border: "border-[#FF572280]", text: "text-[#FF5722]", dot: "bg-[#FF5722]" },
            suspended: { bg: "bg-[#FF5A6533]", border: "border-[#FF5A6580]", text: "text-[#FF5A65]", dot: "bg-[#FF5A65]" },
            paid: { bg: "bg-[#05C16833]", border: "border-[#05C16880]", text: "text-[#14CA74]", dot: "bg-[#14CA74]" },
            unpaid: { bg: "bg-[#FF572233]", border: "border-[#FF572280]", text: "text-[#FF5722]", dot: "bg-[#FF5722]" },
        };
        const s = styles[status] || styles.pending;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${s.bg} ${s.border} ${s.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {status}
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-6 poppins min-h-screen p-6 lg:px-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-white text-2xl font-semibold">Warehouse Management</h1>
                    <p className="text-[#AEB9E1] text-sm mt-1">Complete overview and management of all warehouse operations</p>
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
                            icon={Building2}
                            label="Total Warehouses"
                            value={formatNumber(overview.totalUnits)}
                            color={CHART_COLORS.primary}
                            subLabel={`${overview.approvedUnits || 0} active`}
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

                    {/* Second Row - Mini Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                        <div className="flex items-center gap-3 bg-[#0B1739] border border-[#343B4F] rounded-lg p-3">
                            <CheckCircle size={18} className="text-[#14CA74]" />
                            <div>
                                <p className="text-white text-lg font-bold">{overview.approvedUnits || 0}</p>
                                <p className="text-[#AEB9E1] text-[10px]">Approved</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-[#0B1739] border border-[#343B4F] rounded-lg p-3">
                            <Clock size={18} className="text-[#FDB52A]" />
                            <div>
                                <p className="text-white text-lg font-bold">{overview.pendingUnits || 0}</p>
                                <p className="text-[#AEB9E1] text-[10px]">Pending</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-[#0B1739] border border-[#343B4F] rounded-lg p-3">
                            <ShieldAlert size={18} className="text-[#FF5A65]" />
                            <div>
                                <p className="text-white text-lg font-bold">{overview.suspendedUnits || 0}</p>
                                <p className="text-[#AEB9E1] text-[10px]">Suspended</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-[#0B1739] border border-[#343B4F] rounded-lg p-3">
                            <XCircle size={18} className="text-[#FF5722]" />
                            <div>
                                <p className="text-white text-lg font-bold">{overview.rejectedUnits || 0}</p>
                                <p className="text-[#AEB9E1] text-[10px]">Rejected</p>
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
                            <Ban size={18} className="text-[#AB47BC]" />
                            <div>
                                <p className="text-white text-lg font-bold">{cancellation.totalCancellations || 0}</p>
                                <p className="text-[#AEB9E1] text-[10px]">Cancellations</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 1: Revenue Trend + Booking Trends */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Trend Area Chart */}
                        <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-white text-sm font-medium">Revenue Trend</h3>
                                    <p className="text-[#AEB9E1] text-xs mt-0.5">Last 12 months</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-[#0E43FB20] text-[#0E43FB]">
                                    <TrendingUp size={12} />
                                    Revenue
                                </div>
                            </div>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueTrends}>
                                        <defs>
                                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
                                                <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#343B4F" />
                                        <XAxis dataKey="month" stroke="#AEB9E1" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#AEB9E1" tick={{ fontSize: 10 }} axisLine={false} tickLine={false}
                                            tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.primary} fill="url(#revenueGrad)" strokeWidth={2} />
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

                    {/* Charts Row 2: Type Distribution + Booking Status + Payment Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Warehouse Type Distribution */}
                        <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-5">
                            <h3 className="text-white text-sm font-medium mb-4">Warehouse Types</h3>
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
                            <div className="flex flex-wrap gap-2 mt-2">
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
                            <div className="flex flex-wrap gap-2 mt-2">
                                {statusDistribution.map((item, index) => (
                                    <span key={index} className="flex items-center gap-1 text-[10px] text-[#AEB9E1]">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.status] || CHART_COLORS.primary }} />
                                        {item.status} ({item.count})
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Payment Status Distribution */}
                        <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-5">
                            <h3 className="text-white text-sm font-medium mb-4">Payment Status</h3>
                            <div className="h-[200px] flex items-center justify-center">
                                {paymentDistribution.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={paymentDistribution}
                                                dataKey="count"
                                                nameKey="status"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={45}
                                                outerRadius={75}
                                                strokeWidth={0}
                                            >
                                                {paymentDistribution.map((entry, index) => (
                                                    <Cell key={index} fill={PAYMENT_COLORS[entry.status] || CHART_COLORS.primary} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-[#AEB9E1] text-xs">No data available</p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {paymentDistribution.map((item, index) => (
                                    <span key={index} className="flex items-center gap-1 text-[10px] text-[#AEB9E1]">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[item.status] || CHART_COLORS.primary }} />
                                        {item.status} ({item.count})
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Occupancy + Storage Demand + Cancellation */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Occupancy Gauge */}
                        <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-5">
                            <h3 className="text-white text-sm font-medium mb-4">Occupancy Rate</h3>
                            <div className="flex flex-col items-center justify-center py-4">
                                <div className="relative w-36 h-36">
                                    <svg viewBox="0 0 120 120" className="w-full h-full">
                                        <circle cx="60" cy="60" r="50" fill="none" stroke="#343B4F" strokeWidth="10" />
                                        <circle
                                            cx="60" cy="60" r="50" fill="none"
                                            stroke={overview.occupancyRate >= 70 ? CHART_COLORS.success : overview.occupancyRate >= 40 ? CHART_COLORS.warning : CHART_COLORS.danger}
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(overview.occupancyRate / 100) * 314} 314`}
                                            transform="rotate(-90 60 60)"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-white text-2xl font-bold">{overview.occupancyRate || 0}%</span>
                                        <span className="text-[#AEB9E1] text-[10px]">Utilized</span>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-4 text-xs text-[#AEB9E1]">
                                    <span>{overview.approvedUnits || 0} Active</span>
                                    <span>of {overview.totalUnits || 0} Total</span>
                                </div>
                            </div>
                        </div>

                        {/* Storage Type Demand */}
                        <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-5">
                            <h3 className="text-white text-sm font-medium mb-4">Storage Type Demand</h3>
                            {storageTypeDemand.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {storageTypeDemand.map((item, index) => {
                                        const maxDemand = Math.max(...storageTypeDemand.map(d => d.demand), 1);
                                        const width = (item.demand / maxDemand) * 100;
                                        return (
                                            <div key={index} className="flex flex-col gap-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-[#AEB9E1] capitalize">{item.type?.replace(/_/g, ' ') || 'Unknown'}</span>
                                                    <span className="text-white font-medium">{item.demand}</span>
                                                </div>
                                                <div className="w-full h-2 bg-[#343B4F] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${width}%`,
                                                            backgroundColor: TYPE_COLORS[item.type] || CHART_COLORS.primary
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-[#AEB9E1] text-xs text-center py-8">No demand data yet</p>
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
                                        <Undo2 size={14} className="text-[#AB47BC]" />
                                        <span className="text-[#AEB9E1] text-xs">Total Refunded</span>
                                    </div>
                                    <span className="text-white text-sm font-bold">{formatCurrency(cancellation.totalRefunded || 0)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-[#081028] rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-[#FDB52A]" />
                                        <span className="text-[#AEB9E1] text-xs">Pending Refunds</span>
                                    </div>
                                    <span className="text-white text-sm font-bold">{cancellation.pendingRefunds || 0}</span>
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
                            </div>
                        </div>
                    </div>

                    {/* Row 4: Top Warehouses + Pending Approvals */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Performing Warehouses */}
                        <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white text-sm font-medium">Top Performing Warehouses</h3>
                                <BarChart3 size={16} className="text-[#AEB9E1]" />
                            </div>
                            {topWarehouses.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-[#343B4F]">
                                                <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2 pr-2">#</th>
                                                <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2">Warehouse</th>
                                                <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2">Owner</th>
                                                <th className="text-[#AEB9E1] text-[10px] font-normal text-right pb-2">Bookings</th>
                                                <th className="text-[#AEB9E1] text-[10px] font-normal text-right pb-2">Revenue</th>
                                                <th className="text-[#AEB9E1] text-[10px] font-normal text-right pb-2">Rating</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topWarehouses.map((wh, index) => (
                                                <tr key={wh.id} className="border-b border-[#343B4F]/50 hover:bg-[#081028] transition-colors">
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
                                                            <p className="text-white text-[11px] font-medium">{wh.name}</p>
                                                            <p className="text-[#AEB9E1] text-[9px] capitalize">{wh.type?.replace(/_/g, ' ')}</p>
                                                        </div>
                                                    </td>
                                                    <td className="text-[#0955AC] text-[10px] py-2.5">{wh.owner}</td>
                                                    <td className="text-white text-[11px] text-right py-2.5">{wh.bookings}</td>
                                                    <td className="text-[#14CA74] text-[11px] text-right py-2.5">{formatCurrency(wh.revenue)}</td>
                                                    <td className="text-right py-2.5">
                                                        <span className="flex items-center justify-end gap-0.5 text-[#FDB52A] text-[11px]">
                                                            <Star size={10} fill="#FDB52A" /> {wh.rating}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-[#AEB9E1] text-xs text-center py-8">No warehouse performance data yet</p>
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
                                                <p className="text-white text-xs font-medium">{item.name}</p>
                                                <p className="text-[#AEB9E1] text-[10px]">
                                                    {item.owner} &bull; {item.type?.replace(/_/g, ' ')} &bull; {item.created_at}
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
                            <h3 className="text-white text-sm font-medium">Recent Bookings</h3>
                            <button
                                onClick={() => setActiveTab("warehouses")}
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
                                            <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2">Reference</th>
                                            <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2">Customer</th>
                                            <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2">Warehouse</th>
                                            <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2">Period</th>
                                            <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2">Status</th>
                                            <th className="text-[#AEB9E1] text-[10px] font-normal text-left pb-2">Payment</th>
                                            <th className="text-[#AEB9E1] text-[10px] font-normal text-right pb-2">Amount</th>
                                            <th className="text-[#AEB9E1] text-[10px] font-normal text-right pb-2">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentBookings.map((booking) => (
                                            <tr key={booking.id} className="border-b border-[#343B4F]/30 hover:bg-[#081028] transition-colors">
                                                <td className="py-2.5">
                                                    <span className="text-[#0955AC] text-[11px] font-medium">{booking.reference || `#${booking.id}`}</span>
                                                </td>
                                                <td className="py-2.5">
                                                    <div>
                                                        <p className="text-white text-[11px]">{booking.customer}</p>
                                                        <p className="text-[#AEB9E1] text-[9px]">{booking.email}</p>
                                                    </div>
                                                </td>
                                                <td className="py-2.5">
                                                    <div>
                                                        <p className="text-white text-[11px]">{booking.warehouse}</p>
                                                        <p className="text-[#AEB9E1] text-[9px] capitalize">{booking.warehouse_type?.replace(/_/g, ' ')}</p>
                                                    </div>
                                                </td>
                                                <td className="py-2.5">
                                                    <p className="text-[#AEB9E1] text-[10px]">{booking.start_date}</p>
                                                    <p className="text-[#AEB9E1] text-[9px]">to {booking.end_date}</p>
                                                </td>
                                                <td className="py-2.5"><StatusBadge status={booking.status} /></td>
                                                <td className="py-2.5"><StatusBadge status={booking.payment_status} /></td>
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

            {/* Warehouses List Tab */}
            {activeTab === "warehouses" && (
                <WarehouseListTab warehouses={warehouses} filters={filters} error={error} />
            )}
        </div>
    );
};

export default WarehouseDashboardRightSide;
