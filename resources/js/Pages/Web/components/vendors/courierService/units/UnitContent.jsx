import React, { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { CalendarDays, ChevronDown, Search } from "lucide-react";
import CourierFeedbackModal from "../common/CourierFeedbackModal";
import useCourierActionModal from "../common/useCourierActionModal";

const EMPTY = {
    summary: {
        totalAssigned: 0,
        newAssignments: 0,
        readyForPickup: 0,
        inTransit: 0,
        exception: 0,
        deliveredToday: 0,
    },
    rows: [],
    filters: {
        q: "",
        category: "",
        service: "",
        status: "",
        stage: "",
        fromDate: "",
        toDate: "",
        perPage: 10,
        page: 1,
    },
    pagination: {
        page: 1,
        perPage: 10,
        total: 0,
        totalPages: 1,
    },
    filterOptions: {
        stages: [],
        statuses: [],
        services: [],
        categories: [],
        perPageOptions: [10, 20, 50],
    },
};

const stagePills = [
    { value: "", label: "All" },
    { value: "new_assignments", label: "New Assignments" },
    { value: "ready_for_pickup", label: "Ready for Pickup" },
    { value: "picked_up", label: "Picked Up" },
    { value: "in_transit", label: "In Transit" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "exception", label: "Exception" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
];

const actionLabels = {
    accept_assignment: "Accept",
    ready_for_pickup: "Ready",
    picked_up: "Picked Up",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    mark_exception: "Exception",
    mark_delivered: "Deliver",
    cancel_shipment: "Cancel",
};

const DESTRUCTIVE_SHIPMENT_ACTIONS = ["cancel_shipment"];

const stageBadge = (stage) => {
    switch (stage) {
        case "new_assignments":
            return "bg-[#EEF2FF] text-[#3730A3]";
        case "ready_for_pickup":
            return "bg-[#E0F2FE] text-[#075985]";
        case "picked_up":
        case "in_transit":
        case "out_for_delivery":
            return "bg-[#FEF3C7] text-[#92400E]";
        case "exception":
            return "bg-[#FEE2E2] text-[#991B1B]";
        case "delivered":
            return "bg-[#DCFCE7] text-[#166534]";
        default:
            return "bg-[#F3F4F6] text-[#374151]";
    }
};

const slaBadge = (slaStatus) => {
    switch (slaStatus) {
        case "delayed":
            return "bg-[#FEE2E2] text-[#991B1B]";
        case "at_risk":
            return "bg-[#FEF3C7] text-[#92400E]";
        case "early":
            return "bg-[#DCFCE7] text-[#166534]";
        case "on_time":
            return "bg-[#DBEAFE] text-[#1D4ED8]";
        case "on_track":
            return "bg-[#E0F2FE] text-[#075985]";
        default:
            return "bg-[#F3F4F6] text-[#374151]";
    }
};

const assignmentBadge = (health) => {
    switch (health) {
        case "assigned":
            return "bg-[#DCFCE7] text-[#166534]";
        case "pending_confirmation":
            return "bg-[#FEF3C7] text-[#92400E]";
        case "registration_missing":
            return "bg-[#FEE2E2] text-[#991B1B]";
        default:
            return "bg-[#F3F4F6] text-[#374151]";
    }
};

const titleCase = (value) => value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const UnitContent = () => {
    const props = usePage().props;
    const shipments = props.courierShipments || EMPTY;
    const flash = props.flash || {};

    const [filters, setFilters] = useState({
        q: shipments.filters.q || "",
        category: shipments.filters.category || "",
        service: shipments.filters.service || "",
        status: shipments.filters.status || "",
        stage: shipments.filters.stage || "",
        fromDate: shipments.filters.fromDate || "",
        toDate: shipments.filters.toDate || "",
        perPage: shipments.filters.perPage || 10,
    });

    const [selectedShipment, setSelectedShipment] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkAction, setBulkAction] = useState("");
    const {
        feedback,
        closeFeedback,
        confirmState,
        openConfirm,
        closeConfirm,
        runConfirm,
    } = useCourierActionModal(flash);

    const submitFilters = (page = 1, overrides = {}) => {
        router.get(
            route("courierService.units"),
            {
                ...filters,
                ...overrides,
                page,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const runAction = (shipmentId, action) => {
        const execute = () => {
            router.post(
                route("courierService.shipments.stage", shipmentId),
                { action },
                {
                    preserveScroll: true,
                },
            );
        };

        if (DESTRUCTIVE_SHIPMENT_ACTIONS.includes(action)) {
            openConfirm({
                title: "Confirm Shipment Action",
                message: `Are you sure you want to ${titleCase(action)} for this shipment?`,
                onConfirm: execute,
            });
            return;
        }

        execute();
    };

    const runBulkAction = () => {
        if (!bulkAction || selectedIds.length === 0) {
            return;
        }

        const execute = () => {
            router.post(
                route("courierService.shipments.bulk.stage"),
                {
                    shipmentIds: selectedIds,
                    action: bulkAction,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelectedIds([]);
                    },
                },
            );
        };

        openConfirm({
            title: "Confirm Bulk Shipment Action",
            message: `Apply ${titleCase(bulkAction)} to ${selectedIds.length} selected shipment(s)?`,
            onConfirm: execute,
        });
    };

    const summaryCards = useMemo(
        () => [
            { key: "totalAssigned", label: "Total Assigned", value: shipments.summary.totalAssigned },
            { key: "newAssignments", label: "New Assignments", value: shipments.summary.newAssignments },
            { key: "readyForPickup", label: "Ready for Pickup", value: shipments.summary.readyForPickup },
            { key: "inTransit", label: "In Transit", value: shipments.summary.inTransit },
            { key: "exception", label: "Exception", value: shipments.summary.exception },
            { key: "deliveredToday", label: "Delivered Today", value: shipments.summary.deliveredToday },
        ],
        [shipments.summary],
    );

    return (
        <div className="w-full h-auto lg:pl-4 lg:pr-5 pt-6 pb-12">
            <CourierFeedbackModal
                open={Boolean(feedback)}
                type={feedback?.type || "info"}
                message={feedback?.message || ""}
                passwordChangeRequired={Boolean(feedback?.passwordChangeRequired)}
                passwordChangeTargetUrl={feedback?.passwordChangeTargetUrl || ""}
                onClose={closeFeedback}
            />

            <CourierFeedbackModal
                open={confirmState.open}
                type={confirmState.type || "warning"}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.confirmText || "Confirm"}
                showCancel={true}
                onConfirm={runConfirm}
                onClose={closeConfirm}
            />

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div>
                    <h1 className="figtree text-[34px] font-[700]">Courier Shipments</h1>
                    <p className="text-[14px] text-[#6B7280] mt-1">
                        Operational queue for assigned shipments in approved categories.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mt-6">
                {summaryCards.map((card) => (
                    <div key={card.key} className="bg-white rounded-[10px] px-4 py-3" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
                        <p className="text-[12px] text-[#6B7280] font-[600]">{card.label}</p>
                        <p className="text-[26px] leading-tight font-[700] mt-1">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-6 overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                    {stagePills.map((pill) => (
                        <button
                            key={pill.value || "all"}
                            onClick={() => {
                                const next = { ...filters, stage: pill.value };
                                setFilters(next);
                                submitFilters(1, { stage: pill.value });
                            }}
                            className={`px-3 py-2 rounded-full text-[12px] font-[700] transition-colors ${
                                filters.stage === pill.value
                                    ? "bg-[#0955AC] text-white"
                                    : "bg-white text-[#4B5563]"
                            }`}
                            style={filters.stage === pill.value ? {} : { boxShadow: "2px 2px 4px #00000014" }}
                        >
                            {pill.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[10px] p-4 mt-6" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-8 gap-2 mb-4">
                    <div className="xl:col-span-2 h-[38px] rounded-[8px] bg-[#F3F4F6] px-3 flex items-center gap-2">
                        <Search size={16} className="text-[#6B7280]" />
                        <input
                            type="text"
                            value={filters.q}
                            onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                            placeholder="Search Booking/Tracking"
                            className="w-full border-none bg-transparent outline-none focus:ring-0"
                        />
                    </div>

                    <select
                        value={filters.category}
                        onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                        className="h-[38px] rounded-[8px] border border-[#E5E7EB] px-3 text-[13px]"
                    >
                        <option value="">Category</option>
                        {shipments.filterOptions.categories.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>

                    <select
                        value={filters.service}
                        onChange={(e) => setFilters((prev) => ({ ...prev, service: e.target.value }))}
                        className="h-[38px] rounded-[8px] border border-[#E5E7EB] px-3 text-[13px]"
                    >
                        <option value="">Service</option>
                        {shipments.filterOptions.services.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                        className="h-[38px] rounded-[8px] border border-[#E5E7EB] px-3 text-[13px]"
                    >
                        <option value="">Status</option>
                        {shipments.filterOptions.statuses.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>

                    <div className="h-[38px] rounded-[8px] border border-[#E5E7EB] px-2 flex items-center gap-2">
                        <CalendarDays size={14} className="text-[#6B7280]" />
                        <input
                            type="date"
                            value={filters.fromDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
                            className="w-full border-none outline-none focus:ring-0 text-[13px]"
                        />
                    </div>

                    <div className="h-[38px] rounded-[8px] border border-[#E5E7EB] px-2 flex items-center gap-2">
                        <CalendarDays size={14} className="text-[#6B7280]" />
                        <input
                            type="date"
                            value={filters.toDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
                            className="w-full border-none outline-none focus:ring-0 text-[13px]"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => submitFilters(1)}
                        className="h-[38px] rounded-[8px] bg-[#0955AC] text-white text-[13px] font-[700]"
                    >
                        Apply
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3">
                    <p className="text-[13px] text-[#6B7280]">
                        {selectedIds.length} selected for bulk update
                    </p>
                    <div className="flex gap-2">
                        <select
                            value={bulkAction}
                            onChange={(e) => setBulkAction(e.target.value)}
                            className="h-[36px] rounded-[8px] border border-[#D1D5DB] px-3 text-[13px]"
                        >
                            <option value="">Bulk Action</option>
                            {Object.keys(actionLabels).map((actionKey) => (
                                <option key={actionKey} value={actionKey}>{actionLabels[actionKey]}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={runBulkAction}
                            disabled={!bulkAction || selectedIds.length === 0}
                            className="h-[36px] px-3 rounded-[8px] bg-[#0955AC] text-white text-[13px] font-[700] disabled:opacity-50"
                        >
                            Apply To Selected
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-max min-w-full text-left text-[13px] whitespace-nowrap">
                        <thead className="bg-[#D8E4F2]">
                            <tr>
                                <th className="px-3 py-3 font-[700]">
                                    <input
                                        type="checkbox"
                                        checked={shipments.rows.length > 0 && selectedIds.length === shipments.rows.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedIds(shipments.rows.map((row) => row.id));
                                            } else {
                                                setSelectedIds([]);
                                            }
                                        }}
                                    />
                                </th>
                                <th className="px-3 py-3 font-[700]">Booking No</th>
                                <th className="px-3 py-3 font-[700]">Tracking No</th>
                                <th className="px-3 py-3 font-[700]">Category</th>
                                <th className="px-3 py-3 font-[700]">Route</th>
                                <th className="px-3 py-3 font-[700]">Stage</th>
                                <th className="px-3 py-3 font-[700]">Status</th>
                                <th className="px-3 py-3 font-[700]">Assignment</th>
                                <th className="px-3 py-3 font-[700]">SLA</th>
                                <th className="px-3 py-3 font-[700]">Pickup Window</th>
                                <th className="px-3 py-3 font-[700]">ETA</th>
                                <th className="px-3 py-3 font-[700]">Last Scan</th>
                                <th className="px-3 py-3 font-[700]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shipments.rows.length > 0 ? (
                                shipments.rows.map((row) => (
                                    <tr key={row.id} className="border-b border-[#E5E7EB] cursor-pointer" onClick={() => setSelectedShipment(row)}>
                                        <td className="px-3 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(row.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedIds((prev) => [...prev, row.id]);
                                                    } else {
                                                        setSelectedIds((prev) => prev.filter((id) => id !== row.id));
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="px-3 py-3 font-[700]">{row.bookingNumber}</td>
                                        <td className="px-3 py-3">{row.trackingNumber}</td>
                                        <td className="px-3 py-3">{row.category}</td>
                                        <td className="px-3 py-3">{row.origin} to {row.destination}</td>
                                        <td className="px-3 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-[700] ${stageBadge(row.stage)}`}>
                                                {row.stageLabel}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">{row.statusLabel}</td>
                                        <td className="px-3 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-[700] ${assignmentBadge(row.assignmentHealth)}`}>
                                                {titleCase(row.assignmentHealth)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-[700] ${slaBadge(row.slaStatus)}`}>
                                                {titleCase(row.slaStatus)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">{row.pickupWindow || "-"}</td>
                                        <td className="px-3 py-3">{row.estimatedDelivery || "-"}</td>
                                        <td className="px-3 py-3">{row.lastScan || "-"}</td>
                                        <td className="px-3 py-3">
                                            <div className="flex gap-1">
                                                {(row.allowedActions || []).map((action) => (
                                                    <button
                                                        key={action}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            runAction(row.id, action);
                                                        }}
                                                        className="px-2 py-1 rounded-[5px] bg-[#F3F4F6] text-[11px] font-[700]"
                                                    >
                                                        {actionLabels[action] || titleCase(action)}
                                                    </button>
                                                ))}
                                                {row.allowedActions.length === 0 && (
                                                    <span className="text-[11px] text-[#9CA3AF]">No actions</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={13} className="px-3 py-10 text-center text-[#6B7280]">
                                        No assigned shipments found for current filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mt-5">
                    <div className="flex items-center gap-2 text-[13px]">
                        <span>Rows per page</span>
                        <div className="relative">
                            <select
                                value={filters.perPage}
                                onChange={(e) => {
                                    const nextPerPage = Number(e.target.value);
                                    setFilters((prev) => ({ ...prev, perPage: nextPerPage }));
                                    submitFilters(1, { perPage: nextPerPage });
                                }}
                                className="h-[34px] rounded-[6px] border border-[#D1D5DB] px-3 pr-7 text-[13px]"
                            >
                                {shipments.filterOptions.perPageOptions.map((count) => (
                                    <option key={count} value={count}>{count}</option>
                                ))}
                            </select>
                            <ChevronDown className="size-[14px] text-[#6B7280] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    <p className="text-[13px] text-[#6B7280]">
                        Page {shipments.pagination.page} / {shipments.pagination.totalPages} ({shipments.pagination.total} records)
                    </p>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={shipments.pagination.page <= 1}
                            onClick={() => submitFilters(shipments.pagination.page - 1)}
                            className="h-[34px] px-3 rounded-[6px] border border-[#D1D5DB] text-[13px] disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            disabled={shipments.pagination.page >= shipments.pagination.totalPages}
                            onClick={() => submitFilters(shipments.pagination.page + 1)}
                            className="h-[34px] px-3 rounded-[6px] border border-[#D1D5DB] text-[13px] disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {selectedShipment && (
                <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelectedShipment(null)}>
                    <div
                        className="absolute right-0 top-0 h-full w-full max-w-[430px] bg-white p-6 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-[24px] font-[700] mb-4">Shipment Details</h2>
                        <div className="space-y-3 text-[14px]">
                            <p><span className="font-[700]">Booking:</span> {selectedShipment.bookingNumber}</p>
                            <p><span className="font-[700]">Tracking:</span> {selectedShipment.trackingNumber}</p>
                            <p><span className="font-[700]">Category:</span> {selectedShipment.category}</p>
                            <p><span className="font-[700]">Sender:</span> {selectedShipment.sender || "-"}</p>
                            <p><span className="font-[700]">Recipient:</span> {selectedShipment.recipient || "-"}</p>
                            <p><span className="font-[700]">Route:</span> {selectedShipment.origin} to {selectedShipment.destination}</p>
                            <p><span className="font-[700]">Service:</span> {selectedShipment.service}</p>
                            <p><span className="font-[700]">Current Stage:</span> {selectedShipment.stageLabel}</p>
                            <p><span className="font-[700]">Current Status:</span> {selectedShipment.statusLabel}</p>
                            <p><span className="font-[700]">Assignment:</span> {titleCase(selectedShipment.assignmentHealth)}</p>
                            <p><span className="font-[700]">SLA:</span> {titleCase(selectedShipment.slaStatus)}</p>
                            <p><span className="font-[700]">Pickup Window:</span> {selectedShipment.pickupWindow || "-"}</p>
                            <p><span className="font-[700]">Estimated Delivery:</span> {selectedShipment.estimatedDelivery || "-"}</p>
                            <p><span className="font-[700]">Last Scan:</span> {selectedShipment.lastScan || "-"}</p>
                            <p><span className="font-[700]">Packages:</span> {selectedShipment.details.packageCount}</p>
                            <p><span className="font-[700]">Total Weight:</span> {selectedShipment.details.totalWeight} kg</p>
                            <p><span className="font-[700]">Delivery Notes:</span> {selectedShipment.details.deliveryNotes || "-"}</p>
                            <p><span className="font-[700]">Internal Notes:</span> {selectedShipment.details.internalNotes || "-"}</p>
                        </div>
                        <button
                            type="button"
                            className="mt-6 w-full h-[40px] rounded-[8px] bg-[#0955AC] text-white font-[700]"
                            onClick={() => setSelectedShipment(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnitContent;
