import React, { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import search from "../../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";

import filterIcon from "../../../../assets/vendors/dashboard/icons/filterIcon.svg";
import miniSearchIcon from "../../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";
import miniDownArrow from "../../../../assets/vendors/dashboard/icons/miniDownArrow.svg";

import AddUnit from "../../../../home/vendors/warehouse/AddUnit";

import UserDropdown from "../../Userdropdown";

const UnitContent = () => {
    const { auth } = usePage().props;
    const user = auth?.user;

    // State for warehouse units data
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination and filter state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUnits, setTotalUnits] = useState(0);
    const [showAddUnit, setShowAddUnit] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Toggle status states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [unitToToggle, setUnitToToggle] = useState(null);
    const [isToggling, setIsToggling] = useState(false);

    // Delete confirmation states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const perPageOptions = [5, 10, 20, 50];

    // Fetch warehouse units from API
    const fetchUnits = async (
        page = 1,
        perPage = 10,
        search = "",
        type = "",
        status = ""
    ) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: perPage.toString(),
            });

            if (search) params.append("search", search);
            if (type) params.append("type", type);
            if (status) params.append("status", status);

            const response = await fetch(
                `/vendors/warehouse/api/units?${params}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    credentials: "same-origin",
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            setUnits(data.data || []);
            setCurrentPage(data.current_page || 1);
            setTotalPages(data.last_page || 1);
            setTotalUnits(data.total || 0);
            setError(null);
        } catch (err) {
            console.error("Error fetching warehouse units:", err);
            setError("Failed to load warehouse units. Please try again.");
            setUnits([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchUnits(
            currentPage,
            itemsPerPage,
            searchTerm,
            typeFilter,
            statusFilter
        );
    }, [currentPage, itemsPerPage]);

    // Debounced search effect
    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            setCurrentPage(1); // Reset to first page when filtering
            fetchUnits(1, itemsPerPage, searchTerm, typeFilter, statusFilter);
        }, 500);

        return () => clearTimeout(delayedSearch);
    }, [searchTerm, typeFilter, statusFilter, itemsPerPage]);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // Helper for pagination numbers with ellipsis
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(
                    1,
                    "...",
                    totalPages - 2,
                    totalPages - 1,
                    totalPages
                );
            } else {
                pages.push(
                    1,
                    "...",
                    currentPage - 1,
                    currentPage,
                    currentPage + 1,
                    "...",
                    totalPages
                );
            }
        }
        return pages;
    };

    // Handle Add Unit button click
    const handleAddUnitClick = () => {
        setShowAddUnit(true);
    };

    // Handle toggle active/inactive status
    const handleToggleStatus = (unit) => {
        setUnitToToggle(unit);
        setShowConfirmModal(true);
    };

    // Confirm and execute the toggle
    const confirmToggleStatus = async () => {
        if (!unitToToggle) return;

        setIsToggling(true);
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            const response = await fetch(
                `/vendors/warehouse/api/units/${unitToToggle.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        ...(csrfToken && { "X-CSRF-TOKEN": csrfToken }),
                    },
                    body: JSON.stringify({
                        is_active: !unitToToggle.is_active,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message ||
                        `Failed to update unit status: ${response.status}`
                );
            }

            const result = await response.json();

            // Update the unit in the local state using the response data
            setUnits((prevUnits) =>
                prevUnits.map((unit) =>
                    unit.id === unitToToggle.id
                        ? {
                              ...unit,
                              is_active: result.unit.is_active,
                              status: result.unit.status,
                              availability_status:
                                  result.unit.availability_status,
                          }
                        : unit
                )
            );

            // Close modal and reset state
            setShowConfirmModal(false);
            setUnitToToggle(null);
        } catch (error) {
            console.error("Error toggling unit status:", error);
            alert("Failed to update unit status. Please try again.");
        } finally {
            setIsToggling(false);
        }
    };

    // Cancel toggle
    const cancelToggle = () => {
        setShowConfirmModal(false);
        setUnitToToggle(null);
    };

    // Handle view warehouse
    const handleViewWarehouse = (unit) => {
        router.visit(`/vendors/warehouse/unitDetails/${unit.id}`);
    };

    // Handle edit warehouse
    const handleEditWarehouse = (unit) => {
        router.visit(`/vendors/warehouse/editUnit/${unit.id}`);
    };

    // Handle delete warehouse
    const handleDeleteWarehouse = (unit) => {
        setUnitToDelete(unit);
        setShowDeleteModal(true);
    };

    // Confirm and execute delete
    const confirmDeleteWarehouse = async () => {
        if (!unitToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch(
                `/vendors/warehouse/api/units/${unitToDelete.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        "X-CSRF-TOKEN":
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute("content") || "",
                    },
                    credentials: "same-origin",
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Remove the deleted unit from the list
            setUnits((prevUnits) =>
                prevUnits.filter((unit) => unit.id !== unitToDelete.id)
            );
            setTotalUnits((prev) => prev - 1);

            // Show success message
            alert(result.message || "Warehouse unit deleted successfully");

            // Refresh the list if current page is empty
            if (units.length === 1 && currentPage > 1) {
                setCurrentPage((prev) => prev - 1);
            } else {
                fetchUnits(
                    currentPage,
                    itemsPerPage,
                    searchTerm,
                    typeFilter,
                    statusFilter
                );
            }
        } catch (error) {
            console.error("Error deleting warehouse unit:", error);
            alert("Failed to delete warehouse unit. Please try again.");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setUnitToDelete(null);
        }
    };

    // Cancel delete
    const cancelDeleteWarehouse = () => {
        setShowDeleteModal(false);
        setUnitToDelete(null);
    };

    const statusColor = (status) => {
        switch (status) {
            case "Available":
                return "text-[#3C9A34]";
            case "Occupied":
                return "text-[#D97706]";
            case "Pending Approval":
                return "text-[#F59E0B]";
            case "Rejected":
                return "text-[#DC2626]";
            case "Inactive":
                return "text-[#7B7B7A]";
            default:
                return "text-[#7B7B7A]";
        }
    };

    // Helper: get first available image URL for a unit
    const getFirstImageUrl = (unit) => {
        if (unit?.thumbnail_url) return unit.thumbnail_url;
        const candidates = [
            unit?.images,
            unit?.image_urls,
            unit?.photos,
            unit?.gallery,
            unit?.media,
        ].filter(Boolean);
        for (const arr of candidates) {
            if (Array.isArray(arr) && arr.length > 0) {
                const first = arr[0];
                if (typeof first === "string") return first;
                if (first && typeof first === "object") {
                    return (
                        first.url ||
                        first.path ||
                        first.src ||
                        first.link ||
                        null
                    );
                }
            }
        }
        if (typeof unit?.image === "string") return unit.image;
        if (unit?.image && typeof unit.image === "object")
            return unit.image.url || unit.image.path || null;
        return null;
    };

    return (
        <div className="w-full h-auto pr-5 py-10">
            {/* Header section */}
            <div className="flex flex-row gap-5 justify-between items-center">
                <h1 className="figtree text-[35px] font-[700]">
                    Warehouse Units
                </h1>
                {/* <div className="flex flex-row gap-5">
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={search} alt="Search" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={settings} alt="Settings" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={bell} alt="Notifications" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={proPic} alt="Profile" />
          </div>
          <div className="figtree flex flex-col justify-center items-start">
            <h1 className="text-[20px] font-[700]">{user?.name || 'Vendor'}</h1>
            <h1 className="text-[16px] font-[600] text-[#7B7B7A]">Vendor</h1>
          </div>
        </div> */}

                <div className="flex flex-row gap-5 relative items-center">
                    <UserDropdown />
                </div>
            </div>

            {/* Search, Filter section */}
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

            {/* Conditionally render AddUnit or Units list */}
            {showAddUnit ? (
                <AddUnit />
            ) : (
                <>
                    {/* Loading state */}
                    {loading && (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0955AC]"></div>
                            <span className="ml-3 text-[#7B7B7A]">
                                Loading warehouse units...
                            </span>
                        </div>
                    )}

                    {/* Error state */}
                    {error && !loading && (
                        <div className="flex justify-center items-center py-20">
                            <div className="text-center">
                                <div className="text-red-500 text-lg font-semibold mb-2">
                                    Error
                                </div>
                                <div className="text-[#7B7B7A] mb-4">
                                    {error}
                                </div>
                                <button
                                    onClick={() =>
                                        fetchUnits(
                                            currentPage,
                                            itemsPerPage,
                                            searchTerm,
                                            typeFilter,
                                            statusFilter
                                        )
                                    }
                                    className="px-4 py-2 bg-[#0955AC] text-white rounded-md hover:bg-[#074A94] transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !error && units.length === 0 && (
                        <div className="flex justify-center items-center py-20">
                            <div className="text-center">
                                <div className="text-[#7B7B7A] text-lg font-semibold mb-2">
                                    No warehouse units found
                                </div>
                                <div className="text-[#7B7B7A] mb-4">
                                    {searchTerm || typeFilter || statusFilter
                                        ? "Try adjusting your search or filters"
                                        : "Start by adding your first warehouse unit"}
                                </div>
                                <button
                                    onClick={handleAddUnitClick}
                                    className="px-4 py-2 bg-[#0955AC] text-white rounded-md hover:bg-[#074A94] transition-colors"
                                >
                                    Add Warehouse Unit
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Warehouse units cards (styled like vehicle cards) */}
                    {!loading && !error && units.length > 0 && (
                        <>
                            {units.map((unit) => {
                                const imageUrl = getFirstImageUrl(unit);
                                return (
                                    <div
                                        key={unit.id}
                                        className="relative w-auto h-auto min-h-[157px] bg-[#FFFFFF] rounded-[10px] flex lg:flex-row flex-col items-center my-10"
                                        style={{
                                            boxShadow: "4px 4px 4px #0000001A",
                                        }}
                                    >
                                        {/* Left visual (image or placeholder) */}
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt="Warehouse image"
                                                className="w-[220px] h-[157px] object-cover rounded-l-[10px]"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-[220px] h-[157px] bg-[#E8EBEF] rounded-l-[10px]" />
                                        )}

                                        {/* Content section */}
                                        <div className="px-5 py-5 flex flex-row justify-center items-center w-full">
                                            <div className="flex-1">
                                                <div className="bebas-neue text-[28px] font-[400]">
                                                    <h1>
                                                        {unit.name}{" "}
                                                        <span className="text-[#0955AC]">
                                                            [{unit.type}]
                                                        </span>
                                                    </h1>
                                                </div>
                                                <div className="poppins text-[14px] font-[600] flex flex-wrap gap-6 items-center">
                                                    <span
                                                        className={`${statusColor(
                                                            unit.status
                                                        )}`}
                                                    >
                                                        {
                                                            unit.availability_status
                                                        }
                                                    </span>
                                                    <span className="text-[#7B7B7A]">
                                                        Pricing:{" "}
                                                        {unit.pricing_model?.replace(
                                                            /_/g,
                                                            " "
                                                        ) || "N/A"}
                                                    </span>
                                                    <span className="text-[#7B7B7A]">
                                                        Area:{" "}
                                                        {unit.total_area ||
                                                            "N/A"}{" "}
                                                        sqft
                                                    </span>
                                                    <span className="text-[#7B7B7A]">
                                                        Capacity:{" "}
                                                        {unit.capacity || "N/A"}
                                                    </span>
                                                </div>
                                                <div className="poppins text-[12px] text-[#7B7B7A] mt-1">
                                                    <span>{unit.address}</span>
                                                </div>
                                                {unit.description && (
                                                    <div className="poppins text-[12px] text-[#666666] mt-2 line-clamp-2">
                                                        {unit.description}
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {unit.approval_status &&
                                                        unit.approval_status !==
                                                            "approved" && (
                                                            <span
                                                                className={`px-2 py-1 rounded text-white text-xs ${
                                                                    unit.approval_status ===
                                                                    "pending"
                                                                        ? "bg-yellow-500"
                                                                        : "bg-red-500"
                                                                }`}
                                                            >
                                                                {unit.approval_status ===
                                                                "pending"
                                                                    ? "Pending Approval"
                                                                    : "Rejected"}
                                                            </span>
                                                        )}
                                                    <span
                                                        className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                                                            unit.is_active
                                                                ? "bg-green-600"
                                                                : "bg-gray-500"
                                                        }`}
                                                    >
                                                        {unit.is_active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                    {unit.approval_status ===
                                                        "approved" && (
                                                        <span className="px-2 py-1 rounded text-white text-xs bg-blue-600">
                                                            Approved
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions column */}
                                            <div className="flex flex-col items-center gap-2 pl-[40px]">
                                                <button
                                                    className="figtree min-w-[100px] h-[44px] bg-[#0955AC] rounded-[5px] text-[18px] text-[#FFFFFF] font-[700] hover:bg-[#074A94] transition-colors"
                                                    onClick={() =>
                                                        handleViewWarehouse(
                                                            unit
                                                        )
                                                    }
                                                    title="View"
                                                >
                                                    <span className="inline-flex items-center gap-2">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="w-5 h-5"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z" />
                                                            <circle
                                                                cx="12"
                                                                cy="12"
                                                                r="3.25"
                                                            />
                                                        </svg>
                                                        View
                                                    </span>
                                                </button>
                                                <button
                                                    className="figtree min-w-[100px] h-[44px] bg-[#F59E0B] rounded-[5px] text-[18px] text-[#FFFFFF] font-[700] hover:bg-[#D97706] transition-colors"
                                                    onClick={() =>
                                                        handleEditWarehouse(
                                                            unit
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="figtree min-w-[100px] h-[44px] bg-[#DC2626] rounded-[5px] text-[18px] text-[#FFFFFF] font-[700] hover:bg-[#B91C1C] transition-colors"
                                                    onClick={() =>
                                                        handleDeleteWarehouse(
                                                            unit
                                                        )
                                                    }
                                                    title="Delete warehouse unit"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    className={`figtree min-w-[100px] h-[44px] rounded-[5px] text-[18px] text-[#FFFFFF] font-[700] transition-colors ${
                                                        unit.is_active
                                                            ? "bg-[#DC2626] hover:bg-[#B91C1C]"
                                                            : "bg-[#16A34A] hover:bg-[#15803D]"
                                                    }`}
                                                    onClick={() =>
                                                        handleToggleStatus(unit)
                                                    }
                                                    title={
                                                        unit.is_active
                                                            ? "Deactivate warehouse unit"
                                                            : "Activate warehouse unit"
                                                    }
                                                >
                                                    {unit.is_active
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Right side action bar (icons textual to avoid extra imports) */}
                                        <div className="absolute right-0 w-auto min-w-[143px] h-full bg-[#D8E4F2] flex flex-col justify-center items-center gap-3 rounded-tr-[10px] rounded-br-[10px] px-3">
                                            <button
                                                className="size-[36px] border-[1.5px] border-[#0955AC] bg-[#D8E4F2] rounded-[5px] flex justify-center items-center cursor-pointer hover:bg-[#C5D4E8]"
                                                onClick={() =>
                                                    handleViewWarehouse(unit)
                                                }
                                                title="View Details"
                                            >
                                                👁
                                            </button>
                                            <button
                                                className="size-[36px] border-[1.5px] border-[#F59E0B] bg-[#D8E4F2] rounded-[5px] flex justify-center items-center cursor-pointer hover:bg-[#C5D4E8]"
                                                onClick={() =>
                                                    handleEditWarehouse(unit)
                                                }
                                                title="Edit"
                                            >
                                                ✎
                                            </button>
                                            <button
                                                className="size-[36px] border-[1.5px] border-[#FF0000] bg-[#D8E4F2] rounded-[5px] flex justify-center items-center cursor-pointer hover:bg-[#C5D4E8]"
                                                onClick={() =>
                                                    handleDeleteWarehouse(unit)
                                                }
                                                title="Delete"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Results info */}
                            <div className="text-[#7B7B7A] text-sm mb-4">
                                Showing {units.length} of {totalUnits} warehouse
                                units
                            </div>
                        </>
                    )}

                    {/* Pagination Controls and Results per page */}
                    {!loading && !error && totalPages > 1 && (
                        <div className="flex justify-between items-center gap-2 mt-20">
                            {/* Left: Results per page */}
                            <div className="flex items-center">
                                <span className="mr-3 text-[#00000080] text-[15px]">
                                    Results per page
                                </span>
                                <select
                                    className="rounded px-3 py-1 font-[600] text-[16px] bg-[#F4F3F3] border-[1px] border-[#BEBEBE] w-[71px] h-[40px] focus:outline-none"
                                    value={itemsPerPage}
                                    onChange={(e) =>
                                        setItemsPerPage(Number(e.target.value))
                                    }
                                >
                                    {perPageOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Right: Pagination */}
                            <div className="flex items-center gap-2">
                                <button
                                    className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50 hover:bg-[#E5E5E5] transition-colors"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <span className="text-lg">&#60;</span>
                                </button>
                                {getPageNumbers().map((num, idx) =>
                                    num === "..." ? (
                                        <span key={idx} className="px-2">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={num}
                                            className={`px-3 py-1 text-[16px] font-[600] rounded-[4px] size-[40px] hover:bg-[#E5E5E5] transition-colors ${
                                                currentPage === num
                                                    ? "text-[#0955AC] font-[600] border-[2px] border-[#0955AC] bg-[#F4F3F3]"
                                                    : "bg-[#F4F3F3]"
                                            }`}
                                            onClick={() => goToPage(num)}
                                        >
                                            {num}
                                        </button>
                                    )
                                )}
                                <button
                                    className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50 hover:bg-[#E5E5E5] transition-colors"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <span className="text-lg">&#62;</span>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && unitToToggle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[400px] max-w-[90%] shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Confirm Status Change
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to{" "}
                            {unitToToggle.is_active ? "deactivate" : "activate"}{" "}
                            the warehouse unit
                            <span className="font-semibold">
                                {" "}
                                "{unitToToggle.name}"
                            </span>
                            ?
                        </p>
                        <div className="text-sm text-gray-500 mb-6">
                            {unitToToggle.is_active
                                ? "Deactivating will make this unit unavailable for bookings."
                                : unitToToggle.approval_status === "approved"
                                ? "Activating will make this unit available for bookings immediately."
                                : "Activating will prepare this unit for availability once it's approved by admin."}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelToggle}
                                disabled={isToggling}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmToggleStatus}
                                disabled={isToggling}
                                className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 ${
                                    unitToToggle.is_active
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-green-600 hover:bg-green-700"
                                }`}
                            >
                                {isToggling
                                    ? "Updating..."
                                    : unitToToggle.is_active
                                    ? "Deactivate"
                                    : "Activate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && unitToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[450px] max-w-[90%] shadow-xl">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                <svg
                                    className="w-6 h-6 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Delete Warehouse Unit
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-2">
                            Are you sure you want to permanently delete the
                            warehouse unit
                            <span className="font-semibold">
                                {" "}
                                "{unitToDelete.name}"
                            </span>
                            ?
                        </p>
                        <p className="text-sm text-red-600 mb-6">
                            ⚠️ This action cannot be undone. All associated data
                            including images, documents, and booking history
                            will be permanently removed.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelDeleteWarehouse}
                                disabled={isDeleting}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteWarehouse}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isDeleting
                                    ? "Deleting..."
                                    : "Delete Permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnitContent;
