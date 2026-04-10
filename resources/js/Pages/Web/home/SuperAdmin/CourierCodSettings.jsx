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

const CATEGORY_OPTIONS = [
    { value: 'all', label: 'All Requests' },
    { value: 'domestic', label: 'Domestic Scope' },
    { value: 'international', label: 'International Scope' },
];

const statusClassMap = {
    pending: 'bg-[#FDB52A33] text-[#FDB52A] border border-[#FDB52A80]',
    approved: 'bg-[#05C16833] text-[#14CA74] border border-[#05C16880]',
    rejected: 'bg-[#FF475733] text-[#FF4757] border border-[#FF475780]',
    not_requested: 'bg-[#AEB9E133] text-[#AEB9E1] border border-[#AEB9E180]',
};

const auditEventAccentMap = {
    cod_capability_request_submitted: 'bg-[#5B8DEF]',
    cod_capability_approved: 'bg-[#14CA74]',
    cod_capability_rejected: 'bg-[#FF4757]',
    cod_capability_revoked: 'bg-[#FF8A00]',
};

const HISTORY_EVENT_OPTIONS = [
    { value: 'all', label: 'All Events' },
    { value: 'cod_capability_request_submitted', label: 'Request Submitted' },
    { value: 'cod_capability_approved', label: 'Capability Approved' },
    { value: 'cod_capability_rejected', label: 'Capability Rejected' },
    { value: 'cod_capability_revoked', label: 'Capability Revoked' },
    { value: 'cod_integrity_incident_opened', label: 'Integrity Incident Opened' },
    { value: 'cod_integrity_incident_assigned', label: 'Integrity Incident Assigned' },
    { value: 'cod_integrity_incident_resolved', label: 'Integrity Incident Resolved' },
    { value: 'cod_integrity_incident_dismissed', label: 'Integrity Incident Dismissed' },
];

const INCIDENT_SEVERITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
];

const incidentSeverityClassMap = {
    low: 'border-sky-600 bg-sky-900/20 text-sky-300',
    medium: 'border-amber-600 bg-amber-900/20 text-amber-300',
    high: 'border-orange-600 bg-orange-900/20 text-orange-300',
    critical: 'border-red-600 bg-red-900/20 text-red-300',
};

const incidentStatusClassMap = {
    open: 'border-red-600 bg-red-900/20 text-red-300',
    investigating: 'border-amber-600 bg-amber-900/20 text-amber-300',
    resolved: 'border-emerald-600 bg-emerald-900/20 text-emerald-300',
    dismissed: 'border-gray-600 bg-gray-900/20 text-gray-300',
};

const defaultHistoryPagination = {
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
};

const defaultHistoryIntegrity = {
    isValid: true,
    issueCount: 0,
    verifiedEvents: 0,
};

const DEFAULT_CATEGORY_POLICIES = {
    domestic: {
        cod_enabled: true,
        allow_lock_override: true,
    },
    international: {
        cod_enabled: false,
        allow_lock_override: false,
    },
};

const DEFAULT_OVERRIDE_POLICY = {
    enabled: true,
    maker_checker: true,
    level1_min_amount: 25000,
    level2_min_amount: 100000,
    required_approvals_level1: 1,
    required_approvals_level2: 2,
};

const resolveCategoryPolicies = (settings = {}) => ({
    domestic: {
        ...DEFAULT_CATEGORY_POLICIES.domestic,
        ...(settings?.category_policies?.domestic || {}),
    },
    international: {
        ...DEFAULT_CATEGORY_POLICIES.international,
        ...(settings?.category_policies?.international || {}),
    },
});

const resolveOverridePolicy = (settings = {}) => ({
    ...DEFAULT_OVERRIDE_POLICY,
    ...(settings?.override_policy || {}),
});

const CourierCodSettings = ({ settings, requests, filters, pagination, stats }) => {
    const { flash } = usePage().props;

    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [category, setCategory] = useState(filters?.category || 'all');
    const [fromDate, setFromDate] = useState(filters?.from || '');
    const [toDate, setToDate] = useState(filters?.to || '');
    const [actionNotes, setActionNotes] = useState({});
    const [actionExpiryAt, setActionExpiryAt] = useState({});
    const [incidentDrafts, setIncidentDrafts] = useState({});
    const [incidentResolutionNotes, setIncidentResolutionNotes] = useState({});
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [historyCapability, setHistoryCapability] = useState(null);
    const [historyActiveIncident, setHistoryActiveIncident] = useState(null);
    const [historyEvents, setHistoryEvents] = useState([]);
    const [historyPagination, setHistoryPagination] = useState(defaultHistoryPagination);
    const [historyIntegrity, setHistoryIntegrity] = useState(defaultHistoryIntegrity);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState('');
    const [historyEventTypeFilter, setHistoryEventTypeFilter] = useState('all');
    const [historyActorFilter, setHistoryActorFilter] = useState('');
    const [historyFromFilter, setHistoryFromFilter] = useState('');
    const [historyToFilter, setHistoryToFilter] = useState('');
    const [overrideControls, setOverrideControls] = useState({});

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
        category_policies: resolveCategoryPolicies(settings),
        override_policy: resolveOverridePolicy(settings),
    });

    useEffect(() => {
        setData((current) => ({
            ...current,
            category_policies: resolveCategoryPolicies(settings),
            override_policy: resolveOverridePolicy(settings),
        }));
    }, [settings?.category_policies, settings?.override_policy, setData]);

    useEffect(() => {
        setSearch(filters?.search || '');
        setStatus(filters?.status || 'all');
        setCategory(filters?.category || 'all');
        setFromDate(filters?.from || '');
        setToDate(filters?.to || '');
    }, [filters?.search, filters?.status, filters?.category, filters?.from, filters?.to]);

    const applyFilters = (nextPage = 1) => {
        const params = {
            status,
            category,
            search,
            page: nextPage,
        };

        if (fromDate !== '') {
            params.from = fromDate;
        }

        if (toDate !== '') {
            params.to = toDate;
        }

        router.get(
            route('superadmin.settings.cod-settlement.index'),
            params,
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleComplianceExport = () => {
        const params = {
            status,
            category,
        };

        const trimmedSearch = search.trim();
        if (trimmedSearch !== '') {
            params.search = trimmedSearch;
        }

        if (fromDate !== '') {
            params.from = fromDate;
        }

        if (toDate !== '') {
            params.to = toDate;
        }

        window.location.href = route('superadmin.settings.cod-settlement.compliance-export', params);
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

        if (actionType === 'revoke' && note.length < 10) {
            window.alert('Please provide a revoke reason with at least 10 characters.');
            return;
        }

        const overrideState = overrideControls[capabilityId] || {
            enabled: false,
            exposureAmount: '',
        };
        const overrideEnabled = Boolean(overrideState.enabled);
        const overrideExposureAmount = Number(overrideState.exposureAmount || 0);

        if (overrideEnabled && overrideExposureAmount <= 0) {
            window.alert('Enter a positive override exposure amount.');
            return;
        }

        const payload = {
            note,
            overrideLock: overrideEnabled,
            overrideExposureAmount: overrideEnabled ? overrideExposureAmount : null,
        };

        if (actionType === 'approve') {
            const expiresAt = String(actionExpiryAt[capabilityId] || '').trim();
            if (expiresAt !== '') {
                payload.expiresAt = expiresAt;
            }
        }

        const routeName = {
            approve: 'superadmin.settings.cod-settlement.capabilities.approve',
            reject: 'superadmin.settings.cod-settlement.capabilities.reject',
            revoke: 'superadmin.settings.cod-settlement.capabilities.revoke',
        }[actionType];

        if (!routeName) {
            window.alert('Unsupported capability action.');
            return;
        }

        router.post(
            route(routeName, { capability: capabilityId }),
            payload,
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setActionNotes((prev) => ({
                        ...prev,
                        [capabilityId]: '',
                    }));

                    if (actionType === 'approve') {
                        setActionExpiryAt((prev) => ({
                            ...prev,
                            [capabilityId]: '',
                        }));
                    }

                    setOverrideControls((prev) => ({
                        ...prev,
                        [capabilityId]: {
                            enabled: false,
                            exposureAmount: '',
                        },
                    }));
                },
                onError: (errorsBag) => {
                    const values = Object.values(errorsBag || {});
                    if (values.length > 0) {
                        window.alert(String(values[0] || 'Action failed.'));
                    }
                },
            },
        );
    };

    const updateIncidentDraft = (capabilityId, key, value) => {
        setIncidentDrafts((prev) => {
            const current = prev[capabilityId] || {
                title: '',
                description: '',
                severity: 'high',
            };

            return {
                ...prev,
                [capabilityId]: {
                    ...current,
                    [key]: value,
                },
            };
        });
    };

    const handleOpenIncident = (row) => {
        const capabilityId = row?.id;
        if (!capabilityId) {
            return;
        }

        const draft = incidentDrafts[capabilityId] || {
            title: '',
            description: '',
            severity: 'high',
        };

        const title = String(draft.title || '').trim();
        if (title === '') {
            window.alert('Please provide an incident title.');
            return;
        }

        const payload = {
            title,
            description: String(draft.description || '').trim(),
            severity: String(draft.severity || 'high'),
            note: String(actionNotes[capabilityId] || '').trim(),
        };

        router.post(
            route('superadmin.settings.cod-settlement.capabilities.incidents.open', { capability: capabilityId }),
            payload,
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIncidentDrafts((prev) => ({
                        ...prev,
                        [capabilityId]: {
                            title: '',
                            description: '',
                            severity: 'high',
                        },
                    }));
                },
                onError: (errorsBag) => {
                    const values = Object.values(errorsBag || {});
                    if (values.length > 0) {
                        window.alert(String(values[0] || 'Unable to open incident.'));
                    }
                },
            },
        );
    };

    const handleAssignIncident = (row) => {
        const incidentId = row?.activeIncident?.id;
        if (!incidentId) {
            return;
        }

        router.post(
            route('superadmin.settings.cod-settlement.incidents.assign', { incident: incidentId }),
            {
                note: String(actionNotes[row.id] || '').trim(),
            },
            {
                preserveState: true,
                preserveScroll: true,
                onError: (errorsBag) => {
                    const values = Object.values(errorsBag || {});
                    if (values.length > 0) {
                        window.alert(String(values[0] || 'Unable to assign incident.'));
                    }
                },
            },
        );
    };

    const handleResolveIncident = (row, resolutionStatus) => {
        const incidentId = row?.activeIncident?.id;
        if (!incidentId) {
            return;
        }

        const resolutionNote = String(incidentResolutionNotes[row.id] || '').trim();
        if (resolutionNote === '') {
            window.alert('Please provide a resolution note before closing the incident.');
            return;
        }

        router.post(
            route('superadmin.settings.cod-settlement.incidents.resolve', { incident: incidentId }),
            {
                resolutionStatus,
                resolutionNote,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIncidentResolutionNotes((prev) => ({
                        ...prev,
                        [row.id]: '',
                    }));
                },
                onError: (errorsBag) => {
                    const values = Object.values(errorsBag || {});
                    if (values.length > 0) {
                        window.alert(String(values[0] || 'Unable to resolve incident.'));
                    }
                },
            },
        );
    };

    const fetchCapabilityHistory = async (capabilityId, page = 1, capabilityFallback = null, filterOverrides = null) => {
        if (!capabilityId) {
            return;
        }

        const resolvedEventType = typeof filterOverrides?.eventType === 'string'
            ? filterOverrides.eventType
            : historyEventTypeFilter;
        const resolvedActor = typeof filterOverrides?.actor === 'string'
            ? filterOverrides.actor
            : historyActorFilter;
        const resolvedFrom = typeof filterOverrides?.from === 'string'
            ? filterOverrides.from
            : historyFromFilter;
        const resolvedTo = typeof filterOverrides?.to === 'string'
            ? filterOverrides.to
            : historyToFilter;

        const params = {
            capability: capabilityId,
            page,
            perPage: defaultHistoryPagination.perPage,
        };

        if (resolvedEventType !== 'all') {
            params.eventType = resolvedEventType;
        }

        if (resolvedActor.trim() !== '') {
            params.actor = resolvedActor.trim();
        }

        if (resolvedFrom !== '') {
            params.from = resolvedFrom;
        }

        if (resolvedTo !== '') {
            params.to = resolvedTo;
        }

        setHistoryLoading(true);
        setHistoryError('');

        try {
            const response = await fetch(
                route('superadmin.settings.cod-settlement.capabilities.audit-history', params),
                {
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Unable to load capability audit history.');
            }

            const payload = await response.json();

            setHistoryCapability(payload?.capability || capabilityFallback || null);
            setHistoryActiveIncident(payload?.activeIncident || null);
            setHistoryEvents(Array.isArray(payload?.events) ? payload.events : []);
            setHistoryPagination(payload?.pagination || defaultHistoryPagination);
            setHistoryIntegrity(payload?.integrity || defaultHistoryIntegrity);
        } catch (error) {
            setHistoryError(error?.message || 'Unable to load capability audit history.');
            setHistoryActiveIncident(null);
            setHistoryEvents([]);
            setHistoryPagination(defaultHistoryPagination);
            setHistoryIntegrity(defaultHistoryIntegrity);
        } finally {
            setHistoryLoading(false);
        }
    };

    const openHistoryModal = (row) => {
        const capabilitySummary = {
            id: row?.id,
            vendorName: row?.vendorName || 'Unknown vendor',
            vendorEmail: row?.vendorEmail || '',
            categoryLabel: row?.categoryLabel || 'Domestic',
            statusLabel: row?.statusLabel || 'Unknown',
        };

        setHistoryEventTypeFilter('all');
        setHistoryActorFilter('');
        setHistoryFromFilter('');
        setHistoryToFilter('');
        setHistoryCapability(capabilitySummary);
        setHistoryActiveIncident(row?.activeIncident || null);
        setHistoryEvents([]);
        setHistoryPagination(defaultHistoryPagination);
        setHistoryIntegrity(defaultHistoryIntegrity);
        setHistoryModalOpen(true);

        fetchCapabilityHistory(row?.id, 1, capabilitySummary, {
            eventType: 'all',
            actor: '',
            from: '',
            to: '',
        });
    };

    const closeHistoryModal = () => {
        setHistoryModalOpen(false);
        setHistoryCapability(null);
        setHistoryActiveIncident(null);
        setHistoryEvents([]);
        setHistoryPagination(defaultHistoryPagination);
        setHistoryIntegrity(defaultHistoryIntegrity);
        setHistoryError('');
    };

    const applyHistoryFilters = () => {
        fetchCapabilityHistory(historyCapability?.id, 1, historyCapability);
    };

    const changeHistoryPage = (nextPage) => {
        fetchCapabilityHistory(historyCapability?.id, nextPage, historyCapability);
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
                            <p className="text-gray-400">Configure COD settlement policy and review vendor COD capability governance across domestic and international scopes.</p>
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

                                <div className="rounded-md border border-gray-700 bg-[#081028] p-4">
                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-300">Category Policy Scope</h3>
                                    <p className="mt-1 text-xs text-gray-500">Define where COD capability approvals are enabled and whether lock overrides are allowed.</p>

                                    <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="rounded-md border border-gray-700 bg-[#03091E] p-3">
                                            <p className="text-sm font-semibold text-white">Domestic</p>
                                            <label className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(data.category_policies?.domestic?.cod_enabled)}
                                                    onChange={(event) => setData('category_policies', {
                                                        ...(data.category_policies || DEFAULT_CATEGORY_POLICIES),
                                                        domestic: {
                                                            ...(data.category_policies?.domestic || DEFAULT_CATEGORY_POLICIES.domestic),
                                                            cod_enabled: event.target.checked,
                                                        },
                                                    })}
                                                />
                                                COD approvals enabled
                                            </label>
                                            <label className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(data.category_policies?.domestic?.allow_lock_override)}
                                                    onChange={(event) => setData('category_policies', {
                                                        ...(data.category_policies || DEFAULT_CATEGORY_POLICIES),
                                                        domestic: {
                                                            ...(data.category_policies?.domestic || DEFAULT_CATEGORY_POLICIES.domestic),
                                                            allow_lock_override: event.target.checked,
                                                        },
                                                    })}
                                                />
                                                Lock override allowed
                                            </label>
                                        </div>

                                        <div className="rounded-md border border-gray-700 bg-[#03091E] p-3">
                                            <p className="text-sm font-semibold text-white">International</p>
                                            <label className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(data.category_policies?.international?.cod_enabled)}
                                                    onChange={(event) => setData('category_policies', {
                                                        ...(data.category_policies || DEFAULT_CATEGORY_POLICIES),
                                                        international: {
                                                            ...(data.category_policies?.international || DEFAULT_CATEGORY_POLICIES.international),
                                                            cod_enabled: event.target.checked,
                                                        },
                                                    })}
                                                />
                                                COD approvals enabled
                                            </label>
                                            <label className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(data.category_policies?.international?.allow_lock_override)}
                                                    onChange={(event) => setData('category_policies', {
                                                        ...(data.category_policies || DEFAULT_CATEGORY_POLICIES),
                                                        international: {
                                                            ...(data.category_policies?.international || DEFAULT_CATEGORY_POLICIES.international),
                                                            allow_lock_override: event.target.checked,
                                                        },
                                                    })}
                                                />
                                                Lock override allowed
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-md border border-gray-700 bg-[#081028] p-4">
                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-300">Override Threshold Policy</h3>
                                    <p className="mt-1 text-xs text-gray-500">Thresholds are aligned to sensitive action COD override controls.</p>

                                    <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <label className="flex items-center gap-2 text-sm text-gray-300">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(data.override_policy?.enabled)}
                                                onChange={(event) => setData('override_policy', {
                                                    ...(data.override_policy || DEFAULT_OVERRIDE_POLICY),
                                                    enabled: event.target.checked,
                                                })}
                                            />
                                            Policy enabled
                                        </label>

                                        <label className="flex items-center gap-2 text-sm text-gray-300">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(data.override_policy?.maker_checker)}
                                                onChange={(event) => setData('override_policy', {
                                                    ...(data.override_policy || DEFAULT_OVERRIDE_POLICY),
                                                    maker_checker: event.target.checked,
                                                })}
                                            />
                                            Maker-checker required
                                        </label>
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Field label="Level 1 Min Amount" error={errors['override_policy.level1_min_amount']}>
                                            <input
                                                type="number"
                                                min={0}
                                                step={0.01}
                                                value={Number(data.override_policy?.level1_min_amount || 0)}
                                                onChange={(event) => setData('override_policy', {
                                                    ...(data.override_policy || DEFAULT_OVERRIDE_POLICY),
                                                    level1_min_amount: Number(event.target.value || 0),
                                                })}
                                                className="w-full rounded-md border border-gray-600 bg-[#03091E] px-3 py-2 text-white"
                                            />
                                        </Field>

                                        <Field label="Level 2 Min Amount" error={errors['override_policy.level2_min_amount']}>
                                            <input
                                                type="number"
                                                min={0}
                                                step={0.01}
                                                value={Number(data.override_policy?.level2_min_amount || 0)}
                                                onChange={(event) => setData('override_policy', {
                                                    ...(data.override_policy || DEFAULT_OVERRIDE_POLICY),
                                                    level2_min_amount: Number(event.target.value || 0),
                                                })}
                                                className="w-full rounded-md border border-gray-600 bg-[#03091E] px-3 py-2 text-white"
                                            />
                                        </Field>

                                        <Field label="Level 1 Required Approvals" error={errors['override_policy.required_approvals_level1']}>
                                            <input
                                                type="number"
                                                min={1}
                                                max={3}
                                                value={Number(data.override_policy?.required_approvals_level1 || 1)}
                                                onChange={(event) => setData('override_policy', {
                                                    ...(data.override_policy || DEFAULT_OVERRIDE_POLICY),
                                                    required_approvals_level1: Number(event.target.value || 1),
                                                })}
                                                className="w-full rounded-md border border-gray-600 bg-[#03091E] px-3 py-2 text-white"
                                            />
                                        </Field>

                                        <Field label="Level 2 Required Approvals" error={errors['override_policy.required_approvals_level2']}>
                                            <input
                                                type="number"
                                                min={1}
                                                max={3}
                                                value={Number(data.override_policy?.required_approvals_level2 || 2)}
                                                onChange={(event) => setData('override_policy', {
                                                    ...(data.override_policy || DEFAULT_OVERRIDE_POLICY),
                                                    required_approvals_level2: Number(event.target.value || 2),
                                                })}
                                                className="w-full rounded-md border border-gray-600 bg-[#03091E] px-3 py-2 text-white"
                                            />
                                        </Field>
                                    </div>
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
                                    <p className="text-sm text-gray-400">Approve, reject, or revoke COD capability decisions across category scopes with lock-aware override controls.</p>
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
                                    <select
                                        value={category}
                                        onChange={(event) => setCategory(event.target.value)}
                                        className="rounded-md border border-gray-600 bg-[#081028] px-3 py-2 text-white"
                                    >
                                        {CATEGORY_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(event) => setFromDate(event.target.value)}
                                        className="rounded-md border border-gray-600 bg-[#081028] px-3 py-2 text-white"
                                    />
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(event) => setToDate(event.target.value)}
                                        className="rounded-md border border-gray-600 bg-[#081028] px-3 py-2 text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => applyFilters(1)}
                                        className="rounded-md bg-[#0955AC] px-4 py-2 text-sm font-semibold text-white"
                                    >
                                        Apply
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleComplianceExport}
                                        className="rounded-md border border-sky-500 bg-sky-900/20 px-4 py-2 text-sm font-semibold text-sky-300 hover:bg-sky-900/40"
                                    >
                                        Export Compliance Package
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

                                        {(Array.isArray(requests) ? requests : []).map((row) => {
                                            const overrideState = overrideControls[row.id] || {
                                                enabled: false,
                                                exposureAmount: '',
                                            };
                                            const lockBypassEnabled = Boolean(overrideState.enabled);
                                            const rowPolicy = row?.categoryPolicy || {};
                                            const lockOverrideAllowed = Boolean(rowPolicy.allowLockOverride ?? true);

                                            return (
                                            <tr key={row.id} className="border-b border-gray-800 align-top">
                                                <td className="py-3 pr-4">
                                                    <p className="font-semibold text-white">{row.vendorName || 'Unknown vendor'}</p>
                                                    <p className="text-xs text-gray-400">{row.vendorEmail || '-'}</p>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClassMap[row.status] || statusClassMap.not_requested}`}>
                                                        {row.statusLabel}
                                                    </span>
                                                    <p className="mt-1 text-xs text-gray-400">{row.categoryLabel || 'Domestic'}</p>
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
                                                    <div className="mt-2 rounded-md border border-gray-700 bg-[#03091E] px-2 py-2">
                                                        <label className="flex items-center gap-2 text-[11px] text-gray-300">
                                                            <input
                                                                type="checkbox"
                                                                checked={lockBypassEnabled}
                                                                disabled={!lockOverrideAllowed}
                                                                onChange={(event) => setOverrideControls((prev) => ({
                                                                    ...prev,
                                                                    [row.id]: {
                                                                        ...(prev[row.id] || { exposureAmount: '' }),
                                                                        enabled: event.target.checked,
                                                                    },
                                                                }))}
                                                            />
                                                            Override lock conditions
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            step={0.01}
                                                            value={overrideState.exposureAmount}
                                                            onChange={(event) => setOverrideControls((prev) => ({
                                                                ...prev,
                                                                [row.id]: {
                                                                    ...(prev[row.id] || { enabled: false }),
                                                                    exposureAmount: event.target.value,
                                                                },
                                                            }))}
                                                            disabled={!lockBypassEnabled}
                                                            placeholder="Override exposure amount"
                                                            className="mt-2 w-full rounded-md border border-gray-600 bg-[#081028] px-2 py-1 text-white disabled:opacity-50"
                                                        />
                                                        <p className="mt-1 text-[10px] text-gray-500">
                                                            Use for lock override thresholds (Level 1 / Level 2 policy).
                                                        </p>
                                                        {!lockOverrideAllowed && (
                                                            <p className="mt-1 text-[10px] text-amber-300">
                                                                Category policy currently disables lock overrides.
                                                            </p>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="datetime-local"
                                                        value={actionExpiryAt[row.id] || ''}
                                                        onChange={(event) => setActionExpiryAt((prev) => ({ ...prev, [row.id]: event.target.value }))}
                                                        className="mt-2 w-full rounded-md border border-gray-600 bg-[#081028] px-2 py-1 text-white"
                                                    />
                                                    <p className="mt-1 text-[10px] text-gray-500">Approval expiry (optional, defaults to +1 year)</p>
                                                </td>
                                                <td className="py-3 pr-4 text-gray-300">
                                                    <p>{row.reviewedAt || '-'}</p>
                                                    <p className="text-xs text-gray-500">By: {row.reviewedBy || '-'}</p>
                                                    {row.decisionReason && <p className="text-xs text-gray-400 mt-1">{row.decisionReason}</p>}
                                                    {row.expiresAt && <p className="text-xs text-sky-300 mt-1">Expires: {row.expiresAt}</p>}

                                                    {row.activeIncident && (
                                                        <div className="mt-2 rounded-md border border-red-700 bg-red-900/10 px-3 py-2">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${incidentStatusClassMap[row.activeIncident?.status] || incidentStatusClassMap.open}`}>
                                                                    {row.activeIncident?.statusLabel || 'Open'}
                                                                </span>
                                                                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${incidentSeverityClassMap[row.activeIncident?.severity] || incidentSeverityClassMap.high}`}>
                                                                    {row.activeIncident?.severityLabel || 'High'}
                                                                </span>
                                                            </div>
                                                            <p className="mt-1 text-xs text-red-200 font-semibold">{row.activeIncident?.title || 'Integrity incident active'}</p>
                                                            {row.activeIncident?.description && <p className="mt-1 text-[11px] text-red-100">{row.activeIncident.description}</p>}
                                                            <p className="mt-1 text-[11px] text-red-200/90">
                                                                Detected: {row.activeIncident?.detectedAt || '-'}
                                                                {' '}• Issues: {Number(row.activeIncident?.detectedIssueCount || 0)}
                                                            </p>
                                                            {row.activeIncident?.assignedTo && <p className="mt-1 text-[11px] text-red-200/90">Assignee: {row.activeIncident.assignedTo}</p>}
                                                        </div>
                                                    )}

                                                    {row.auditIntegrity && (
                                                        <div className="mt-2">
                                                            <span
                                                                className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${row.auditIntegrity?.isValid
                                                                    ? 'border-emerald-600 bg-emerald-900/20 text-emerald-300'
                                                                    : 'border-red-600 bg-red-900/20 text-red-300'
                                                                    }`}
                                                            >
                                                                {row.auditIntegrity?.isValid
                                                                    ? `Chain valid (${Number(row.auditIntegrity?.verifiedEvents || 0)} events)`
                                                                    : `Chain issue (${Number(row.auditIntegrity?.issueCount || 0)} issue${Number(row.auditIntegrity?.issueCount || 0) === 1 ? '' : 's'})`}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <CapabilityAuditTimeline
                                                        events={Array.isArray(row.auditTrail) ? row.auditTrail : []}
                                                        totalCount={Number(row.auditEventCount || 0)}
                                                        onOpenFullHistory={() => openHistoryModal(row)}
                                                    />

                                                    {row.canOpenIncident && (
                                                        <div className="mt-3 rounded-md border border-amber-700 bg-amber-900/10 p-3">
                                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-300">Open Integrity Incident</p>
                                                            <input
                                                                type="text"
                                                                value={incidentDrafts[row.id]?.title || ''}
                                                                onChange={(event) => updateIncidentDraft(row.id, 'title', event.target.value)}
                                                                placeholder="Incident title"
                                                                className="mt-2 w-full rounded-md border border-gray-600 bg-[#081028] px-2 py-1 text-white"
                                                            />
                                                            <textarea
                                                                rows={2}
                                                                value={incidentDrafts[row.id]?.description || ''}
                                                                onChange={(event) => updateIncidentDraft(row.id, 'description', event.target.value)}
                                                                placeholder="Describe the integrity issue and expected response"
                                                                className="mt-2 w-full rounded-md border border-gray-600 bg-[#081028] px-2 py-1 text-white"
                                                            />
                                                            <select
                                                                value={incidentDrafts[row.id]?.severity || 'high'}
                                                                onChange={(event) => updateIncidentDraft(row.id, 'severity', event.target.value)}
                                                                className="mt-2 w-full rounded-md border border-gray-600 bg-[#081028] px-2 py-1 text-white"
                                                            >
                                                                {INCIDENT_SEVERITY_OPTIONS.map((option) => (
                                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenIncident(row)}
                                                                className="mt-2 rounded-md bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700"
                                                            >
                                                                Open Incident
                                                            </button>
                                                        </div>
                                                    )}

                                                    {row.activeIncident && (
                                                        <div className="mt-3 rounded-md border border-gray-700 bg-[#081028] p-3">
                                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-300">Incident Response</p>
                                                            <textarea
                                                                rows={2}
                                                                value={incidentResolutionNotes[row.id] || ''}
                                                                onChange={(event) => setIncidentResolutionNotes((prev) => ({ ...prev, [row.id]: event.target.value }))}
                                                                placeholder="Resolution note (required to resolve or dismiss)"
                                                                className="mt-2 w-full rounded-md border border-gray-600 bg-[#03091E] px-2 py-1 text-white"
                                                            />
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAssignIncident(row)}
                                                                    className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                                                                >
                                                                    Assign To Me
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleResolveIncident(row, 'resolved')}
                                                                    className="rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                                                                >
                                                                    Resolve Incident
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleResolveIncident(row, 'dismissed')}
                                                                    className="rounded-md bg-gray-600 px-3 py-1 text-xs font-semibold text-white hover:bg-gray-700"
                                                                >
                                                                    Dismiss Incident
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCapabilityAction(row.id, 'approve')}
                                                            disabled={Boolean(row.isActionLocked) && !lockBypassEnabled}
                                                            className="rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCapabilityAction(row.id, 'reject')}
                                                            disabled={Boolean(row.isActionLocked) && !lockBypassEnabled}
                                                            className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (!window.confirm('Revoke this COD capability? This action records an immutable audit event.')) {
                                                                    return;
                                                                }

                                                                handleCapabilityAction(row.id, 'revoke');
                                                            }}
                                                            disabled={Boolean(row.isActionLocked) && !lockBypassEnabled}
                                                            className="rounded-md bg-orange-600 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            Revoke
                                                        </button>
                                                    </div>
                                                    {row.isActionLocked && (
                                                        <p className="mt-2 text-[11px] text-red-300">
                                                            Actions locked until incident resolution{lockBypassEnabled ? ' (override mode enabled)' : ''}.
                                                        </p>
                                                    )}
                                                </td>
                                            </tr>
                                            );
                                        })}
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

                        {historyModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                                <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg border border-gray-700 bg-[#0A1330] shadow-2xl">
                                    <div className="flex items-start justify-between border-b border-gray-700 px-6 py-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-white">COD Capability Audit History</h3>
                                                <span
                                                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${historyIntegrity?.isValid
                                                        ? 'border-emerald-600 bg-emerald-900/20 text-emerald-300'
                                                        : 'border-red-600 bg-red-900/20 text-red-300'
                                                        }`}
                                                >
                                                    {historyIntegrity?.isValid ? 'Integrity: Valid' : 'Integrity: Issue'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                {(historyCapability?.vendorName || 'Unknown vendor')}
                                                {historyCapability?.vendorEmail ? ` • ${historyCapability.vendorEmail}` : ''}
                                                {historyCapability?.categoryLabel ? ` • ${historyCapability.categoryLabel}` : ''}
                                                {historyCapability?.statusLabel ? ` • ${historyCapability.statusLabel}` : ''}
                                            </p>
                                            <p className="mt-1 text-[11px] text-gray-500">
                                                Verified events: {Number(historyIntegrity?.verifiedEvents || 0)}
                                                {' '}• Issues: {Number(historyIntegrity?.issueCount || 0)}
                                            </p>
                                            {historyActiveIncident && (
                                                <p className="mt-1 text-[11px] text-red-300">
                                                    Active incident: {historyActiveIncident.title || 'Integrity incident'}
                                                    {' '}({historyActiveIncident.statusLabel || 'Open'})
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={closeHistoryModal}
                                            className="rounded-md border border-gray-600 px-3 py-1 text-sm text-white"
                                        >
                                            Close
                                        </button>
                                    </div>

                                    <div className="border-b border-gray-700 px-6 py-4">
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
                                            <select
                                                value={historyEventTypeFilter}
                                                onChange={(event) => setHistoryEventTypeFilter(event.target.value)}
                                                className="rounded-md border border-gray-600 bg-[#081028] px-3 py-2 text-sm text-white"
                                            >
                                                {HISTORY_EVENT_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>

                                            <input
                                                type="text"
                                                value={historyActorFilter}
                                                onChange={(event) => setHistoryActorFilter(event.target.value)}
                                                placeholder="Actor name"
                                                className="rounded-md border border-gray-600 bg-[#081028] px-3 py-2 text-sm text-white"
                                            />

                                            <input
                                                type="date"
                                                value={historyFromFilter}
                                                onChange={(event) => setHistoryFromFilter(event.target.value)}
                                                className="rounded-md border border-gray-600 bg-[#081028] px-3 py-2 text-sm text-white"
                                            />

                                            <input
                                                type="date"
                                                value={historyToFilter}
                                                onChange={(event) => setHistoryToFilter(event.target.value)}
                                                className="rounded-md border border-gray-600 bg-[#081028] px-3 py-2 text-sm text-white"
                                            />

                                            <button
                                                type="button"
                                                onClick={applyHistoryFilters}
                                                disabled={historyLoading}
                                                className="rounded-md bg-[#0955AC] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                            >
                                                Apply Filters
                                            </button>
                                        </div>
                                    </div>

                                    <div className="max-h-[58vh] overflow-y-auto px-6 py-4">
                                        {historyLoading && (
                                            <div className="rounded-md border border-gray-700 bg-[#081028] px-4 py-5 text-sm text-gray-300">
                                                Loading capability audit history...
                                            </div>
                                        )}

                                        {!historyLoading && historyError !== '' && (
                                            <div className="rounded-md border border-red-700 bg-red-900/20 px-4 py-5 text-sm text-red-300">
                                                {historyError}
                                            </div>
                                        )}

                                        {!historyLoading && historyError === '' && historyEvents.length === 0 && (
                                            <div className="rounded-md border border-gray-700 bg-[#081028] px-4 py-5 text-sm text-gray-400">
                                                No events found for the selected filters.
                                            </div>
                                        )}

                                        {!historyLoading && historyError === '' && historyEvents.length > 0 && (
                                            <div className="relative space-y-4 pl-5">
                                                <div className="absolute bottom-1 left-[9px] top-1 w-px bg-gray-700" />

                                                {historyEvents.map((event) => {
                                                    const accentClass = auditEventAccentMap[event.eventType] || 'bg-[#AEB9E1]';

                                                    return (
                                                        <div key={event.id} className="relative rounded-md border border-gray-700 bg-[#081028] px-4 py-3">
                                                            <span className={`absolute -left-[22px] top-4 h-3.5 w-3.5 rounded-full border-2 border-[#081028] ${accentClass}`} />
                                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                                <p className="text-sm font-semibold text-white">{event.eventLabel || 'Capability event'}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <span
                                                                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${event.integrityStatus === 'issue'
                                                                            ? 'border-red-600 bg-red-900/20 text-red-300'
                                                                            : 'border-emerald-600 bg-emerald-900/20 text-emerald-300'
                                                                            }`}
                                                                    >
                                                                        {event.integrityStatus === 'issue' ? 'Issue' : 'Valid'}
                                                                    </span>
                                                                    <p className="text-xs text-gray-500">{event.createdAt || '-'}</p>
                                                                </div>
                                                            </div>
                                                            <p className="mt-1 text-xs text-gray-400">Actor: {event.actorName || 'System'}</p>
                                                            {event.transitionLabel && <p className="mt-1 text-xs text-gray-300">Transition: {event.transitionLabel}</p>}
                                                            {event.note && <p className="mt-1 text-xs italic text-gray-400">&quot;{event.note}&quot;</p>}
                                                            {event.source && <p className="mt-1 text-xs text-gray-500">Source: {event.source}</p>}
                                                            {event.expiresAt && <p className="mt-1 text-xs text-sky-300">Expiry: {event.expiresAt}</p>}
                                                            {event.integrityReason && (
                                                                <p className="mt-1 text-xs text-red-300">
                                                                    Integrity reason: {String(event.integrityReason).replaceAll('_', ' ')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-gray-700 px-6 py-3 text-xs text-gray-400">
                                        <p>
                                            Page {historyPagination?.currentPage || 1} of {historyPagination?.lastPage || 1}
                                            {' '}({historyPagination?.total || 0} total events)
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                disabled={historyLoading || (historyPagination?.currentPage || 1) <= 1}
                                                onClick={() => changeHistoryPage((historyPagination?.currentPage || 1) - 1)}
                                                className="rounded-md border border-gray-600 px-3 py-1 text-white disabled:opacity-40"
                                            >
                                                Prev
                                            </button>
                                            <button
                                                type="button"
                                                disabled={historyLoading || (historyPagination?.currentPage || 1) >= (historyPagination?.lastPage || 1)}
                                                onClick={() => changeHistoryPage((historyPagination?.currentPage || 1) + 1)}
                                                className="rounded-md border border-gray-600 px-3 py-1 text-white disabled:opacity-40"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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

const CapabilityAuditTimeline = ({ events, totalCount, onOpenFullHistory }) => {
    const timelineEvents = Array.isArray(events) ? events : [];

    if (timelineEvents.length === 0) {
        return (
            <div className="mt-3 rounded-md border border-gray-700 bg-[#081028] px-3 py-2 text-[11px] text-gray-500">
                No audit events yet.
            </div>
        );
    }

    return (
        <div className="mt-3 rounded-md border border-gray-700 bg-[#081028] p-3">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">Audit Timeline</p>

            <div className="relative mt-2 space-y-3 pl-4">
                <div className="absolute bottom-1 left-[7px] top-1 w-px bg-gray-700" />

                {timelineEvents.map((event) => {
                    const accentClass = auditEventAccentMap[event.eventType] || 'bg-[#AEB9E1]';

                    return (
                        <div key={event.id} className="relative">
                            <span className={`absolute -left-[14px] top-1 h-3 w-3 rounded-full border-2 border-[#081028] ${accentClass}`} />
                            <p className="text-xs font-semibold text-white">{event.eventLabel || 'Capability event'}</p>
                            <p className="text-[11px] text-gray-500">{event.createdAt || '-'} • {event.actorName || 'System'}</p>
                            {event.transitionLabel && <p className="mt-1 text-[11px] text-gray-300">{event.transitionLabel}</p>}
                            {event.note && <p className="mt-1 text-[11px] italic text-gray-400">&quot;{event.note}&quot;</p>}
                            {event.expiresAt && <p className="mt-1 text-[11px] text-sky-300">Expires: {event.expiresAt}</p>}
                        </div>
                    );
                })}
            </div>

            {Number(totalCount || 0) > timelineEvents.length && (
                <p className="mt-2 text-[11px] text-gray-500">
                    Showing latest {timelineEvents.length} of {Number(totalCount || 0)} events.
                </p>
            )}

            {typeof onOpenFullHistory === 'function' && Number(totalCount || 0) > 0 && (
                <button
                    type="button"
                    onClick={onOpenFullHistory}
                    className="mt-2 rounded-md border border-gray-600 px-2 py-1 text-[11px] font-semibold text-sky-300 hover:bg-sky-900/20"
                >
                    View full history
                </button>
            )}
        </div>
    );
};

export default CourierCodSettings;
