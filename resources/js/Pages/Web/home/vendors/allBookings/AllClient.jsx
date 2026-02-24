import React, { useState, useEffect, useMemo } from "react";
import { usePage } from "@inertiajs/react";
import {
    Download,
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    X,
    Users,
    UserCheck,
    DollarSign,
    TrendingUp,
} from "lucide-react";
import SideMenu from "./SideMenu";
import UserDropdown from "../../../components/vendors/UserDropdown";
import NotificationDropdown from "../../../components/vendors/warehouse/NotificationDropdown";
import { API_BASE_URL } from "../../../../../config/api";
import UnverifiedBanner from "./UnverifiedBanner";

// ─── dummy data shown to unverified vendors ───────────────────────────────────
const DUMMY_CLIENTS = [
    {
        id: 1,
        name: "Kasun Perera",
        email: "kasun.perera@gmail.com",
        phone: "+94 77 123 4567",
        bookingType: "Vehicle",
        bookings: 4,
        totalSpent: "LKR 28,400",
        lastBooking: "2025-06-10",
        status: "Active",
    },
    {
        id: 2,
        name: "Nimal Fernando",
        email: "nimal.f@yahoo.com",
        phone: "+94 71 234 5678",
        bookingType: "Flight",
        bookings: 2,
        totalSpent: "LKR 155,000",
        lastBooking: "2025-06-08",
        status: "Active",
    },
    {
        id: 3,
        name: "Dilani Wickramasinghe",
        email: "dilani.w@outlook.com",
        phone: "+94 76 345 6789",
        bookingType: "Vehicle",
        bookings: 7,
        totalSpent: "LKR 74,200",
        lastBooking: "2025-06-12",
        status: "Active",
    },
    {
        id: 4,
        name: "Roshan Jayawardena",
        email: "roshan.j@gmail.com",
        phone: "+94 78 456 7890",
        bookingType: "Flight",
        bookings: 1,
        totalSpent: "LKR 82,500",
        lastBooking: "2025-05-29",
        status: "Inactive",
    },
    {
        id: 5,
        name: "Sachini Silva",
        email: "sachini.s@gmail.com",
        phone: "+94 70 567 8901",
        bookingType: "Vehicle",
        bookings: 3,
        totalSpent: "LKR 19,800",
        lastBooking: "2025-06-11",
        status: "Active",
    },
    {
        id: 6,
        name: "Tharindu Bandara",
        email: "tharindu.b@live.com",
        phone: "+94 75 678 9012",
        bookingType: "Vehicle",
        bookings: 5,
        totalSpent: "LKR 41,000",
        lastBooking: "2025-06-05",
        status: "Active",
    },
    {
        id: 7,
        name: "Priya Rajapaksa",
        email: "priya.raj@gmail.com",
        phone: "+94 72 789 0123",
        bookingType: "Flight",
        bookings: 3,
        totalSpent: "LKR 247,500",
        lastBooking: "2025-06-09",
        status: "Active",
    },
    {
        id: 8,
        name: "Chamara Gunasekara",
        email: "chamara.g@gmail.com",
        phone: "+94 74 890 1234",
        bookingType: "Vehicle",
        bookings: 2,
        totalSpent: "LKR 13,600",
        lastBooking: "2025-05-20",
        status: "Inactive",
    },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const statusBadge = (status) =>
    status === "Active"
        ? "bg-green-100 text-green-700"
        : "bg-gray-100 text-gray-500";

const typeBadge = (type) =>
    type === "Flight"
        ? "bg-blue-100 text-blue-700"
        : "bg-orange-100 text-orange-700";

// ─── component ────────────────────────────────────────────────────────────────
const AllClient = () => {
    const { auth, clients: propClients } = usePage().props;
    const user = auth?.user;

    const isVerified =
        user?.vendor_status === "verified" || user?.is_verified === true;

    // ── notifications ──
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!auth?.user) return;
        const fetchNotifications = async () => {
            try {
                const res = await fetch(
                    `${API_BASE_URL}vendors/warehouse/notifications/data`
                );
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || []);
                    setUnreadCount(data.unread_count || 0);
                }
            } catch (e) {
                console.error("Failed to fetch notifications:", e);
            }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [auth?.user]);

    // ── data source (dummy vs real) ──
    const rawClients = useMemo(() => {
        if (!isVerified) return DUMMY_CLIENTS;
        if (!propClients?.length) return DUMMY_CLIENTS;

        // de-duplicate by email
        const seen = new Set();
        return propClients.filter((c) => {
            if (seen.has(c.email)) return false;
            seen.add(c.email);
            return true;
        });
    }, [isVerified, propClients]);

    // ── local state ──
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [page, setPage] = useState(1);
    const ROWS = 6;
    const [modal, setModal] = useState(null);

    // ── filtered / paged ──
    const filtered = useMemo(() => {
        return rawClients.filter((c) => {
            const q = search.toLowerCase();
            const matchSearch =
                c.name?.toLowerCase().includes(q) ||
                c.email?.toLowerCase().includes(q) ||
                c.phone?.toLowerCase().includes(q);
            const matchStatus =
                statusFilter === "All" || c.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [rawClients, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS));
    const paginated = filtered.slice((page - 1) * ROWS, page * ROWS);

    const resetPage = () => setPage(1);

    // ── stats ──
    const totalClients = rawClients.length;
    const activeClients = rawClients.filter((c) => c.status === "Active").length;
    const totalRevenue = isVerified
        ? rawClients.reduce((sum, c) => {
              const n = parseFloat(
                  String(c.totalSpent || "0").replace(/[^0-9.]/g, "")
              );
              return sum + (isNaN(n) ? 0 : n);
          }, 0)
        : 662000;
    const avgBookings =
        rawClients.length > 0
            ? (
                  rawClients.reduce((s, c) => s + (c.bookings || 0), 0) /
                  rawClients.length
              ).toFixed(1)
            : "0";

    // ── export ──
    const exportCSV = () => {
        const header = "Name,Email,Phone,Type,Bookings,Total Spent,Last Booking,Status\n";
        const rows = filtered
            .map(
                (c) =>
                    `"${c.name}","${c.email}","${c.phone}","${c.bookingType}","${c.bookings}","${c.totalSpent}","${c.lastBooking}","${c.status}"`
            )
            .join("\n");
        const blob = new Blob([header + rows], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "clients.csv";
        a.click();
    };

    const exportXLSX = () => {
        const ws = window.XLSX?.utils?.json_to_sheet
            ? window.XLSX.utils.json_to_sheet(filtered)
            : null;
        if (!ws) {
            alert("XLSX export not available. Use CSV instead.");
            return;
        }
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Clients");
        window.XLSX.writeFile(wb, "clients.xlsx");
    };

    const exportPDF = () => {
        import("jspdf").then(({ default: jsPDF }) => {
            const doc = new jsPDF({ orientation: "landscape" });
            doc.setFontSize(14);
            doc.text("All Clients", 14, 16);
            doc.setFontSize(9);
            const headers = ["Name", "Email", "Phone", "Type", "Bookings", "Spent", "Last Booking", "Status"];
            const colW = [35, 50, 32, 20, 18, 30, 30, 18];
            let x = 14, y = 26;
            headers.forEach((h, i) => { doc.text(h, x, y); x += colW[i]; });
            filtered.forEach((c) => {
                y += 8;
                if (y > 185) { doc.addPage(); y = 20; }
                x = 14;
                [c.name, c.email, c.phone, c.bookingType, String(c.bookings), c.totalSpent, c.lastBooking, c.status].forEach(
                    (v, i) => { doc.text(String(v ?? ""), x, y); x += colW[i]; }
                );
            });
            doc.save("clients.pdf");
        });
    };

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div className="poppins flex flex-row w-full min-h-screen bg-[#F5F5F5]">
            <SideMenu />

            <div className="w-full h-auto px-4 sm:px-6 lg:px-8 xl:pr-5 xl:pl-0 pt-24 lg:pt-12 pb-8 lg:pb-12">
                {/* ── header ── */}
                <div className="flex md:flex-row flex-col gap-5 justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="figtree text-[24px] md:text-[30px] font-[700] text-center md:text-left">
                            All Clients
                        </h1>
                    </div>
                    <div className="hidden lg:flex items-center gap-3">
                        <NotificationDropdown
                            notifications={notifications}
                            unreadCount={unreadCount}
                        />
                        <UserDropdown settingsRoute={route("warehouse.settingsPage")} />
                    </div>
                </div>

                {/* ── unverified banner ── */}
                <UnverifiedBanner />

                {/* ── stats ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total Clients", value: totalClients, Icon: Users, color: "text-blue-600" },
                        { label: "Active Clients", value: activeClients, Icon: UserCheck, color: "text-green-600" },
                        { label: "Total Revenue", value: `LKR ${totalRevenue.toLocaleString()}`, Icon: DollarSign, color: "text-purple-600" },
                        { label: "Avg Bookings", value: avgBookings, Icon: TrendingUp, color: "text-orange-600" },
                    ].map(({ label, value, Icon, color }) => (
                        <div
                            key={label}
                            className="bg-[#F5F5F5] rounded-[10px] px-4 py-4 flex items-center gap-3"
                        >
                            <div className={`p-2 rounded-full bg-white ${color}`}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">{label}</p>
                                <p className="font-[700] text-sm">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── white card ── */}
                <div
                    className="w-full bg-white rounded-[10px] px-4 py-5"
                    style={{ boxShadow: "4px 4px 4px #0000001A" }}
                >
                    {/* toolbar */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-5">
                        <div className="flex gap-3 flex-wrap">
                            {/* search */}
                            <div className="flex items-center gap-2 border border-gray-200 rounded-[8px] px-3 py-2 bg-white">
                                <Search size={16} className="text-gray-400" />
                                <input
                                    className="outline-none text-sm w-[180px]"
                                    placeholder="Search clients…"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                                />
                            </div>
                            {/* status filter */}
                            <select
                                className="border border-gray-200 rounded-[8px] px-3 py-2 text-sm outline-none bg-white"
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                            >
                                <option value="All">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        {/* export buttons */}
                        <div className="flex gap-2">
                            {[
                                { label: "CSV", fn: exportCSV },
                                { label: "XLSX", fn: exportXLSX },
                                { label: "PDF", fn: exportPDF },
                            ].map(({ label, fn }) => (
                                <button
                                    key={label}
                                    onClick={fn}
                                    className="flex items-center gap-1 text-xs font-[600] border border-gray-300 rounded-[8px] px-3 py-2 hover:bg-gray-50 transition"
                                >
                                    <Download size={13} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-xs">
                                    <th className="text-left py-3 px-2 font-[600]">#</th>
                                    <th className="text-left py-3 px-2 font-[600]">Name</th>
                                    <th className="text-left py-3 px-2 font-[600]">Email</th>
                                    <th className="text-left py-3 px-2 font-[600]">Phone</th>
                                    <th className="text-left py-3 px-2 font-[600]">Type</th>
                                    <th className="text-left py-3 px-2 font-[600]">Bookings</th>
                                    <th className="text-left py-3 px-2 font-[600]">Total Spent</th>
                                    <th className="text-left py-3 px-2 font-[600]">Status</th>
                                    <th className="text-left py-3 px-2 font-[600]">View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-10 text-gray-400">
                                            No clients found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((c, idx) => (
                                        <tr
                                            key={c.id ?? c.email}
                                            className="border-b border-gray-50 hover:bg-gray-50 transition"
                                        >
                                            <td className="py-3 px-2 text-gray-400">
                                                {(page - 1) * ROWS + idx + 1}
                                            </td>
                                            <td className="py-3 px-2 font-[600]">{c.name}</td>
                                            <td className="py-3 px-2 text-gray-500">{c.email}</td>
                                            <td className="py-3 px-2 text-gray-500">{c.phone}</td>
                                            <td className="py-3 px-2">
                                                <span className={`text-xs font-[600] px-2 py-1 rounded-full ${typeBadge(c.bookingType)}`}>
                                                    {c.bookingType}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2">{c.bookings}</td>
                                            <td className="py-3 px-2 font-[600]">{c.totalSpent}</td>
                                            <td className="py-3 px-2">
                                                <span className={`text-xs font-[600] px-2 py-1 rounded-full ${statusBadge(c.status)}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2">
                                                <button
                                                    onClick={() => setModal(c)}
                                                    className="p-1.5 rounded-[6px] hover:bg-blue-50 text-blue-500 transition"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* pagination */}
                    <div className="flex justify-between items-center mt-5 text-sm text-gray-500">
                        <span>
                            Showing {filtered.length === 0 ? 0 : (page - 1) * ROWS + 1}–
                            {Math.min(page * ROWS, filtered.length)} of {filtered.length}
                        </span>
                        <div className="flex gap-2 items-center">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-[6px] border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="font-[600] text-gray-700">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-[6px] border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── client detail modal ── */}
            {modal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    onClick={() => setModal(null)}
                >
                    <div
                        className="bg-white rounded-[14px] w-full max-w-md mx-4 p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-[700]">Client Details</h2>
                            <button
                                onClick={() => setModal(null)}
                                className="p-1 rounded-full hover:bg-gray-100 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-3 text-sm">
                            {[
                                ["Name", modal.name],
                                ["Email", modal.email],
                                ["Phone", modal.phone],
                                ["Booking Type", modal.bookingType],
                                ["Total Bookings", modal.bookings],
                                ["Total Spent", modal.totalSpent],
                                ["Last Booking", modal.lastBooking],
                                ["Status", modal.status],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500 font-[500]">{label}</span>
                                    <span className="font-[600]">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllClient;
