import React, { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { BellRing, Clock3, KeyRound, MapPinned, ShieldCheck, Users } from "lucide-react";
import CourierFeedbackModal from "./common/CourierFeedbackModal";
import useCourierActionModal from "./common/useCourierActionModal";

const DEFAULT_SETTINGS = {
    business: {
        companyName: "Sonnac Lanka Enterprises",
        supportEmail: "ops@sonnac.lk",
        hotline: "+94 11 123 4567",
        primaryHub: "Colombo Hub",
        serviceZones: "Colombo, Gampaha, Kalutara, Kandy",
    },
    operations: {
        autoAcceptBookings: false,
        workStart: "08:00",
        workEnd: "20:00",
        sameDayCutoff: "14:00",
        maxDailyBookings: 350,
    },
    sla: {
        expressHours: 8,
        economyHours: 24,
        breachAlertMinutes: 90,
        autoEscalateExceptions: true,
    },
    tracking: {
        noScan6h: true,
        noScan12h: true,
        noScan24h: false,
        requirePodPhoto: true,
        requirePodSignature: false,
        allowManualScanCorrection: true,
    },
    notifications: {
        notifyClientPickup: true,
        notifyClientOutForDelivery: true,
        notifyClientDelivered: true,
        notifyInternalException: true,
        notifyInternalSlaRisk: true,
    },
    integrations: {
        webhookUrl: "",
        apiKeyAlias: "CourierProdKey",
        retryWindowMinutes: 15,
        rotateKeysEveryDays: 90,
    },
    team: {
        dispatcherCanCancel: false,
        opsLeadCanReassign: true,
        financeCanViewRates: true,
        enforce2FA: true,
        teamAccessControl: {
            applyRoleDefaultsOnCreate: true,
            defaultDirectPermissions: [],
        },
    },
};

const TAB_CONFIG = [
    { key: "business", label: "Business", icon: MapPinned },
    { key: "operations", label: "Operations", icon: Clock3 },
    { key: "sla", label: "SLA", icon: ShieldCheck },
    { key: "tracking", label: "Tracking", icon: MapPinned },
    { key: "notifications", label: "Notifications", icon: BellRing },
    { key: "integrations", label: "Integrations", icon: KeyRound },
    { key: "team", label: "Team Access", icon: Users },
];

const SectionCard = ({ title, description, children }) => (
    <div className="bg-white rounded-[10px] p-5 md:p-6" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
        <div className="mb-4">
            <h2 className="text-[18px] font-[700] text-[#111827]">{title}</h2>
            {description && <p className="text-[12px] text-[#6B7280] mt-1">{description}</p>}
        </div>
        {children}
    </div>
);

const Field = ({ label, children, help }) => (
    <label className="block">
        <span className="text-[13px] font-[700] text-[#374151]">{label}</span>
        <div className="mt-1">{children}</div>
        {help && <p className="text-[11px] text-[#6B7280] mt-1">{help}</p>}
    </label>
);

const Toggle = ({ label, checked, onChange, description }) => (
    <div className="flex items-start justify-between gap-3 border border-[#E5E7EB] rounded-[8px] px-3 py-3">
        <div>
            <p className="text-[13px] font-[700] text-[#111827]">{label}</p>
            {description && <p className="text-[11px] text-[#6B7280] mt-0.5">{description}</p>}
        </div>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-[#0955AC]" : "bg-[#D1D5DB]"}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
        </button>
    </div>
);

const Settings = () => {
    const props = usePage().props;
    const flash = props.flash || {};
    const incoming = props.courierSettings || {};
    const teamPermissionOptions = Array.isArray(props.teamPermissionOptions) ? props.teamPermissionOptions : [];
    const teamCapabilities = props.teamCapabilities || {};
    const canAssignPermissions = Boolean(teamCapabilities.assignPermissions);

    const [activeTab, setActiveTab] = useState("business");
    const [settings, setSettings] = useState(() => {
        const incomingTeam = incoming.team && typeof incoming.team === "object" ? incoming.team : {};
        const incomingTeamAccessControl = incomingTeam.teamAccessControl && typeof incomingTeam.teamAccessControl === "object"
            ? incomingTeam.teamAccessControl
            : {};

        return {
            ...DEFAULT_SETTINGS,
            ...incoming,
            team: {
                ...DEFAULT_SETTINGS.team,
                ...incomingTeam,
                teamAccessControl: {
                    ...DEFAULT_SETTINGS.team.teamAccessControl,
                    ...incomingTeamAccessControl,
                    defaultDirectPermissions: Array.isArray(incomingTeamAccessControl.defaultDirectPermissions)
                        ? incomingTeamAccessControl.defaultDirectPermissions
                        : [],
                },
            },
        };
    });
    const [teamDefaultPermissionSearch, setTeamDefaultPermissionSearch] = useState("");

    const {
        feedback,
        closeFeedback,
        setFeedback,
        confirmState,
        openConfirm,
        closeConfirm,
        runConfirm,
    } = useCourierActionModal(flash, 2800);

    const updateValue = (section, key, value) => {
        setSettings((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value,
            },
        }));
    };

    const updateTeamAccessControlValue = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            team: {
                ...prev.team,
                teamAccessControl: {
                    ...prev.team.teamAccessControl,
                    [key]: value,
                },
            },
        }));
    };

    const toggleInArray = (list, value) => {
        if (list.includes(value)) {
            return list.filter((item) => item !== value);
        }

        return [...list, value];
    };

    const groupedTeamPermissions = useMemo(() => {
        return teamPermissionOptions.reduce((acc, perm) => {
            const group = String(perm || "").split(".")[1] || "other";

            if (!acc[group]) {
                acc[group] = [];
            }

            acc[group].push(perm);
            return acc;
        }, {});
    }, [teamPermissionOptions]);

    const saveSection = (sectionKey) => {
        router.post(
            route("courierService.settings.update"),
            {
                action: "save_section",
                section: sectionKey,
                settings: {
                    [sectionKey]: settings[sectionKey],
                },
            },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    setFeedback({
                        type: "error",
                        message: "Failed to save section settings. Please review input and try again.",
                    });
                },
            },
        );
    };

    const saveAll = () => {
        openConfirm({
            title: "Confirm Save All Settings",
            message: "Apply all courier operational setting changes now?",
            onConfirm: () => {
                router.post(
                    route("courierService.settings.update"),
                    {
                        action: "save_all",
                        settings,
                    },
                    {
                        preserveScroll: true,
                        preserveState: true,
                        onError: () => {
                            setFeedback({ type: "error", message: "Failed to save all settings." });
                        },
                    },
                );
            },
        });
    };

    const resetAll = () => {
        openConfirm({
            title: "Reset Settings",
            message: "Reset all courier settings to defaults? This cannot be undone.",
            onConfirm: () => {
                setSettings(DEFAULT_SETTINGS);
                router.post(
                    route("courierService.settings.update"),
                    {
                        action: "reset_defaults",
                    },
                    {
                        preserveScroll: true,
                        preserveState: true,
                        onError: () => {
                            setFeedback({ type: "error", message: "Failed to reset settings." });
                        },
                    },
                );
            },
        });
    };

    const saveButtonLabel = TAB_CONFIG.find((tab) => tab.key === activeTab)?.label;

    if (!settings || typeof settings !== "object") {
        return (
            <div className="w-full h-auto lg:pl-4 lg:pr-5 pt-6 pb-12">
                <div className="bg-white rounded-[10px] p-6" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
                    <p className="text-[14px] text-[#6B7280]">Unable to load settings data.</p>
                </div>
            </div>
        );
    }

    const tabContent = useMemo(() => {
        if (activeTab === "business") {
            return (
                <SectionCard title="Business Profile" description="Main identity and service coverage used across booking and tracking experiences.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Company Name">
                            <input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={settings.business.companyName} onChange={(e) => updateValue("business", "companyName", e.target.value)} />
                        </Field>
                        <Field label="Support Email">
                            <input type="email" className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={settings.business.supportEmail} onChange={(e) => updateValue("business", "supportEmail", e.target.value)} />
                        </Field>
                        <Field label="Hotline">
                            <input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={settings.business.hotline} onChange={(e) => updateValue("business", "hotline", e.target.value)} />
                        </Field>
                        <Field label="Primary Hub">
                            <input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={settings.business.primaryHub} onChange={(e) => updateValue("business", "primaryHub", e.target.value)} />
                        </Field>
                        <div className="md:col-span-2">
                            <Field label="Service Zones" help="Comma-separated zone list for booking/assignment filtering.">
                                <textarea rows={3} className="w-full rounded-[8px] border border-[#D1D5DB]" value={settings.business.serviceZones} onChange={(e) => updateValue("business", "serviceZones", e.target.value)} />
                            </Field>
                        </div>
                    </div>
                </SectionCard>
            );
        }

        if (activeTab === "operations") {
            return (
                <SectionCard title="Operations" description="Daily operations guardrails for booking intake and dispatch capacity.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Toggle label="Auto-Accept Bookings" checked={settings.operations.autoAcceptBookings} onChange={(next) => updateValue("operations", "autoAcceptBookings", next)} description="If disabled, all bookings require manual review." />
                        <Field label="Max Daily Bookings">
                            <input type="number" min={1} className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={settings.operations.maxDailyBookings} onChange={(e) => updateValue("operations", "maxDailyBookings", Number(e.target.value || 0))} />
                        </Field>
                        <Field label="Workday Start">
                            <input type="time" className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={settings.operations.workStart} onChange={(e) => updateValue("operations", "workStart", e.target.value)} />
                        </Field>
                        <Field label="Workday End">
                            <input type="time" className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={settings.operations.workEnd} onChange={(e) => updateValue("operations", "workEnd", e.target.value)} />
                        </Field>
                        <Field label="Same Day Cutoff">
                            <input type="time" className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={settings.operations.sameDayCutoff} onChange={(e) => updateValue("operations", "sameDayCutoff", e.target.value)} />
                        </Field>
                    </div>
                </SectionCard>
            );
        }

        if (activeTab === "sla") {
            return (
                <SectionCard title="SLA Policies" description="Configure expected commitments and breach alerts by service tier.">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field label="Express SLA (hours)">
                            <input type="number" min={1} className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={settings.sla.expressHours} onChange={(e) => updateValue("sla", "expressHours", Number(e.target.value || 0))} />
                        </Field>
                        <Field label="Economy SLA (hours)">
                            <input type="number" min={1} className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={settings.sla.economyHours} onChange={(e) => updateValue("sla", "economyHours", Number(e.target.value || 0))} />
                        </Field>
                        <Field label="Breach Alert Lead (minutes)">
                            <input type="number" min={5} className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={settings.sla.breachAlertMinutes} onChange={(e) => updateValue("sla", "breachAlertMinutes", Number(e.target.value || 0))} />
                        </Field>
                        <div className="md:col-span-3">
                            <Toggle label="Auto Escalate Exceptions" checked={settings.sla.autoEscalateExceptions} onChange={(next) => updateValue("sla", "autoEscalateExceptions", next)} description="Automatically flag repeated exceptions to Ops lead queue." />
                        </div>
                    </div>
                </SectionCard>
            );
        }

        if (activeTab === "tracking") {
            return (
                <SectionCard title="Tracking and POD Rules" description="Define scan monitoring and proof-of-delivery requirements.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Toggle label="No Scan Alert > 6h" checked={settings.tracking.noScan6h} onChange={(next) => updateValue("tracking", "noScan6h", next)} />
                        <Toggle label="No Scan Alert > 12h" checked={settings.tracking.noScan12h} onChange={(next) => updateValue("tracking", "noScan12h", next)} />
                        <Toggle label="No Scan Alert > 24h" checked={settings.tracking.noScan24h} onChange={(next) => updateValue("tracking", "noScan24h", next)} />
                        <Toggle label="Require POD Photo" checked={settings.tracking.requirePodPhoto} onChange={(next) => updateValue("tracking", "requirePodPhoto", next)} />
                        <Toggle label="Require POD Signature" checked={settings.tracking.requirePodSignature} onChange={(next) => updateValue("tracking", "requirePodSignature", next)} />
                        <Toggle label="Allow Manual Scan Correction" checked={settings.tracking.allowManualScanCorrection} onChange={(next) => updateValue("tracking", "allowManualScanCorrection", next)} />
                    </div>
                </SectionCard>
            );
        }

        if (activeTab === "notifications") {
            return (
                <SectionCard title="Notification Preferences" description="Choose what gets sent to clients and internal operations teams.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Toggle label="Client: Pickup Update" checked={settings.notifications.notifyClientPickup} onChange={(next) => updateValue("notifications", "notifyClientPickup", next)} />
                        <Toggle label="Client: Out For Delivery" checked={settings.notifications.notifyClientOutForDelivery} onChange={(next) => updateValue("notifications", "notifyClientOutForDelivery", next)} />
                        <Toggle label="Client: Delivered" checked={settings.notifications.notifyClientDelivered} onChange={(next) => updateValue("notifications", "notifyClientDelivered", next)} />
                        <Toggle label="Internal: Exception Alerts" checked={settings.notifications.notifyInternalException} onChange={(next) => updateValue("notifications", "notifyInternalException", next)} />
                        <Toggle label="Internal: SLA Risk Alerts" checked={settings.notifications.notifyInternalSlaRisk} onChange={(next) => updateValue("notifications", "notifyInternalSlaRisk", next)} />
                    </div>
                </SectionCard>
            );
        }

        if (activeTab === "integrations") {
            return (
                <SectionCard title="Integrations" description="Webhook and API configuration for operational integrations.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Field label="Webhook URL" help="Leave empty if you do not use external webhook consumers.">
                                <input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={settings.integrations.webhookUrl} onChange={(e) => updateValue("integrations", "webhookUrl", e.target.value)} placeholder="https://example.com/webhooks/courier" />
                            </Field>
                        </div>
                        <Field label="API Key Alias">
                            <input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={settings.integrations.apiKeyAlias} onChange={(e) => updateValue("integrations", "apiKeyAlias", e.target.value)} />
                        </Field>
                        <Field label="Retry Window (minutes)">
                            <input type="number" min={1} className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={settings.integrations.retryWindowMinutes} onChange={(e) => updateValue("integrations", "retryWindowMinutes", Number(e.target.value || 0))} />
                        </Field>
                        <Field label="Rotate Keys Every (days)">
                            <input type="number" min={30} className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={settings.integrations.rotateKeysEveryDays} onChange={(e) => updateValue("integrations", "rotateKeysEveryDays", Number(e.target.value || 0))} />
                        </Field>
                    </div>
                </SectionCard>
            );
        }

        return (
            <SectionCard title="Team Access Control" description="Set role powers for key operational decisions.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <Toggle label="Dispatcher Can Cancel Shipments" checked={settings.team.dispatcherCanCancel} onChange={(next) => updateValue("team", "dispatcherCanCancel", next)} />
                    <Toggle label="Ops Lead Can Reassign" checked={settings.team.opsLeadCanReassign} onChange={(next) => updateValue("team", "opsLeadCanReassign", next)} />
                    <Toggle label="Finance Can View Rate Cards" checked={settings.team.financeCanViewRates} onChange={(next) => updateValue("team", "financeCanViewRates", next)} />
                    <Toggle label="Enforce 2FA For All Staff" checked={settings.team.enforce2FA} onChange={(next) => updateValue("team", "enforce2FA", next)} />
                </div>

                <div className="border border-[#E5E7EB] rounded-[10px] p-4 bg-[#FAFBFD]">
                    <p className="text-[15px] font-[700] text-[#111827]">Team User Creation Defaults</p>
                    <p className="text-[12px] text-[#6B7280] mt-1">Configure permissions auto-applied when creating courier team users.</p>

                    <label className="inline-flex items-center gap-2 text-[13px] font-[600] mt-3">
                        <input
                            type="checkbox"
                            disabled={!canAssignPermissions}
                            checked={Boolean(settings.team.teamAccessControl.applyRoleDefaultsOnCreate)}
                            onChange={(e) => updateTeamAccessControlValue("applyRoleDefaultsOnCreate", e.target.checked)}
                        />
                        Auto-apply selected role default permissions for new users
                    </label>

                    <p className="text-[12px] font-[700] text-[#374151] mt-4 mb-2">Always Add These Default Direct Permissions</p>
                    <input
                        className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-3 mb-2 text-[13px]"
                        placeholder="Search default permissions"
                        disabled={!canAssignPermissions}
                        value={teamDefaultPermissionSearch}
                        onChange={(e) => setTeamDefaultPermissionSearch(e.target.value)}
                    />

                    <div className="max-h-[220px] overflow-y-auto border border-[#E5E7EB] rounded-[8px] p-2 bg-white">
                        {Object.keys(groupedTeamPermissions).length === 0 && (
                            <p className="text-[12px] text-[#6B7280] px-1 py-2">No courier permissions found.</p>
                        )}

                        {Object.keys(groupedTeamPermissions).map((group) => (
                            <div key={group} className="mb-2">
                                <p className="text-[11px] font-[700] uppercase text-[#6B7280] mb-1">{group.replaceAll("_", " ")}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {groupedTeamPermissions[group]
                                        .filter((perm) => perm.toLowerCase().includes(teamDefaultPermissionSearch.toLowerCase()))
                                        .map((perm) => (
                                            <label key={perm} className="inline-flex items-center gap-2 text-[12px]">
                                                <input
                                                    type="checkbox"
                                                    disabled={!canAssignPermissions}
                                                    checked={settings.team.teamAccessControl.defaultDirectPermissions.includes(perm)}
                                                    onChange={() => updateTeamAccessControlValue(
                                                        "defaultDirectPermissions",
                                                        toggleInArray(settings.team.teamAccessControl.defaultDirectPermissions, perm),
                                                    )}
                                                />
                                                {perm}
                                            </label>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionCard>
        );
    }, [
        activeTab,
        canAssignPermissions,
        groupedTeamPermissions,
        settings,
        teamDefaultPermissionSearch,
    ]);

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

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
                <div>
                    <h1 className="figtree text-[34px] font-[700]">Courier Settings</h1>
                    <p className="text-[14px] text-[#6B7280] mt-1">
                        Configure courier operations, SLA policies, tracking rules, notifications, and access controls.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button type="button" onClick={resetAll} className="h-[38px] px-4 rounded-[8px] border border-[#D1D5DB] text-[13px] font-[700]">
                        Reset Defaults
                    </button>
                    <button type="button" onClick={saveAll} className="h-[38px] px-4 rounded-[8px] bg-[#0955AC] text-white text-[13px] font-[700]">
                        Save All
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5">
                <div className="bg-white rounded-[10px] p-4 h-fit" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
                    <p className="text-[12px] text-[#6B7280] font-[700] uppercase tracking-wide mb-3">Settings Modules</p>
                    <div className="space-y-2">
                        {TAB_CONFIG.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-left text-[13px] font-[700] transition-colors ${
                                        activeTab === tab.key
                                            ? "bg-[#0955AC] text-white"
                                            : "bg-[#F3F4F6] text-[#374151]"
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-4">
                    {tabContent}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => saveSection(activeTab)}
                            className="h-[38px] px-5 rounded-[8px] bg-[#111827] text-white text-[13px] font-[700]"
                        >
                            Save {saveButtonLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
