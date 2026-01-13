import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@inertiajs/react";
import BookingCancellationModal from "./allBooking/BookingCancellationModal";
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

const Hero = ({ bookings = [], vehicles = [], monthlyData = [] }) => {
    const [mode, setMode] = useState("all");
    const [q, setQ] = useState("");
    const [location, setLocation] = useState("all");
    const [sort, setSort] = useState("popular");
    const [showCancellationModal, setShowCancellationModal] = useState(false);
    const [bookingToCancell, setBookingToCancell] = useState(null);

    // Group booked vehicles by type
    const fleets = useMemo(() => {
        const grouped = {
            land: [],
            air: [],
            sea: []
        };
        
        bookings.forEach(booking => {
            const type = booking.vehicle_category?.toLowerCase() || 'land';
            const bookingData = {
                id: booking.id,
                name: booking.vehicle_name || booking.item || 'Vehicle',
                rating: booking.rating || 4.5,
                location: booking.pickup_location || booking.pickup || 'N/A',
                price: booking.total_amount || booking.amount || 0,
                unit: 'booking',
                vehicle: booking,
                status: booking.status,
                startDate: booking.start_date || booking.from,
                endDate: booking.end_date || booking.to,
                bookingCode: booking.booking_code || booking.code || `BK-${booking.id}`
            };

            if (type.includes('land') || type.includes('car') || type.includes('bus') || type.includes('train')) {
                grouped.land.push(bookingData);
            } else if (type.includes('air') || type.includes('plane') || type.includes('flight')) {
                grouped.air.push(bookingData);
            } else if (type.includes('sea') || type.includes('boat') || type.includes('ship')) {
                grouped.sea.push(bookingData);
            }
        });
        
        return grouped;
    }, [bookings]);

    // Calculate KPI metrics from bookings
    const kpiMetrics = useMemo(() => {
        const activeLand = bookings.filter(b => 
            ['confirmed', 'paid', 'pending'].includes(b.status?.toLowerCase()) &&
            (b.vehicle_category?.toLowerCase().includes('land') || 
             b.vehicle_category?.toLowerCase().includes('car'))
        ).length;

        const flightHours = bookings.filter(b => 
            ['confirmed', 'paid', 'pending'].includes(b.status?.toLowerCase()) &&
            b.vehicle_category?.toLowerCase().includes('air')
        ).reduce((total, b) => total + (b.hours || 0), 0);

        const seaTrips = bookings.filter(b => 
            b.vehicle_category?.toLowerCase().includes('sea') &&
            new Date(b.created_at).getMonth() === new Date().getMonth()
        ).length;

        return {
            activeLand,
            flightHours,
            seaTrips
        };
    }, [bookings]);

    // Process monthly data for charts
    const chartData = useMemo(() => {
        if (monthlyData && monthlyData.length > 0) {
            return monthlyData;
        }
        // Return empty data structure if no data
        return Array.from({ length: 12 }, (_, i) => ({
            month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
            land: 0,
            air: 0,
            sea: 0
        }));
    }, [monthlyData]);

    const pieData = useMemo(() => [
        { name: "Land", value: chartData.reduce((a, b) => a + (b.land || 0), 0) },
        { name: "Air", value: chartData.reduce((a, b) => a + (b.air || 0), 0) },
        { name: "Sea", value: chartData.reduce((a, b) => a + (b.sea || 0), 0) },
    ], [chartData]);

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
    }, [mode, q, location, sort, fleets]);

    const locations = useMemo(() => {
        const locationSet = new Set();
        bookings.forEach(b => {
            const loc = b.pickup_location || b.pickup;
            if (loc) locationSet.add(loc);
        });
        return ["all", ...Array.from(locationSet)];
    }, [bookings]);

    const upcoming = bookings.filter((r) =>
        ["confirmed", "paid", "pending"].includes(r.status?.toLowerCase())
    );

    const handleNewBooking = () => {
        window.location.href = '/clientRent';
    };

    const handleCancellationSuccess = () => {
        setShowCancellationModal(false);
        setBookingToCancell(null);
        // Reload the page to show updated bookings
        window.location.reload();
    };

    // const handleExport = () => {
    //     alert('Export functionality will be implemented');
    // };

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
                        {/* <button 
                            onClick={handleExport}
                            className="inline-flex items-center h-10 px-6 py-6 rounded-2xl border border-slate-200 text-[16px] font-medium hover:bg-slate-50"
                        >
                            <Download className="mr-2 h-7 w-7" /> Export
                        </button> */}
                        <button 
                            onClick={handleNewBooking}
                            className="inline-flex items-center h-10 px-6 py-6 rounded-2xl bg-[#0955AC] text-white text-[16px] font-medium hover:bg-[#0744a0]"
                        >
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
                                {kpiMetrics.activeLand}
                            </h3>
                        </div>
                        <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
                            Currently active
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="px-5 pt-5 pb-2">
                            <p className="flex items-center gap-3 text-[#7B7B7A] text-[16px] font-[700]">
                                <Plane className="h-8 w-8" /> Scheduled Flight
                                Hours
                            </p>
                            <h3 className="text-[26px] font-[700] text-[#0955AC]">
                                {kpiMetrics.flightHours}h
                            </h3>
                        </div>
                        <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
                            Total scheduled
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="px-5 pt-5 pb-2">
                            <p className="flex items-center gap-3 text-[#7B7B7A] text-[16px] font-[700]">
                                <Ship className="h-8 w-8" /> Sea Trips This
                                Month
                            </p>
                            <h3 className="text-[26px] font-[700] text-[#0955AC]">
                                {kpiMetrics.seaTrips}
                            </h3>
                        </div>
                        <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
                            This month
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
                                        data={chartData}
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
                                My Booked Vehicles
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
                                                    <p className="mt-1 flex items-center gap-2 text-[12px] text-slate-600">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {f.startDate} → {f.endDate}
                                                    </p>
                                                </div>
                                                {/* Status badge */}
                                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[12px] font-semibold ${
                                                    statusMap[f.status?.toLowerCase()]?.tone || statusMap.pending.tone
                                                }`}>
                                                    {statusMap[f.status?.toLowerCase()]?.label || f.status || 'Pending'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="px-10 pb-10 flex items-end justify-between gap-2">
                                            <div className="text-[14px] text-slate-600">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <CreditCard className="h-4 w-4" />
                                                    <span className="font-medium">
                                                        ${f.price.toFixed(2)}
                                                    </span>{" "}
                                                    total
                                                </div>
                                                <div className="mt-1 flex items-center gap-2 text-slate-500 text-[12px]">
                                                    Ref: {f.bookingCode}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/client/bookings/${f.id}/summary`}
                                                    className="h-10 px-4 rounded-xl bg-[#0955AC] text-white text-[14px] font-medium hover:bg-[#0744a0]"
                                                >
                                                    View Details{" "}
                                                    <ChevronRight className="ml-1 h-4 w-4 inline-block" />
                                                </Link>
                                                {['confirmed', 'pending', 'paid'].includes(f.status?.toLowerCase()) && (
                                                    <button
                                                        onClick={() => {
                                                            setBookingToCancell(f);
                                                            setShowCancellationModal(true);
                                                        }}
                                                        className="h-10 px-4 rounded-xl bg-rose-500 text-white text-[14px] font-medium hover:bg-rose-600 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {filteredFleets.length === 0 && (
                                <div className="rounded-2xl border-dashed border border-slate-200 bg-white">
                                    <div className="px-4 py-10 text-center text-slate-500">
                                        No bookings found. Try changing filters or book a new vehicle.
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
                                {upcoming.length > 0 ? (
                                    upcoming.map((r) => (
                                        <div
                                            key={r.id || r.code}
                                            className="rounded-2xl border p-5"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <ModeIcon
                                                        mode={r.vehicle_category?.toLowerCase().includes('air') ? 'air' : r.vehicle_category?.toLowerCase().includes('sea') ? 'sea' : 'land'}
                                                        className="h-7 w-7"
                                                    />
                                                    <span className="font-medium">
                                                        {r.vehicle_name || r.item || 'Vehicle'}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`rounded-full border px-2 py-0.5 text-[10px] ${
                                                        statusMap[r.status?.toLowerCase()]?.tone || statusMap.pending.tone
                                                    }`}
                                                >
                                                    {statusMap[r.status?.toLowerCase()]?.label || r.status || 'Pending'}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 text-[12px] text-slate-600">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {r.start_date || r.from} → {r.end_date || r.to}
                                                </span>
                                            </div>
                                            <div className="mt-1 text-sm text-slate-500">
                                                Pickup: {r.pickup_location || r.pickup || 'N/A'}
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-[12px]">
                                                <span className="text-slate-500">
                                                    Ref: {r.booking_code || r.code || `BK-${r.id}`}
                                                </span>
                                                <Link
                                                    href={`/client/bookings/${r.id}/summary`}
                                                    className="h-8 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-sm inline-flex items-center"
                                                >
                                                    Manage
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        No upcoming reservations
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
                            <div className="px-10 pb-10 grid grid-cols-2 gap-2 font-[500]">
                                <Link
                                    href="/clientRent?type=land"
                                    className="h-12 px-3 rounded-2xl border border-slate-200 text-left text-[12px] hover:bg-slate-100 inline-flex items-center"
                                >
                                    <Car className="mr-2 h-7 w-7" /> Rent Land Vehicle
                                </Link>
                                <Link
                                    href="/clientRent?type=air"
                                    className="h-12 px-3 rounded-2xl border border-slate-200 text-left text-[12px] hover:bg-slate-100 inline-flex items-center"
                                >
                                    <Plane className="mr-2 h-7 w-7" /> Charter
                                    Flight
                                </Link>
                                <Link
                                    href="/clientRent?type=sea"
                                    className="h-12 px-3 rounded-2xl border border-slate-200 text-left text-[12px] hover:bg-slate-100 inline-flex items-center"
                                >
                                    <Ship className="mr-2 h-7 w-7" /> Book Yacht
                                </Link>
                                <Link
                                    href="/dashboard/view"
                                    className="h-12 px-3 rounded-2xl border border-slate-200 text-left text-[12px] hover:bg-slate-100 inline-flex items-center"
                                >
                                    <Calendar className="mr-2 h-7 w-7" /> View Bookings
                                </Link>
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
                                    {bookings.length > 0 ? (
                                        bookings.map((r) => (
                                            <tr
                                                key={r.id || r.code}
                                                className="rounded-xl bg-white shadow-sm"
                                            >
                                                <td className="px-3 py-3">
                                                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-2 py-1 text-slate-700">
                                                        <ModeIcon
                                                            mode={r.vehicle_category?.toLowerCase().includes('air') ? 'air' : r.vehicle_category?.toLowerCase().includes('sea') ? 'sea' : 'land'}
                                                            className="h-4 w-4"
                                                        />
                                                        {r.vehicle_category?.toUpperCase() || 'LAND'}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 font-medium">
                                                    {r.vehicle_name || r.item || 'Vehicle'}
                                                </td>
                                                <td className="px-3 py-3 text-slate-600">
                                                    {r.start_date || r.from || 'N/A'}
                                                </td>
                                                <td className="px-3 py-3 text-slate-600">
                                                    {r.end_date || r.to || 'N/A'}
                                                </td>
                                                <td className="px-3 py-3 text-slate-600">
                                                    {r.pickup_location || r.pickup || 'N/A'}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span
                                                        className={`rounded-full border px-2 py-0.5 text-xs ${
                                                            statusMap[r.status?.toLowerCase()]?.tone || statusMap.pending.tone
                                                        }`}
                                                    >
                                                        {statusMap[r.status?.toLowerCase()]?.label || r.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-right font-medium">
                                                    ${(r.total_amount || r.amount || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-3 py-8 text-center text-slate-500">
                                                No bookings found
                                            </td>
                                        </tr>
                                    )}
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

                {/* Booking Cancellation Modal */}
                {bookingToCancell && (
                    <BookingCancellationModal
                        booking={bookingToCancell}
                        isOpen={showCancellationModal}
                        onClose={() => {
                            setShowCancellationModal(false);
                            setBookingToCancell(null);
                        }}
                        onSuccess={handleCancellationSuccess}
                    />
                )}
            </div>
        </div>
    );
};

export default Hero;
