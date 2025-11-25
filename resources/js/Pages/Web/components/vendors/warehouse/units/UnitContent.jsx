// resources/js/Pages/Web/components/vendors/warehouse/UnitContent.jsx
import React, { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";

// Assets
import miniSearchIcon from "../../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";
import filterIcon from "../../../../assets/vendors/dashboard/icons/filterIcon.svg";
import miniDownArrow from "../../../../assets/vendors/dashboard/icons/miniDownArrow.svg";
import AddUnit from "../../../../home/vendors/warehouse/AddUnit";
import UserDropdown from "../../UserDropdown.jsx";

const UnitContent = () => {
    const { auth } = usePage().props;
    const user = auth?.user;

    // Data & Loading
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUnits, setTotalUnits] = useState(0);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // UI States
    const [showAddUnit, setShowAddUnit] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [unitToToggle, setUnitToToggle] = useState(null);
    const [isToggling, setIsToggling] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const perPageOptions = [5, 10, 20, 50];

    // Fetch Units
    const fetchUnits = async (page = 1, perPage = 10, search = "", type = "", status = "") => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: perPage.toString(),
            });
            if (search) params.append("search", search);
            if (type) params.append("type", type);
            if (status) params.append("status", status);

            const response = await fetch(`/vendors/warehouse/api/units?${params}`, {
                method: "GET",
                headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
                credentials: "same-origin",
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            setUnits(data.data || []);
            setCurrentPage(data.current_page || 1);
            setTotalPages(data.last_page || 1);
            setTotalUnits(data.total || 0);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to load warehouse units. Please try again.");
            setUnits([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial & Pagination Fetch
    useEffect(() => {
        fetchUnits(currentPage, itemsPerPage, searchTerm, typeFilter, statusFilter);
    }, [currentPage, itemsPerPage]);

    // Debounced Search & Filters
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchUnits(1, itemsPerPage, searchTerm, typeFilter, statusFilter);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, typeFilter, statusFilter]);

    // Pagination Helpers
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            pages.push(1, 2, 3, "...", totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
        }
        return pages;
    };

    // Actions
    const handleAddUnitClick = () => setShowAddUnit(true);
    const handleViewWarehouse = (unit) => router.visit(`/vendors/warehouse/unitDetails/${unit.id}`);
    const handleEditWarehouse = (unit) => router.visit(`/vendors/warehouse/editUnit/${unit.id}`);

    const handleToggleStatus = (unit) => {
        setUnitToToggle(unit);
        setShowConfirmModal(true);
    };

    const confirmToggleStatus = async () => {
        if (!unitToToggle) return;
        setIsToggling(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
            const res = await fetch(`/vendors/warehouse/api/units/${unitToToggle.id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken || "",
                },
                body: JSON.stringify({ is_active: !unitToToggle.is_active }),
            });

            if (!res.ok) throw new Error("Failed to update");

            const result = await res.json();
            setUnits(prev => prev.map(u => u.id === unitToToggle.id ? { ...u, ...result.unit } : u));
            setShowConfirmModal(false);
            setUnitToToggle(null);
        } catch (err) {
            alert("Failed to update status");
        } finally {
            setIsToggling(false);
        }
    };

    const handleDeleteWarehouse = (unit) => {
        setUnitToDelete(unit);
        setShowDeleteModal(true);
    };

    const confirmDeleteWarehouse = async () => {
        if (!unitToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/vendors/warehouse/api/units/${unitToDelete.id}`, {
                method: "DELETE",
                headers: { "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" },
            });
            if (!res.ok) throw new Error("Delete failed");
            setUnits(prev => prev.filter(u => u.id !== unitToDelete.id));
            setTotalUnits(prev => prev - 1);
            setShowDeleteModal(false);
            setUnitToDelete(null);
        } catch (err) {
            alert("Failed to delete unit");
        } finally {
            setIsDeleting(false);
        }
    };

    const statusColor = (status) => {
        const map = {
            Available: "text-green-600",
            Occupied: "text-amber-600",
            "Pending Approval": "text-yellow-600",
            Rejected: "text-red-600",
            Inactive: "text-gray-500",
        };
        return map[status] || "text-gray-500";
    };

    const getFirstImageUrl = (unit) => {
        const sources = [
            unit?.thumbnail_url,
            unit?.image,
            unit?.images?.[0]?.url || unit?.images?.[0],
            unit?.image_urls?.[0],
            unit?.gallery?.[0]?.url,
        ];
        return sources.find(Boolean) || null;
    };

    return (
        <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-8 lg:py-12 bg-gray-50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-6 mb-10">
                <h1 className="figtree text-[28px] sm:text-[35px] font-bold text-gray-900">
                    Warehouse Units
                </h1>
                <UserDropdown />
            </div>

            {/* Search, Filter section - Only show when not in Add Unit mode */}
            {!showAddUnit && (
                <div className="flex flex-row justify-between mt-10 mb-5">
                    <div className="flex flex-row items-center justify-between w-full">
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="w-[253px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
                                <img src={miniSearchIcon} alt="Search" />
                                <input
                                    type="text"
                                    className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                                    placeholder="Search warehouse name, address..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="w-[139px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                                <img
                                    src={filterIcon}
                                    className="size-[12px]"
                                    alt="Filter"
                                />
                                <select
                                    className="text-[14px] font-[500] text-[#7B7B7ACC] bg-transparent outline-none border-none"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option value="">All Types</option>
                                    <option value="Cold Storage">
                                        Cold Storage
                                    </option>
                                    <option value="Dry Storage">Dry Storage</option>
                                    <option value="Climate Controlled">
                                        Climate Controlled
                                    </option>
                                    <option value="General Storage">
                                        General Storage
                                    </option>
                                </select>
                                <img src={miniDownArrow} alt="Dropdown" />
                            </div>
                            <div className="w-[125px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                                <img
                                    src={filterIcon}
                                    className="size-[12px]"
                                    alt="Filter"
                                />
                                <select
                                    className="text-[14px] font-[500] text-[#7B7B7ACC] bg-transparent outline-none border-none"
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                >
                                    <option value="">All Status</option>
                                    <option value="Available">Available</option>
                                    <option value="Occupied">Occupied</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                                <img src={miniDownArrow} alt="Dropdown" />
                            </div>
                        </div>
                        <button
                            className="w-[125px] h-[35px] bg-[#0955AC] text-[14px] rounded-[6px] text-[#FFFFFF] font-[700]"
                            onClick={handleAddUnitClick}
                        >
                            Add Warehouse
                        </button>
                    </div>
                </div>
            )}

            {/* Add Unit or List */}
            {showAddUnit ? (
                <AddUnit />
            ) : (
                <>
                    {/* States */}
                    {loading && (
                        <div className="text-center py-20">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-[#0955AC]"></div>
                            <p className="mt-4 text-gray-600">Loading...</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="text-center py-20">
                            <p className="text-red-600 font-semibold mb-4">{error}</p>
                            <button onClick={() => fetchUnits()} className="px-6 py-3 bg-[#0955AC] text-white rounded-lg">
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading && !error && units.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-xl">
                            <p className="text-2xl font-bold text-gray-700 mb-3">No units found</p>
                            <button onClick={handleAddUnitClick} className="px-6 py-3 bg-[#0955AC] text-white rounded-lg">
                                Add Your First Warehouse
                            </button>
                        </div>
                    )}

                    {/* Cards */}
                    {!loading && !error && units.length > 0 && (
                        <div className="space-y-8">
                            {units.map((unit) => {
                                const imageUrl = getFirstImageUrl(unit);
                                return (
                                    <div
                                        key={unit.id}
                                        className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col lg:flex-row"
                                    >
                                        {/* Image */}
                                        <div className="w-full lg:w-72 h-56 lg:h-auto">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={unit.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 text-xl font-medium">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between min-w-0">
                                            <div>
                                                <h3 className="bebas-neue text-3xl lg:text-4xl font-normal leading-tight truncate">
                                                    {unit.name}{" "}
                                                    <span className="text-[#0955AC]">[{unit.type}]</span>
                                                </h3>

                                                <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-gray-700">
                                                    <span className={statusColor(unit.availability_status)}>
                                                        {unit.availability_status}
                                                    </span>
                                                    <span>Pricing: {unit.pricing_model?.replace(/_/g, " ") || "N/A"}</span>
                                                    <span>Area: {unit.total_area || "N/A"} sqft</span>
                                                    <span>Capacity: {unit.capacity || "N/A"}</span>
                                                </div>

                                                <p className="mt-3 text-gray-600">{unit.address}</p>
                                                {unit.description && (
                                                    <p className="mt-3 text-gray-600 text-sm line-clamp-2">{unit.description}</p>
                                                )}

                                                <div className="mt-5 flex flex-wrap gap-2">
                                                    {unit.approval_status && unit.approval_status !== "approved" && (
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${unit.approval_status === "pending" ? "bg-yellow-500" : "bg-red-600"}`}>
                                                            {unit.approval_status === "pending" ? "Pending" : "Rejected"}
                                                        </span>
                                                    )}
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${unit.is_active ? "bg-green-600" : "bg-gray-500"}`}>
                                                        {unit.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                    {unit.approval_status === "approved" && (
                                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">Approved</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                                <button
                                                    onClick={() => handleViewWarehouse(unit)}
                                                    className="flex-1 h-12 bg-[#0955AC] text-white font-bold rounded-lg hover:bg-[#074a94] transition flex items-center justify-center gap-2"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => handleEditWarehouse(unit)}
                                                    className="h-12 px-6 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteWarehouse(unit)}
                                                    className="h-12 px-6 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(unit)}
                                                    className={`h-12 px-6 font-bold rounded-lg text-white ${unit.is_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                                                >
                                                    {unit.is_active ? "Deactivate" : "Activate"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Action Icons (Right on desktop, bottom on mobile) */}
                                        <div className="bg-[#D8E4F2] p-6 lg:p-8 lg:w-48 flex lg:flex-col justify-center items-center gap-6 order-first lg:order-last">
                                            <button onClick={() => handleViewWarehouse(unit)} className="size-14 bg-white border-2 border-[#0955AC] rounded-xl hover:bg-blue-50 transition flex items-center justify-center text-2xl" title="View">
                                                View
                                            </button>
                                            <button onClick={() => handleEditWarehouse(unit)} className="size-14 bg-white border-2 border-orange-500 rounded-xl hover:bg-orange-50 transition flex items-center justify-center text-2xl" title="Edit">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteWarehouse(unit)} className="size-14 bg-white border-2 border-red-600 rounded-xl hover:bg-red-50 transition flex items-center justify-center text-2xl" title="Delete">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-12">
                            <div className="flex items-center gap-3">
                                <span className="text-gray-700">Per page</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="px-4 py-2 bg-white border rounded-lg"
                                >
                                    {perPageOptions.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="size-10 rounded-lg bg-white border disabled:opacity-50 hover:bg-gray-50">Previous</button>
                                {getPageNumbers().map((n, i) => (
                                    n === "..." ? <span key={i}>...</span> :
                                    <button key={n} onClick={() => goToPage(n)} className={`size-10 rounded-lg font-semibold ${currentPage === n ? "bg-[#0955AC] text-white" : "bg-white border hover:bg-gray-50"}`}>
                                        {n}
                                    </button>
                                ))}
                                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="size-10 rounded-lg bg-white border disabled:opacity-50 hover:bg-gray-50">Next</button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modals - unchanged */}
            {showConfirmModal && unitToToggle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Confirm Status Change</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to <strong>{unitToToggle.is_active ? "deactivate" : "activate"}</strong> "<strong>{unitToToggle.name}</strong>"?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowConfirmModal(false)} disabled={isToggling} className="px-5 py-2 border rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={confirmToggleStatus} disabled={isToggling} className={`px-5 py-2 text-white rounded-lg ${unitToToggle.is_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}>
                                {isToggling ? "Updating..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && unitToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-red-600 mb-4">Delete Warehouse Unit</h3>
                        <p className="text-gray-600 mb-6">
                            Permanently delete "<strong>{unitToDelete.name}</strong>"? This cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="px-5 py-2 border rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={confirmDeleteWarehouse} disabled={isDeleting} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnitContent;