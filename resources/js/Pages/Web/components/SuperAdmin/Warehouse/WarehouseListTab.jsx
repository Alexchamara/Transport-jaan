import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    CheckCircle,
    XCircle,
    ShieldAlert,
    Clock,
    Building2,
    MapPin,
    User,
    Mail,
    Phone,
    DollarSign,
    Maximize,
    Package,
    Filter,
} from "lucide-react";

const warehouseTypeFilterOptions = [
    { value: "all", label: "All Types" },
    { value: "cold_storage", label: "Cold Storage" },
    { value: "dry", label: "Dry Storage" },
    { value: "bonded", label: "Bonded Warehouse" },
    { value: "open_yard", label: "Open Yard" },
    { value: "climate_controlled", label: "Climate Controlled" },
    { value: "hazmat", label: "Hazmat Storage" },
];

const warehouseStatusFilterOptions = [
    { value: "all", label: "All Status" },
    { value: "approved", label: "Approved" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" },
    { value: "suspended", label: "Suspended" },
];

const getCategoryStyles = (category) => {
    const map = {
        cold_storage: { border: "border-[#26A69A80]", bg: "bg-[#26A69A33]", dot: "bg-[#26A69A]", text: "text-[#26A69A]" },
        dry: { border: "border-[#8D6E6380]", bg: "bg-[#8D6E6333]", dot: "bg-[#8D6E63]", text: "text-[#8D6E63]" },
        bonded: { border: "border-[#AB47BC80]", bg: "bg-[#AB47BC33]", dot: "bg-[#AB47BC]", text: "text-[#AB47BC]" },
        open_yard: { border: "border-[#2196F380]", bg: "bg-[#2196F333]", dot: "bg-[#2196F3]", text: "text-[#2196F3]" },
        climate_controlled: { border: "border-[#4CAF5080]", bg: "bg-[#4CAF5033]", dot: "bg-[#4CAF50]", text: "text-[#4CAF50]" },
        hazmat: { border: "border-[#FF980080]", bg: "bg-[#FF980033]", dot: "bg-[#FF9800]", text: "text-[#FF9800]" },
    };
    return map[category] || { border: "border-[#343B4F]", bg: "bg-[#0B1739]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]" };
};

const getStatusStyles = (status) => {
    const map = {
        approved: { border: "border-[#05C16880]", bg: "bg-[#05C16833]", dot: "bg-[#14CA74]", text: "text-[#14CA74]" },
        pending: { border: "border-[#FFB01680]", bg: "bg-[#FFB01633]", dot: "bg-[#FDB52A]", text: "text-[#FDB52A]" },
        suspended: { border: "border-[#FF5A6580]", bg: "bg-[#FF5A6533]", dot: "bg-[#FF5A65]", text: "text-[#FF5A65]" },
        rejected: { border: "border-[#FF572280]", bg: "bg-[#FF572233]", dot: "bg-[#FF5722]", text: "text-[#FF5722]" },
    };
    return map[status] || { border: "border-[#343B4F]", bg: "bg-[#0B1739]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]" };
};

const getButtonColors = (status) => {
    const map = {
        approved: { bg: "bg-[#05C16833]", hover: "hover:bg-[#05C1684D]", text: "text-[#14CA74]", border: "border-[#05C16880]" },
        pending: { bg: "bg-[#FFB01633]", hover: "hover:bg-[#FFB0164D]", text: "text-[#FDB52A]", border: "border-[#FFB01680]" },
        suspended: { bg: "bg-[#FF5A6533]", hover: "hover:bg-[#FF5A654D]", text: "text-[#FF5A65]", border: "border-[#FF5A6580]" },
        rejected: { bg: "bg-[#FF572233]", hover: "hover:bg-[#FF57224D]", text: "text-[#FF5722]", border: "border-[#FF572280]" },
    };
    return map[status] || { bg: "bg-[#0955AC]", hover: "hover:bg-[#074a92]", text: "text-white", border: "border-[#0955AC]" };
};

const WarehouseListTab = ({ warehouses = {}, filters = {}, error }) => {
    const [selectedType, setSelectedType] = useState(filters.type_filter || "");
    const [selectedStatus, setSelectedStatus] = useState(filters.status_filter || "");
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const applyFilters = (overrides = {}) => {
        const params = {
            search: overrides.search ?? searchTerm,
            type_filter: overrides.type ?? (selectedType === "all" ? "" : selectedType),
            status_filter: overrides.status ?? (selectedStatus === "all" ? "" : selectedStatus),
        };
        router.get("/superadmin/Warehouse", params, { preserveState: true, preserveScroll: true });
    };

    const handleTypeFilterChange = (e) => {
        const val = e.target.value;
        setSelectedType(val);
        applyFilters({ type: val === "all" ? "" : val });
    };

    const handleStatusFilterChange = (e) => {
        const val = e.target.value;
        setSelectedStatus(val);
        applyFilters({ status: val === "all" ? "" : val });
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (searchTimeout) clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(() => applyFilters({ search: val }), 500));
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedType("");
        setSelectedStatus("");
        router.get("/superadmin/Warehouse", {}, { preserveState: true, preserveScroll: true });
    };

    const handlePagination = (url) => {
        if (url) router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    const handleStatusChange = (warehouseId, newStatus) => {
        setLoading(true);
        router.put(`/superadmin/warehouses/${warehouseId}/status`, { status: newStatus }, {
            onSuccess: () => { setIsModalOpen(false); setSelectedWarehouse(null); },
            onFinish: () => setLoading(false),
        });
    };

    useEffect(() => {
        return () => { if (searchTimeout) clearTimeout(searchTimeout); };
    }, [searchTimeout]);

    const data = warehouses.data || [];
    const allStatuses = ["approved", "rejected", "suspended", "pending"];

    return (
        <div className="flex flex-col gap-4">
            <AnimatePresence>
                {confirmAction && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="bg-[#0B1739] border border-[#343B4F] rounded-[12px] p-6 w-[380px] max-w-[90vw] shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${confirmAction.iconBg}`}>
                                    {confirmAction.icon}
                                </div>
                                <h3 className="text-white text-[16px] font-[600]">{confirmAction.title}</h3>
                            </div>
                            <p className="text-[#AEB9E1] text-[13px] mb-6 leading-relaxed">
                                {confirmAction.message}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmAction(null)}
                                    className="flex-1 border border-[#343B4F] bg-[#0F1A3A] text-[#AEB9E1] text-[13px] py-2.5 rounded-[7px] hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        confirmAction.onConfirm();
                                        setConfirmAction(null);
                                    }}
                                    className={`flex-1 text-[13px] py-2.5 rounded-[7px] font-[500] transition-colors ${confirmAction.confirmStyle}`}
                                >
                                    {confirmAction.confirmLabel}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-3 items-center bg-[#0B1739] border border-[#343B4F] rounded-lg p-4">
                <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[#081028] border border-[#343B4F] rounded-md px-3">
                    <Search size={14} className="text-[#AEB9E1]" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search warehouses, owners..."
                        className="bg-transparent text-white text-xs outline-none border-none focus:ring-0 py-2 w-full"
                    />
                </div>
                <select
                    value={selectedType}
                    onChange={handleTypeFilterChange}
                    className="bg-[#081028] border border-[#343B4F] text-white text-xs rounded-md px-3 py-2 focus:outline-none focus:ring-0 cursor-pointer"
                >
                    {warehouseTypeFilterOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <select
                    value={selectedStatus}
                    onChange={handleStatusFilterChange}
                    className="bg-[#081028] border border-[#343B4F] text-white text-xs rounded-md px-3 py-2 focus:outline-none focus:ring-0 cursor-pointer"
                >
                    {warehouseStatusFilterOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-1 bg-[#FF572233] hover:bg-[#FF57224D] text-[#FF5722] text-xs px-3 py-2 rounded-md border border-[#FF572280] transition-colors"
                >
                    <X size={12} /> Clear
                </button>
            </div>

            {/* Table */}
            <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg overflow-hidden">
                {error ? (
                    <div className="flex items-center justify-center h-48 text-red-500 text-sm">{error}</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#343B4F]">
                                        <th className="text-[#AEB9E1] text-[10px] font-normal text-left px-4 py-3">Warehouse</th>
                                        <th className="text-[#AEB9E1] text-[10px] font-normal text-left px-4 py-3">Location</th>
                                        <th className="text-[#AEB9E1] text-[10px] font-normal text-left px-4 py-3">Capacity</th>
                                        <th className="text-[#AEB9E1] text-[10px] font-normal text-left px-4 py-3">Area</th>
                                        <th className="text-[#AEB9E1] text-[10px] font-normal text-left px-4 py-3">Type</th>
                                        <th className="text-[#AEB9E1] text-[10px] font-normal text-left px-4 py-3">Status</th>
                                        <th className="text-[#AEB9E1] text-[10px] font-normal text-left px-4 py-3">Owner</th>
                                        <th className="text-[#AEB9E1] text-[10px] font-normal text-left px-4 py-3">Monthly Rate</th>
                                        <th className="text-[#AEB9E1] text-[10px] font-normal text-center px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.length > 0 ? (
                                        data.map((wh) => {
                                            const cs = getCategoryStyles(wh.type);
                                            const ss = getStatusStyles(wh.status);
                                            return (
                                                <tr key={wh.id} className="border-b border-[#343B4F]/30 hover:bg-[#081028] transition-colors">
                                                    <td className="px-4 py-3">
                                                        <span className="text-white text-[11px] font-medium">{wh.name}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-[#AEB9E1] text-[10px] flex items-center gap-1">
                                                            <MapPin size={10} /> {wh.location}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-[#AEB9E1] text-[10px]">{wh.capacity} sq ft</td>
                                                    <td className="px-4 py-3 text-[#AEB9E1] text-[10px]">{wh.total_area} sq ft</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1 border ${cs.border} ${cs.bg} px-2 py-0.5 rounded text-[10px] ${cs.text}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${cs.dot}`} />
                                                            {wh.type?.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1 border ${ss.border} ${ss.bg} px-2 py-0.5 rounded text-[10px] ${ss.text}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                                                            {wh.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-[#0955AC] text-[10px] font-medium">{wh.owner_name}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-[#14CA74] text-[10px]">
                                                        LKR {Number(wh.pricing?.monthly_rate || 0).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => { setSelectedWarehouse(wh); setIsModalOpen(true); }}
                                                            className="p-1.5 rounded hover:bg-[#0E43FB20] transition-colors"
                                                        >
                                                            <Eye size={14} className="text-[#0E43FB]" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="text-center text-[#AEB9E1] text-xs py-12">
                                                No warehouses found matching your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-[#343B4F]">
                            <span className="text-[#AEB9E1] text-xs">
                                {warehouses.from || 0} - {warehouses.to || 0} of {warehouses.total || 0}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePagination(warehouses.prev_page_url)}
                                    disabled={!warehouses.prev_page_url}
                                    className={`p-1.5 rounded border border-[#343B4F] ${
                                        !warehouses.prev_page_url
                                            ? "opacity-40 cursor-not-allowed"
                                            : "hover:bg-[#181A2A] cursor-pointer"
                                    }`}
                                >
                                    <ChevronLeft size={14} className="text-white" />
                                </button>
                                <span className="text-white text-xs px-2">
                                    Page {warehouses.current_page || 1} of {warehouses.last_page || 1}
                                </span>
                                <button
                                    onClick={() => handlePagination(warehouses.next_page_url)}
                                    disabled={!warehouses.next_page_url}
                                    className={`p-1.5 rounded border border-[#343B4F] ${
                                        !warehouses.next_page_url
                                            ? "opacity-40 cursor-not-allowed"
                                            : "hover:bg-[#181A2A] cursor-pointer"
                                    }`}
                                >
                                    <ChevronRight size={14} className="text-white" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Detail Modal */}
            {isModalOpen && selectedWarehouse && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
                    onClick={() => { setIsModalOpen(false); setSelectedWarehouse(null); }}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="bg-gradient-to-br from-[#0B1739] to-[#1A2444] border border-[#343B4F] p-6 rounded-xl text-white w-[550px] max-w-[90vw] max-h-[85vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Building2 size={20} className="text-[#0E43FB]" />
                                Warehouse Details
                            </h2>
                            <button
                                onClick={() => { setIsModalOpen(false); setSelectedWarehouse(null); }}
                                className="p-1 rounded hover:bg-[#343B4F] transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem icon={Building2} label="Name" value={selectedWarehouse.name} />
                            <DetailItem icon={MapPin} label="Location" value={selectedWarehouse.location} />
                            <DetailItem icon={Maximize} label="Capacity" value={`${selectedWarehouse.capacity} sq ft`} />
                            <DetailItem icon={Maximize} label="Total Area" value={`${selectedWarehouse.total_area} sq ft`} />
                            <DetailItem icon={User} label="Owner" value={selectedWarehouse.owner_name} highlight />
                            <DetailItem icon={Mail} label="Email" value={selectedWarehouse.owner_email} />
                            <div>
                                <span className="text-[#AEB9E1] text-[10px] flex items-center gap-1 mb-1">
                                    <Package size={10} /> Type
                                </span>
                                <span className={`inline-flex items-center gap-1 border ${getCategoryStyles(selectedWarehouse.type).border} ${getCategoryStyles(selectedWarehouse.type).bg} px-2 py-1 rounded text-xs ${getCategoryStyles(selectedWarehouse.type).text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${getCategoryStyles(selectedWarehouse.type).dot}`} />
                                    {selectedWarehouse.type?.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <div>
                                <span className="text-[#AEB9E1] text-[10px] flex items-center gap-1 mb-1">
                                    <CheckCircle size={10} /> Status
                                </span>
                                <span className={`inline-flex items-center gap-1 border ${getStatusStyles(selectedWarehouse.status).border} ${getStatusStyles(selectedWarehouse.status).bg} px-2 py-1 rounded text-xs ${getStatusStyles(selectedWarehouse.status).text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusStyles(selectedWarehouse.status).dot}`} />
                                    {selectedWarehouse.status}
                                </span>
                            </div>
                        </div>

                        {/* Pricing */}
                        {selectedWarehouse.pricing && (
                            <div className="mt-4 p-3 bg-[#081028] rounded-lg">
                                <h4 className="text-xs font-medium text-[#AEB9E1] mb-2 flex items-center gap-1">
                                    <DollarSign size={12} /> Pricing
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-[10px] text-[#AEB9E1]">Base Price: <span className="text-white">LKR {Number(selectedWarehouse.pricing.base_price || 0).toLocaleString()}</span></div>
                                    <div className="text-[10px] text-[#AEB9E1]">Monthly Rate: <span className="text-[#14CA74]">LKR {Number(selectedWarehouse.pricing.monthly_rate || 0).toLocaleString()}</span></div>
                                </div>
                            </div>
                        )}

                        {/* Contact */}
                        {selectedWarehouse.contact && (
                            <div className="mt-3 p-3 bg-[#081028] rounded-lg">
                                <h4 className="text-xs font-medium text-[#AEB9E1] mb-2 flex items-center gap-1">
                                    <Phone size={12} /> Contact
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-[10px] text-[#AEB9E1]">Person: <span className="text-white">{selectedWarehouse.contact.person}</span></div>
                                    <div className="text-[10px] text-[#AEB9E1]">Phone: <span className="text-white">{selectedWarehouse.contact.phone}</span></div>
                                    <div className="text-[10px] text-[#AEB9E1] col-span-2">Email: <span className="text-white">{selectedWarehouse.contact.email}</span></div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-6 flex flex-wrap gap-2 justify-center">
                            {loading && <p className="text-xs text-[#AEB9E1] w-full text-center">Updating status...</p>}
                            {allStatuses
                                .filter((s) => s !== selectedWarehouse.status)
                                .map((targetStatus) => {
                                    const bc = getButtonColors(targetStatus);
                                    const labels = { approved: "Approve", rejected: "Reject", suspended: "Suspend", pending: "Set Pending" };
                                    const icons = { approved: CheckCircle, rejected: XCircle, suspended: ShieldAlert, pending: Clock };
                                    const Icon = icons[targetStatus];
                                    return (
                                        <motion.button
                                            key={targetStatus}
                                            whileHover={{ scale: loading ? 1 : 1.03 }}
                                            disabled={loading}
                                            className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-md border transition-colors duration-150 ${bc.bg} ${bc.hover} ${bc.text} ${bc.border} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                            onClick={() =>
                                                setConfirmAction({
                                                    title: `${labels[targetStatus]} Warehouse`,
                                                    message: `Are you sure you want to ${labels[targetStatus].toLowerCase()} ${selectedWarehouse.name || "this warehouse"}?`,
                                                    confirmLabel: labels[targetStatus],
                                                    confirmStyle:
                                                        targetStatus === "approved"
                                                            ? "border border-[#05C16880] bg-[#05C16820] text-[#14CA74] hover:bg-[#05C16840]"
                                                            : targetStatus === "rejected"
                                                            ? "border border-[#FF572280] bg-[#FF572220] text-[#FF5722] hover:bg-[#FF572240]"
                                                            : targetStatus === "suspended"
                                                            ? "border border-[#FF5A6580] bg-[#FF5A6520] text-[#FF5A65] hover:bg-[#FF5A6540]"
                                                            : "border border-[#FFB01680] bg-[#FFB01620] text-[#FDB52A] hover:bg-[#FFB01640]",
                                                    iconBg:
                                                        targetStatus === "approved"
                                                            ? "bg-[#05C16820]"
                                                            : targetStatus === "rejected"
                                                            ? "bg-[#FF572220]"
                                                            : targetStatus === "suspended"
                                                            ? "bg-[#FF5A6520]"
                                                            : "bg-[#FFB01620]",
                                                    icon: <Icon size={16} className={
                                                        targetStatus === "approved"
                                                            ? "text-[#14CA74]"
                                                            : targetStatus === "rejected"
                                                            ? "text-[#FF5722]"
                                                            : targetStatus === "suspended"
                                                            ? "text-[#FF5A65]"
                                                            : "text-[#FDB52A]"
                                                    } />,
                                                    onConfirm: () => handleStatusChange(selectedWarehouse.id, targetStatus),
                                                })
                                            }
                                        >
                                            <Icon size={12} /> {labels[targetStatus]}
                                        </motion.button>
                                    );
                                })}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-md bg-[#343B4F] hover:bg-[#4A5270] text-white transition-colors"
                                onClick={() => { setIsModalOpen(false); setSelectedWarehouse(null); }}
                            >
                                <X size={12} /> Close
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

const DetailItem = ({ icon: Icon, label, value, highlight }) => (
    <div>
        <span className="text-[#AEB9E1] text-[10px] flex items-center gap-1 mb-1">
            <Icon size={10} /> {label}
        </span>
        <span className={`text-xs ${highlight ? "text-[#0955AC] font-medium" : "text-white"}`}>{value || "N/A"}</span>
    </div>
);

export default WarehouseListTab;
