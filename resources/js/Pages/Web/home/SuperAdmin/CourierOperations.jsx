import React, { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';

const CourierOperations = ({
    shipments = {},
    stats = {},
    filters = {},
    statusOptions = [],
    vendorOptions = [],
}) => {
    const [query, setQuery] = useState(filters.q || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [assignmentFilter, setAssignmentFilter] = useState(filters.assignment || 'all');
    const [frozenFilter, setFrozenFilter] = useState(filters.frozen || 'all');

    const [reasonByShipment, setReasonByShipment] = useState({});
    const [targetStatusByShipment, setTargetStatusByShipment] = useState({});
    const [vendorByShipment, setVendorByShipment] = useState({});

    const rows = Array.isArray(shipments?.data) ? shipments.data : [];

    const vendorOptionsByCategory = useMemo(() => {
        return vendorOptions.reduce((accumulator, item) => {
            const category = item?.category || 'all';
            if (!accumulator[category]) {
                accumulator[category] = [];
            }
            accumulator[category].push(item);
            return accumulator;
        }, {});
    }, [vendorOptions]);

    const applyFilters = () => {
        router.get(
            '/superadmin/courier-operations',
            {
                q: query,
                status: statusFilter,
                assignment: assignmentFilter,
                frozen: frozenFilter,
                perPage: filters.perPage || 15,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const resetFilters = () => {
        setQuery('');
        setStatusFilter('all');
        setAssignmentFilter('all');
        setFrozenFilter('all');

        router.get(
            '/superadmin/courier-operations',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const setReason = (shipmentId, value) => {
        setReasonByShipment((current) => ({
            ...current,
            [shipmentId]: value,
        }));
    };

    const resolveReason = (shipmentId) => {
        return (reasonByShipment[shipmentId] || '').trim();
    };

    const withReason = (shipmentId, callback) => {
        const reason = resolveReason(shipmentId);
        if (reason.length < 10) {
            window.alert('Reason must be at least 10 characters.');
            return;
        }

        callback(reason);
    };

    const runAction = (url, shipmentId, payload = {}) => {
        withReason(shipmentId, (reason) => {
            router.post(
                url,
                {
                    ...payload,
                    reason,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setReasonByShipment((current) => ({
                            ...current,
                            [shipmentId]: '',
                        }));
                    },
                }
            );
        });
    };

    const pagination = {
        currentPage: shipments?.current_page || 1,
        lastPage: shipments?.last_page || 1,
        prevPageUrl: shipments?.prev_page_url || null,
        nextPageUrl: shipments?.next_page_url || null,
        from: shipments?.from || 0,
        to: shipments?.to || 0,
        total: shipments?.total || 0,
    };

    return (
        <div className="flex min-h-screen flex-row bg-[#081028] poppins sm:flex-col md:flex-row lg:flex-row">
            <div className="sm:w-full md:w-auto lg:w-auto">
                <SideMenu />
            </div>

            <div className="flex-1 p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white">Courier Operations Control</h1>
                        <p className="mt-2 text-sm text-[#AEB9E1]">
                            Superadmin intervention console for reassignment, forced transitions, operational freeze, and cancellation overrides.
                        </p>
                    </div>

                    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
                        <div className="rounded-lg border border-[#24315A] bg-[#181A2A] p-4">
                            <div className="text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">Total</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{stats.total || 0}</div>
                        </div>
                        <div className="rounded-lg border border-[#24315A] bg-[#181A2A] p-4">
                            <div className="text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">Pending</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{stats.pending || 0}</div>
                        </div>
                        <div className="rounded-lg border border-[#24315A] bg-[#181A2A] p-4">
                            <div className="text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">In Transit</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{stats.inTransit || 0}</div>
                        </div>
                        <div className="rounded-lg border border-[#24315A] bg-[#181A2A] p-4">
                            <div className="text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">Delivered</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{stats.delivered || 0}</div>
                        </div>
                        <div className="rounded-lg border border-[#24315A] bg-[#181A2A] p-4">
                            <div className="text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">Cancelled</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{stats.cancelled || 0}</div>
                        </div>
                    </div>

                    <div className="mb-6 rounded-lg border border-[#24315A] bg-[#0F1A3A] p-4">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="min-w-[220px] flex-1">
                                <label className="mb-1 block text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">Search</label>
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    className="w-full rounded-md border border-[#25345F] bg-[#081028] px-3 py-2 text-sm text-white focus:border-[#0E43FB] focus:outline-none"
                                    placeholder="Reference, sender, recipient"
                                />
                            </div>

                            <div className="min-w-[160px]">
                                <label className="mb-1 block text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                    className="w-full rounded-md border border-[#25345F] bg-[#081028] px-3 py-2 text-sm text-white"
                                >
                                    <option value="all">All</option>
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="min-w-[170px]">
                                <label className="mb-1 block text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">Assignment</label>
                                <select
                                    value={assignmentFilter}
                                    onChange={(event) => setAssignmentFilter(event.target.value)}
                                    className="w-full rounded-md border border-[#25345F] bg-[#081028] px-3 py-2 text-sm text-white"
                                >
                                    <option value="all">All</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="unassigned">Unassigned</option>
                                </select>
                            </div>

                            <div className="min-w-[140px]">
                                <label className="mb-1 block text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">Frozen</label>
                                <select
                                    value={frozenFilter}
                                    onChange={(event) => setFrozenFilter(event.target.value)}
                                    className="w-full rounded-md border border-[#25345F] bg-[#081028] px-3 py-2 text-sm text-white"
                                >
                                    <option value="all">All</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={applyFilters}
                                className="rounded-md bg-[#0E43FB] px-4 py-2 text-sm font-medium text-white hover:bg-[#0B35C8]"
                            >
                                Apply
                            </button>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="rounded-md border border-[#32406A] px-4 py-2 text-sm font-medium text-[#C5D0EE] hover:bg-[#1A2750]"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    <div className="rounded-lg border border-[#24315A] bg-[#181A2A] p-4">
                        <div className="mb-4 flex items-center justify-between text-sm text-[#AEB9E1]">
                            <div>
                                Showing {pagination.from || 0}-{pagination.to || 0} of {pagination.total || 0}
                            </div>
                            <div>
                                Page {pagination.currentPage} of {pagination.lastPage}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1200px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[#2B3860] text-[#8E9BC4]">
                                        <th className="px-2 py-3">Shipment</th>
                                        <th className="px-2 py-3">Status</th>
                                        <th className="px-2 py-3">Assigned Vendor</th>
                                        <th className="px-2 py-3">Reason</th>
                                        <th className="px-2 py-3">Interventions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 && (
                                        <tr>
                                            <td className="px-2 py-6 text-[#AEB9E1]" colSpan={5}>
                                                No shipments found for the selected filters.
                                            </td>
                                        </tr>
                                    )}

                                    {rows.map((shipment) => {
                                        const shipmentId = shipment.id;
                                        const selectedStatus = targetStatusByShipment[shipmentId] || shipment.status;
                                        const selectedVendor = vendorByShipment[shipmentId] || '';
                                        const preferredVendors = vendorOptionsByCategory[shipment.assignmentCategory] || [];
                                        const selectableVendors = preferredVendors.length > 0 ? preferredVendors : vendorOptions;

                                        return (
                                            <tr key={shipment.id} className="border-b border-[#273660] align-top text-white">
                                                <td className="px-2 py-4">
                                                    <div className="font-semibold">{shipment.reference}</div>
                                                    <div className="mt-1 text-xs text-[#8E9BC4]">Created {shipment.createdAt || '-'}</div>
                                                    <div className="mt-1 text-xs text-[#8E9BC4]">
                                                        {shipment.sender?.name || 'Unknown sender'} to {shipment.recipient?.name || 'Unknown recipient'}
                                                    </div>
                                                    <div className="mt-2 inline-flex rounded-full border border-[#3A4C7A] px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-[#C6D5FF]">
                                                        {shipment.assignmentCategory || 'unscoped'}
                                                    </div>
                                                    {shipment.isFrozen && (
                                                        <div className="ml-2 mt-2 inline-flex rounded-full border border-[#8B3A3A] bg-[#451D1D] px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-[#FFD2D2]">
                                                            Frozen
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-2 py-4">
                                                    <div className="mb-2 text-xs text-[#8E9BC4]">Current: {shipment.status}</div>
                                                    <select
                                                        value={selectedStatus}
                                                        onChange={(event) =>
                                                            setTargetStatusByShipment((current) => ({
                                                                ...current,
                                                                [shipmentId]: event.target.value,
                                                            }))
                                                        }
                                                        className="w-full rounded-md border border-[#31406A] bg-[#0B1739] px-2 py-2 text-sm text-white"
                                                    >
                                                        {statusOptions.map((status) => (
                                                            <option key={status} value={status}>
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        className="mt-2 w-full rounded-md border border-[#2E7A4F] bg-[#14492C] px-3 py-2 text-xs font-semibold text-[#D3F7DF] hover:bg-[#186338]"
                                                        onClick={() =>
                                                            runAction(
                                                                `/superadmin/courier-operations/shipments/${shipmentId}/force-transition`,
                                                                shipmentId,
                                                                { targetStatus: selectedStatus }
                                                            )
                                                        }
                                                        disabled={selectedStatus === shipment.status}
                                                    >
                                                        Force Transition
                                                    </button>
                                                </td>

                                                <td className="px-2 py-4">
                                                    <div className="mb-2 text-xs text-[#8E9BC4]">
                                                        {shipment.assignedVendor?.name || 'Not assigned'}
                                                    </div>
                                                    <select
                                                        value={selectedVendor}
                                                        onChange={(event) =>
                                                            setVendorByShipment((current) => ({
                                                                ...current,
                                                                [shipmentId]: event.target.value,
                                                            }))
                                                        }
                                                        className="w-full rounded-md border border-[#31406A] bg-[#0B1739] px-2 py-2 text-sm text-white"
                                                    >
                                                        <option value="">Select vendor</option>
                                                        {selectableVendors.map((vendor) => (
                                                            <option key={`${vendor.registrationId}-${vendor.vendorUserId}`} value={vendor.vendorUserId}>
                                                                {vendor.vendorName} ({vendor.category || 'all'})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        className="mt-2 w-full rounded-md border border-[#2B4E86] bg-[#10356E] px-3 py-2 text-xs font-semibold text-[#CFE0FF] hover:bg-[#13448D]"
                                                        onClick={() =>
                                                            runAction(
                                                                `/superadmin/courier-operations/shipments/${shipmentId}/reassign`,
                                                                shipmentId,
                                                                { vendorUserId: Number(selectedVendor) }
                                                            )
                                                        }
                                                        disabled={!selectedVendor}
                                                    >
                                                        Reassign Vendor
                                                    </button>
                                                </td>

                                                <td className="px-2 py-4">
                                                    <textarea
                                                        value={reasonByShipment[shipmentId] || ''}
                                                        onChange={(event) => setReason(shipmentId, event.target.value)}
                                                        rows={4}
                                                        placeholder="Mandatory reason (min 10 chars)"
                                                        className="w-full rounded-md border border-[#31406A] bg-[#0B1739] px-2 py-2 text-sm text-white placeholder:text-[#66749F]"
                                                    />
                                                </td>

                                                <td className="px-2 py-4">
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <button
                                                            type="button"
                                                            className="rounded-md border border-[#7B5A22] bg-[#4F370F] px-3 py-2 text-xs font-semibold text-[#FEE8BA] hover:bg-[#604514]"
                                                            onClick={() => {
                                                                const endpoint = shipment.isFrozen
                                                                    ? `/superadmin/courier-operations/shipments/${shipmentId}/unfreeze`
                                                                    : `/superadmin/courier-operations/shipments/${shipmentId}/freeze`;
                                                                runAction(endpoint, shipmentId);
                                                            }}
                                                        >
                                                            {shipment.isFrozen ? 'Unfreeze Operations' : 'Freeze Operations'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="rounded-md border border-[#8A3434] bg-[#5A1E1E] px-3 py-2 text-xs font-semibold text-[#FFD2D2] hover:bg-[#6A2424]"
                                                            onClick={() =>
                                                                runAction(
                                                                    `/superadmin/courier-operations/shipments/${shipmentId}/cancel-override`,
                                                                    shipmentId
                                                                )
                                                            }
                                                        >
                                                            Cancel Override
                                                        </button>
                                                        <a
                                                            href={`/superadmin/courier-operations/shipments/${shipmentId}/audit-history`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="rounded-md border border-[#32406A] px-3 py-2 text-center text-xs font-semibold text-[#C7D5FA] hover:bg-[#1A2750]"
                                                        >
                                                            Audit History
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <button
                                type="button"
                                className="rounded-md border border-[#32406A] px-4 py-2 text-sm text-[#C7D5FA] disabled:opacity-50"
                                disabled={!pagination.prevPageUrl}
                                onClick={() =>
                                    pagination.prevPageUrl &&
                                    router.visit(pagination.prevPageUrl, {
                                        preserveState: true,
                                        preserveScroll: true,
                                    })
                                }
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                className="rounded-md border border-[#32406A] px-4 py-2 text-sm text-[#C7D5FA] disabled:opacity-50"
                                disabled={!pagination.nextPageUrl}
                                onClick={() =>
                                    pagination.nextPageUrl &&
                                    router.visit(pagination.nextPageUrl, {
                                        preserveState: true,
                                        preserveScroll: true,
                                    })
                                }
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourierOperations;
