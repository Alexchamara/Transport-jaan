import React, { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';

const rowKey = (row) => `${row.vendorUserId}:${row.category}`;

const CourierPricingGovernance = ({
    queue = {},
    stats = {},
    filters = {},
    categoryOptions = [],
    authorityOptions = [],
}) => {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [authorityFilter, setAuthorityFilter] = useState(filters.authority || 'all');

    const rows = Array.isArray(queue?.data) ? queue.data : [];
    const [notesByRow, setNotesByRow] = useState({});
    const [policyByRow, setPolicyByRow] = useState({});
    const [rollbackVersionByRow, setRollbackVersionByRow] = useState({});
    const [busyActionRowKey, setBusyActionRowKey] = useState('');

    useEffect(() => {
        setPolicyByRow((current) => {
            const next = { ...current };
            rows.forEach((row) => {
                const key = rowKey(row);
                if (!next[key]) {
                    next[key] = {
                        approvalAuthority: row.authority || 'vendor',
                        requireApproval: Boolean(row.requireApproval),
                    };
                }
            });
            return next;
        });

        setRollbackVersionByRow((current) => {
            const next = { ...current };
            rows.forEach((row) => {
                const key = rowKey(row);
                if (typeof next[key] === 'undefined') {
                    const history = Array.isArray(row.versionHistory) ? row.versionHistory : [];
                    const previousVersion = history
                        .map((item) => Number(item?.version || 0))
                        .filter((item) => item > 0)
                        .sort((a, b) => b - a)[1];
                    next[key] = previousVersion ? String(previousVersion) : '';
                }
            });
            return next;
        });
    }, [rows]);

    const pagination = {
        currentPage: queue?.current_page || 1,
        lastPage: queue?.last_page || 1,
        prevPageUrl: queue?.prev_page_url || null,
        nextPageUrl: queue?.next_page_url || null,
        from: queue?.from || 0,
        to: queue?.to || 0,
        total: queue?.total || 0,
    };

    const statusOptionList = useMemo(
        () => [
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending Only' },
            { value: 'no_pending', label: 'No Pending' },
        ],
        []
    );

    const applyFilters = () => {
        router.get(
            '/superadmin/pricing-governance',
            {
                search,
                status: statusFilter,
                category: categoryFilter,
                authority: authorityFilter,
                perPage: filters.perPage || 20,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setAuthorityFilter('all');

        router.get(
            '/superadmin/pricing-governance',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const updateNote = (row, value) => {
        const key = rowKey(row);
        setNotesByRow((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const runAction = (row, endpoint, payload = {}, options = {}) => {
        const key = rowKey(row);
        const note = String(notesByRow[key] || '').trim();

        if (options.requireNote && note.length < (options.noteMinLength || 1)) {
            window.alert(`Reason must be at least ${options.noteMinLength || 1} characters.`);
            return;
        }

        setBusyActionRowKey(key);

        router.post(
            endpoint,
            {
                ...payload,
                note: note || null,
            },
            {
                preserveScroll: true,
                onFinish: () => setBusyActionRowKey(''),
            }
        );
    };

    const runPolicyUpdate = (row) => {
        const key = rowKey(row);
        const policy = policyByRow[key] || {
            approvalAuthority: row.authority || 'vendor',
            requireApproval: Boolean(row.requireApproval),
        };

        runAction(
            row,
            `/superadmin/pricing-governance/vendors/${row.vendorUserId}/categories/${row.category}/policy`,
            {
                approvalAuthority: policy.approvalAuthority,
                requireApproval: Boolean(policy.requireApproval),
            },
            {
                requireNote: false,
            }
        );
    };

    return (
        <div className="flex min-h-screen flex-row bg-[#081028] poppins sm:flex-col md:flex-row lg:flex-row">
            <div className="sm:w-full md:w-auto lg:w-auto">
                <SideMenu />
            </div>

            <div className="flex-1 p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white">Courier Pricing Governance</h1>
                        <p className="mt-2 text-sm text-[#AEB9E1]">
                            Review and enforce vendor pricing approval queues, authority policy, force publish interventions, and rollback controls.
                        </p>
                    </div>

                    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
                        <div className="rounded-lg border border-[#24315A] bg-[#181A2A] p-4">
                            <div className="text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">Total Category Scopes</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{stats.totalCategories || 0}</div>
                        </div>
                        <div className="rounded-lg border border-[#24315A] bg-[#181A2A] p-4">
                            <div className="text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">Pending Requests</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{stats.pendingRequests || 0}</div>
                        </div>
                        <div className="rounded-lg border border-[#24315A] bg-[#181A2A] p-4">
                            <div className="text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">SuperAdmin Authority</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{stats.superadminAuthority || 0}</div>
                        </div>
                        <div className="rounded-lg border border-[#24315A] bg-[#181A2A] p-4">
                            <div className="text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">Vendor Authority</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{stats.vendorAuthority || 0}</div>
                        </div>
                        <div className="rounded-lg border border-[#24315A] bg-[#181A2A] p-4">
                            <div className="text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">Vendors With Pending</div>
                            <div className="mt-2 text-2xl font-semibold text-white">{stats.vendorsWithPending || 0}</div>
                        </div>
                    </div>

                    <div className="mb-6 rounded-lg border border-[#24315A] bg-[#0F1A3A] p-4">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="min-w-[220px] flex-1">
                                <label className="mb-1 block text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">Search</label>
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="w-full rounded-md border border-[#25345F] bg-[#081028] px-3 py-2 text-sm text-white focus:border-[#0E43FB] focus:outline-none"
                                    placeholder="Vendor or requester"
                                />
                            </div>

                            <div className="min-w-[150px]">
                                <label className="mb-1 block text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                    className="w-full rounded-md border border-[#25345F] bg-[#081028] px-3 py-2 text-sm text-white"
                                >
                                    {statusOptionList.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="min-w-[150px]">
                                <label className="mb-1 block text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">Category</label>
                                <select
                                    value={categoryFilter}
                                    onChange={(event) => setCategoryFilter(event.target.value)}
                                    className="w-full rounded-md border border-[#25345F] bg-[#081028] px-3 py-2 text-sm text-white"
                                >
                                    {categoryOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {String(option).replace('_', ' ').toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="min-w-[170px]">
                                <label className="mb-1 block text-xs uppercase tracking-[0.08em] text-[#7E8AB2]">Authority</label>
                                <select
                                    value={authorityFilter}
                                    onChange={(event) => setAuthorityFilter(event.target.value)}
                                    className="w-full rounded-md border border-[#25345F] bg-[#081028] px-3 py-2 text-sm text-white"
                                >
                                    {authorityOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {String(option).replace('_', ' ').toUpperCase()}
                                        </option>
                                    ))}
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
                            <table className="w-full min-w-[1400px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[#2B3860] text-[#8E9BC4]">
                                        <th className="px-2 py-3">Vendor / Scope</th>
                                        <th className="px-2 py-3">Policy</th>
                                        <th className="px-2 py-3">Pending Request</th>
                                        <th className="px-2 py-3">Reason</th>
                                        <th className="px-2 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 && (
                                        <tr>
                                            <td className="px-2 py-6 text-[#AEB9E1]" colSpan={5}>
                                                No pricing governance rows found for the selected filters.
                                            </td>
                                        </tr>
                                    )}

                                    {rows.map((row) => {
                                        const key = rowKey(row);
                                        const busy = busyActionRowKey === key;
                                        const policy = policyByRow[key] || {
                                            approvalAuthority: row.authority || 'vendor',
                                            requireApproval: Boolean(row.requireApproval),
                                        };
                                        const pending = row.pendingApproval;
                                        const rollbackOptions = Array.isArray(row.versionHistory)
                                            ? row.versionHistory
                                            : [];

                                        return (
                                            <tr key={key} className="border-b border-[#273660] align-top text-white">
                                                <td className="px-2 py-4">
                                                    <div className="font-semibold">{row.vendorName}</div>
                                                    <div className="mt-1 text-xs text-[#8E9BC4]">{row.vendorEmail || '-'}</div>
                                                    <div className="mt-2 inline-flex rounded-full border border-[#355280] bg-[#0D2A54] px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-[#D0E2FF]">
                                                        {row.category}
                                                    </div>
                                                    <div className="mt-2 text-xs text-[#8E9BC4]">
                                                        Draft v{Number(row.draftVersion || 1)} • Published v{Number(row.publishedVersion || 1)}
                                                    </div>
                                                    <div className="mt-1 text-xs text-[#8E9BC4]">
                                                        Published at: {row.publishedAt || 'Never'}
                                                    </div>
                                                </td>

                                                <td className="px-2 py-4">
                                                    <div className="mb-2 text-xs uppercase tracking-[0.08em] text-[#8E9BC4]">Authority</div>
                                                    <select
                                                        value={policy.approvalAuthority}
                                                        onChange={(event) =>
                                                            setPolicyByRow((current) => ({
                                                                ...current,
                                                                [key]: {
                                                                    ...(current[key] || policy),
                                                                    approvalAuthority: event.target.value,
                                                                    requireApproval:
                                                                        event.target.value === 'superadmin'
                                                                            ? true
                                                                            : Boolean((current[key] || policy).requireApproval),
                                                                },
                                                            }))
                                                        }
                                                        className="w-full rounded-md border border-[#31406A] bg-[#0B1739] px-2 py-2 text-sm text-white"
                                                        disabled={busy}
                                                    >
                                                        <option value="vendor">Vendor</option>
                                                        <option value="superadmin">SuperAdmin</option>
                                                    </select>

                                                    <label className="mt-2 inline-flex items-center gap-2 text-xs text-[#C5D0EE]">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(policy.requireApproval)}
                                                            disabled={busy || policy.approvalAuthority === 'superadmin'}
                                                            onChange={(event) =>
                                                                setPolicyByRow((current) => ({
                                                                    ...current,
                                                                    [key]: {
                                                                        ...(current[key] || policy),
                                                                        requireApproval: event.target.checked,
                                                                    },
                                                                }))
                                                            }
                                                        />
                                                        Require approval before publish
                                                    </label>

                                                    <div className="mt-2 text-xs text-[#8E9BC4]">
                                                        Approver roles: {(Array.isArray(row.approverRoles) ? row.approverRoles : []).join(', ') || '-'}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="mt-3 w-full rounded-md border border-[#2B4E86] bg-[#10356E] px-3 py-2 text-xs font-semibold text-[#CFE0FF] hover:bg-[#13448D] disabled:opacity-50"
                                                        disabled={busy}
                                                        onClick={() => runPolicyUpdate(row)}
                                                    >
                                                        Save Policy
                                                    </button>
                                                </td>

                                                <td className="px-2 py-4">
                                                    {pending ? (
                                                        <>
                                                            <div className="inline-flex rounded-full border border-[#7B5A22] bg-[#4F370F] px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] text-[#FEE8BA]">
                                                                Pending Approval
                                                            </div>
                                                            <div className="mt-2 text-xs text-[#8E9BC4]">Requested at: {pending.requestedAt || '-'}</div>
                                                            <div className="mt-1 text-xs text-[#8E9BC4]">Requested by: {pending.requestedByName || 'Unknown'} {pending.requestedByEmail ? `(${pending.requestedByEmail})` : ''}</div>
                                                            <div className="mt-1 text-xs text-[#8E9BC4]">Snapshot: {pending.hasSnapshot ? 'Ready' : 'Missing'}</div>
                                                            {pending.note && (
                                                                <div className="mt-2 rounded-md border border-[#3E4F78] bg-[#101F42] p-2 text-xs text-[#D3DDFB]">
                                                                    {pending.note}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="text-xs text-[#8E9BC4]">No pending approval request.</div>
                                                    )}

                                                    <div className="mt-3 text-xs text-[#8E9BC4]">Rollback version</div>
                                                    <select
                                                        value={rollbackVersionByRow[key] || ''}
                                                        onChange={(event) =>
                                                            setRollbackVersionByRow((current) => ({
                                                                ...current,
                                                                [key]: event.target.value,
                                                            }))
                                                        }
                                                        className="mt-1 w-full rounded-md border border-[#31406A] bg-[#0B1739] px-2 py-2 text-sm text-white"
                                                    >
                                                        <option value="">Previous Published Version</option>
                                                        {rollbackOptions.map((entry) => (
                                                            <option key={`${key}-rollback-${entry.version}`} value={String(entry.version)}>
                                                                v{Number(entry.version)} ({entry.event || 'published'})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>

                                                <td className="px-2 py-4">
                                                    <textarea
                                                        rows={5}
                                                        value={notesByRow[key] || ''}
                                                        onChange={(event) => updateNote(row, event.target.value)}
                                                        placeholder="Action reason / governance note"
                                                        className="w-full rounded-md border border-[#31406A] bg-[#0B1739] px-2 py-2 text-sm text-white placeholder:text-[#66749F]"
                                                    />
                                                    <a
                                                        href={`/superadmin/pricing-governance/vendors/${row.vendorUserId}/categories/${row.category}/audit-history`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-3 inline-flex w-full justify-center rounded-md border border-[#32406A] px-3 py-2 text-xs font-semibold text-[#C7D5FA] hover:bg-[#1A2750]"
                                                    >
                                                        Audit History
                                                    </a>
                                                </td>

                                                <td className="px-2 py-4">
                                                    <div className="grid grid-cols-1 gap-2">
                                                        <button
                                                            type="button"
                                                            className="rounded-md border border-[#2E7A4F] bg-[#14492C] px-3 py-2 text-xs font-semibold text-[#D3F7DF] hover:bg-[#186338] disabled:opacity-50"
                                                            disabled={busy || !pending}
                                                            onClick={() =>
                                                                runAction(
                                                                    row,
                                                                    `/superadmin/pricing-governance/vendors/${row.vendorUserId}/categories/${row.category}/approve`,
                                                                    {},
                                                                    { requireNote: false }
                                                                )
                                                            }
                                                        >
                                                            Approve + Publish
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="rounded-md border border-[#8A3434] bg-[#5A1E1E] px-3 py-2 text-xs font-semibold text-[#FFD2D2] hover:bg-[#6A2424] disabled:opacity-50"
                                                            disabled={busy || !pending}
                                                            onClick={() =>
                                                                runAction(
                                                                    row,
                                                                    `/superadmin/pricing-governance/vendors/${row.vendorUserId}/categories/${row.category}/reject`,
                                                                    {},
                                                                    { requireNote: true, noteMinLength: 5 }
                                                                )
                                                            }
                                                        >
                                                            Reject Request
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="rounded-md border border-[#7B5A22] bg-[#4F370F] px-3 py-2 text-xs font-semibold text-[#FEE8BA] hover:bg-[#604514] disabled:opacity-50"
                                                            disabled={busy}
                                                            onClick={() => {
                                                                if (!window.confirm('Force publish will bypass pending approval checks. Continue?')) {
                                                                    return;
                                                                }

                                                                runAction(
                                                                    row,
                                                                    `/superadmin/pricing-governance/vendors/${row.vendorUserId}/categories/${row.category}/force-publish`,
                                                                    {},
                                                                    { requireNote: true, noteMinLength: 10 }
                                                                );
                                                            }}
                                                        >
                                                            Force Publish
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="rounded-md border border-[#2B4E86] bg-[#10356E] px-3 py-2 text-xs font-semibold text-[#CFE0FF] hover:bg-[#13448D] disabled:opacity-50"
                                                            disabled={busy || rollbackOptions.length < 2}
                                                            onClick={() =>
                                                                runAction(
                                                                    row,
                                                                    `/superadmin/pricing-governance/vendors/${row.vendorUserId}/categories/${row.category}/rollback`,
                                                                    {
                                                                        rollbackVersion: rollbackVersionByRow[key]
                                                                            ? Number(rollbackVersionByRow[key])
                                                                            : null,
                                                                    },
                                                                    { requireNote: true, noteMinLength: 10 }
                                                                )
                                                            }
                                                        >
                                                            Rollback Publish
                                                        </button>
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

export default CourierPricingGovernance;
