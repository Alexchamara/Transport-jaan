import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";
import Search from "../../assets/superAdmin/Search.png";
import Car from "../../assets/superAdmin/Car.svg";
import DotsThreeY from "../../assets/superAdmin/DotsThreeY.svg";
import Heart from "../../assets/superAdmin/Heart Icon.svg";
import Dots from "../../assets/superAdmin/Dots Icon.svg";
import ArrowLeftB from "../../assets/superAdmin/Arrow LeftB.svg";
import ArrowRight from "../../assets/superAdmin/Arrow Right.svg";

const Vehicles = ({ vehicles = { data: [] }, categories = [], filters = {}, stats = {}, auth }) => {
    const [selectedVehicles, setSelectedVehicles] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [categoryFilter, setCategoryFilter] = useState(
        filters.category_type || "all"
    );
    const [approvalStatusFilter, setApprovalStatusFilter] = useState(
        filters.approval_status || "all"
    );
    const [statusFilter, setStatusFilter] = useState(filters.status || "all");

    // Handle search
    const handleSearch = (e) => {
        if (e.key === "Enter") {
            performSearch();
        }
    };

    const performSearch = () => {
        const newFilters = {
            search: searchTerm,
            category_type: categoryFilter === "all" ? "" : categoryFilter,
            approval_status:
                approvalStatusFilter === "all" ? "" : approvalStatusFilter,
            status: statusFilter === "all" ? "" : statusFilter,
        };

        // Remove empty filters from the request
        Object.keys(newFilters).forEach((key) => {
            if (newFilters[key] === "" || newFilters[key] === "all") {
                delete newFilters[key];
            }
        });

        router.get(route("superadmin.Vehicles"), newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    // Handle filter changes
    const handleFilterChange = (filterType, value) => {
        console.log("Filter change:", filterType, value);

        // Convert "all" to empty string for the API call
        const filterValue = value === "all" ? "" : value;

        const newFilters = {
            search: searchTerm,
            category_type:
                filterType === "category_type"
                    ? filterValue
                    : categoryFilter === "all"
                    ? ""
                    : categoryFilter,
            approval_status:
                filterType === "approval_status"
                    ? filterValue
                    : approvalStatusFilter === "all"
                    ? ""
                    : approvalStatusFilter,
            status:
                filterType === "status"
                    ? filterValue
                    : statusFilter === "all"
                    ? ""
                    : statusFilter,
        };

        // Remove empty filters from the request
        Object.keys(newFilters).forEach((key) => {
            if (newFilters[key] === "" || newFilters[key] === "all") {
                delete newFilters[key];
            }
        });

        console.log("Sending filters:", newFilters);

        if (filterType === "category_type") setCategoryFilter(value);
        if (filterType === "approval_status") setApprovalStatusFilter(value);
        if (filterType === "status") setStatusFilter(value);

        router.get(route("superadmin.Vehicles"), newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    // Handle vehicle selection
    const handleVehicleSelect = (vehicleId) => {
        setSelectedVehicles((prev) => {
            const newSelected = prev.includes(vehicleId)
                ? prev.filter((id) => id !== vehicleId)
                : [...prev, vehicleId];
            setShowBulkActions(newSelected.length > 0);
            return newSelected;
        });
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedVehicles.length === vehicles.data.length) {
            setSelectedVehicles([]);
            setShowBulkActions(false);
        } else {
            const allIds = vehicles.data.map((vehicle) => vehicle.id);
            setSelectedVehicles(allIds);
            setShowBulkActions(true);
        }
    };

    // Handle approval status change
    const handleApprovalChange = (vehicleId, status, reason = "") => {
        router.put(
            route("superadmin.vehicles.approval", vehicleId),
            {
                approval_status: status,
                rejection_reason: reason,
            },
            {
                onSuccess: () => {
                    setSelectedVehicles([]);
                    setShowBulkActions(false);
                },
            }
        );
    };

    // Handle bulk approve
    const handleBulkApprove = () => {
        router.post(
            route("superadmin.vehicles.bulkApprove"),
            {
                vehicle_ids: selectedVehicles,
            },
            {
                onSuccess: () => {
                    setSelectedVehicles([]);
                    setShowBulkActions(false);
                },
            }
        );
    };

    // Handle bulk reject
    const handleBulkReject = () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a rejection reason");
            return;
        }

        router.post(
            route("superadmin.vehicles.bulkReject"),
            {
                vehicle_ids: selectedVehicles,
                rejection_reason: rejectionReason,
            },
            {
                onSuccess: () => {
                    setSelectedVehicles([]);
                    setShowBulkActions(false);
                    setRejectionReason("");
                },
            }
        );
    };

    // Status badge component - matching Users styling
    const StatusBadge = ({ status, type = "status" }) => {
        const getStatusClass = () => {
            if (type === "approval") {
                switch (status) {
                    case "approved":
                        return "text-[10px] px-[8px] py-[2px] bg-[#05C168]/20 text-[#05C168] rounded-[4px]";
                    case "pending":
                        return "text-[10px] px-[8px] py-[2px] bg-[#FDB52A]/20 text-[#FDB52A] rounded-[4px]";
                    case "rejected":
                        return "text-[10px] px-[8px] py-[2px] bg-[#FF4757]/20 text-[#FF4757] rounded-[4px]";
                    default:
                        return "text-[10px] px-[8px] py-[2px] bg-[#AEB9E1]/20 text-[#AEB9E1] rounded-[4px]";
                }
            } else {
                switch (status) {
                    case "active":
                        return "text-[10px] px-[8px] py-[2px] bg-[#05C168]/20 text-[#05C168] rounded-[4px]";
                    case "inactive":
                        return "text-[10px] px-[8px] py-[2px] bg-[#FF4757]/20 text-[#FF4757] rounded-[4px]";
                    case "draft":
                        return "text-[10px] px-[8px] py-[2px] bg-[#AEB9E1]/20 text-[#AEB9E1] rounded-[4px]";
                    default:
                        return "text-[10px] px-[8px] py-[2px] bg-[#AEB9E1]/20 text-[#AEB9E1] rounded-[4px]";
                }
            }
        };

        return (
            <span className={getStatusClass()}>
                {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
        );
    };

    return (
        <>
            <Head title="Vehicle Management" />
            <div className="flex flex-row bg-[#081028] min-h-screen poppins">
                <div className="sm:w-full md:w-auto lg:w-auto">
                    <SideMenu />
                </div>

                <div className="flex flex-col gap-5 poppins">
                    {/* Header */}
                    <div className="w-[1125px] h-[42px] flex flex-row justify-between items-center px-4 md:px-12 lg:px-47 my-6 md:my-10 lg:my-[25px]">
                        <div className="flex flex-row justify-center items-center gap-6">
                            <h1 className="text-white text-base md:text-lg lg:text-[24px] font-poppins">
                                Vehicles
                            </h1>
                            <div className="flex flex-row items-center border border-[#343B4F] bg-[#0B1739] rounded-[4px] overflow-hidden px-2">
                                <img
                                    src={Search}
                                    alt="Search"
                                    className="size-[12px]"
                                />
                                <input
                                    placeholder="Search for vehicles..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyPress={handleSearch}
                                    className="bg-transparent text-[#ffffff] text-[12px] outline-none border-none focus:outline-none focus:ring-0 p-2 w-full"
                                />
                            </div>
                        </div>


                    </div>

                    {/* Stats Cards */}
                    <div className="w-[1060px] flex flex-row justify-center items-center gap-[22px] mx-[35px]">
                        {/* Card1 - Total Vehicles */}
                        <div className="w-[243px] h-[80px] border border-[#343B4F] bg-[#0B1739] my-4 rounded-[10px]">
                            <div className="w-[220px] flex flex-row justify-between items-center">
                                <div className="px-2 py-4 flex flex-row items-center gap-2">
                                    <div className="flex justify-center items-center w-8 h-8 bg-[#CB3CFF]/20 rounded-full">
                                        <img src={Car} alt="Total Vehicles" />
                                    </div>
                                    <div>
                                        <h1 className="text-white text-[16px] font-500">
                                            Total Vehicles
                                        </h1>
                                        <h2 className="text-[#AEB9E1] text-[12px] font-400">
                                            {stats.total || 0}
                                        </h2>
                                    </div>
                                </div>
                                <img src={DotsThreeY} alt="Menu" />
                            </div>
                        </div>

                        {/* Card2 - Pending Approval */}
                        <div className="w-[243px] h-[80px] border border-[#343B4F] bg-[#0B1739] my-4 rounded-[10px]">
                            <div className="w-[220px] flex flex-row justify-between items-center">
                                <div className="px-2 py-4 flex flex-row items-center gap-2">
                                    <div className="flex justify-center items-center w-8 h-8 bg-[#FDB52A]/20 rounded-full">
                                        <img src={Heart} alt="Pending" />
                                    </div>
                                    <div>
                                        <h1 className="text-white text-[16px] font-500">
                                            Pending
                                        </h1>
                                        <h2 className="text-[#AEB9E1] text-[12px] font-400">
                                            {stats.pending_approval || 0}
                                        </h2>
                                    </div>
                                </div>
                                <img src={DotsThreeY} alt="Menu" />
                            </div>
                        </div>

                        {/* Card3 - Approved */}
                        <div className="w-[243px] h-[80px] border border-[#343B4F] bg-[#0B1739] my-4 rounded-[10px]">
                            <div className="w-[220px] flex flex-row justify-between items-center">
                                <div className="px-2 py-4 flex flex-row items-center gap-2">
                                    <div className="flex justify-center items-center w-8 h-8 bg-[#05C168]/20 rounded-full">
                                        <img src={Dots} alt="Approved" />
                                    </div>
                                    <div>
                                        <h1 className="text-white text-[16px] font-500">
                                            Approved
                                        </h1>
                                        <h2 className="text-[#AEB9E1] text-[12px] font-400">
                                            {stats.approved || 0}
                                        </h2>
                                    </div>
                                </div>
                                <img src={DotsThreeY} alt="Menu" />
                            </div>
                        </div>

                        {/* Card4 - Active */}
                        <div className="w-[243px] h-[80px] border border-[#343B4F] bg-[#0B1739] my-4 rounded-[10px]">
                            <div className="w-[220px] flex flex-row justify-between items-center">
                                <div className="px-2 py-4 flex flex-row items-center gap-2">
                                    <div className="flex justify-center items-center w-8 h-8 bg-[#086CD9]/20 rounded-full">
                                        <img src={Car} alt="Active" />
                                    </div>
                                    <div>
                                        <h1 className="text-white text-[16px] font-500">
                                            Active
                                        </h1>
                                        <h2 className="text-[#AEB9E1] text-[12px] font-400">
                                            {stats.active || 0}
                                        </h2>
                                    </div>
                                </div>
                                <img src={DotsThreeY} alt="Menu" />
                            </div>
                        </div>
                    </div>

                    {/* Filter buttons */}
                    <div className="w-[1040px] flex flex-row gap-4 mx-[45px] justify-between">
                        {/* Category Filter Buttons */}
                        <div className="flex flex-row gap-4">
                            <button
                                onClick={() =>
                                    handleFilterChange("category_type", "all")
                                }
                                className={`text-[15px] px-[16px] py-[6px] rounded-[5px] border ${
                                    categoryFilter === "all" ||
                                    categoryFilter === ""
                                        ? "border-[#0E43FB] bg-[#0E43FB] text-white"
                                        : "border-[#343B4F] bg-[#0B1739] text-white hover:border-[#0E43FB]"
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() =>
                                    handleFilterChange("category_type", "land")
                                }
                                className={`text-[15px] px-[16px] py-[6px] rounded-[5px] border ${
                                    categoryFilter === "land"
                                        ? "border-[#0E43FB] bg-[#0E43FB] text-white"
                                        : "border-[#343B4F] bg-[#0B1739] text-white hover:border-[#0E43FB]"
                                }`}
                            >
                                Land
                            </button>
                            <button
                                onClick={() =>
                                    handleFilterChange("category_type", "sea")
                                }
                                className={`text-[15px] px-[16px] py-[6px] rounded-[5px] border ${
                                    categoryFilter === "sea"
                                        ? "border-[#0E43FB] bg-[#0E43FB] text-white"
                                        : "border-[#343B4F] bg-[#0B1739] text-white hover:border-[#0E43FB]"
                                }`}
                            >
                                Sea
                            </button>
                            <button
                                onClick={() =>
                                    handleFilterChange("category_type", "air")
                                }
                                className={`text-[15px] px-[16px] py-[6px] rounded-[5px] border ${
                                    categoryFilter === "air"
                                        ? "border-[#0E43FB] bg-[#0E43FB] text-white"
                                        : "border-[#343B4F] bg-[#0B1739] text-white hover:border-[#0E43FB]"
                                }`}
                            >
                                Air
                            </button>
                        </div>

                        <div className="flex flex-row gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    handleFilterChange("status", e.target.value)
                                }
                                className="text-[15px] px-[9px] py-[6px] rounded-[5px] border border-[#343B4F] bg-[#0B1739] text-white"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="draft">Draft</option>
                            </select>

                            <select
                                value={approvalStatusFilter}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "approval_status",
                                        e.target.value
                                    )
                                }
                                className="text-[15px] px-[9px] py-[6px] rounded-[5px] border border-[#343B4F] bg-[#0B1739] text-white"
                            >
                                <option value="all">All Approval Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>

                            {/* Clear Filters Button */}
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setCategoryFilter("all");
                                    setApprovalStatusFilter("all");
                                    setStatusFilter("all");
                                    router.get(
                                        route("superadmin.Vehicles"),
                                        {},
                                        {
                                            preserveState: true,
                                            replace: true,
                                        }
                                    );
                                }}
                                className="text-[15px] px-[16px] py-[6px] rounded-[5px] border border-[#FF4757] bg-[#FF4757] text-white hover:bg-[#FF4757]/80"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {showBulkActions && (
                        <div className="w-[1040px] mx-[48px] mb-4 ">
                            <div className="border border-[#343B4F] bg-[#0E43FB]/10 p-4 rounded-[10px]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-white text-sm">
                                            {selectedVehicles.length} vehicles
                                            selected
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleBulkApprove}
                                            className="border border-[#05C168] bg-[#05C168] px-4 py-2 rounded-[5px] text-white text-sm hover:bg-[#05C168]/80"
                                        >
                                            Bulk Approve
                                        </button>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Rejection reason..."
                                                value={rejectionReason}
                                                onChange={(e) =>
                                                    setRejectionReason(
                                                        e.target.value
                                                    )
                                                }
                                                className="px-3 py-2 border border-[#343B4F] bg-[#0B1739] rounded-[5px] text-white text-sm outline-none bg-transparent focus:outline-none focus:ring-0 focus:border-[#343B4F] focus:shadow-none"
                                            />
                                            <button
                                                onClick={handleBulkReject}
                                                className="border border-[#FF4757] bg-[#FF4757] px-4 py-2 rounded-[5px] text-white text-sm hover:bg-[#FF4757]/80"
                                            >
                                                Bulk Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vehicles Table */}
                    {vehicles.data.length > 0 ? (
                        <div className="w-[1125px] h-auto mx-[48px]">
                            <div className="w-[1035px] h-auto border border-[#343B4F] bg-[#0B1739] rounded-[10px]">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-[#343B4F]">
                                                <th className="p-4 text-left">
                                                    <input
                                                        type="checkbox"
                                                        style={{
                                                            boxShadow: "none",
                                                            WebkitAppearance:
                                                                "none",
                                                            MozAppearance:
                                                                "none",
                                                        }}
                                                        checked={
                                                            selectedVehicles.length ===
                                                                vehicles.data
                                                                    .length &&
                                                            vehicles.data
                                                                .length > 0
                                                        }
                                                        onChange={
                                                            handleSelectAll
                                                        }
                                                        className="rounded bg-[#0B1739] border-[#343B4F]"
                                                    />
                                                </th>
                                                <th className="p-4 text-left text-white text-[14px] font-500">
                                                    Vehicle
                                                </th>
                                                <th className="p-4 text-left text-white text-[14px] font-500">
                                                    Category
                                                </th>
                                                <th className="p-4 text-left text-white text-[14px] font-500">
                                                    Owner
                                                </th>
                                                <th className="p-4 text-left text-white text-[14px] font-500">
                                                    Price/Day
                                                </th>
                                                <th className="p-4 text-left text-white text-[14px] font-500">
                                                    Status
                                                </th>
                                                <th className="p-4 text-left text-white text-[14px] font-500">
                                                    Approval
                                                </th>
                                                <th className="p-4 text-left text-white text-[14px] font-500">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vehicles.data.map((vehicle) => (
                                                <tr
                                                    key={vehicle.id}
                                                    className="border-b border-[#343B4F] hover:bg-[#343B4F]/20"
                                                >
                                                    <td className="p-4">
                                                        <input
                                                            type="checkbox"
                                                            style={{
                                                                boxShadow:
                                                                    "none",
                                                                WebkitAppearance:
                                                                    "none",
                                                                MozAppearance:
                                                                    "none",
                                                            }}
                                                            checked={selectedVehicles.includes(
                                                                vehicle.id
                                                            )}
                                                            onChange={() =>
                                                                handleVehicleSelect(
                                                                    vehicle.id
                                                                )
                                                            }
                                                            className="rounded bg-[#0B1739] border-[#343B4F]"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            {vehicle.media &&
                                                            vehicle.media
                                                                .length > 0 ? (
                                                                <img
                                                                    src={
                                                                        vehicle
                                                                            .media[0]
                                                                            .url
                                                                    }
                                                                    alt={
                                                                        vehicle.model
                                                                    }
                                                                    className="w-12 h-12 rounded object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 bg-[#343B4F] rounded flex items-center justify-center">
                                                                    <img
                                                                        src={
                                                                            Car
                                                                        }
                                                                        alt="Vehicle"
                                                                        className="w-6 h-6"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="text-white text-[14px] font-500">
                                                                    {
                                                                        vehicle.manufacturer
                                                                    }{" "}
                                                                    {
                                                                        vehicle.model
                                                                    }
                                                                </div>
                                                                <div className="text-[#AEB9E1] text-[12px]">
                                                                    {
                                                                        vehicle.registration_number
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-white text-[14px] capitalize">
                                                            {
                                                                vehicle.category
                                                                    ?.type
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div>
                                                            <div className="text-white text-[14px] font-500">
                                                                {
                                                                    vehicle
                                                                        .provider
                                                                        ?.name
                                                                }
                                                            </div>
                                                            <div className="text-[#AEB9E1] text-[12px]">
                                                                {
                                                                    vehicle
                                                                        .provider
                                                                        ?.email
                                                                }
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-white text-[14px] font-500">
                                                            $
                                                            {
                                                                vehicle.rental_price_per_day
                                                            }
                                                        </div>
                                                        <div className="text-[#AEB9E1] text-[12px]">
                                                            {vehicle.currency}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <StatusBadge
                                                            status={
                                                                vehicle.status
                                                            }
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <StatusBadge
                                                            status={
                                                                vehicle.approval_status
                                                            }
                                                            type="approval"
                                                        />
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex gap-2">
                                                            <Link
                                                                href={route(
                                                                    "superadmin.vehicles.show",
                                                                    vehicle.id
                                                                )}
                                                                className="border border-[#0E43FB] bg-[#0E43FB] px-3 py-1 rounded-[4px] text-white text-[12px] hover:bg-[#0E43FB]/80"
                                                            >
                                                                View
                                                            </Link>
                                                            {vehicle.approval_status ===
                                                                "pending" && (
                                                                <>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleApprovalChange(
                                                                                vehicle.id,
                                                                                "approved"
                                                                            )
                                                                        }
                                                                        className="border border-[#05C168] bg-[#05C168] px-3 py-1 rounded-[4px] text-white text-[12px] hover:bg-[#05C168]/80"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            const reason =
                                                                                prompt(
                                                                                    "Rejection reason:"
                                                                                );
                                                                            if (
                                                                                reason
                                                                            )
                                                                                handleApprovalChange(
                                                                                    vehicle.id,
                                                                                    "rejected",
                                                                                    reason
                                                                                );
                                                                        }}
                                                                        className="border border-[#FF4757] bg-[#FF4757] px-3 py-1 rounded-[4px] text-white text-[12px] hover:bg-[#FF4757]/80"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-[1040px] mx-[48px]">
                            <div className="border border-[#343B4F] bg-[#0B1739] p-8 rounded-[10px] text-center">
                                <div className="text-[#AEB9E1] mb-4">
                                    No vehicles found
                                </div>
                                <p className="text-[12px] text-[#AEB9E1]">
                                    Try adjusting your filters to see more
                                    results.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {vehicles.data.length > 0 && (
                        <div className="flex flex-row justify-between items-center mt-5 mx-[48px] w-[1032px]">
                            <h1 className="text-white text-[12px] font-500">
                                {vehicles.data.length > 0
                                    ? `${vehicles.from} - ${vehicles.to}`
                                    : "0"}{" "}
                                of {vehicles.total || 0}
                            </h1>
                            {vehicles.last_page > 1 && (
                                <div className="flex flex-row justify-center items-center gap-2">
                                    {vehicles.prev_page_url && (
                                        <Link
                                            href={vehicles.prev_page_url}
                                            className="flex justify-center items-center w-8 h-8 border border-[#343B4F] bg-[#0B1739] rounded hover:bg-[#343B4F]/20"
                                        >
                                            <img
                                                src={ArrowLeftB}
                                                alt="Previous"
                                            />
                                        </Link>
                                    )}

                                    {vehicles.links.map((link, index) => {
                                        if (
                                            link.label.includes("Previous") ||
                                            link.label.includes("Next")
                                        )
                                            return null;
                                        return (
                                            <Link
                                                key={index}
                                                href={link.url || "#"}
                                                className={`flex justify-center items-center w-8 h-8 border rounded text-[12px] ${
                                                    link.active
                                                        ? "border-[#0E43FB] bg-[#0E43FB] text-white"
                                                        : link.url
                                                        ? "border-[#343B4F] bg-[#0B1739] text-white hover:bg-[#343B4F]/20"
                                                        : "border-[#343B4F] bg-[#343B4F] text-[#AEB9E1] cursor-not-allowed"
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        );
                                    })}

                                    {vehicles.next_page_url && (
                                        <Link
                                            href={vehicles.next_page_url}
                                            className="flex justify-center items-center w-8 h-8 border border-[#343B4F] bg-[#0B1739] rounded hover:bg-[#343B4F]/20"
                                        >
                                            <img src={ArrowRight} alt="Next" />
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Vehicles;
