import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Ship,
    Plane,
    Boxes,
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
    Weight,
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

// ---------- Mock Data (Freight Bookings) ----------
const monthly = [
    { month: "Jan", fcl: 220, lcl: 140, air: 80 },
    { month: "Feb", fcl: 240, lcl: 130, air: 90 },
    { month: "Mar", fcl: 260, lcl: 160, air: 110 },
    { month: "Apr", fcl: 280, lcl: 170, air: 120 },
    { month: "May", fcl: 300, lcl: 190, air: 130 },
    { month: "Jun", fcl: 290, lcl: 200, air: 150 },
    { month: "Jul", fcl: 310, lcl: 210, air: 160 },
    { month: "Aug", fcl: 320, lcl: 215, air: 170 },
    { month: "Sep", fcl: 300, lcl: 205, air: 155 },
    { month: "Oct", fcl: 280, lcl: 190, air: 145 },
    { month: "Nov", fcl: 270, lcl: 185, air: 135 },
    { month: "Dec", fcl: 260, lcl: 175, air: 120 },
];

const services = {
    fcl: [
        {
            id: "FCL-001",
            name: "CMB (Colombo) → SIN (Singapore)",
            rating: 4.7,
            origin: "Colombo Port",
            price: 1200,
            unit: "20' container",
        },
        {
            id: "FCL-002",
            name: "CMB (Colombo) → DXB (Jebel Ali)",
            rating: 4.6,
            origin: "Colombo Port",
            price: 2100,
            unit: "40' container",
        },
        {
            id: "FCL-003",
            name: "HBA (Hambantota) → MAA (Chennai)",
            rating: 4.5,
            origin: "Hambantota",
            price: 980,
            unit: "20' container",
        },
    ],
    lcl: [
        {
            id: "LCL-101",
            name: "Colombo → Singapore",
            rating: 4.6,
            origin: "Colombo Port",
            price: 45,
            unit: "cbm",
        },
        {
            id: "LCL-102",
            name: "Colombo → Dubai",
            rating: 4.5,
            origin: "Colombo Port",
            price: 52,
            unit: "cbm",
        },
        {
            id: "LCL-103",
            name: "Colombo → Malaysia",
            rating: 4.4,
            origin: "Colombo Port",
            price: 48,
            unit: "cbm",
        },
    ],
    air: [
        {
            id: "AIR-501",
            name: "CMB (BIA) → SIN (Changi)",
            rating: 4.8,
            origin: "BIA (CMB)",
            price: 3.9,
            unit: "kg",
        },
        {
            id: "AIR-502",
            name: "CMB (BIA) → DXB (Dubai)",
            rating: 4.7,
            origin: "BIA (CMB)",
            price: 4.2,
            unit: "kg",
        },
    ],
};

const bookings = [
    {
        code: "FB-202508-001",
        mode: "fcl",
        item: "20' FCL – Colombo → Singapore",
        from: "2025-08-30 10:00",
        to: "2025-09-12 16:00",
        hub: "Colombo Port",
        status: "confirmed",
        amount: 1200,
    },
    {
        code: "FB-202508-002",
        mode: "lcl",
        item: "LCL 4.2 cbm – Colombo → Dubai",
        from: "2025-08-29 09:30",
        to: "2025-09-05 18:00",
        hub: "Colombo Port",
        status: "paid",
        amount: 218.4, // 4.2 * 52
    },
    {
        code: "FB-202508-003",
        mode: "air",
        item: "Air 180 kg – CMB → SIN",
        from: "2025-09-02 07:00",
        to: "2025-09-02 20:30",
        hub: "BIA (CMB)",
        status: "pending",
        amount: 702, // 180 * 3.9
    },
    {
        code: "FB-202508-004",
        mode: "fcl",
        item: "40' FCL – Colombo → Jebel Ali",
        from: "2025-08-26 14:00",
        to: "2025-09-09 11:00",
        hub: "Colombo Port",
        status: "cancelled",
        amount: 2100,
    },
];

// ---------- Helpers ----------
const ModeIcon = ({ mode, className }) => {
    if (mode === "air") return <Plane className={className} />;
    if (mode === "lcl") return <Boxes className={className} />;
    return <Ship className={className} />; // fcl default
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
};

const pieData = [
    { name: "FCL", value: monthly.reduce((a, b) => a + b.fcl, 0) },
    { name: "LCL", value: monthly.reduce((a, b) => a + b.lcl, 0) },
    { name: "Air", value: monthly.reduce((a, b) => a + b.air, 0) },
];

const Hero = () => {
    const [mode, setMode] = useState("all");
    const [q, setQ] = useState("");
    const [origin, setOrigin] = useState("all");
    const [sort, setSort] = useState("popular");

    const filteredServices = useMemo(() => {
        const pool =
            mode === "all"
                ? [...services.fcl, ...services.lcl, ...services.air]
                : services[mode] ?? [];
        return pool
            .filter((s) => {
                const text = `${s.name} ${s.origin}`.toLowerCase();
                const okQ = q ? text.includes(q.toLowerCase()) : true;
                const okLoc = origin === "all" ? true : s.origin === origin;
                return okQ && okLoc;
            })
            .sort((a, b) => {
                if (sort === "price") return a.price - b.price;
                if (sort === "rating") return b.rating - a.rating;
                return b.rating - a.rating; // popular ~ rating
            });
    }, [mode, q, origin, sort]);

    const origins = useMemo(() => {
        const set = new Set(["Colombo Port", "Hambantota", "BIA (CMB)"]); // ports/hubs
        return ["all", ...Array.from(set)];
    }, []);

    const upcoming = bookings.filter((r) =>
        ["confirmed", "paid", "pending"].includes(r.status)
    );

    return (
        <div className="min-h-screen w-full bg-[#E5E5E5] md:p-20 poppins">
            <div className="mx-auto max-w-[1300px]">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 md:mb-10 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold tracking-tight md:text-[35px]">
                            <span className="text-[#0955AC]">
                                Freight Booking
                            </span>{" "}
                            Dashboard
                        </h1>
                        <p className="text-slate-600 text-[14px]">
                            Plan, book, and manage shipments across FCL • LCL •
                            Air.
                        </p>
                    </div>
                    <div className="flex gap-2 justify-center items-center">
                        <button className="inline-flex items-center h-10 px-6 py-6 rounded-2xl border border-slate-200 text-[16px] font-medium">
                            <Download className="mr-2 h-7 w-7" /> Export
                        </button>
                        <button className="inline-flex items-center h-10 px-6 py-6 rounded-2xl bg-[#0955AC] text-white text-[16px] font-medium">
                            <Plus className="mr-2 h-6 w-6" /> New Booking
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="px-5 pt-5 pb-2">
                            <p className="flex items-center gap-3 text-[#7B7B7A] text-[16px] font-[700]">
                                <Ship className="h-8 w-8" /> TEUs This Month
                            </p>
                            <h3 className="text-[26px] font-[700] text-[#0955AC]">
                                612
                            </h3>
                        </div>
                        <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
                            +4% vs last month
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="px-5 pt-5 pb-2">
                            <p className="flex items-center gap-3 text-[#7B7B7A] text-[16px] font-[700]">
                                <Boxes className="h-8 w-8" /> LCL in Transit
                                (cbm)
                            </p>
                            <h3 className="text-[26px] font-[700] text-[#0955AC]">
                                1,420
                            </h3>
                        </div>
                        <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
                            6 groupage lanes
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="px-5 pt-5 pb-2">
                            <p className="flex items-center gap-3 text-[#7B7B7A] text-[16px] font-[700]">
                                <Plane className="h-8 w-8" /> Air Booked (kg)
                            </p>
                            <h3 className="text-[26px] font-[700] text-[#0955AC]">
                                18,900
                            </h3>
                        </div>
                        <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
                            3 flights this week
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
                                        FCL • LCL • Air (year to date)
                                    </p>
                                </div>
                                <button className="inline-flex items-center h-10 px-3 rounded-xl border border-slate-200 text-[12px] font-[600] hover:bg-slate-100">
                                    <Filter className="mr-2 h-4 w-4" /> View
                                </button>
                            </div>
                        </div>
                        <div className="px-10 pb-10 pt-10">
                            <div
                                className="h-[350px] w-full focus:outline-none"
                                style={{
                                    WebkitTapHighlightColor: "transparent",
                                    outline: "none",
                                }}
                            >
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                    className="focus:outline-none"
                                    tabIndex={-1}
                                    style={{
                                        WebkitTapHighlightColor: "transparent",
                                        outline: "none",
                                    }}
                                >
                                    <AreaChart
                                        data={monthly}
                                        margin={{ left: 8, right: 8, top: 10 }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="gFCL"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#3b82f6"
                                                    stopOpacity={0.35}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#3b82f6"
                                                    stopOpacity={0.02}
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="gLCL"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#0955AC"
                                                    stopOpacity={0.35}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#0955AC"
                                                    stopOpacity={0.02}
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="gAir"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#6366f1"
                                                    stopOpacity={0.35}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#6366f1"
                                                    stopOpacity={0.02}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            vertical={false}
                                            horizontal={true}
                                        />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <RTooltip />
                                        <Area
                                            type="monotone"
                                            dataKey="fcl"
                                            name="FCL"
                                            stroke="#3b82f6"
                                            fill="url(#gFCL)"
                                            strokeWidth={4}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="lcl"
                                            name="LCL"
                                            stroke="#0955AC"
                                            fill="url(#gLCL)"
                                            strokeWidth={4}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="air"
                                            name="Air"
                                            stroke="#6366f1"
                                            fill="url(#gAir)"
                                            strokeWidth={4}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
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
                            <div
                                className="h-[350px] w-full"
                                style={{
                                    WebkitTapHighlightColor: "transparent",
                                    outline: "none",
                                }}
                            >
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                    className="focus:outline-none"
                                    tabIndex={-1}
                                    style={{
                                        WebkitTapHighlightColor: "transparent",
                                        outline: "none",
                                    }}
                                >
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={90}
                                            outerRadius={140}
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="name"
                                            cornerRadius={8}
                                        >
                                            {pieData.map((_, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={
                                                        [
                                                            "#3b82f6",
                                                            "#0955AC",
                                                            "#6366f1",
                                                        ][i]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <RTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 flex items-center justify-center gap-4 text-[14px] text-slate-600">
                                <div className="flex items-center gap-2">
                                    <span className="h-5 w-5 rounded-full bg-[#3b82f6]" />{" "}
                                    FCL
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-5 w-5 rounded-full bg-[#0955AC]" />{" "}
                                    LCL
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-5 w-5 rounded-full bg-indigo-500" />{" "}
                                    Air
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="mb-8 rounded-2xl">
                    <div className="px-4 pb-4 pt-6">
                        <div className="grid items-center gap-3 md:grid-cols-2 lg:grid-cols-4 font-[600]">
                            {/* Search */}
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search routes, ports, airports…"
                                    className="h-12 w-full rounded-[10px] border border-slate-300 bg-white pl-9 px-3 text-[14px] placeholder:text-slate-400 focus:outline-none"
                                />
                            </div>

                            {/* Mode select */}
                            <div>
                                <select
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value)}
                                    className="h-12 w-full rounded-[10px] border border-slate-300 bg-white px-3 text-[14px] focus:outline-none"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="fcl">FCL</option>
                                    <option value="lcl">LCL</option>
                                    <option value="air">Air</option>
                                </select>
                            </div>

                            {/* Origin select */}
                            <div>
                                <select
                                    value={origin}
                                    onChange={(e) => setOrigin(e.target.value)}
                                    className="h-12 w-full rounded-[10px] border border-slate-300 bg-white px-3 text-[14px] focus:outline-none"
                                >
                                    {origins.map((o) => (
                                        <option key={o} value={o}>
                                            {o === "all" ? "All Origins" : o}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort select */}
                            <div>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="h-12 w-full rounded-[10px] border border-slate-300 bg-white px-3 text-[14px] focus:outline-none"
                                >
                                    <option value="popular">
                                        Most Popular
                                    </option>
                                    <option value="price">Price (Asc)</option>
                                    <option value="rating">
                                        Rating (Desc)
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services & Upcoming */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-[20px] font-[600]">
                                Available Services
                            </h2>

                            {/* Tabs */}
                            <div className="hidden sm:block">
                                <div className="rounded-2xl inline-flex gap-2">
                                    {[
                                        {
                                            val: "all",
                                            label: "All",
                                            icon: null,
                                        },
                                        {
                                            val: "fcl",
                                            label: "FCL",
                                            icon: Ship,
                                        },
                                        {
                                            val: "lcl",
                                            label: "LCL",
                                            icon: Boxes,
                                        },
                                        {
                                            val: "air",
                                            label: "Air",
                                            icon: Plane,
                                        },
                                    ].map(({ val, label, icon: Icon }) => {
                                        const active =
                                            mode === val ||
                                            (val === "all" && mode === "all");
                                        return (
                                            <button
                                                key={val}
                                                onClick={() => setMode(val)}
                                                className={`px-8 py-2 rounded-xl border text-[12px] font-[600] transition ${
                                                    active
                                                        ? "bg-[#0955AC] text-white border-[#0955AC]"
                                                        : "border-slate-200 hover:bg-slate-100"
                                                }`}
                                            >
                                                <span className="inline-flex items-center gap-2">
                                                    {Icon ? (
                                                        <Icon className="h-8 w-8" />
                                                    ) : null}
                                                    {label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Service grid */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {filteredServices.map((s) => (
                                <motion.div
                                    key={s.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <div className="group rounded-2xl bg-white border border-slate-200 shadow-sm">
                                        <div className="px-10 pt-10 pb-5">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-[18px] font-semibold leading-none tracking-tight">
                                                        {s.name}
                                                    </h3>
                                                    <p className="mt-1 flex items-center gap-2 text-[12px] text-slate-500">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {s.origin}
                                                    </p>
                                                </div>
                                                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-semibold bg-slate-50 text-slate-700">
                                                    <Star className="mr-1 h-4 w-4" />
                                                    {s.rating}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="px-10 pb-10 flex items-end justify-between gap-2">
                                            <div className="text-[14px] text-slate-600">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <CreditCard className="h-4 w-4" />
                                                    <span className="font-medium">
                                                        {s.unit === "kg" ||
                                                        s.unit === "cbm"
                                                            ? `${s.price}/${s.unit}`
                                                            : `LKR ${s.price}`}
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex items-center gap-2 text-slate-500">
                                                    <Clock className="h-4 w-4" />{" "}
                                                    Schedule weekly sailings
                                                </div>
                                            </div>
                                            <button className="h-10 px-4 rounded-xl bg-[#0955AC] text-white text-[14px] font-medium hover:bg-[#0955AC]">
                                                Book{" "}
                                                <ChevronRight className="ml-1 h-4 w-4 inline-block" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {filteredServices.length === 0 && (
                                <div className="rounded-2xl border-dashed border border-slate-200 bg-white">
                                    <div className="px-4 py-10 text-center text-slate-500">
                                        No results. Try changing filters.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Upcoming + Quick Actions */}
                    <div className="space-y-4">
                        {/* Upcoming */}
                        <div className="rounded-2xl bg-white shadow-sm">
                            <div className="px-10 pt-10 pb-5">
                                <h3 className="font-semibold leading-none tracking-tight text-[18px]">
                                    Upcoming Shipments
                                </h3>
                                <p className="text-[14px] text-slate-500 mt-1">
                                    Next sailings and flights
                                </p>
                            </div>
                            <div className="px-10 pb-10 space-y-6 text-[14px]">
                                {upcoming.map((r) => (
                                    <div
                                        key={r.code}
                                        className="rounded-2xl border p-5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <ModeIcon
                                                    mode={r.mode}
                                                    className="h-7 w-7"
                                                />
                                                <span className="font-medium">
                                                    {r.item}
                                                </span>
                                            </div>
                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-[10px] ${
                                                    statusMap[r.status].tone
                                                }`}
                                            >
                                                {statusMap[r.status].label}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-[12px] text-slate-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {r.from} → {r.to}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-sm text-slate-500">
                                            Hub: {r.hub}
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-[12px]">
                                            <span className="text-slate-500">
                                                Ref: {r.code}
                                            </span>
                                            <button className="h-8 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm">
                                                Manage
                                            </button>
                                        </div>
                                    </div>
                                ))}
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
                            <div className="px-10 pb-10 grid grid-cols-2 gap-2 font-[500]">
                                <button className="h-12 px-3 rounded-2xl border border-slate-200 text-left text-[12px] hover:bg-slate-100 inline-flex items-center">
                                    <Ship className="mr-2 h-7 w-7" /> Book FCL
                                </button>
                                <button className="h-12 px-3 rounded-2xl border border-slate-200 text-left text-[12px] hover:bg-slate-100 inline-flex items-center">
                                    <Boxes className="mr-2 h-7 w-7" /> Book LCL
                                </button>
                                <button className="h-12 px-3 rounded-2xl border border-slate-200 text-left text-[12px] hover:bg-slate-100 inline-flex items-center">
                                    <Plane className="mr-2 h-7 w-7" /> Book Air
                                </button>
                                <button className="h-12 px-3 rounded-2xl border border-slate-200 text-left text-[12px] hover:bg-slate-100 inline-flex items-center">
                                    <Calendar className="mr-2 h-7 w-7" /> Change
                                    Dates
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Table */}
                <div className="mt-8 rounded-2xl bg-white shadow-sm">
                    <div className="px-10 pt-10 pb-5">
                        <h3 className="font-semibold leading-none tracking-tight text-[18px]">
                            Recent Activity
                        </h3>
                        <p className="text-[14px] text-slate-500 mt-1">
                            Latest bookings and changes
                        </p>
                    </div>
                    <div className="px-10 pb-10">
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto border-separate border-spacing-y-5 text-[14px]">
                                <thead>
                                    <tr className="text-left text-slate-500">
                                        <th className="px-3 py-2">Category</th>
                                        <th className="px-3 py-2">Service</th>
                                        <th className="px-3 py-2">From</th>
                                        <th className="px-3 py-2">To</th>
                                        <th className="px-3 py-2">Hub</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2 text-right">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((r) => (
                                        <tr
                                            key={r.code}
                                            className="rounded-xl bg-white shadow-sm"
                                        >
                                            <td className="px-3 py-3">
                                                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-2 py-1 text-slate-700">
                                                    <ModeIcon
                                                        mode={r.mode}
                                                        className="h-4 w-4"
                                                    />
                                                    {r.mode.toUpperCase()}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 font-medium">
                                                {r.item}
                                            </td>
                                            <td className="px-3 py-3 text-slate-600">
                                                {r.from}
                                            </td>
                                            <td className="px-3 py-3 text-slate-600">
                                                {r.to}
                                            </td>
                                            <td className="px-3 py-3 text-slate-600">
                                                {r.hub}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span
                                                    className={`rounded-full border px-2 py-0.5 text-xs ${
                                                        statusMap[r.status].tone
                                                    }`}
                                                >
                                                    {statusMap[r.status].label}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-right font-medium">
                                                {typeof r.amount === "number"
                                                    ? `LKR ${r.amount.toFixed(
                                                          2
                                                      )}`
                                                    : r.amount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} Freight Portal · FCL • LCL •
                    Air
                </div>
            </div>
        </div>
    );
};

export default Hero;
