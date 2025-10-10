import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    BookmarkCheck,
    Building2,
    Calendar,
    ChevronRight,
    CreditCard,
    Download,
    FileText,
    Filter,
    Link as LinkIcon,
    Loader2,
    MapPin,
    Plus,
    RefreshCcw,
    Search,
    ShieldCheck,
    Snowflake,
    Star,
    TrendingUp,
} from "lucide-react";

const statusStyles = {
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    paid: "bg-blue-50 text-blue-700 border-blue-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed: "bg-slate-100 text-slate-700 border-slate-200",
};

const normalizeStatus = (status) =>
    (status || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const fallbackImage =
    "https://via.placeholder.com/640x400?text=Warehouse+Preview";

const iconForType = (type) => {
    const value = (type || "").toLowerCase();
    if (value.includes("cold")) return Snowflake;
    if (value.includes("long")) return Building2;
    if (value.includes("short")) return TrendingUp;
    return Building2;
};

const formatCurrency = (amount, currency = "LKR") => {
    if (amount === null || amount === undefined) return "-";
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
        }).format(Number(amount));
    } catch (err) {
        return `${currency} ${Number(amount).toLocaleString()}`;
    }
};

const formatDate = (value) => {
    if (!value) return "-";
    return new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(value));
};

const formatDateTime = (value) => {
    if (!value) return "-";
    return new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
};

const formatDateRange = (start, end) => {
    if (!start && !end) return "TBC";
    if (!end) return `${formatDate(start)} → TBD`;
    return `${formatDate(start)} → ${formatDate(end)}`;
};

const Hero = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: "",
        type: "all",
        location: "all",
        amenity: "all",
        sort: "ratingDesc",
    });
    const [liked, setLiked] = useState(new Set());

    const fetchDashboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get(
                route("client.warehouses.dashboard-data")
            );
            setDashboard(data);
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Please sign in to manage your warehouses.");
            } else {
                setError("We couldn't load your warehouse dashboard. Try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    useEffect(() => {
        if (dashboard?.likedWarehouseIds) {
            setLiked(new Set(dashboard.likedWarehouseIds));
        }
    }, [dashboard]);

    const stats = dashboard?.stats ?? {};
    const recentActivity = dashboard?.recentActivity ?? [];
    const recommended = dashboard?.recommended ?? [];
    const wishlist = dashboard?.wishlist ?? [];
    const billing = dashboard?.billing ?? {};
    const documents = dashboard?.documents ?? [];
    const filtersData = dashboard?.filters ?? {
        types: [],
        locations: [],
        amenities: [],
    };

    const priceOf = (warehouse) =>
        Number(warehouse.monthly_rate ?? warehouse.base_price ?? 0);

    const resolveWishlistUrl = () => {
        if (typeof route === "function") {
            try {
                return route("client.warehouse.like.toggle");
            } catch (error) {
                console.warn("Falling back to hardcoded wishlist URL", error);
            }
        }

    return "/api/warehouse/like-toggle";
    };

    const filteredWarehouses = useMemo(() => {
        return recommended
            .filter((warehouse) => {
                if (filters.type === "all") return true;
                return (warehouse.type || "").toLowerCase() === filters.type.toLowerCase();
            })
            .filter((warehouse) => {
                if (filters.location === "all") return true;
                return (warehouse.city || "").toLowerCase() === filters.location.toLowerCase();
            })
            .filter((warehouse) => {
                if (filters.amenity === "all") return true;
                return (warehouse.amenities || [])
                    .map((a) => a.toLowerCase())
                    .includes(filters.amenity.toLowerCase());
            })
            .filter((warehouse) => {
                if (!filters.search) return true;
                const haystack = `${warehouse.name} ${warehouse.address} ${warehouse.type}`.toLowerCase();
                return haystack.includes(filters.search.toLowerCase());
            })
            .sort((a, b) => {
                switch (filters.sort) {
                    case "priceAsc":
                        return priceOf(a) - priceOf(b);
                    case "priceDesc":
                        return priceOf(b) - priceOf(a);
                    case "ratingAsc":
                        return (a.avg_rating ?? 0) - (b.avg_rating ?? 0);
                    case "ratingDesc":
                    default:
                        return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
                }
            });
    }, [filters, recommended]);

    const handleLikeToggle = async (warehouseId) => {
        try {
            const { data } = await axios.post(
                resolveWishlistUrl(),
                { warehouse_id: warehouseId }
            );

            if (Array.isArray(data.likedWarehouseIds)) {
                setLiked(new Set(data.likedWarehouseIds));
            } else {
                setLiked((prev) => {
                    const next = new Set(prev);
                    if (data.is_liked) {
                        next.add(warehouseId);
                    } else {
                        next.delete(warehouseId);
                    }
                    return next;
                });
            }

            setDashboard((prev) => {
                if (!prev) {
                    return prev;
                }

                const nextDashboard = {
                    ...prev,
                    stats: {
                        ...prev.stats,
                        likedWarehouses:
                            typeof data.likedCount === "number"
                                ? data.likedCount
                                : prev.stats?.likedWarehouses ?? 0,
                    },
                };

                if (Array.isArray(data.wishlist)) {
                    nextDashboard.wishlist = data.wishlist;
                }

                if (Array.isArray(data.likedWarehouseIds) && Array.isArray(prev.recommended)) {
                    const likedSet = new Set(data.likedWarehouseIds);
                    nextDashboard.recommended = prev.recommended.map((warehouse) => ({
                        ...warehouse,
                        is_liked: likedSet.has(warehouse.id),
                    }));
                }

                return nextDashboard;
            });
        } catch (err) {
            if (err.response?.status === 401) {
                router.visit(route("signin.signin"));
                return;
            }
            setError("Unable to update wishlist right now. Please retry.");
        }
    };

    const handleViewDetails = (warehouse) => {
        router.visit("/warehouseDetails", {
            method: "get",
            data: {
                warehouse,
            },
            preserveState: true,
        });
    };

    const quickActions = [
        {
            label: "Browse Warehouses",
            description: "Discover approved space across the network",
            icon: Search,
            onClick: () => router.visit(route("warehouse.list")),
        },
        {
            label: "My Bookings",
            description: "Track, extend or cancel reservations",
            icon: BookmarkCheck,
            onClick: () => router.visit(route("warehouse-bookings.list")),
        },
        {
            label: "Checkout",
            description: "Finish a draft warehouse reservation",
            icon: CreditCard,
            onClick: () => router.visit(route("warehouse-bookings.checkout")),
        },
        {
            label: "Payments",
            description: "Review invoices and payment options",
            icon: TrendingUp,
            onClick: () => router.visit(route("warehouse-bookings.payments")),
        },
    ];

    const statCards = [
        {
            key: "activeBookings",
            label: "Active bookings",
            value: stats.activeBookings ?? 0,
            helper: `${stats.upcomingMoveIns ?? 0} move-ins scheduled`,
            icon: BookmarkCheck,
        },
        {
            key: "totalSpend",
            label: "Lifetime spend",
            value: formatCurrency(stats.totalSpend ?? 0),
            helper: `${stats.pendingPayments ?? 0} payment(s) pending`,
            icon: CreditCard,
        },
        {
            key: "likedWarehouses",
            label: "Saved warehouses",
            value: stats.likedWarehouses ?? 0,
            helper: `${stats.completedBookings ?? 0} completed reservations`,
            icon: Building2,
        },
        {
            key: "expiringSoon",
            label: "Renewals due (30d)",
            value: stats.expiringSoon ?? 0,
            helper: "Prepare renewals & extensions",
            icon: Calendar,
        },
    ];

    const renderWarehouseCard = (warehouse) => {
        const Icon = iconForType(warehouse.type);
        return (
            <motion.div
                key={warehouse.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="relative h-[200px] w-full overflow-hidden bg-slate-100">
                        <img
                            src={warehouse.main_image || fallbackImage}
                            alt={warehouse.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(event) => {
                                event.currentTarget.src = fallbackImage;
                            }}
                        />
                        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                            <Icon className="h-4 w-4" />
                            {normalizeStatus(warehouse.type)}
                        </div>
                        <button
                            onClick={() => handleLikeToggle(warehouse.id)}
                            className={`absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white text-sm transition ${
                                liked.has(warehouse.id)
                                    ? "border-[#0955AC] text-[#0955AC]"
                                    : "border-slate-200 text-slate-500 hover:border-[#0955AC]/40 hover:text-[#0955AC]"
                            }`}
                            aria-label={
                                liked.has(warehouse.id)
                                    ? "Remove from wishlist"
                                    : "Add to wishlist"
                            }
                        >
                            <BookmarkCheck className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex flex-1 flex-col gap-4 p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {warehouse.name}
                                </h3>
                                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                    <MapPin className="h-4 w-4" />
                                    {warehouse.city}
                                </div>
                                {warehouse.liked_at ? (
                                    <div className="mt-1 text-xs text-slate-400">
                                        Saved {formatDate(warehouse.liked_at)}
                                    </div>
                                ) : null}
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                <Star className="h-4 w-4" />
                                {(warehouse.avg_rating ?? 0).toFixed(1)}
                                <span className="text-amber-500">
                                    ({warehouse.reviews_count ?? 0})
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                            <span className="font-semibold text-slate-800">
                                {formatCurrency(priceOf(warehouse), warehouse.currency)} / month
                            </span>
                            {warehouse.capacity ? (
                                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    {Number(warehouse.capacity).toLocaleString()} {warehouse.capacity_unit || "units"}
                                </span>
                            ) : null}
                            {warehouse.available_from ? (
                                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                    <Calendar className="h-3.5 w-3.5" /> Available {formatDate(warehouse.available_from)}
                                </span>
                            ) : null}
                        </div>

                        {warehouse.amenities?.length ? (
                            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                {warehouse.amenities.slice(0, 4).map((amenity) => (
                                    <span
                                        key={`${warehouse.id}-${amenity}`}
                                        className="rounded-full border border-slate-200 px-3 py-1"
                                    >
                                        {amenity}
                                    </span>
                                ))}
                                {warehouse.amenities.length > 4 ? (
                                    <span className="text-slate-400">
                                        +{warehouse.amenities.length - 4} more
                                    </span>
                                ) : null}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400">
                                Provider has not published amenities yet.
                            </div>
                        )}

                        <div className="mt-auto flex items-center justify-between gap-3">
                            <button
                                onClick={() => handleViewDetails(warehouse)}
                                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                                View details
                            </button>
                            <button
                                onClick={() => router.visit(route("warehouse-bookings.checkout"))}
                                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#0955AC] text-sm font-semibold text-white transition hover:bg-[#084a97]"
                            >
                                Start booking
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-[#E5E5E5] md:p-20 poppins">
                <div className="mx-auto flex h-full max-w-[700px] flex-col items-center justify-center gap-4 rounded-3xl bg-white p-12 text-center shadow-sm">
                    <Loader2 className="h-10 w-10 animate-spin text-[#0955AC]" />
                    <p className="text-sm text-slate-500">
                        Loading your warehouse dashboard…
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen w-full bg-[#E5E5E5] md:p-20 poppins">
                <div className="mx-auto flex h-full max-w-[700px] flex-col items-center justify-center gap-6 rounded-3xl bg-white p-12 text-center shadow-sm">
                    <AlertTriangle className="h-10 w-10 text-amber-500" />
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
                        <p className="mt-2 text-sm text-slate-500">{error}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.visit(route("signin.signin"))}
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            Sign in
                        </button>
                        <button
                            onClick={fetchDashboard}
                            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0955AC] px-5 text-sm font-semibold text-white hover:bg-[#084a97]"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#E5E5E5] md:p-20 poppins">
            <div className="mx-auto max-w-[1300px]">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-[36px]">
                            Warehouse Management
                            <span className="text-[#0955AC]"> Dashboard</span>
                        </h1>
                        <p className="flex items-center gap-3 text-sm text-slate-500">
                            End-to-end control for your warehouse reservations
                            {dashboard?.lastUpdated ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                                    <Loader2 className="h-3.5 w-3.5" />
                                    Updated {formatDateTime(dashboard.lastUpdated)}
                                </span>
                            ) : null}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={fetchDashboard}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                        </button>
                        <button
                            onClick={() => router.visit(route("warehouse-bookings.list"))}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            <Download className="mr-2 h-4 w-4" /> Download statement
                        </button>
                        <button
                            onClick={() => router.visit(route("warehouse.list"))}
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#0955AC] px-6 text-sm font-semibold text-white transition hover:bg-[#084a97]"
                        >
                            <Plus className="mr-2 h-4 w-4" /> New booking
                        </button>
                    </div>
                </div>

                <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.key}
                                className="rounded-2xl bg-white p-6 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-500">
                                        {card.label}
                                    </p>
                                    <Icon className="h-6 w-6 text-[#0955AC]" />
                                </div>
                                <p className="mt-3 text-3xl font-bold text-slate-900">
                                    {card.key === "totalSpend"
                                        ? card.value
                                        : Number(card.value ?? 0).toLocaleString()}
                                </p>
                                <p className="mt-2 text-xs text-slate-500">
                                    {card.helper}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-6 flex flex-wrap gap-4">
                            <div className="relative flex-1 min-w-[220px]">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={filters.search}
                                    onChange={(event) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            search: event.target.value,
                                        }))
                                    }
                                    placeholder="Search warehouses, cities or types"
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                                />
                            </div>
                            <select
                                value={filters.type}
                                onChange={(event) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        type: event.target.value,
                                    }))
                                }
                                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                            >
                                <option value="all">All types</option>
                                {filtersData.types.map((type) => (
                                    <option key={type} value={type.toLowerCase()}>
                                        {normalizeStatus(type)}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filters.location}
                                onChange={(event) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        location: event.target.value,
                                    }))
                                }
                                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                            >
                                <option value="all">All locations</option>
                                {filtersData.locations.map((city) => (
                                    <option key={city} value={city.toLowerCase()}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filters.amenity}
                                onChange={(event) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        amenity: event.target.value,
                                    }))
                                }
                                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                            >
                                <option value="all">Any amenity</option>
                                {filtersData.amenities.map((amenity) => (
                                    <option key={amenity} value={amenity.toLowerCase()}>
                                        {amenity}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filters.sort}
                                onChange={(event) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        sort: event.target.value,
                                    }))
                                }
                                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none"
                            >
                                <option value="ratingDesc">Top rated</option>
                                <option value="ratingAsc">Rating (low → high)</option>
                                <option value="priceAsc">Price (low → high)</option>
                                <option value="priceDesc">Price (high → low)</option>
                            </select>
                        </div>

                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-900">
                                Recommended warehouses
                            </h2>
                            <span className="text-sm text-slate-500">
                                {filteredWarehouses.length} match(es)
                            </span>
                        </div>

                        {filteredWarehouses.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-sm text-slate-500">
                                No warehouses match your filters. Adjust filters or explore all listings.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {filteredWarehouses.slice(0, 6).map((warehouse) =>
                                    renderWarehouseCard(warehouse)
                                )}
                            </div>
                        )}

                        <div className="mt-10">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Saved warehouses
                                </h2>
                                <button
                                    onClick={() => router.visit(route("warehouse.list"))}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Browse catalog
                                    <ChevronRight className="h-3 w-3" />
                                </button>
                            </div>

                            {wishlist.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-sm text-slate-500">
                                    You have not saved any warehouses yet. Use the wishlist button to keep interesting spaces handy.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    {wishlist.slice(0, 6).map((warehouse) =>
                                        renderWarehouseCard(warehouse)
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        Upcoming reservations
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Confirm move-ins, extensions and handovers
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.visit(route("warehouse-bookings.list"))}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Manage all
                                    <ChevronRight className="h-3 w-3" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {upcoming.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                                        You have no upcoming reservations. Browse warehouses to make a booking.
                                    </div>
                                ) : (
                                    upcoming.map((booking) => {
                                        const Icon = iconForType(booking.warehouse?.type);
                                        const tone = statusStyles[booking.status] || "bg-slate-100 text-slate-700 border-slate-200";
                                        return (
                                            <div
                                                key={booking.id}
                                                className="rounded-2xl border border-slate-200 p-4"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                                        <Icon className="h-5 w-5 text-[#0955AC]" />
                                                        <div>
                                                            <p className="font-semibold text-slate-800">
                                                                {booking.warehouse?.name ?? "Warehouse"}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {booking.warehouse?.address}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>
                                                        {normalizeStatus(booking.status)}
                                                    </span>
                                                </div>
                                                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                                    <span className="inline-flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDateRange(booking.start_date, booking.end_date)}
                                                    </span>
                                                    <span className="inline-flex items-center gap-2">
                                                        <CreditCard className="h-4 w-4" />
                                                        {formatCurrency(booking.amount)}
                                                    </span>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                                                    <span>Reference #{booking.reference}</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                router.visit(
                                                                    route(
                                                                        "warehouse-bookings.show",
                                                                        { id: booking.id }
                                                                    )
                                                                )
                                                            }
                                                            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-600 hover:bg-slate-100"
                                                        >
                                                            View details
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                router.visit(
                                                                    route(
                                                                        "warehouse-bookings.summary",
                                                                        { bookingId: booking.id }
                                                                    )
                                                                )
                                                            }
                                                            className="inline-flex items-center rounded-lg border border-[#0955AC]/20 bg-[#0955AC]/10 px-3 py-1 font-semibold text-[#0955AC] hover:bg-[#0955AC]/20"
                                                        >
                                                            Manage booking
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        Quick actions
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Stay on top of key warehouse tasks
                                    </p>
                                </div>
                                <Filter className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="mt-5 grid grid-cols-1 gap-3">
                                {quickActions.map((action) => {
                                    const ActionIcon = action.icon;
                                    return (
                                        <button
                                            key={action.label}
                                            onClick={action.onClick}
                                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-[#0955AC] hover:bg-[#F3F8FF]"
                                        >
                                            <span className="flex items-center gap-3">
                                                <ActionIcon className="h-5 w-5 text-[#0955AC]" />
                                                <span>
                                                    {action.label}
                                                    <span className="block text-xs font-normal text-slate-500">
                                                        {action.description}
                                                    </span>
                                                </span>
                                            </span>
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        Billing snapshot
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Quickly review your billing position
                                    </p>
                                </div>
                                <CreditCard className="h-5 w-5 text-[#0955AC]" />
                            </div>
                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                    <span className="text-slate-600">Outstanding balance</span>
                                    <span className="font-semibold text-slate-900">
                                        {formatCurrency(billing.outstanding ?? 0)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                    <span className="text-slate-600">Paid this year</span>
                                    <span className="font-semibold text-slate-900">
                                        {formatCurrency(billing.paidThisYear ?? 0)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                    <span className="text-slate-600">Next invoice date</span>
                                    <span className="font-semibold text-slate-900">
                                        {billing.nextInvoiceDate ? formatDate(billing.nextInvoiceDate) : "TBD"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        Documents & agreements
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Leases, invoices and compliance documents
                                    </p>
                                </div>
                                <FileText className="h-5 w-5 text-[#0955AC]" />
                            </div>
                            <div className="mt-4 space-y-3">
                                {documents.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                                        No documents uploaded for your bookings yet.
                                    </div>
                                ) : (
                                    documents.slice(0, 5).map((doc) => (
                                        <a
                                            key={`${doc.booking_id}-${doc.name}`}
                                            href={doc.url || "#"}
                                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-[#0955AC] hover:bg-[#F3F8FF]"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <span className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-[#0955AC]" />
                                                <span>
                                                    {doc.name}
                                                    <span className="block text-xs text-slate-500">
                                                        Booking #{doc.reference}
                                                    </span>
                                                </span>
                                            </span>
                                            <LinkIcon className="h-4 w-4 text-slate-400" />
                                        </a>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                Recent activity
                            </h3>
                            <p className="text-xs text-slate-500">
                                Last 25 booking updates, payments and status changes
                            </p>
                        </div>
                        <button
                            onClick={() => router.visit(route("warehouse-bookings.list"))}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                            Export CSV
                            <Download className="h-3 w-3" />
                        </button>
                    </div>
                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full table-auto text-left text-sm">
                            <thead>
                                <tr className="text-xs uppercase tracking-wide text-slate-400">
                                    <th className="py-3 pr-6 font-semibold">Booking</th>
                                    <th className="py-3 pr-6 font-semibold">Warehouse</th>
                                    <th className="py-3 pr-6 font-semibold">Start</th>
                                    <th className="py-3 pr-6 font-semibold">End</th>
                                    <th className="py-3 pr-6 font-semibold">Status</th>
                                    <th className="py-3 pr-6 font-semibold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentActivity.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-6 text-center text-sm text-slate-500">
                                            No historical activity yet.
                                        </td>
                                    </tr>
                                ) : (
                                    recentActivity.map((activity) => {
                                        const tone = statusStyles[activity.status] || "bg-slate-100 text-slate-700 border-slate-200";
                                        return (
                                            <tr key={activity.id} className="border-b border-slate-100 text-sm text-slate-600 last:border-0">
                                                <td className="py-4 pr-6">
                                                    <div className="font-semibold text-slate-800">
                                                        #{activity.reference}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {formatDateTime(activity.created_at)}
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-6">
                                                    <div className="font-medium text-slate-800">
                                                        {activity.warehouse?.name ?? "Warehouse"}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {activity.warehouse?.address}
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-6 text-xs text-slate-500">
                                                    {formatDate(activity.start_date)}
                                                </td>
                                                <td className="py-4 pr-6 text-xs text-slate-500">
                                                    {formatDate(activity.end_date)}
                                                </td>
                                                <td className="py-4 pr-6">
                                                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>
                                                        {normalizeStatus(activity.status)}
                                                    </span>
                                                </td>
                                                <td className="py-4 pr-6 text-right font-semibold text-slate-800">
                                                    {formatCurrency(activity.amount)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-10 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} Transport Jaan · Client Warehouse Management Suite
                </div>
            </div>
        </div>
    );
};

export default Hero;