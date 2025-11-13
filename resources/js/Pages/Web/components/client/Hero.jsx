import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Car,
    Plane,
    Ship,
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

// ---------- Mock Data ----------
const monthly = [
    { month: "Jan", land: 22, air: 8, sea: 12 },
    { month: "Feb", land: 25, air: 7, sea: 14 },
    { month: "Mar", land: 28, air: 10, sea: 16 },
    { month: "Apr", land: 30, air: 12, sea: 18 },
    { month: "May", land: 33, air: 11, sea: 20 },
    { month: "Jun", land: 31, air: 13, sea: 21 },
    { month: "Jul", land: 35, air: 15, sea: 22 },
    { month: "Aug", land: 36, air: 16, sea: 23 },
    { month: "Sep", land: 34, air: 14, sea: 21 },
    { month: "Oct", land: 32, air: 13, sea: 19 },
    { month: "Nov", land: 29, air: 12, sea: 18 },
    { month: "Dec", land: 27, air: 9, sea: 16 },
];

const fleets = {
    land: [
        {
            id: "L-001",
            name: "SUV – Ranger X",
            rating: 4.7,
            location: "Colombo",
            price: 68,
            unit: "day",
        },
        {
            id: "L-002",
            name: "Sedan – Swift S",
            rating: 4.5,
            location: "Kandy",
            price: 45,
            unit: "day",
        },
        {
            id: "L-003",
            name: "Van – Comfort Pro",
            rating: 4.8,
            location: "Galle",
            price: 80,
            unit: "day",
        },
    ],
    air: [
        {
            id: "A-101",
            name: "Cessna 172",
            rating: 4.9,
            location: "Ratmalana",
            price: 350,
            unit: "hr",
        },
        {
            id: "A-102",
            name: "Helicopter – H125",
            rating: 4.6,
            location: "Katunayake",
            price: 1200,
            unit: "hr",
        },
    ],
    sea: [
        {
            id: "S-501",
            name: "Speedboat – Wave 24",
            rating: 4.4,
            location: "Trincomalee",
            price: 180,
            unit: "hr",
        },
        {
            id: "S-502",
            name: "Yacht – Oceanis 38",
            rating: 4.9,
            location: "Bentota",
            price: 950,
            unit: "day",
        },
    ],
};

const reservations = [
    {
        code: "BK-202508-001",
        mode: "land",
        item: "SUV – Ranger X",
        from: "2025-09-01 09:00",
        to: "2025-09-05 18:00",
        pickup: "Colombo",
        status: "confirmed",
        amount: 272,
    },
    {
        code: "BK-202508-002",
        mode: "air",
        item: "Cessna 172",
        from: "2025-09-10 07:00",
        to: "2025-09-10 11:00",
        pickup: "Ratmalana",
        status: "pending",
        amount: 1400,
    },
    {
        code: "BK-202508-003",
        mode: "sea",
        item: "Yacht – Oceanis 38",
        from: "2025-10-02 12:00",
        to: "2025-10-04 12:00",
        pickup: "Bentota",
        status: "paid",
        amount: 1900,
    },
    {
        code: "BK-202508-004",
        mode: "land",
        item: "Van – Comfort Pro",
        from: "2025-08-28 08:00",
        to: "2025-08-29 20:00",
        pickup: "Galle",
        status: "cancelled",
        amount: 80,
    },
];

// ---------- Helpers ----------
const ModeIcon = ({ mode, className }) => {
    if (mode === "air") return <Plane className={className} />;
    if (mode === "sea") return <Ship className={className} />;
    return <Car className={className} />;
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
    { name: "Land", value: monthly.reduce((a, b) => a + b.land, 0) },
    { name: "Air", value: monthly.reduce((a, b) => a + b.air, 0) },
    { name: "Sea", value: monthly.reduce((a, b) => a + b.sea, 0) },
];

const Hero = () => {
    const [mode, setMode] = useState("all");
    const [q, setQ] = useState("");
    const [location, setLocation] = useState("all");
    const [sort, setSort] = useState("popular");

    const filteredFleets = useMemo(() => {
        const pool =
            mode === "all"
                ? [...fleets.land, ...fleets.air, ...fleets.sea]
                : fleets[mode] ?? [];
        return pool
            .filter((f) => {
                const text = `${f.name} ${f.location}`.toLowerCase();
                const okQ = q ? text.includes(q.toLowerCase()) : true;
                const okLoc =
                    location === "all" ? true : f.location === location;
                return okQ && okLoc;
            })
            .sort((a, b) => {
                if (sort === "price") return a.price - b.price;
                if (sort === "rating") return b.rating - a.rating;
                return b.rating - a.rating; // popular ~ rating
            });
    }, [mode, q, location, sort]);

    const locations = useMemo(() => {
        const set = new Set([
            "Colombo",
            "Kandy",
            "Galle",
            "Ratmalana",
            "Katunayake",
            "Trincomalee",
            "Bentota",
        ]);
        return ["all", ...Array.from(set)];
    }, []);

    const upcoming = reservations.filter((r) =>
        ["confirmed", "paid", "pending"].includes(r.status)
    );

    return (
        <div className="min-h-screen w-full bg-[#E5E5E5] md:p-20 poppins">
            <div className="mx-auto max-w-[1300px]">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 md:mb-10 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold tracking-tight md:text-[35px]">
                            <span className="text-[#0955AC]">Vehicle Rentals</span>{" "}
                            Dashboard
                        </h1>
                        <p className="text-slate-600 text-[14px]">
                            Plan, book, and manage rentals across Land, Air, and
                            Sea.
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
                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="px-5 pt-5 pb-2">
                            <p className="flex items-center gap-3 text-[#7B7B7A] text-[16px] font-[700]">
                                <Car className="h-8 w-8" /> Active Land Rentals
                            </p>
                            <h3 className="text-[26px] font-[700] text-[#0955AC]">
                                12
                            </h3>
                        </div>
                        <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
                            +3 this week
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="px-5 pt-5 pb-2">
                            <p className="flex items-center gap-3 text-[#7B7B7A] text-[16px] font-[700]">
                                <Plane className="h-8 w-8" /> Scheduled Flight
                                Hours
                            </p>
                            <h3 className="text-[26px] font-[700] text-[#0955AC]">
                                47h
                            </h3>
                        </div>
                        <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
                            2 upcoming missions
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="px-5 pt-5 pb-2">
                            <p className="flex items-center gap-3 text-[#7B7B7A] text-[16px] font-[700]">
                                <Ship className="h-8 w-8" /> Sea Trips This
                                Month
                            </p>
                            <h3 className="text-[26px] font-[700] text-[#0955AC]">
                                9
                            </h3>
                        </div>
                        <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
                            +2 vs last month
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
                                        Land • Air • Sea (year to date)
                                    </p>
                                </div>
                                {/* Placeholder view control */}
                                <button className="inline-flex items-center h-10 px-3 rounded-xl border border-slate-200 text-[12px] font-[600] hover:bg-slate-100">
                                    <Filter className="mr-2 h-4 w-4" />
                                    View
                                </button>
                            </div>
                        </div>
                        <div className="px-10 pb-10 pt-10">
                            <div
                                className="h-[350px] w-full focus:outline-none focus:border-none"
                                style={{
                                    WebkitTapHighlightColor: "transparent",
                                    outline: "none",
                                }}
                            >
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                    className="focus:outline-none focus:ring-0 outline-none focus-visible:outline-none"
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
                                                id="gLand"
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
                                                id="gAir"
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
                                                id="gSea"
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
                                            dataKey="land"
                                            name="Land"
                                            stroke="#3b82f6"
                                            fill="url(#gLand)"
                                            strokeWidth={4}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="air"
                                            name="Air"
                                            stroke="#0955AC"
                                            fill="url(#gAir)"
                                            strokeWidth={4}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="sea"
                                            name="Sea"
                                            stroke="#6366f1"
                                            fill="url(#gSea)"
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
                                Mode Mix
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
                                    className="focus:outline-none focus:ring-0 outline-none focus-visible:outline-none"
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
                                                            "#3CD0FF",
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
                                    Land
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-5 w-5 rounded-full bg-[#3CD0FF]" />{" "}
                                    Air
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-5 w-5 rounded-full bg-indigo-500" />{" "}
                                    Sea
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
                                    placeholder="Search vehicles, aircraft, boats…"
                                    className="h-12 w-full rounded-[10px] border border-slate-300 bg-white pl-9 px-3 text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-slate-300"
                                />
                            </div>

                            {/* Mode select */}
                            <div>
                                <select
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value)}
                                    className="h-12 w-full rounded-[10px] border border-slate-300 bg-white px-3 text-[14px] focus:outline-none focus:ring-0 focus:border-slate-300"
                                >
                                    <option value="all">All Modes</option>
                                    <option value="land">Land</option>
                                    <option value="air">Air</option>
                                    <option value="sea">Sea</option>
                                </select>
                            </div>

                            {/* Location select */}
                            <div>
                                <select
                                    value={location}
                                    onChange={(e) =>
                                        setLocation(e.target.value)
                                    }
                                    className="h-12 w-full rounded-[10px] border border-slate-300 bg-white px-3 text-[14px] focus:outline-none focus:ring-0 focus:border-slate-300"
                                >
                                    {locations.map((loc) => (
                                        <option key={loc} value={loc}>
                                            {loc === "all"
                                                ? "All Locations"
                                                : loc}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort select */}
                            <div>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="h-12 w-full rounded-[10px] border border-slate-300 bg-white px-3 text-[14px] focus:outline-none focus:ring-0 focus:border-slate-300"
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

                {/* Fleets & Upcoming */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-[20px] font-[600]">
                                Available Fleet
                            </h2>

                            {/* Tabs → simple buttons */}
                            <div className="hidden sm:block">
                                <div className="rounded-2xl inline-flex gap-2">
                                    {[
                                        {
                                            val: "all",
                                            label: "All",
                                            icon: null,
                                        },
                                        {
                                            val: "land",
                                            label: "Land",
                                            icon: Car,
                                        },
                                        {
                                            val: "air",
                                            label: "Air",
                                            icon: Plane,
                                        },
                                        {
                                            val: "sea",
                                            label: "Sea",
                                            icon: Ship,
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

                        {/* Fleet grid */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {filteredFleets.map((f) => (
                                <motion.div
                                    key={f.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <div className="group rounded-2xl bg-white border border-slate-200 shadow-sm">
                                        <div className="px-10 pt-10 pb-5">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-[18px] font-semibold leading-none tracking-tight">
                                                        {f.name}
                                                    </h3>
                                                    <p className="mt-1 flex items-center gap-2 text-[12px] text-slate-500">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {f.location}
                                                    </p>
                                                </div>
                                                {/* Rating badge (static) */}
                                                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-semibold bg-slate-50 text-slate-700">
                                                    <Star className="mr-1 h-4 w-4" />
                                                    {f.rating}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="px-10 pb-10 flex items-end justify-between gap-2">
                                            <div className="text-[14px] text-slate-600">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <CreditCard className="h-4 w-4" />
                                                    <span className="font-medium">
                                                        ${f.price}
                                                    </span>{" "}
                                                    / {f.unit}
                                                </div>
                                                <div className="mt-1 flex items-center gap-2 text-slate-500">
                                                    <Clock className="h-4 w-4" />{" "}
                                                    Instant confirm
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

                            {filteredFleets.length === 0 && (
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
                                    Upcoming Reservations
                                </h3>
                                <p className="text-[14px] text-slate-500 mt-1">
                                    Next trips and rentals
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
                                            Pickup: {r.pickup}
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
                                    <Car className="mr-2 h-7 w-7" /> Extend Land
                                </button>
                                <button className="h-12 px-3 rounded-2xl border border-slate-200 text-left text-[12px] hover:bg-slate-100 inline-flex items-center">
                                    <Plane className="mr-2 h-7 w-7" /> Charter
                                    Flight
                                </button>
                                <button className="h-12 px-3 rounded-2xl border border-slate-200 text-left text-[12px] hover:bg-slate-100 inline-flex items-center">
                                    <Ship className="mr-2 h-7 w-7" /> Book Yacht
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
                                        <th className="px-3 py-2">Mode</th>
                                        <th className="px-3 py-2">Item</th>
                                        <th className="px-3 py-2">From</th>
                                        <th className="px-3 py-2">To</th>
                                        <th className="px-3 py-2">Pickup</th>
                                        <th className="px-3 py-2">Status</th>
                                        <th className="px-3 py-2 text-right">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.map((r) => (
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
                                                {r.pickup}
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
                                                ${r.amount.toFixed(2)}
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
                    © {new Date().getFullYear()} Rental Portal · Land • Air •
                    Sea
                </div>
            </div>
        </div>
    );
};

export default Hero;
