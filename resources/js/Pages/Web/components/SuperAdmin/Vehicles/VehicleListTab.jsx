import React, { useState, useEffect } from "react";
import { router, Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    CheckCircle,
    XCircle,
    Clock,
    Car,
    Plane,
    Ship,
    User,
    Mail,
    DollarSign,
    Truck,
    Star,
    MapPin,
    Calendar,
    Fuel,
    Users,
    Filter,
} from "lucide-react";

const vehicleTypeFilterOptions = [
    { value: "all", label: "All Types" },
    { value: "land", label: "Land" },
    { value: "air", label: "Air" },
    { value: "sea", label: "Sea" },
];

const vehicleStatusFilterOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "draft", label: "Draft" },
];

const approvalFilterOptions = [
    { value: "all", label: "All Approval" },
    { value: "approved", label: "Approved" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" },
];

const getTypeStyles = (type) => {
    const map = {
        land: { border: "border-[#0E43FB80]", bg: "bg-[#0E43FB33]", dot: "bg-[#0E43FB]", text: "text-[#0E43FB]" },
        air: { border: "border-[#AB47BC80]", bg: "bg-[#AB47BC33]", dot: "bg-[#AB47BC]", text: "text-[#AB47BC]" },
        sea: { border: "border-[#00C2FF80]", bg: "bg-[#00C2FF33]", dot: "bg-[#00C2FF]", text: "text-[#00C2FF]" },
    };
    return map[type] || { border: "border-[#343B4F]", bg: "bg-[#0B1739]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]" };
};

const getStatusStyles = (status) => {
    const map = {
        active: { border: "border-[#05C16880]", bg: "bg-[#05C16833]", dot: "bg-[#14CA74]", text: "text-[#14CA74]" },
        inactive: { border: "border-[#FF5A6580]", bg: "bg-[#FF5A6533]", dot: "bg-[#FF5A65]", text: "text-[#FF5A65]" },
        draft: { border: "border-[#AEB9E180]", bg: "bg-[#AEB9E133]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]" },
    };
    return map[status] || { border: "border-[#343B4F]", bg: "bg-[#0B1739]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]" };
};

const getApprovalStyles = (status) => {
    const map = {
        approved: { border: "border-[#05C16880]", bg: "bg-[#05C16833]", dot: "bg-[#14CA74]", text: "text-[#14CA74]" },
        pending: { border: "border-[#FFB01680]", bg: "bg-[#FFB01633]", dot: "bg-[#FDB52A]", text: "text-[#FDB52A]" },
        rejected: { border: "border-[#FF572280]", bg: "bg-[#FF572233]", dot: "bg-[#FF5722]", text: "text-[#FF5722]" },
    };
    return map[status] || { border: "border-[#343B4F]", bg: "bg-[#0B1739]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]" };
};

const getActionColors = (action) => {
    const map = {
        approve: { bg: "bg-[#05C16833]", hover: "hover:bg-[#05C1684D]", text: "text-[#14CA74]", border: "border-[#05C16880]" },
        reject: { bg: "bg-[#FF572233]", hover: "hover:bg-[#FF57224D]", text: "text-[#FF5722]", border: "border-[#FF572280]" },
        activate: { bg: "bg-[#0E43FB33]", hover: "hover:bg-[#0E43FB4D]", text: "text-[#0E43FB]", border: "border-[#0E43FB80]" },
        deactivate: { bg: "bg-[#FF5A6533]", hover: "hover:bg-[#FF5A654D]", text: "text-[#FF5A65]", border: "border-[#FF5A6580]" },
    };
    return map[action] || { bg: "bg-[#0955AC]", hover: "hover:bg-[#074a92]", text: "text-white", border: "border-[#0955AC]" };
};

const TypeIcon = ({ type, size = 12 }) => {
    const icons = { land: Car, air: Plane, sea: Ship };
    const Icon = icons[type] || Car;
    return <Icon size={size} />;
};

const VehicleListTab = ({ vehicles = {}, filters = {}, stats = {} }) => {
    const [selectedType, setSelectedType] = useState(filters.category_type || "all");
    const [selectedStatus, setSelectedStatus] = useState(filters.status || "all");
    const [selectedApproval, setSelectedApproval] = useState(filters.approval_status || "all");
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [loading, setLoading] = useState(false);

    const applyFilters = (overrides = {}) => {
        const params = {};
        const search = overrides.search ?? searchTerm;
        const type = overrides.type ?? (selectedType === "all" ? "" : selectedType);
        const status = overrides.status ?? (selectedStatus === "all" ? "" : selectedStatus);
        const approval = overrides.approval ?? (selectedApproval === "all" ? "" : selectedApproval);

        if (search) params.search = search;
        if (type) params.category_type = type;
        if (status) params.status = status;
        if (approval) params.approval_status = approval;

        router.get("/superadmin/Vehicles", params, { preserveState: true, preserveScroll: true });
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

    const handleApprovalFilterChange = (e) => {
        const val = e.target.value;
        setSelectedApproval(val);
        applyFilters({ approval: val === "all" ? "" : val });
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (searchTimeout) clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(() => applyFilters({ search: val }), 500));
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedType("all");
        setSelectedStatus("all");
        setSelectedApproval("all");
        router.get("/superadmin/Vehicles", {}, { preserveState: true, preserveScroll: true });
    };

    const handlePagination = (url) => {
        if (url) router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    const handleApprovalChange = (vehicleId, status, reason = "") => {
        setLoading(true);
        router.put(`/superadmin/vehicles/${vehicleId}/approval`, {
            approval_status: status,
            rejection_reason: reason,
        }, {
            onSuccess: () => { setIsModalOpen(false); setSelectedVehicle(null); },
            onFinish: () => setLoading(false),
        });
    };

    const handleStatusChange = (vehicleId, status) => {
        setLoading(true);
        router.put(`/superadmin/vehicles/${vehicleId}/status`, { status }, {
            onSuccess: () => { setIsModalOpen(false); setSelectedVehicle(null); },
            onFinish: () => setLoading(false),
        });
    };

    useEffect(() => {
        return () => { if (searchTimeout) clearTimeout(searchTimeout); };
    }, [searchTimeout]);

    const data = vehicles.data || [];

    return (
        <div className="flex flex-col gap-4">
            {/* Filters Bar */}
            <div className="flex flex-wrap gap-3 items-center bg-[#0B1739] border border-[#343B4F] rounded-lg p-4">
                <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[#081028] border border-[#343B4F] rounded-md px-3">
                    <Search size={14} className="text-[#AEB9E1]" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search vehicles, owners..."
                        className="bg-transparent text-white text-xs outline-none border-none focus:ring-0 py-2 w-full"
                    />
                </div>
                <select
                    value={selectedType}
                    onChange={handleTypeFilterChange}
                    className="bg-[#081028] border border-[#343B4F] text-white text-xs rounded-md px-3 py-2 focus:outline-none focus:ring-0 cursor-pointer"
                >
                    {vehicleTypeFilterOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <select
                    value={selectedStatus}
                    onChange={handleStatusFilterChange}
                    className="bg-[#081028] border border-[#343B4F] text-white text-xs rounded-md px-3 py-2 focus:outline-none focus:ring-0 cursor-pointer"
                >
                    {vehicleStatusFilterOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <select
                    value={selectedApproval}
                    onChange={handleApprovalFilterChange}
                    className="bg-[#081028] border border-[#343B4F] text-white text-xs rounded-md px-3 py-2 focus:outline-none focus:ring-0 cursor-pointer"
                >
                    {approvalFilterOptions.map((opt) => (
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
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#343B4F]">
                                <th className="text-[#AEB9E1] text-[10px] font-normal text-left px-4 py-3">Vehicle</th>
                                <th className="text-[#AEB9E1] text-[10px] font-normal text-left px-4 py-3">Type</th>
                                <th className="text-[#AEB9E1] text-[10px] font-normal text-left px-4 py-3">Owner</th>
                                <th className="text-[#AEB9E1] text-[10px] font-normal text-left px-4 py-3">Price/Day</th>
                                <th className="text-[#AEB9E1] text-[10px] font-normal text-left px-4 py-3">Status</th>
                                <th className="text-[#AEB9E1] text-[10px] font-normal text-left px-4 py-3">Approval</th>
                                <th className="text-[#AEB9E1] text-[10px] font-normal text-center px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((vehicle) => {
                                    const ts = getTypeStyles(vehicle.category?.type || vehicle.type);
                                    const ss = getStatusStyles(vehicle.status);
                                    const as = getApprovalStyles(vehicle.approval_status);
                                    return (
                                        <tr key={vehicle.id} className="border-b border-[#343B4F]/30 hover:bg-[#081028] transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {vehicle.media && vehicle.media.length > 0 ? (
                                                        <img
                                                            src={vehicle.media[0].url}
                                                            alt={vehicle.model}
                                                            className="w-10 h-10 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-[#343B4F] rounded flex items-center justify-center">
                                                            <Truck size={16} className="text-[#AEB9E1]" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-white text-[11px] font-medium">
                                                            {vehicle.manufacturer} {vehicle.model}
                                                        </p>
                                                        <p className="text-[#AEB9E1] text-[9px]">{vehicle.registration_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 border ${ts.border} ${ts.bg} px-2 py-0.5 rounded text-[10px] ${ts.text}`}>
                                                    <TypeIcon type={vehicle.category?.type || vehicle.type} />
                                                    {(vehicle.category?.type || vehicle.type)?.charAt(0).toUpperCase() + (vehicle.category?.type || vehicle.type)?.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="text-[#0955AC] text-[10px] font-medium">{vehicle.provider?.name}</p>
                                                    <p className="text-[#AEB9E1] text-[9px]">{vehicle.provider?.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-[#14CA74] text-[10px] font-medium">
                                                LKR {Number(vehicle.rental_price_per_day || 0).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 border ${ss.border} ${ss.bg} px-2 py-0.5 rounded text-[10px] ${ss.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                                                    {vehicle.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 border ${as.border} ${as.bg} px-2 py-0.5 rounded text-[10px] ${as.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${as.dot}`} />
                                                    {vehicle.approval_status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => { setSelectedVehicle(vehicle); setIsModalOpen(true); }}
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
                                    <td colSpan={7} className="text-center text-[#AEB9E1] text-xs py-12">
                                        No vehicles found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#343B4F]">
                    <span className="text-[#AEB9E1] text-xs">
                        {vehicles.from || 0} - {vehicles.to || 0} of {vehicles.total || 0}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePagination(vehicles.prev_page_url)}
                            disabled={!vehicles.prev_page_url}
                            className={`p-1.5 rounded border border-[#343B4F] ${
                                !vehicles.prev_page_url
                                    ? "opacity-40 cursor-not-allowed"
                                    : "hover:bg-[#181A2A] cursor-pointer"
                            }`}
                        >
                            <ChevronLeft size={14} className="text-white" />
                        </button>
                        <span className="text-white text-xs px-2">
                            Page {vehicles.current_page || 1} of {vehicles.last_page || 1}
                        </span>
                        <button
                            onClick={() => handlePagination(vehicles.next_page_url)}
                            disabled={!vehicles.next_page_url}
                            className={`p-1.5 rounded border border-[#343B4F] ${
                                !vehicles.next_page_url
                                    ? "opacity-40 cursor-not-allowed"
                                    : "hover:bg-[#181A2A] cursor-pointer"
                            }`}
                        >
                            <ChevronRight size={14} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {isModalOpen && selectedVehicle && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
                    onClick={() => { setIsModalOpen(false); setSelectedVehicle(null); }}
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
                                <Truck size={20} className="text-[#0E43FB]" />
                                Vehicle Details
                            </h2>
                            <button
                                onClick={() => { setIsModalOpen(false); setSelectedVehicle(null); }}
                                className="p-1 rounded hover:bg-[#343B4F] transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Vehicle Image */}
                        {selectedVehicle.media && selectedVehicle.media.length > 0 && (
                            <div className="mb-4 rounded-lg overflow-hidden">
                                <img
                                    src={selectedVehicle.media[0].url}
                                    alt={selectedVehicle.model}
                                    className="w-full h-48 object-cover"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem icon={Truck} label="Vehicle" value={`${selectedVehicle.manufacturer} ${selectedVehicle.model}`} />
                            <DetailItem icon={Calendar} label="Year" value={selectedVehicle.manufacture_year} />
                            <DetailItem icon={Car} label="Registration" value={selectedVehicle.registration_number} />
                            <DetailItem icon={Users} label="Capacity" value={`${selectedVehicle.passenger_capacity || 'N/A'} passengers`} />
                            <DetailItem icon={User} label="Owner" value={selectedVehicle.provider?.name} highlight />
                            <DetailItem icon={Mail} label="Email" value={selectedVehicle.provider?.email} />
                            <div>
                                <span className="text-[#AEB9E1] text-[10px] flex items-center gap-1 mb-1">
                                    <Truck size={10} /> Type
                                </span>
                                {(() => {
                                    const type = selectedVehicle.category?.type || selectedVehicle.type;
                                    const ts = getTypeStyles(type);
                                    return (
                                        <span className={`inline-flex items-center gap-1 border ${ts.border} ${ts.bg} px-2 py-1 rounded text-xs ${ts.text}`}>
                                            <TypeIcon type={type} />
                                            {type?.charAt(0).toUpperCase() + type?.slice(1)}
                                        </span>
                                    );
                                })()}
                            </div>
                            <div>
                                <span className="text-[#AEB9E1] text-[10px] flex items-center gap-1 mb-1">
                                    <CheckCircle size={10} /> Status
                                </span>
                                {(() => {
                                    const ss = getStatusStyles(selectedVehicle.status);
                                    return (
                                        <span className={`inline-flex items-center gap-1 border ${ss.border} ${ss.bg} px-2 py-1 rounded text-xs ${ss.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                                            {selectedVehicle.status}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="mt-4 p-3 bg-[#081028] rounded-lg">
                            <h4 className="text-xs font-medium text-[#AEB9E1] mb-2 flex items-center gap-1">
                                <DollarSign size={12} /> Pricing
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="text-[10px] text-[#AEB9E1]">Price/Day: <span className="text-[#14CA74] font-medium">LKR {Number(selectedVehicle.rental_price_per_day || 0).toLocaleString()}</span></div>
                                <div className="text-[10px] text-[#AEB9E1]">Deposit: <span className="text-white">LKR {Number(selectedVehicle.deposit_amount || 0).toLocaleString()}</span></div>
                                <div className="text-[10px] text-[#AEB9E1]">Currency: <span className="text-white">{selectedVehicle.currency || 'LKR'}</span></div>
                                <div className="text-[10px] text-[#AEB9E1]">Condition: <span className="text-white capitalize">{selectedVehicle.condition || 'N/A'}</span></div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="mt-3 p-3 bg-[#081028] rounded-lg">
                            <h4 className="text-xs font-medium text-[#AEB9E1] mb-2">Features</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedVehicle.gps && (
                                    <span className="text-[10px] px-2 py-0.5 bg-[#0E43FB33] text-[#0E43FB] rounded border border-[#0E43FB80]">GPS</span>
                                )}
                                {selectedVehicle.wifi && (
                                    <span className="text-[10px] px-2 py-0.5 bg-[#14CA7433] text-[#14CA74] rounded border border-[#14CA7480]">WiFi</span>
                                )}
                                {selectedVehicle.child_seat && (
                                    <span className="text-[10px] px-2 py-0.5 bg-[#FDB52A33] text-[#FDB52A] rounded border border-[#FDB52A80]">Child Seat</span>
                                )}
                                {selectedVehicle.insurance_coverage && (
                                    <span className="text-[10px] px-2 py-0.5 bg-[#AB47BC33] text-[#AB47BC] rounded border border-[#AB47BC80]">Insurance</span>
                                )}
                                {!selectedVehicle.gps && !selectedVehicle.wifi && !selectedVehicle.child_seat && !selectedVehicle.insurance_coverage && (
                                    <span className="text-[10px] text-[#AEB9E1]">No features listed</span>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex flex-wrap gap-2 justify-center">
                            {loading && <p className="text-xs text-[#AEB9E1] w-full text-center">Updating...</p>}

                            {/* Approval Actions */}
                            {selectedVehicle.approval_status !== "approved" && (
                                <motion.button
                                    whileHover={{ scale: loading ? 1 : 1.03 }}
                                    disabled={loading}
                                    className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-md border transition-colors duration-150 ${getActionColors('approve').bg} ${getActionColors('approve').hover} ${getActionColors('approve').text} ${getActionColors('approve').border} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    onClick={() => handleApprovalChange(selectedVehicle.id, "approved")}
                                >
                                    <CheckCircle size={12} /> Approve
                                </motion.button>
                            )}
                            {selectedVehicle.approval_status !== "rejected" && (
                                <motion.button
                                    whileHover={{ scale: loading ? 1 : 1.03 }}
                                    disabled={loading}
                                    className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-md border transition-colors duration-150 ${getActionColors('reject').bg} ${getActionColors('reject').hover} ${getActionColors('reject').text} ${getActionColors('reject').border} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    onClick={() => {
                                        const reason = prompt("Rejection reason:");
                                        if (reason) handleApprovalChange(selectedVehicle.id, "rejected", reason);
                                    }}
                                >
                                    <XCircle size={12} /> Reject
                                </motion.button>
                            )}

                            {/* Status Actions */}
                            {selectedVehicle.status !== "active" && (
                                <motion.button
                                    whileHover={{ scale: loading ? 1 : 1.03 }}
                                    disabled={loading}
                                    className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-md border transition-colors duration-150 ${getActionColors('activate').bg} ${getActionColors('activate').hover} ${getActionColors('activate').text} ${getActionColors('activate').border} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    onClick={() => handleStatusChange(selectedVehicle.id, "active")}
                                >
                                    <CheckCircle size={12} /> Activate
                                </motion.button>
                            )}
                            {selectedVehicle.status !== "inactive" && (
                                <motion.button
                                    whileHover={{ scale: loading ? 1 : 1.03 }}
                                    disabled={loading}
                                    className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-md border transition-colors duration-150 ${getActionColors('deactivate').bg} ${getActionColors('deactivate').hover} ${getActionColors('deactivate').text} ${getActionColors('deactivate').border} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    onClick={() => handleStatusChange(selectedVehicle.id, "inactive")}
                                >
                                    <XCircle size={12} /> Deactivate
                                </motion.button>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-md bg-[#343B4F] hover:bg-[#4A5270] text-white transition-colors"
                                onClick={() => { setIsModalOpen(false); setSelectedVehicle(null); }}
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

export default VehicleListTab;
