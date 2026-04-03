import React, { useEffect, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';

const STATUS_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'not_requested', label: 'Not Requested' },
];

const statusClassMap = {
    pending: 'bg-[#FDB52A33] text-[#FDB52A] border border-[#FDB52A80]',
    approved: 'bg-[#05C16833] text-[#14CA74] border border-[#05C16880]',
    rejected: 'bg-[#FF475733] text-[#FF4757] border border-[#FF475780]',
    not_requested: 'bg-[#AEB9E133] text-[#AEB9E1] border border-[#AEB9E180]',
};

const CourierCodSettings = ({ settings, requests, filters, pagination, stats }) => {
    const { flash } = usePage().props;

    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [actionNotes, setActionNotes] = useState({});

    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({
        is_cod_enabled: Boolean(settings?.is_cod_enabled ?? true),
        settlement_cycle_days: Number(settings?.settlement_cycle_days ?? 7),
        holding_days: Number(settings?.holding_days ?? 2),
        reserve_percentage: Number(settings?.reserve_percentage ?? 0),
        minimum_payout_amount: Number(settings?.minimum_payout_amount ?? 0),
        currency_code: String(settings?.currency_code || 'LKR'),
        notes: String(settings?.notes || ''),
    });

    useEffect(() => {
        setSearch(filters?.search || '');
        setStatus(filters?.status || 'all');
    }, [filters?.search, filters?.status]);

    const applyFilters = (nextPage = 1) => {
        router.get(
            route('superadmin.settings.cod-settlement.index'),
            {
                status,
                search,
                page: nextPage,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleSettingsSubmit = (event) => {
        event.preventDefault();
        put(route('superadmin.settings.cod-settlement.update'), {
            preserveScroll: true,
        });
    };

    const handleCapabilityAction = (capabilityId, actionType) => {
        const note = String(actionNotes[capabilityId] || '').trim();
        if (actionType === 'reject' && note === '') {
            window.alert('Please provide a rejection reason.');
            return;
        }

        router.post(
            actionType === 'approve'
                ? route('superadmin.settings.cod-settlement.capabilities.approve', { capability: capabilityId })
                : route('superadmin.settings.cod-settlement.capabilities.reject', { capability: capabilityId }),
            {
                note,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="Courier COD Settlement" />

            <div className="flex flex-row bg-[#081028] min-h-screen poppins">
                <div className="sm:w-full md:w-auto lg:w-auto">
                    <SideMenu />
                </div>

                <div className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Courier COD Settlement</h1>
                            <p className="text-gray-400">Configure COD settlement policy and review vendor COD capability requests.</p>
                        </div>

                        {flash?.success && (
                            <div className="mb-4 rounded-lg border border-green-600 bg-green-600/20 px-4 py-3 text-green-300">
                                {flash.success}
                            </div>
                        )}

                        {flash?.error && (
                            <div className="mb-4 rounded-lg border border-red-600 bg-red-600/20 px-4 py-3 text-red-300">
                                {flash.error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <StatCard title="Total Requests" value={stats?.total || 0} color="text-[#AEB9E1]" />
                            <StatCard title="Pending" value={stats?.pending || 0} color="text-[#FDB52A]" />
                            <StatCard title="Approved" value={stats?.approved || 0} color="text-[#14CA74]" />
                            <StatCard title="Rejected" value={stats?.rejected || 0} color="text-[#FF4757]" />
                        </div>

                        <div className="bg-[#0A1330] border border-gray-700 rounded-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Settlement Policy</h2>
                            <form onSubmit={handleSettingsSubmit} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        id="is_cod_enabled"
                                        type="checkbox"
                                        checked={Boolean(data.is_cod_enabled)}
                                        onChange={(event) => setData('is_cod_enabled', event.target.checked)}
                                    />
                                    <label htmlFor="is_cod_enabled" className="text-sm font-medium text-gray-200">
                                        Enable COD settlement globally
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Field label="Settlement Cycle (days)" error={errors.settlement_cycle_days}>
                                        <input
                                            type="number"
                                            min={1}
                                            max={31}
                                            value={data.settlement_cycle_days}
                                            onChange={(event) => setData('settlement_cycle_days', Number(event.target.value || 0))}
                                            className="w-full rounded-md border border-gray-600 bg-[#081028] px-3 py-2 text-white"
                                        />
                                    </Field>

                                    <Field label="Holding Period (days)" error={errors.holding_days}>
                                        <input
                                            type="number"
                                            min={0}
                                            max={31}
                                            value={data.holding_days}
                                            onChange={(event) => setData('holding_days', Number(event.target.value || 0))}
                                            className="w-full rounded-md border border-gray-600 bg-[#081028] px-3 py-2 text-white"
                                        />
                                    </Field>

                                    <Field label="Reserve Percentage" error={errors.reserve_percentage}>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            step={0.01}
                                            value={data.reserve_percentage}
                                            onChange={(event) => setData('reserve_percentage', Number(event.target.value || 0))}
                                            className="w-full rounded-md border border-gray-600 bg-[#081028] px-3 py-2 text-white"
                                        />
                                    </Field>

                                    <Field label="Minimum Payout Amount" error={errors.minimum_payout_amount}>
                                        <input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            value={data.minimum_payout_amount}
                                            onChange={(event) => setData('minimum_payout_amount', Number(event.target.value || 0))}
                                            className="w-full rounded-md border border-gray-600 bg-[#081028] px-3 py-2 text-white"
                                        />
                                    </Field>

                                    <Field label="Currency" error={errors.currency_code}>
                                        <input
                                            type="text"
                                            maxLength={3}
                                            value={data.currency_code}
                                            onChange={(event) => setData('currency_code', event.target.value.toUpperCase())}
                                            className="w-full rounded-md border border-gray-600 bg-[#081028] px-3 py-2 text-white uppercase"
                                        />
                                    </Field>

                                    <Field label="Internal Notes" error={errors.notes}>
                                        <textarea
                                            rows={2}
                                            value={data.notes}
                                            onChange={(event) => setData('notes', event.target.value)}
                                            className="w-full rounded-md border border-gray-600 bg-[#081028] px-3 py-2 text-white"
                                        />
                                    </Field>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : 'Save COD Settlement'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-[#0A1330] border border-gray-700 rounded-lg p-6">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Vendor COD Capability Requests</h2>
                                    <p className="text-sm text-gray-400">Approve or reject vendor requests to enable operational COD collection.</p>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search vendor"
                                        className="rounded-md border border-gray-600 bg-[#081028] px-3 py-2 text-white"
                                    />
                                    <select
                                        value={status}
                                        onChange={(event) => setStatus(event.target.value)}
                                        className="rounded-md border border-gray-600 bg-[#081028] px-3 py-2 text-white"
                                    >
                                        {STATUS_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => applyFilters(1)}
                                        className="rounded-md bg-[#0955AC] px-4 py-2 text-sm font-semibold text-white"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1100px] text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-700 text-left text-gray-300">
                                            <th className="py-3 pr-4">Vendor</th>
                                            <th className="py-3 pr-4">Status</th>
                                            <th className="py-3 pr-4">Requested</th>
                                            <th className="py-3 pr-4">Review Note</th>
                                            <th className="py-3 pr-4">Last Decision</th>
                                            <th className="py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(Array.isArray(requests) ? requests : []).length === 0 && (
                                            <tr>
                                                <td className="py-6 text-center text-gray-400" colSpan={6}>No COD capability requests found.</td>
                                            </tr>
                                        )}

                                        {(Array.isArray(requests) ? requests : []).map((row) => (
                                            <tr key={row.id} className="border-b border-gray-800 align-top">
                                                <td className="py-3 pr-4">
                                                    <p className="font-semibold text-white">{row.vendorName || 'Unknown vendor'}</p>
                                                    <p className="text-xs text-gray-400">{row.vendorEmail || '-'}</p>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClassMap[row.status] || statusClassMap.not_requested}`}>
                                                        {row.statusLabel}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-4 text-gray-300">
                                                    <p>{row.requestedAt || '-'}</p>
                                                    <p className="text-xs text-gray-500">By: {row.requestedBy || '-'}</p>
                                                    {row.requestedNote && <p className="text-xs text-gray-400 mt-1">{row.requestedNote}</p>}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <textarea
                                                        rows={2}
                                                        value={actionNotes[row.id] || ''}
                                                        onChange={(event) => setActionNotes((prev) => ({ ...prev, [row.id]: event.target.value }))}
                                                        placeholder="Optional approval note / required rejection reason"
                                                        className="w-full rounded-md border border-gray-600 bg-[#081028] px-2 py-1 text-white"
                                                    />
                                                </td>
                                                <td className="py-3 pr-4 text-gray-300">
                                                    <p>{row.reviewedAt || '-'}</p>
                                                    <p className="text-xs text-gray-500">By: {row.reviewedBy || '-'}</p>
                                                    {row.decisionReason && <p className="text-xs text-gray-400 mt-1">{row.decisionReason}</p>}
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCapabilityAction(row.id, 'approve')}
                                                            className="rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCapabilityAction(row.id, 'reject')}
                                                            className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                                <p>
                                    Page {pagination?.currentPage || 1} of {pagination?.lastPage || 1} ({pagination?.total || 0} total)
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        disabled={(pagination?.currentPage || 1) <= 1}
                                        onClick={() => applyFilters((pagination?.currentPage || 1) - 1)}
                                        className="rounded-md border border-gray-600 px-3 py-1 text-white disabled:opacity-40"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        type="button"
                                        disabled={(pagination?.currentPage || 1) >= (pagination?.lastPage || 1)}
                                        onClick={() => applyFilters((pagination?.currentPage || 1) + 1)}
                                        className="rounded-md border border-gray-600 px-3 py-1 text-white disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const Field = ({ label, error, children }) => (
    <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-200">{label}</span>
        {children}
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </label>
);

const StatCard = ({ title, value, color }) => (
    <div className="rounded-lg border border-gray-700 bg-[#0A1330] p-4">
        <p className="text-xs uppercase tracking-wide text-gray-400">{title}</p>
        <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
);

export default CourierCodSettings;
