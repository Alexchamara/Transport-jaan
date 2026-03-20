import React, { useEffect, useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { BellRing, ChevronDown, Clock3, KeyRound, MapPinned, ShieldCheck, Users } from "lucide-react";
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
        approvalControl: {
            enabled: true,
            makerChecker: true,
            approvalTtlMinutes: 240,
            sensitiveActions: {
                high_value_cancellation: {
                    enabled: true,
                    minAmount: 50000,
                    requiredApprovals: 1,
                },
                refund: {
                    enabled: true,
                    level1MinAmount: 25000,
                    level2MinAmount: 100000,
                    requiredApprovalsLevel1: 1,
                    requiredApprovalsLevel2: 2,
                },
                ownership_transfer: {
                    enabled: true,
                    requiredApprovals: 2,
                },
                client_list_export: {
                    enabled: true,
                    minRows: 100,
                    requiredApprovals: 1,
                },
            },
        },
        teamAccessControl: {
            defaultDirectPermissionsByRole: {},
            defaultDataScopeByRole: {},
            onboardingBundles: [],
        },
        permissionModel: {
            enabled: true,
            rolePolicies: {},
            fieldVisibility: {
                rate_cards: { visibleToRoles: [] },
                margin: { visibleToRoles: [] },
                customer_phone: { visibleToRoles: [] },
                payment_refs: { visibleToRoles: [] },
            },
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

const TEAM_ACCESS_TOPIC_CONFIG = [
    { key: "policy-controls", label: "Team Policy Controls" },
    { key: "user-defaults", label: "Team User Creation Defaults" },
    { key: "role-studio", label: "Role Studio" },
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

const titleCase = (value) => String(value || "").replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
const humanizeFieldKey = (value) => titleCase(String(value || "").replaceAll("_", " "));
const DEFAULT_ROLE_SCOPE_CONSTRAINTS = {
    regionZones: [],
    hubBranches: [],
    allowedCustomerIds: [],
    keyAccountsOnly: false,
    enforceShiftWindow: false,
    shiftStart: "00:00",
    shiftEnd: "23:59",
    allowedEnvironments: ["production", "sandbox"],
    blockedActionsByEnvironment: {
        production: [],
        sandbox: [],
    },
    policyRules: [],
};

const Settings = () => {
    const props = usePage().props;
    const flash = props.flash || {};
    const incoming = props.courierSettings || {};
    const teamPermissionOptions = Array.isArray(props.teamPermissionOptions) ? props.teamPermissionOptions : [];
    const teamRoleOptions = Array.isArray(props.teamRoleOptions) ? props.teamRoleOptions : [];
    const teamRoleCatalog = Array.isArray(props.teamRoleCatalog) ? props.teamRoleCatalog : [];
    const teamRoleTemplates = props.teamRoleTemplates && typeof props.teamRoleTemplates === "object" ? props.teamRoleTemplates : {};
    const teamAccessAudit = Array.isArray(props.teamAccessAudit) ? props.teamAccessAudit : [];
    const teamSensitiveApprovals = Array.isArray(props.teamSensitiveApprovals) ? props.teamSensitiveApprovals : [];
    const permissionModelMeta = props.permissionModelMeta && typeof props.permissionModelMeta === "object" ? props.permissionModelMeta : {};
    const permissionResources = Array.isArray(permissionModelMeta.resources) ? permissionModelMeta.resources : ["shipments", "bookings", "clients", "reports", "pricing", "payouts"];
    const permissionActions = Array.isArray(permissionModelMeta.actions) ? permissionModelMeta.actions : ["view", "create", "update", "cancel", "reassign", "export", "approve", "refund"];
    const permissionScopes = Array.isArray(permissionModelMeta.scopes) ? permissionModelMeta.scopes : ["own_records", "assigned_region", "assigned_hub", "all_workspace"];
    const sensitiveFieldKeys = Array.isArray(permissionModelMeta.sensitiveFields) ? permissionModelMeta.sensitiveFields : ["rate_cards", "margin", "customer_phone", "payment_refs"];
    const permissionEnvironments = Array.isArray(permissionModelMeta.environments) ? permissionModelMeta.environments : ["production", "sandbox"];
    const permissionRuleEffects = Array.isArray(permissionModelMeta.ruleEffects) ? permissionModelMeta.ruleEffects : ["allow", "deny"];
    const permissionRuleConditionOptions = permissionModelMeta.ruleConditionOptions && typeof permissionModelMeta.ruleConditionOptions === "object"
        ? permissionModelMeta.ruleConditionOptions
        : {};
    const permissionRuleShipmentStages = Array.isArray(permissionRuleConditionOptions.shipmentStages)
        ? permissionRuleConditionOptions.shipmentStages
        : ["new_assignments", "ready_for_pickup", "picked_up", "in_transit", "out_for_delivery", "exception", "delivered", "cancelled"];
    const permissionRuleClientTiers = Array.isArray(permissionRuleConditionOptions.clientTiers)
        ? permissionRuleConditionOptions.clientTiers
        : ["enterprise", "sme", "individual"];
    const permissionRuleSlaClasses = Array.isArray(permissionRuleConditionOptions.slaClasses)
        ? permissionRuleConditionOptions.slaClasses
        : ["on_track", "at_risk", "on_time", "delayed", "early", "unknown"];
    const teamScopeControlOptions = props.teamScopeControlOptions && typeof props.teamScopeControlOptions === "object" ? props.teamScopeControlOptions : {};
    const scopeZoneOptions = Array.isArray(teamScopeControlOptions.availableZones) ? teamScopeControlOptions.availableZones : [];
    const scopeHubOptions = Array.isArray(teamScopeControlOptions.availableHubs) ? teamScopeControlOptions.availableHubs : [];
    const scopeCustomerOptions = Array.isArray(teamScopeControlOptions.customerAccounts) ? teamScopeControlOptions.customerAccounts : [];
    const initialSettingsModule = String(props.initialSettingsModule || "business");
    const initialTeamAccessTopic = String(props.initialTeamAccessTopic || "policy-controls");
    const teamCapabilities = props.teamCapabilities || {};
    const canAssignPermissions = Boolean(teamCapabilities.assignPermissions);
    const canAssignRole = Boolean(teamCapabilities.assignRole);

    const [activeTab] = useState(
        TAB_CONFIG.some((tab) => tab.key === initialSettingsModule) ? initialSettingsModule : "business",
    );
    const [activeTeamAccessTopic, setActiveTeamAccessTopic] = useState(
        TEAM_ACCESS_TOPIC_CONFIG.some((topic) => topic.key === initialTeamAccessTopic)
            ? initialTeamAccessTopic
            : "policy-controls",
    );
    const [settings, setSettings] = useState(() => {
        const incomingTeam = incoming.team && typeof incoming.team === "object" ? incoming.team : {};
        const incomingTeamAccessControl = incomingTeam.teamAccessControl && typeof incomingTeam.teamAccessControl === "object"
            ? incomingTeam.teamAccessControl
            : {};
        const incomingPermissionModel = incomingTeam.permissionModel && typeof incomingTeam.permissionModel === "object"
            ? incomingTeam.permissionModel
            : {};
        const incomingFieldVisibility = incomingPermissionModel.fieldVisibility && typeof incomingPermissionModel.fieldVisibility === "object"
            ? incomingPermissionModel.fieldVisibility
            : {};

        return {
            ...DEFAULT_SETTINGS,
            ...incoming,
            team: {
                ...DEFAULT_SETTINGS.team,
                ...incomingTeam,
                approvalControl: {
                    ...DEFAULT_SETTINGS.team.approvalControl,
                    ...(incomingTeam.approvalControl && typeof incomingTeam.approvalControl === "object" ? incomingTeam.approvalControl : {}),
                    sensitiveActions: {
                        ...DEFAULT_SETTINGS.team.approvalControl.sensitiveActions,
                        ...(incomingTeam.approvalControl?.sensitiveActions && typeof incomingTeam.approvalControl.sensitiveActions === "object"
                            ? incomingTeam.approvalControl.sensitiveActions
                            : {}),
                    },
                },
                teamAccessControl: {
                    ...DEFAULT_SETTINGS.team.teamAccessControl,
                    ...incomingTeamAccessControl,
                    defaultDirectPermissionsByRole: incomingTeamAccessControl.defaultDirectPermissionsByRole
                    && typeof incomingTeamAccessControl.defaultDirectPermissionsByRole === "object"
                        ? incomingTeamAccessControl.defaultDirectPermissionsByRole
                        : {},
                    defaultDataScopeByRole: incomingTeamAccessControl.defaultDataScopeByRole
                    && typeof incomingTeamAccessControl.defaultDataScopeByRole === "object"
                        ? incomingTeamAccessControl.defaultDataScopeByRole
                        : {},
                    onboardingBundles: Array.isArray(incomingTeamAccessControl.onboardingBundles)
                        ? incomingTeamAccessControl.onboardingBundles
                        : [],
                },
                permissionModel: {
                    ...DEFAULT_SETTINGS.team.permissionModel,
                    ...incomingPermissionModel,
                    rolePolicies: incomingPermissionModel.rolePolicies && typeof incomingPermissionModel.rolePolicies === "object"
                        ? incomingPermissionModel.rolePolicies
                        : {},
                    fieldVisibility: sensitiveFieldKeys.reduce((acc, fieldKey) => {
                        const incomingField = incomingFieldVisibility[fieldKey] && typeof incomingFieldVisibility[fieldKey] === "object"
                            ? incomingFieldVisibility[fieldKey]
                            : {};
                        acc[fieldKey] = {
                            visibleToRoles: Array.isArray(incomingField.visibleToRoles)
                                ? incomingField.visibleToRoles
                                : [],
                        };
                        return acc;
                    }, {}),
                },
            },
        };
    });
    const [teamDefaultPermissionSearch, setTeamDefaultPermissionSearch] = useState("");
    const [auditTypeFilter, setAuditTypeFilter] = useState("all");
    const [auditResourceFilter, setAuditResourceFilter] = useState("all");
    const [auditSearch, setAuditSearch] = useState("");
    const [auditPage, setAuditPage] = useState(1);
    const [activeRoleForDefaults, setActiveRoleForDefaults] = useState(() => teamRoleOptions[0] || "courier_dispatcher");
    const [activeRoleForPermissionModel, setActiveRoleForPermissionModel] = useState(() => teamRoleOptions[0] || "courier_dispatcher");
    const [roleStudioRoles, setRoleStudioRoles] = useState(teamRoleCatalog);
    const [roleStudioTemplates] = useState(teamRoleTemplates);
    const [selectedRoleName, setSelectedRoleName] = useState(() => teamRoleCatalog[0]?.name || teamRoleOptions[0] || "");
    const [roleStudioPermissionSearch, setRoleStudioPermissionSearch] = useState("");
    const [roleCatalogSearch, setRoleCatalogSearch] = useState("");
    const [roleTypeFilter, setRoleTypeFilter] = useState("all");
    const [roleVersionTimeline, setRoleVersionTimeline] = useState([]);
    const [leftVersionNumber, setLeftVersionNumber] = useState("");
    const [rightVersionNumber, setRightVersionNumber] = useState("");
    const [loadingRoleVersions, setLoadingRoleVersions] = useState(false);
    const [roleStudioBusy, setRoleStudioBusy] = useState(false);
    const [roleFormErrors, setRoleFormErrors] = useState({});
    const [roleTemplateFormErrors, setRoleTemplateFormErrors] = useState({});
    const [roleCloneFormErrors, setRoleCloneFormErrors] = useState({});
    const [roleForm, setRoleForm] = useState({
        name: "",
        label: "",
        description: "",
        permissions: [],
    });
    const [roleTemplateForm, setRoleTemplateForm] = useState({
        template: Object.keys(teamRoleTemplates || {})[0] || "operations",
        name: "",
        label: "",
        description: "",
        permissions: [],
    });
    const [roleCloneForm, setRoleCloneForm] = useState({
        sourceRole: teamRoleCatalog[0]?.name || teamRoleOptions[0] || "",
        name: "",
        label: "",
        description: "",
        permissions: [],
    });
    const [teamPolicyPanels, setTeamPolicyPanels] = useState({
        basic: true,
        approvalDualControl: false,
        advancedModel: false,
    });
    const [approvalQueue, setApprovalQueue] = useState(teamSensitiveApprovals);
    const [approvalActionBusyId, setApprovalActionBusyId] = useState(null);

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

    const toggleTeamPolicyPanel = (panelKey) => {
        setTeamPolicyPanels((prev) => ({
            ...prev,
            [panelKey]: !prev[panelKey],
        }));
    };

    const toggleInArray = (list, value) => {
        if (list.includes(value)) {
            return list.filter((item) => item !== value);
        }

        return [...list, value];
    };

    const requestJson = async (method, url, body = null) => {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...(csrf ? { "X-CSRF-TOKEN": csrf } : {}),
            },
            credentials: "same-origin",
            body: body ? JSON.stringify(body) : undefined,
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(payload?.message || "Request failed");
        }

        return payload;
    };

    const refreshRoleStudioRoles = async () => {
        try {
            const payload = await requestJson("GET", route("courierService.team.roles.index"));
            const roles = Array.isArray(payload.roles) ? payload.roles : [];
            setRoleStudioRoles(roles);

            if (roles.length > 0 && !roles.some((role) => role.name === selectedRoleName)) {
                setSelectedRoleName(roles[0].name);
            }
        } catch {
            setFeedback({ type: "error", message: "Failed to refresh role catalog." });
        }
    };

    const loadRoleVersions = async (roleName) => {
        if (!roleName) {
            setRoleVersionTimeline([]);
            return;
        }

        setLoadingRoleVersions(true);

        try {
            const payload = await requestJson("GET", route("courierService.team.roles.versions", { roleName }));
            setRoleVersionTimeline(Array.isArray(payload.versions) ? payload.versions : []);
        } catch {
            setRoleVersionTimeline([]);
            setFeedback({ type: "error", message: "Failed to load role version timeline." });
        } finally {
            setLoadingRoleVersions(false);
        }
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

    const activeRoleDefaultPermissions = useMemo(() => {
        const byRole = settings.team?.teamAccessControl?.defaultDirectPermissionsByRole;

        if (!byRole || typeof byRole !== "object") {
            return [];
        }

        const selected = byRole[activeRoleForDefaults];
        return Array.isArray(selected) ? selected : [];
    }, [activeRoleForDefaults, settings.team]);

    const activeRoleDefaultDataScope = useMemo(() => {
        const byRole = settings.team?.teamAccessControl?.defaultDataScopeByRole;

        if (!byRole || typeof byRole !== "object") {
            return {
                scope: "own_records",
                regionZones: [],
                hubBranches: [],
            };
        }

        const selected = byRole[activeRoleForDefaults];

        return {
            scope: permissionScopes.includes(selected?.scope) ? selected.scope : "own_records",
            regionZones: Array.isArray(selected?.regionZones) ? selected.regionZones : [],
            hubBranches: Array.isArray(selected?.hubBranches) ? selected.hubBranches : [],
        };
    }, [activeRoleForDefaults, settings.team, permissionScopes]);

    const permissionModelRoleOptions = useMemo(() => {
        const fromRoles = Array.isArray(teamRoleOptions) ? teamRoleOptions : [];
        const fromPolicies = Object.keys(settings.team?.permissionModel?.rolePolicies || {});
        return [...new Set([...fromRoles, ...fromPolicies])].filter(Boolean);
    }, [teamRoleOptions, settings.team]);

    const activePermissionRolePolicy = useMemo(() => {
        const policies = settings.team?.permissionModel?.rolePolicies || {};
        const fallbackResources = permissionResources.reduce((acc, resource) => {
            acc[resource] = permissionActions.reduce((actionAcc, action) => {
                actionAcc[action] = false;
                return actionAcc;
            }, {});
            return acc;
        }, {});

        const selected = policies[activeRoleForPermissionModel] || {};
        const selectedResources = selected.resources && typeof selected.resources === "object" ? selected.resources : {};

        return {
            scope: permissionScopes.includes(selected.scope) ? selected.scope : "own_records",
            resources: permissionResources.reduce((acc, resource) => {
                const incoming = selectedResources[resource] && typeof selectedResources[resource] === "object"
                    ? selectedResources[resource]
                    : {};
                acc[resource] = permissionActions.reduce((actionsAcc, action) => {
                    actionsAcc[action] = Boolean(incoming[action] ?? fallbackResources[resource][action]);
                    return actionsAcc;
                }, {});
                return acc;
            }, {}),
            constraints: {
                ...DEFAULT_ROLE_SCOPE_CONSTRAINTS,
                ...(selected.constraints && typeof selected.constraints === "object" ? selected.constraints : {}),
                regionZones: Array.isArray(selected.constraints?.regionZones) ? selected.constraints.regionZones : [],
                hubBranches: Array.isArray(selected.constraints?.hubBranches) ? selected.constraints.hubBranches : [],
                allowedCustomerIds: Array.isArray(selected.constraints?.allowedCustomerIds)
                    ? selected.constraints.allowedCustomerIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
                    : [],
                allowedEnvironments: Array.isArray(selected.constraints?.allowedEnvironments)
                    ? selected.constraints.allowedEnvironments
                    : permissionEnvironments,
                blockedActionsByEnvironment: {
                    production: Array.isArray(selected.constraints?.blockedActionsByEnvironment?.production)
                        ? selected.constraints.blockedActionsByEnvironment.production
                        : [],
                    sandbox: Array.isArray(selected.constraints?.blockedActionsByEnvironment?.sandbox)
                        ? selected.constraints.blockedActionsByEnvironment.sandbox
                        : [],
                },
                policyRules: Array.isArray(selected.constraints?.policyRules)
                    ? selected.constraints.policyRules.map((rule, index) => {
                        const conditions = rule && typeof rule.conditions === "object" ? rule.conditions : {};
                        return {
                            id: String(rule?.id || `rule_${index + 1}`),
                            label: String(rule?.label || ""),
                            effect: permissionRuleEffects.includes(rule?.effect) ? rule.effect : "allow",
                            resource: permissionResources.includes(rule?.resource) || rule?.resource === "*" ? rule.resource : "*",
                            action: permissionActions.includes(rule?.action) || rule?.action === "*" ? rule.action : "*",
                            conditions: {
                                shipmentStages: Array.isArray(conditions.shipmentStages)
                                    ? conditions.shipmentStages.filter((value) => permissionRuleShipmentStages.includes(value))
                                    : [],
                                minAmount: Number.isFinite(Number(conditions.minAmount)) ? Number(conditions.minAmount) : "",
                                maxAmount: Number.isFinite(Number(conditions.maxAmount)) ? Number(conditions.maxAmount) : "",
                                clientTiers: Array.isArray(conditions.clientTiers)
                                    ? conditions.clientTiers.filter((value) => permissionRuleClientTiers.includes(value))
                                    : [],
                                slaClasses: Array.isArray(conditions.slaClasses)
                                    ? conditions.slaClasses.filter((value) => permissionRuleSlaClasses.includes(value))
                                    : [],
                            },
                        };
                    })
                    : [],
            },
        };
    }, [
        settings.team,
        activeRoleForPermissionModel,
        permissionResources,
        permissionActions,
        permissionScopes,
        permissionEnvironments,
        permissionRuleEffects,
        permissionRuleShipmentStages,
        permissionRuleClientTiers,
        permissionRuleSlaClasses,
    ]);

    const selectedRole = useMemo(
        () => roleStudioRoles.find((role) => role.name === selectedRoleName) || null,
        [roleStudioRoles, selectedRoleName],
    );

    const filteredRoleStudioRoles = useMemo(() => {
        return roleStudioRoles.filter((role) => {
            const matchesSearch = `${role.name || ""} ${role.label || ""}`
                .toLowerCase()
                .includes(roleCatalogSearch.toLowerCase());
            const matchesType = roleTypeFilter === "all" || String(role.sourceType || "custom") === roleTypeFilter;
            return matchesSearch && matchesType;
        });
    }, [roleStudioRoles, roleCatalogSearch, roleTypeFilter]);

    const selectedLeftVersion = useMemo(
        () => roleVersionTimeline.find((version) => String(version.version) === String(leftVersionNumber)) || null,
        [roleVersionTimeline, leftVersionNumber],
    );

    const selectedRightVersion = useMemo(
        () => roleVersionTimeline.find((version) => String(version.version) === String(rightVersionNumber)) || null,
        [roleVersionTimeline, rightVersionNumber],
    );

    const roleVersionDiff = useMemo(() => {
        if (!selectedLeftVersion || !selectedRightVersion) {
            return { added: [], removed: [] };
        }

        const left = new Set(Array.isArray(selectedLeftVersion.permissions) ? selectedLeftVersion.permissions : []);
        const right = new Set(Array.isArray(selectedRightVersion.permissions) ? selectedRightVersion.permissions : []);

        const added = [...right].filter((permission) => !left.has(permission)).sort();
        const removed = [...left].filter((permission) => !right.has(permission)).sort();

        return { added, removed };
    }, [selectedLeftVersion, selectedRightVersion]);

    const groupedRoleStudioPermissions = useMemo(() => {
        return teamPermissionOptions.reduce((acc, perm) => {
            const group = String(perm || "").split(".")[1] || "other";
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(perm);
            return acc;
        }, {});
    }, [teamPermissionOptions]);

    const filteredTeamAccessAudit = useMemo(() => {
        return teamAccessAudit.filter((event) => {
            const isDenied = event.action === "courier_permission_denied";
            const type = isDenied ? "denied" : "updated";
            const meta = event.metadata && typeof event.metadata === "object" ? event.metadata : {};
            const resource = String(meta.resource || "").trim();

            if (auditTypeFilter !== "all" && auditTypeFilter !== type) {
                return false;
            }

            if (auditResourceFilter !== "all" && auditResourceFilter !== resource) {
                return false;
            }

            const needle = auditSearch.trim().toLowerCase();
            if (!needle) {
                return true;
            }

            const haystack = [
                String(event.action || ""),
                String(event.description || ""),
                String(meta.resource || ""),
                String(meta.requested_action || ""),
                String(meta.scope || ""),
                String(meta.reason || ""),
                String(meta.mode || ""),
                String(event.createdAt || ""),
            ].join(" ").toLowerCase();

            return haystack.includes(needle);
        });
    }, [teamAccessAudit, auditTypeFilter, auditResourceFilter, auditSearch]);

    const auditResourceOptions = useMemo(() => {
        return [...new Set(teamAccessAudit
            .map((event) => (event.metadata && typeof event.metadata === "object" ? String(event.metadata.resource || "").trim() : ""))
            .filter(Boolean))]
            .sort();
    }, [teamAccessAudit]);

    const auditPerPage = 10;

    const auditPagination = useMemo(() => {
        const total = filteredTeamAccessAudit.length;
        const totalPages = Math.max(1, Math.ceil(total / auditPerPage));
        const currentPage = Math.min(Math.max(auditPage, 1), totalPages);
        const start = (currentPage - 1) * auditPerPage;
        const rows = filteredTeamAccessAudit.slice(start, start + auditPerPage);

        return {
            total,
            totalPages,
            currentPage,
            rows,
        };
    }, [filteredTeamAccessAudit, auditPage]);

    const exportAuditCsv = () => {
        if (filteredTeamAccessAudit.length === 0) {
            return;
        }

        const escapeCsv = (value) => {
            const text = String(value ?? "");
            return `"${text.replaceAll("\"", "\"\"")}"`;
        };

        const lines = [
            [
                "Timestamp",
                "Event Type",
                "Description",
                "Resource",
                "Requested Action",
                "Scope",
                "Reason",
                "Mode",
            ].join(","),
            ...filteredTeamAccessAudit.map((event) => {
                const isDenied = event.action === "courier_permission_denied";
                const meta = event.metadata && typeof event.metadata === "object" ? event.metadata : {};
                return [
                    escapeCsv(event.createdAt || ""),
                    escapeCsv(isDenied ? "Denied" : "Policy Updated"),
                    escapeCsv(event.description || ""),
                    escapeCsv(meta.resource || ""),
                    escapeCsv(meta.requested_action || ""),
                    escapeCsv(meta.scope || ""),
                    escapeCsv(meta.reason || ""),
                    escapeCsv(meta.mode || ""),
                ].join(",");
            }),
        ];

        const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
        const href = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = href;
        anchor.setAttribute("download", `team-access-audit-${new Date().toISOString().slice(0, 19).replaceAll(":", "-")}.csv`);
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(href);
    };

    useEffect(() => {
        setAuditPage(1);
    }, [auditTypeFilter, auditResourceFilter, auditSearch]);

    useEffect(() => {
        setApprovalQueue(teamSensitiveApprovals);
    }, [teamSensitiveApprovals]);

    useEffect(() => {
        if (teamRoleOptions.length > 0 && !teamRoleOptions.includes(activeRoleForDefaults)) {
            setActiveRoleForDefaults(teamRoleOptions[0]);
        }
    }, [teamRoleOptions, activeRoleForDefaults]);

    useEffect(() => {
        if (permissionModelRoleOptions.length > 0 && !permissionModelRoleOptions.includes(activeRoleForPermissionModel)) {
            setActiveRoleForPermissionModel(permissionModelRoleOptions[0]);
        }
    }, [permissionModelRoleOptions, activeRoleForPermissionModel]);

    useEffect(() => {
        if (filteredRoleStudioRoles.length > 0 && !filteredRoleStudioRoles.some((role) => role.name === selectedRoleName)) {
            setSelectedRoleName(filteredRoleStudioRoles[0].name);
        }
    }, [filteredRoleStudioRoles, selectedRoleName]);

    useEffect(() => {
        if (!selectedRole) {
            return;
        }

        setRoleForm((prev) => ({
            ...prev,
            label: selectedRole.label || "",
            description: selectedRole.description || "",
            permissions: Array.isArray(selectedRole.permissions) ? selectedRole.permissions : [],
        }));

        setRoleCloneForm((prev) => ({
            ...prev,
            sourceRole: selectedRole.name,
            permissions: Array.isArray(selectedRole.permissions) ? selectedRole.permissions : [],
            label: prev.label || `${selectedRole.label || titleCase(selectedRole.name)} Clone`,
        }));
    }, [selectedRole]);

    useEffect(() => {
        const source = roleStudioRoles.find((role) => role.name === roleCloneForm.sourceRole);
        if (!source) {
            return;
        }

        setRoleCloneForm((prev) => ({
            ...prev,
            permissions: Array.isArray(source.permissions) ? source.permissions : [],
            label: prev.label || `${source.label || titleCase(source.name)} Clone`,
        }));
    }, [roleCloneForm.sourceRole, roleStudioRoles]);

    useEffect(() => {
        loadRoleVersions(selectedRoleName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRoleName]);

    useEffect(() => {
        if (roleVersionTimeline.length > 1) {
            setRightVersionNumber(String(roleVersionTimeline[0].version));
            setLeftVersionNumber(String(roleVersionTimeline[1].version));
            return;
        }

        if (roleVersionTimeline.length === 1) {
            setRightVersionNumber(String(roleVersionTimeline[0].version));
            setLeftVersionNumber(String(roleVersionTimeline[0].version));
            return;
        }

        setRightVersionNumber("");
        setLeftVersionNumber("");
    }, [roleVersionTimeline]);

    const validateRoleForm = () => {
        const nextErrors = {};

        if (!String(roleForm.name || "").trim()) {
            nextErrors.name = "Role name is required.";
        }

        if (!String(roleForm.label || "").trim()) {
            nextErrors.label = "Role label is required.";
        }

        if (!Array.isArray(roleForm.permissions) || roleForm.permissions.length === 0) {
            nextErrors.permissions = "Select at least one permission.";
        }

        setRoleFormErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const validateRoleTemplateForm = () => {
        const nextErrors = {};

        if (!String(roleTemplateForm.template || "").trim()) {
            nextErrors.template = "Template is required.";
        }

        if (!String(roleTemplateForm.name || "").trim()) {
            nextErrors.name = "New role name is required.";
        }

        setRoleTemplateFormErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const validateRoleCloneForm = () => {
        const nextErrors = {};

        if (!String(roleCloneForm.sourceRole || "").trim()) {
            nextErrors.sourceRole = "Source role is required.";
        }

        if (!String(roleCloneForm.name || "").trim()) {
            nextErrors.name = "Cloned role name is required.";
        }

        setRoleCloneFormErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const toggleRoleDefaultPermission = (permission) => {
        const nextRoleDefaults = toggleInArray(activeRoleDefaultPermissions, permission);

        setSettings((prev) => ({
            ...prev,
            team: {
                ...prev.team,
                teamAccessControl: {
                    ...prev.team.teamAccessControl,
                    defaultDirectPermissionsByRole: {
                        ...(prev.team.teamAccessControl.defaultDirectPermissionsByRole || {}),
                        [activeRoleForDefaults]: nextRoleDefaults,
                    },
                },
            },
        }));
    };

    const updateApprovalControl = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            team: {
                ...prev.team,
                approvalControl: {
                    ...(prev.team.approvalControl || DEFAULT_SETTINGS.team.approvalControl),
                    [key]: value,
                },
            },
        }));
    };

    const updateApprovalActionControl = (actionKey, key, value) => {
        setSettings((prev) => ({
            ...prev,
            team: {
                ...prev.team,
                approvalControl: {
                    ...(prev.team.approvalControl || DEFAULT_SETTINGS.team.approvalControl),
                    sensitiveActions: {
                        ...((prev.team.approvalControl && prev.team.approvalControl.sensitiveActions) || DEFAULT_SETTINGS.team.approvalControl.sensitiveActions),
                        [actionKey]: {
                            ...(((prev.team.approvalControl && prev.team.approvalControl.sensitiveActions && prev.team.approvalControl.sensitiveActions[actionKey])
                                || DEFAULT_SETTINGS.team.approvalControl.sensitiveActions[actionKey]
                                || {})),
                            [key]: value,
                        },
                    },
                },
            },
        }));
    };

    const approveSensitiveAction = async (approvalId) => {
        setApprovalActionBusyId(approvalId);

        try {
            const payload = await requestJson("POST", route("courierService.team.sensitive-approvals.approve", { approval: approvalId }));
            setFeedback({ type: "success", message: payload?.message || "Approval recorded." });
            router.reload({ only: ["teamSensitiveApprovals"], preserveScroll: true, preserveState: true });
        } catch (error) {
            setFeedback({ type: "error", message: error.message || "Failed to approve request." });
        } finally {
            setApprovalActionBusyId(null);
        }
    };

    const rejectSensitiveAction = async (approvalId) => {
        setApprovalActionBusyId(approvalId);

        try {
            const payload = await requestJson("POST", route("courierService.team.sensitive-approvals.reject", { approval: approvalId }), {
                reason: "Rejected by approver from Team Access Control queue.",
            });
            setFeedback({ type: "success", message: payload?.message || "Approval rejected." });
            router.reload({ only: ["teamSensitiveApprovals"], preserveScroll: true, preserveState: true });
        } catch (error) {
            setFeedback({ type: "error", message: error.message || "Failed to reject request." });
        } finally {
            setApprovalActionBusyId(null);
        }
    };

    const updateRoleDefaultDataScope = (key, value) => {
        setSettings((prev) => {
            const currentScope = prev.team?.teamAccessControl?.defaultDataScopeByRole?.[activeRoleForDefaults] || {};

            return {
                ...prev,
                team: {
                    ...prev.team,
                    teamAccessControl: {
                        ...prev.team.teamAccessControl,
                        defaultDataScopeByRole: {
                            ...(prev.team.teamAccessControl.defaultDataScopeByRole || {}),
                            [activeRoleForDefaults]: {
                                scope: permissionScopes.includes(currentScope.scope) ? currentScope.scope : "own_records",
                                regionZones: Array.isArray(currentScope.regionZones) ? currentScope.regionZones : [],
                                hubBranches: Array.isArray(currentScope.hubBranches) ? currentScope.hubBranches : [],
                                [key]: value,
                            },
                        },
                    },
                },
            };
        });
    };

    const toggleRoleDefaultDataScopeArray = (key, value) => {
        const current = Array.isArray(activeRoleDefaultDataScope[key]) ? activeRoleDefaultDataScope[key] : [];
        updateRoleDefaultDataScope(key, toggleInArray(current, value));
    };

    const updatePermissionModelEnabled = (enabled) => {
        setSettings((prev) => ({
            ...prev,
            team: {
                ...prev.team,
                permissionModel: {
                    ...prev.team.permissionModel,
                    enabled,
                },
            },
        }));
    };

    const updatePermissionRoleScope = (roleName, scope) => {
        setSettings((prev) => ({
            ...prev,
            team: {
                ...prev.team,
                permissionModel: {
                    ...prev.team.permissionModel,
                    rolePolicies: {
                        ...(prev.team.permissionModel.rolePolicies || {}),
                        [roleName]: {
                            ...(prev.team.permissionModel.rolePolicies?.[roleName] || {}),
                            scope,
                            resources: {
                                ...(prev.team.permissionModel.rolePolicies?.[roleName]?.resources || activePermissionRolePolicy.resources),
                            },
                        },
                    },
                },
            },
        }));
    };

    const togglePermissionRoleAction = (roleName, resource, action) => {
        const currentValue = Boolean(activePermissionRolePolicy.resources?.[resource]?.[action]);
        setSettings((prev) => ({
            ...prev,
            team: {
                ...prev.team,
                permissionModel: {
                    ...prev.team.permissionModel,
                    rolePolicies: {
                        ...(prev.team.permissionModel.rolePolicies || {}),
                        [roleName]: {
                            ...(prev.team.permissionModel.rolePolicies?.[roleName] || {}),
                            scope: prev.team.permissionModel.rolePolicies?.[roleName]?.scope || activePermissionRolePolicy.scope,
                            resources: {
                                ...(prev.team.permissionModel.rolePolicies?.[roleName]?.resources || activePermissionRolePolicy.resources),
                                [resource]: {
                                    ...(prev.team.permissionModel.rolePolicies?.[roleName]?.resources?.[resource] || activePermissionRolePolicy.resources?.[resource] || {}),
                                    [action]: !currentValue,
                                },
                            },
                            constraints: {
                                ...DEFAULT_ROLE_SCOPE_CONSTRAINTS,
                                ...(prev.team.permissionModel.rolePolicies?.[roleName]?.constraints || activePermissionRolePolicy.constraints),
                            },
                        },
                    },
                },
            },
        }));
    };

    const updatePermissionRoleConstraint = (roleName, key, value) => {
        setSettings((prev) => ({
            ...prev,
            team: {
                ...prev.team,
                permissionModel: {
                    ...prev.team.permissionModel,
                    rolePolicies: {
                        ...(prev.team.permissionModel.rolePolicies || {}),
                        [roleName]: {
                            ...(prev.team.permissionModel.rolePolicies?.[roleName] || {}),
                            scope: prev.team.permissionModel.rolePolicies?.[roleName]?.scope || activePermissionRolePolicy.scope,
                            resources: {
                                ...(prev.team.permissionModel.rolePolicies?.[roleName]?.resources || activePermissionRolePolicy.resources),
                            },
                            constraints: {
                                ...DEFAULT_ROLE_SCOPE_CONSTRAINTS,
                                ...(prev.team.permissionModel.rolePolicies?.[roleName]?.constraints || activePermissionRolePolicy.constraints),
                                [key]: value,
                            },
                        },
                    },
                },
            },
        }));
    };

    const togglePermissionRoleConstraintArrayValue = (roleName, key, itemValue) => {
        const current = Array.isArray(activePermissionRolePolicy.constraints?.[key])
            ? activePermissionRolePolicy.constraints[key]
            : [];
        updatePermissionRoleConstraint(roleName, key, toggleInArray(current, itemValue));
    };

    const togglePermissionRoleBlockedActionForEnvironment = (roleName, environment, action) => {
        const current = Array.isArray(activePermissionRolePolicy.constraints?.blockedActionsByEnvironment?.[environment])
            ? activePermissionRolePolicy.constraints.blockedActionsByEnvironment[environment]
            : [];

        updatePermissionRoleConstraint(roleName, "blockedActionsByEnvironment", {
            ...(activePermissionRolePolicy.constraints?.blockedActionsByEnvironment || {}),
            [environment]: toggleInArray(current, action),
        });
    };

    const addPermissionPolicyRule = (roleName) => {
        const nextRules = [
            ...(Array.isArray(activePermissionRolePolicy.constraints?.policyRules) ? activePermissionRolePolicy.constraints.policyRules : []),
            {
                id: `rule_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
                label: "",
                effect: "allow",
                resource: "*",
                action: "*",
                conditions: {
                    shipmentStages: [],
                    minAmount: "",
                    maxAmount: "",
                    clientTiers: [],
                    slaClasses: [],
                },
            },
        ];

        updatePermissionRoleConstraint(roleName, "policyRules", nextRules);
    };

    const updatePermissionPolicyRule = (roleName, ruleId, updater) => {
        const currentRules = Array.isArray(activePermissionRolePolicy.constraints?.policyRules)
            ? activePermissionRolePolicy.constraints.policyRules
            : [];
        const nextRules = currentRules.map((rule) => (rule.id === ruleId ? updater(rule) : rule));
        updatePermissionRoleConstraint(roleName, "policyRules", nextRules);
    };

    const removePermissionPolicyRule = (roleName, ruleId) => {
        const currentRules = Array.isArray(activePermissionRolePolicy.constraints?.policyRules)
            ? activePermissionRolePolicy.constraints.policyRules
            : [];
        updatePermissionRoleConstraint(roleName, "policyRules", currentRules.filter((rule) => rule.id !== ruleId));
    };

    const toggleFieldVisibilityRole = (fieldKey, roleName) => {
        const currentRoles = settings.team?.permissionModel?.fieldVisibility?.[fieldKey]?.visibleToRoles || [];
        const nextRoles = toggleInArray(currentRoles, roleName);

        setSettings((prev) => ({
            ...prev,
            team: {
                ...prev.team,
                permissionModel: {
                    ...prev.team.permissionModel,
                    fieldVisibility: {
                        ...(prev.team.permissionModel.fieldVisibility || {}),
                        [fieldKey]: {
                            visibleToRoles: nextRoles,
                        },
                    },
                },
            },
        }));
    };

    const navigateTeamAccessTopic = (topicKey) => {
        if (!TEAM_ACCESS_TOPIC_CONFIG.some((topic) => topic.key === topicKey)) {
            return;
        }

        setActiveTeamAccessTopic(topicKey);
        router.get(route("courierService.settings.team.topic", { topic: topicKey }), {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const createCustomRole = () => {
        if (!canAssignRole || !canAssignPermissions) {
            return;
        }

        if (!validateRoleForm()) {
            return;
        }

        openConfirm({
            title: "Create Custom Role",
            message: "Create this custom role and apply selected permissions?",
            onConfirm: async () => {
                setRoleStudioBusy(true);
                try {
                    const payload = await requestJson("POST", route("courierService.team.roles.store"), roleForm);
                    const createdName = payload?.role?.name;
                    await refreshRoleStudioRoles();
                    if (createdName) {
                        setSelectedRoleName(createdName);
                        await loadRoleVersions(createdName);
                    }
                    setFeedback({ type: "success", message: "Custom role created successfully." });
                } catch (error) {
                    setFeedback({ type: "error", message: error.message || "Failed to create custom role." });
                } finally {
                    setRoleStudioBusy(false);
                }
            },
        });
    };

    const createRoleFromTemplate = () => {
        if (!canAssignRole || !canAssignPermissions) {
            return;
        }

        if (!validateRoleTemplateForm()) {
            return;
        }

        openConfirm({
            title: "Create Role From Template",
            message: "Generate a new role from selected template settings?",
            onConfirm: async () => {
                setRoleStudioBusy(true);
                try {
                    const payload = await requestJson("POST", route("courierService.team.roles.store-template"), roleTemplateForm);
                    const createdName = payload?.role?.name;
                    await refreshRoleStudioRoles();
                    if (createdName) {
                        setSelectedRoleName(createdName);
                        await loadRoleVersions(createdName);
                    }
                    setFeedback({ type: "success", message: "Template-based role created successfully." });
                } catch (error) {
                    setFeedback({ type: "error", message: error.message || "Failed to create role from template." });
                } finally {
                    setRoleStudioBusy(false);
                }
            },
        });
    };

    const cloneExistingRole = () => {
        if (!canAssignRole || !canAssignPermissions || !roleCloneForm.sourceRole) {
            return;
        }

        if (!validateRoleCloneForm()) {
            return;
        }

        openConfirm({
            title: "Clone Role",
            message: `Clone ${titleCase(roleCloneForm.sourceRole)} with selected adjustments?`,
            onConfirm: async () => {
                setRoleStudioBusy(true);
                try {
                    const payload = await requestJson("POST", route("courierService.team.roles.clone", { roleName: roleCloneForm.sourceRole }), roleCloneForm);
                    const createdName = payload?.role?.name;
                    await refreshRoleStudioRoles();
                    if (createdName) {
                        setSelectedRoleName(createdName);
                        await loadRoleVersions(createdName);
                    }
                    setFeedback({ type: "success", message: "Role cloned successfully." });
                } catch (error) {
                    setFeedback({ type: "error", message: error.message || "Failed to clone role." });
                } finally {
                    setRoleStudioBusy(false);
                }
            },
        });
    };

    const saveRoleEdits = () => {
        if (!canAssignRole || !canAssignPermissions || !selectedRole?.name) {
            return;
        }

        const nextErrors = {};
        if (!String(roleForm.label || "").trim()) {
            nextErrors.label = "Role label is required.";
        }
        if (!Array.isArray(roleForm.permissions) || roleForm.permissions.length === 0) {
            nextErrors.permissions = "Select at least one permission.";
        }
        setRoleFormErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        openConfirm({
            title: "Update Role",
            message: `Apply permission and profile updates to ${titleCase(selectedRole.name)}?`,
            onConfirm: async () => {
                setRoleStudioBusy(true);
                try {
                    await requestJson("PATCH", route("courierService.team.roles.update", { roleName: selectedRole.name }), {
                        label: roleForm.label,
                        description: roleForm.description,
                        permissions: roleForm.permissions,
                    });

                    await refreshRoleStudioRoles();
                    await loadRoleVersions(selectedRole.name);
                    setFeedback({ type: "success", message: "Role updated successfully." });
                } catch (error) {
                    setFeedback({ type: "error", message: error.message || "Failed to update role." });
                } finally {
                    setRoleStudioBusy(false);
                }
            },
        });
    };

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

    const tabContent = (() => {
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
            <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-5">
                <div className="bg-white rounded-[10px] p-4 h-fit" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
                    <p className="text-[12px] text-[#6B7280] font-[700] uppercase tracking-wide mb-3">Team Access Topics</p>
                    <div className="space-y-2">
                        {TEAM_ACCESS_TOPIC_CONFIG.map((topic) => (
                            <button
                                key={topic.key}
                                type="button"
                                onClick={() => navigateTeamAccessTopic(topic.key)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-left text-[13px] font-[700] transition-colors ${
                                    activeTeamAccessTopic === topic.key
                                        ? "bg-[#0955AC] text-white"
                                        : "bg-[#F3F4F6] text-[#374151]"
                                }`}
                            >
                                <span>{topic.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <SectionCard title="Team Access Control" description="Set role powers for key operational decisions.">
                    {activeTeamAccessTopic === "policy-controls" && (
                        <div className="space-y-4">
                            <div className="border border-[#E5E7EB] rounded-[10px] p-4 bg-[#FAFBFD]">
                                <button
                                    type="button"
                                    onClick={() => toggleTeamPolicyPanel("basic")}
                                    className="w-full flex items-center justify-between gap-3 text-left"
                                >
                                    <div>
                                        <p className="text-[14px] font-[700] text-[#111827]">Core Team Policy Toggles</p>
                                        <p className="text-[12px] text-[#6B7280] mt-1">Quick operational gates for cancellation, reassignment, rates, and 2FA enforcement.</p>
                                    </div>
                                    <ChevronDown size={16} className={`text-[#6B7280] transition-transform ${teamPolicyPanels.basic ? "rotate-180" : ""}`} />
                                </button>

                                {teamPolicyPanels.basic && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                        <Toggle label="Dispatcher Can Cancel Shipments" checked={settings.team.dispatcherCanCancel} onChange={(next) => updateValue("team", "dispatcherCanCancel", next)} />
                                        <Toggle label="Ops Lead Can Reassign" checked={settings.team.opsLeadCanReassign} onChange={(next) => updateValue("team", "opsLeadCanReassign", next)} />
                                        <Toggle label="Finance Can View Rate Cards" checked={settings.team.financeCanViewRates} onChange={(next) => updateValue("team", "financeCanViewRates", next)} />
                                        <Toggle label="Enforce 2FA For All Staff" checked={settings.team.enforce2FA} onChange={(next) => updateValue("team", "enforce2FA", next)} />
                                    </div>
                                )}
                            </div>

                            <div className="border border-[#E5E7EB] rounded-[10px] p-4 bg-[#FAFBFD]">
                                <button
                                    type="button"
                                    onClick={() => toggleTeamPolicyPanel("approvalDualControl")}
                                    className="w-full flex items-center justify-between gap-3 text-left"
                                >
                                    <div>
                                        <p className="text-[14px] font-[700] text-[#111827]">Approval and Dual Control</p>
                                        <p className="text-[12px] text-[#6B7280] mt-1">Require maker-checker approvals for high-risk actions (cancellation, refunds, ownership transfer, and full client exports).</p>
                                    </div>
                                    <ChevronDown size={16} className={`text-[#6B7280] transition-transform ${teamPolicyPanels.approvalDualControl ? "rotate-180" : ""}`} />
                                </button>

                                {teamPolicyPanels.approvalDualControl && (
                                <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                    <Toggle
                                        label="Enable Sensitive Action Approval"
                                        checked={Boolean(settings.team?.approvalControl?.enabled)}
                                        onChange={(next) => updateApprovalControl("enabled", next)}
                                        description="When enabled, configured sensitive actions create approval requests before execution."
                                    />
                                    <Toggle
                                        label="Enforce Maker-Checker"
                                        checked={Boolean(settings.team?.approvalControl?.makerChecker)}
                                        onChange={(next) => updateApprovalControl("makerChecker", next)}
                                        description="Requester and approver must be different users."
                                    />
                                </div>

                                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <Field label="Approval TTL (minutes)">
                                        <input
                                            type="number"
                                            min={10}
                                            max={10080}
                                            className="h-[38px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                            value={settings.team?.approvalControl?.approvalTtlMinutes ?? 240}
                                            onChange={(e) => updateApprovalControl("approvalTtlMinutes", Number(e.target.value || 240))}
                                        />
                                    </Field>
                                </div>

                                <div className="mt-3 border border-[#E5E7EB] rounded-[8px] p-3 bg-white">
                                    <p className="text-[13px] font-[700] text-[#111827] mb-2">Sensitive Action Thresholds</p>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                        <div className="border border-[#E5E7EB] rounded-[8px] p-2">
                                            <Toggle
                                                label="High-Value Cancellation"
                                                checked={Boolean(settings.team?.approvalControl?.sensitiveActions?.high_value_cancellation?.enabled)}
                                                onChange={(next) => updateApprovalActionControl("high_value_cancellation", "enabled", next)}
                                            />
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <Field label="Min Amount (LKR)">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                        value={settings.team?.approvalControl?.sensitiveActions?.high_value_cancellation?.minAmount ?? 50000}
                                                        onChange={(e) => updateApprovalActionControl("high_value_cancellation", "minAmount", Number(e.target.value || 0))}
                                                    />
                                                </Field>
                                                <Field label="Required Approvals">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={3}
                                                        className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                        value={settings.team?.approvalControl?.sensitiveActions?.high_value_cancellation?.requiredApprovals ?? 1}
                                                        onChange={(e) => updateApprovalActionControl("high_value_cancellation", "requiredApprovals", Number(e.target.value || 1))}
                                                    />
                                                </Field>
                                            </div>
                                        </div>

                                        <div className="border border-[#E5E7EB] rounded-[8px] p-2">
                                            <Toggle
                                                label="Refund Approval"
                                                checked={Boolean(settings.team?.approvalControl?.sensitiveActions?.refund?.enabled)}
                                                onChange={(next) => updateApprovalActionControl("refund", "enabled", next)}
                                            />
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <Field label="Level 1 Min (LKR)">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                        value={settings.team?.approvalControl?.sensitiveActions?.refund?.level1MinAmount ?? 25000}
                                                        onChange={(e) => updateApprovalActionControl("refund", "level1MinAmount", Number(e.target.value || 0))}
                                                    />
                                                </Field>
                                                <Field label="L1 Approvals">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={3}
                                                        className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                        value={settings.team?.approvalControl?.sensitiveActions?.refund?.requiredApprovalsLevel1 ?? 1}
                                                        onChange={(e) => updateApprovalActionControl("refund", "requiredApprovalsLevel1", Number(e.target.value || 1))}
                                                    />
                                                </Field>
                                                <Field label="Level 2 Min (LKR)">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                        value={settings.team?.approvalControl?.sensitiveActions?.refund?.level2MinAmount ?? 100000}
                                                        onChange={(e) => updateApprovalActionControl("refund", "level2MinAmount", Number(e.target.value || 0))}
                                                    />
                                                </Field>
                                                <Field label="L2 Approvals">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={3}
                                                        className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                        value={settings.team?.approvalControl?.sensitiveActions?.refund?.requiredApprovalsLevel2 ?? 2}
                                                        onChange={(e) => updateApprovalActionControl("refund", "requiredApprovalsLevel2", Number(e.target.value || 2))}
                                                    />
                                                </Field>
                                            </div>
                                        </div>

                                        <div className="border border-[#E5E7EB] rounded-[8px] p-2">
                                            <Toggle
                                                label="Ownership Transfer"
                                                checked={Boolean(settings.team?.approvalControl?.sensitiveActions?.ownership_transfer?.enabled)}
                                                onChange={(next) => updateApprovalActionControl("ownership_transfer", "enabled", next)}
                                            />
                                            <Field label="Required Approvals">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={3}
                                                    className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                    value={settings.team?.approvalControl?.sensitiveActions?.ownership_transfer?.requiredApprovals ?? 2}
                                                    onChange={(e) => updateApprovalActionControl("ownership_transfer", "requiredApprovals", Number(e.target.value || 2))}
                                                />
                                            </Field>
                                        </div>

                                        <div className="border border-[#E5E7EB] rounded-[8px] p-2">
                                            <Toggle
                                                label="Full Client Export"
                                                checked={Boolean(settings.team?.approvalControl?.sensitiveActions?.client_list_export?.enabled)}
                                                onChange={(next) => updateApprovalActionControl("client_list_export", "enabled", next)}
                                            />
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <Field label="Min Rows">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                        value={settings.team?.approvalControl?.sensitiveActions?.client_list_export?.minRows ?? 100}
                                                        onChange={(e) => updateApprovalActionControl("client_list_export", "minRows", Number(e.target.value || 100))}
                                                    />
                                                </Field>
                                                <Field label="Required Approvals">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={3}
                                                        className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                        value={settings.team?.approvalControl?.sensitiveActions?.client_list_export?.requiredApprovals ?? 1}
                                                        onChange={(e) => updateApprovalActionControl("client_list_export", "requiredApprovals", Number(e.target.value || 1))}
                                                    />
                                                </Field>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 border border-[#E5E7EB] rounded-[8px] p-3 bg-white">
                                    <p className="text-[13px] font-[700] text-[#111827] mb-2">Sensitive Action Approval Queue</p>
                                    {(approvalQueue || []).length === 0 && (
                                        <p className="text-[12px] text-[#6B7280]">No pending or approved requests waiting execution.</p>
                                    )}

                                    <div className="space-y-2">
                                        {(approvalQueue || []).map((item) => (
                                            <div key={`approval-${item.id}`} className="border border-[#E5E7EB] rounded-[8px] p-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-[12px] font-[700] text-[#111827]">{titleCase(item.actionKey || "action")}</p>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-[700] ${item.status === "approved" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEF3C7] text-[#92400E]"}`}>
                                                        {titleCase(item.status || "pending")}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-[#6B7280] mt-1">
                                                    Requested by {item.requester?.name || "-"} • Approvals {item.approvedCount || 0}/{item.requiredApprovals || 0}
                                                    {item.amount !== null ? ` • Amount LKR ${item.amount}` : ""}
                                                </p>
                                                <p className="text-[11px] text-[#6B7280] mt-1">Created at {item.createdAt || "-"} • Expires at {item.expiresAt || "-"}</p>

                                                {canAssignPermissions && item.status === "pending" && (
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={approvalActionBusyId === item.id}
                                                            className="h-[30px] px-2 rounded-[6px] bg-[#0955AC] text-white text-[11px] font-[700] disabled:opacity-50"
                                                            onClick={() => approveSensitiveAction(item.id)}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={approvalActionBusyId === item.id}
                                                            className="h-[30px] px-2 rounded-[6px] border border-[#FCA5A5] text-[#B91C1C] text-[11px] font-[700] disabled:opacity-50"
                                                            onClick={() => rejectSensitiveAction(item.id)}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                </>
                                )}
                            </div>

                            <div className="border border-[#E5E7EB] rounded-[10px] p-4 bg-[#FAFBFD]">
                                <div className="flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => toggleTeamPolicyPanel("advancedModel")}
                                        className="flex-1 flex items-center justify-between gap-3 text-left"
                                    >
                                        <div>
                                            <p className="text-[14px] font-[700] text-[#111827]">Advanced Permission Model</p>
                                            <p className="text-[12px] text-[#6B7280]">Configure action-level permissions by resource, role scope, and sensitive field visibility.</p>
                                        </div>
                                        <ChevronDown size={16} className={`text-[#6B7280] transition-transform ${teamPolicyPanels.advancedModel ? "rotate-180" : ""}`} />
                                    </button>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={Boolean(settings.team?.permissionModel?.enabled)}
                                        onClick={() => updatePermissionModelEnabled(!Boolean(settings.team?.permissionModel?.enabled))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.team?.permissionModel?.enabled ? "bg-[#0955AC]" : "bg-[#D1D5DB]"}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.team?.permissionModel?.enabled ? "translate-x-6" : "translate-x-1"}`} />
                                    </button>
                                </div>

                                {teamPolicyPanels.advancedModel && (
                                <>
                                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3 mb-3">
                                    <div>
                                        <label className="text-[12px] font-[700] text-[#374151]">Role</label>
                                        <select
                                            className="mt-1 h-[42px] w-full rounded-[8px] border border-[#D1D5DB] px-3 text-[13px] leading-[1.35]"
                                            value={activeRoleForPermissionModel}
                                            onChange={(e) => setActiveRoleForPermissionModel(e.target.value)}
                                        >
                                            {permissionModelRoleOptions.map((role) => (
                                                <option key={role} value={role}>{titleCase(role)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[12px] font-[700] text-[#374151]">Scope Level</label>
                                        <select
                                            className="mt-1 h-[42px] w-full rounded-[8px] border border-[#D1D5DB] px-3 text-[13px] leading-[1.35]"
                                            value={activePermissionRolePolicy.scope}
                                            onChange={(e) => updatePermissionRoleScope(activeRoleForPermissionModel, e.target.value)}
                                        >
                                            {permissionScopes.map((scope) => (
                                                <option key={scope} value={scope}>{titleCase(scope)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="overflow-x-auto border border-[#E5E7EB] rounded-[8px] bg-white">
                                    <table className="w-full min-w-[760px] text-[12px]">
                                        <thead>
                                            <tr className="bg-[#F9FAFB] text-left">
                                                <th className="px-3 py-2 font-[700] text-[#374151]">Resource</th>
                                                {permissionActions.map((action) => (
                                                    <th key={action} className="px-3 py-2 font-[700] text-[#374151]">{titleCase(action)}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {permissionResources.map((resource) => (
                                                <tr key={resource} className="border-t border-[#E5E7EB]">
                                                    <td className="px-3 py-2 font-[700] text-[#111827]">{titleCase(resource)}</td>
                                                    {permissionActions.map((action) => (
                                                        <td key={`${resource}-${action}`} className="px-3 py-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={Boolean(activePermissionRolePolicy.resources?.[resource]?.[action])}
                                                                onChange={() => togglePermissionRoleAction(activeRoleForPermissionModel, resource, action)}
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-3 border border-[#E5E7EB] rounded-[8px] p-3 bg-white">
                                    <p className="text-[13px] font-[700] text-[#111827] mb-2">Data Scope Controls</p>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-[12px] font-[700] text-[#374151] mb-1">Region Restrictions (zones)</p>
                                            <div className="flex flex-wrap gap-2">
                                                {scopeZoneOptions.length === 0 && <p className="text-[11px] text-[#6B7280]">No zone options configured.</p>}
                                                {scopeZoneOptions.map((zone) => (
                                                    <label key={zone} className="inline-flex items-center gap-1 text-[12px] text-[#374151]">
                                                        <input
                                                            type="checkbox"
                                                            checked={activePermissionRolePolicy.constraints.regionZones.includes(zone)}
                                                            onChange={() => togglePermissionRoleConstraintArrayValue(activeRoleForPermissionModel, "regionZones", zone)}
                                                        />
                                                        {zone}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[12px] font-[700] text-[#374151] mb-1">Hub/Branch Restrictions</p>
                                            <div className="flex flex-wrap gap-2">
                                                {scopeHubOptions.length === 0 && <p className="text-[11px] text-[#6B7280]">No hub options configured.</p>}
                                                {scopeHubOptions.map((hub) => (
                                                    <label key={hub} className="inline-flex items-center gap-1 text-[12px] text-[#374151]">
                                                        <input
                                                            type="checkbox"
                                                            checked={activePermissionRolePolicy.constraints.hubBranches.includes(hub)}
                                                            onChange={() => togglePermissionRoleConstraintArrayValue(activeRoleForPermissionModel, "hubBranches", hub)}
                                                        />
                                                        {hub}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-[12px] font-[700] text-[#374151] mb-1">Customer/Account Restrictions</p>
                                        <label className="inline-flex items-center gap-2 text-[12px] text-[#374151] mb-2">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(activePermissionRolePolicy.constraints.keyAccountsOnly)}
                                                onChange={(e) => updatePermissionRoleConstraint(activeRoleForPermissionModel, "keyAccountsOnly", e.target.checked)}
                                            />
                                            Key accounts only
                                        </label>

                                        <div className="max-h-[160px] overflow-y-auto border border-[#E5E7EB] rounded-[8px] p-2">
                                            {scopeCustomerOptions.length === 0 && <p className="text-[11px] text-[#6B7280]">No customer accounts found.</p>}
                                            {scopeCustomerOptions.map((account) => (
                                                <label key={account.id} className="block text-[12px] text-[#374151]">
                                                    <input
                                                        type="checkbox"
                                                        className="mr-2"
                                                        checked={activePermissionRolePolicy.constraints.allowedCustomerIds.includes(Number(account.id))}
                                                        onChange={() => togglePermissionRoleConstraintArrayValue(activeRoleForPermissionModel, "allowedCustomerIds", Number(account.id))}
                                                    />
                                                    {account.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-[12px] font-[700] text-[#374151] mb-1">Time Window Restrictions</p>
                                            <label className="inline-flex items-center gap-2 text-[12px] text-[#374151] mb-2">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(activePermissionRolePolicy.constraints.enforceShiftWindow)}
                                                    onChange={(e) => updatePermissionRoleConstraint(activeRoleForPermissionModel, "enforceShiftWindow", e.target.checked)}
                                                />
                                                Enforce shift window for non-view actions
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="time"
                                                    className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                    value={activePermissionRolePolicy.constraints.shiftStart || "00:00"}
                                                    onChange={(e) => updatePermissionRoleConstraint(activeRoleForPermissionModel, "shiftStart", e.target.value)}
                                                />
                                                <input
                                                    type="time"
                                                    className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                    value={activePermissionRolePolicy.constraints.shiftEnd || "23:59"}
                                                    onChange={(e) => updatePermissionRoleConstraint(activeRoleForPermissionModel, "shiftEnd", e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[12px] font-[700] text-[#374151] mb-1">Environment Restrictions</p>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {permissionEnvironments.map((environment) => (
                                                    <label key={environment} className="inline-flex items-center gap-1 text-[12px] text-[#374151]">
                                                        <input
                                                            type="checkbox"
                                                            checked={activePermissionRolePolicy.constraints.allowedEnvironments.includes(environment)}
                                                            onChange={() => togglePermissionRoleConstraintArrayValue(activeRoleForPermissionModel, "allowedEnvironments", environment)}
                                                        />
                                                        {titleCase(environment)}
                                                    </label>
                                                ))}
                                            </div>
                                            {permissionEnvironments.map((environment) => (
                                                <div key={`blocked-${environment}`} className="mb-1">
                                                    <p className="text-[11px] font-[700] text-[#6B7280]">Blocked actions in {titleCase(environment)}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {permissionActions.map((action) => (
                                                            <label key={`${environment}-${action}`} className="inline-flex items-center gap-1 text-[11px] text-[#374151]">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={Boolean(activePermissionRolePolicy.constraints.blockedActionsByEnvironment?.[environment]?.includes(action))}
                                                                    onChange={() => togglePermissionRoleBlockedActionForEnvironment(activeRoleForPermissionModel, environment, action)}
                                                                />
                                                                {titleCase(action)}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 border border-[#E5E7EB] rounded-[8px] p-3 bg-white">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <p className="text-[13px] font-[700] text-[#111827]">Policy Rules (ABAC)</p>
                                        <button
                                            type="button"
                                            className="h-[30px] px-2 rounded-[6px] border border-[#D1D5DB] text-[11px] font-[700] text-[#374151]"
                                            onClick={() => addPermissionPolicyRule(activeRoleForPermissionModel)}
                                        >
                                            Add Rule
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-[#6B7280] mb-2">Rules are evaluated with deny-over-allow priority. If any scoped rule exists for an action, at least one matching allow rule is required.</p>

                                    {activePermissionRolePolicy.constraints.policyRules.length === 0 && (
                                        <p className="text-[12px] text-[#6B7280]">No ABAC rules configured for this role.</p>
                                    )}

                                    <div className="space-y-2">
                                        {activePermissionRolePolicy.constraints.policyRules.map((rule) => (
                                            <div key={rule.id} className="border border-[#E5E7EB] rounded-[8px] p-2">
                                                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_110px_1fr_1fr_auto] gap-2 items-end">
                                                    <div>
                                                        <label className="text-[11px] font-[700] text-[#374151]">Rule Label</label>
                                                        <input
                                                            className="mt-1 h-[38px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px] leading-[1.35]"
                                                            value={rule.label || ""}
                                                            placeholder="High-value delivery restriction"
                                                            onChange={(e) => updatePermissionPolicyRule(activeRoleForPermissionModel, rule.id, (prev) => ({ ...prev, label: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[11px] font-[700] text-[#374151]">Effect</label>
                                                        <select
                                                            className="mt-1 h-[38px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px] leading-[1.35]"
                                                            value={rule.effect}
                                                            onChange={(e) => updatePermissionPolicyRule(activeRoleForPermissionModel, rule.id, (prev) => ({ ...prev, effect: e.target.value }))}
                                                        >
                                                            {permissionRuleEffects.map((effect) => (
                                                                <option key={effect} value={effect}>{titleCase(effect)}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[11px] font-[700] text-[#374151]">Resource</label>
                                                        <select
                                                            className="mt-1 h-[38px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px] leading-[1.35]"
                                                            value={rule.resource}
                                                            onChange={(e) => updatePermissionPolicyRule(activeRoleForPermissionModel, rule.id, (prev) => ({ ...prev, resource: e.target.value }))}
                                                        >
                                                            <option value="*">Any Resource</option>
                                                            {permissionResources.map((resource) => (
                                                                <option key={resource} value={resource}>{titleCase(resource)}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[11px] font-[700] text-[#374151]">Action</label>
                                                        <select
                                                            className="mt-1 h-[38px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px] leading-[1.35]"
                                                            value={rule.action}
                                                            onChange={(e) => updatePermissionPolicyRule(activeRoleForPermissionModel, rule.id, (prev) => ({ ...prev, action: e.target.value }))}
                                                        >
                                                            <option value="*">Any Action</option>
                                                            {permissionActions.map((action) => (
                                                                <option key={action} value={action}>{titleCase(action)}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="h-[32px] px-2 rounded-[6px] border border-[#FECACA] text-[11px] font-[700] text-[#B91C1C]"
                                                        onClick={() => removePermissionPolicyRule(activeRoleForPermissionModel, rule.id)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">
                                                    <div>
                                                        <p className="text-[11px] font-[700] text-[#374151] mb-1">Shipment Stage</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {permissionRuleShipmentStages.map((stage) => (
                                                                <label key={`${rule.id}-stage-${stage}`} className="inline-flex items-center gap-1 text-[11px] text-[#374151]">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={Array.isArray(rule.conditions?.shipmentStages) && rule.conditions.shipmentStages.includes(stage)}
                                                                        onChange={() => updatePermissionPolicyRule(activeRoleForPermissionModel, rule.id, (prev) => ({
                                                                            ...prev,
                                                                            conditions: {
                                                                                ...(prev.conditions || {}),
                                                                                shipmentStages: toggleInArray(Array.isArray(prev.conditions?.shipmentStages) ? prev.conditions.shipmentStages : [], stage),
                                                                            },
                                                                        }))}
                                                                    />
                                                                    {titleCase(stage)}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-[11px] font-[700] text-[#374151] mb-1">Amount Threshold (LKR)</p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                className="h-[38px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px] leading-[1.35]"
                                                                placeholder="Min"
                                                                value={rule.conditions?.minAmount ?? ""}
                                                                onChange={(e) => updatePermissionPolicyRule(activeRoleForPermissionModel, rule.id, (prev) => ({
                                                                    ...prev,
                                                                    conditions: {
                                                                        ...(prev.conditions || {}),
                                                                        minAmount: e.target.value === "" ? "" : Number(e.target.value),
                                                                    },
                                                                }))}
                                                            />
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                className="h-[38px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px] leading-[1.35]"
                                                                placeholder="Max"
                                                                value={rule.conditions?.maxAmount ?? ""}
                                                                onChange={(e) => updatePermissionPolicyRule(activeRoleForPermissionModel, rule.id, (prev) => ({
                                                                    ...prev,
                                                                    conditions: {
                                                                        ...(prev.conditions || {}),
                                                                        maxAmount: e.target.value === "" ? "" : Number(e.target.value),
                                                                    },
                                                                }))}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-[11px] font-[700] text-[#374151] mb-1">Client Tier</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {permissionRuleClientTiers.map((tier) => (
                                                                <label key={`${rule.id}-tier-${tier}`} className="inline-flex items-center gap-1 text-[11px] text-[#374151]">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={Array.isArray(rule.conditions?.clientTiers) && rule.conditions.clientTiers.includes(tier)}
                                                                        onChange={() => updatePermissionPolicyRule(activeRoleForPermissionModel, rule.id, (prev) => ({
                                                                            ...prev,
                                                                            conditions: {
                                                                                ...(prev.conditions || {}),
                                                                                clientTiers: toggleInArray(Array.isArray(prev.conditions?.clientTiers) ? prev.conditions.clientTiers : [], tier),
                                                                            },
                                                                        }))}
                                                                    />
                                                                    {titleCase(tier)}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-[11px] font-[700] text-[#374151] mb-1">SLA Class</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {permissionRuleSlaClasses.map((slaClass) => (
                                                                <label key={`${rule.id}-sla-${slaClass}`} className="inline-flex items-center gap-1 text-[11px] text-[#374151]">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={Array.isArray(rule.conditions?.slaClasses) && rule.conditions.slaClasses.includes(slaClass)}
                                                                        onChange={() => updatePermissionPolicyRule(activeRoleForPermissionModel, rule.id, (prev) => ({
                                                                            ...prev,
                                                                            conditions: {
                                                                                ...(prev.conditions || {}),
                                                                                slaClasses: toggleInArray(Array.isArray(prev.conditions?.slaClasses) ? prev.conditions.slaClasses : [], slaClass),
                                                                            },
                                                                        }))}
                                                                    />
                                                                    {titleCase(slaClass)}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-3 border border-[#E5E7EB] rounded-[8px] p-3 bg-white">
                                    <p className="text-[13px] font-[700] text-[#111827] mb-2">Sensitive Field Visibility</p>
                                    <div className="space-y-2">
                                        {sensitiveFieldKeys.map((fieldKey) => {
                                            const visibleTo = settings.team?.permissionModel?.fieldVisibility?.[fieldKey]?.visibleToRoles || [];
                                            return (
                                                <div key={fieldKey} className="border border-[#E5E7EB] rounded-[8px] p-2">
                                                    <p className="text-[12px] font-[700] text-[#374151]">{humanizeFieldKey(fieldKey)}</p>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 mt-2">
                                                        {permissionModelRoleOptions.map((role) => (
                                                            <label key={`${fieldKey}-${role}`} className="inline-flex items-center gap-2 text-[12px] text-[#374151]">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={visibleTo.includes(role)}
                                                                    onChange={() => toggleFieldVisibilityRole(fieldKey, role)}
                                                                />
                                                                {titleCase(role)}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-3 border border-[#E5E7EB] rounded-[8px] p-3 bg-white">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <p className="text-[13px] font-[700] text-[#111827]">Access Denials and Policy Audit</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] text-[#6B7280]">Showing {filteredTeamAccessAudit.length} / {teamAccessAudit.length}</span>
                                            <button
                                                type="button"
                                                className="h-[30px] px-2 rounded-[6px] border border-[#D1D5DB] text-[11px] font-[700] text-[#374151] disabled:opacity-50"
                                                onClick={exportAuditCsv}
                                                disabled={filteredTeamAccessAudit.length === 0}
                                            >
                                                Export CSV
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                                        <select
                                            className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                            value={auditTypeFilter}
                                            onChange={(e) => setAuditTypeFilter(e.target.value)}
                                        >
                                            <option value="all">All Event Types</option>
                                            <option value="denied">Denied Only</option>
                                            <option value="updated">Policy Updated Only</option>
                                        </select>

                                        <select
                                            className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                            value={auditResourceFilter}
                                            onChange={(e) => setAuditResourceFilter(e.target.value)}
                                        >
                                            <option value="all">All Resources</option>
                                            {auditResourceOptions.map((resource) => (
                                                <option key={resource} value={resource}>{titleCase(resource)}</option>
                                            ))}
                                        </select>

                                        <input
                                            className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                            placeholder="Search reason, scope, action"
                                            value={auditSearch}
                                            onChange={(e) => setAuditSearch(e.target.value)}
                                        />
                                    </div>

                                    <div className="max-h-[280px] overflow-y-auto border border-[#E5E7EB] rounded-[8px]">
                                        {auditPagination.rows.length === 0 && (
                                            <p className="text-[12px] text-[#6B7280] px-3 py-3">No Team Access audit events found yet.</p>
                                        )}

                                        {auditPagination.rows.map((event) => {
                                            const isDenied = event.action === "courier_permission_denied";
                                            const meta = event.metadata && typeof event.metadata === "object" ? event.metadata : {};

                                            return (
                                                <div key={event.id} className="px-3 py-2 border-b border-[#E5E7EB] last:border-b-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-[12px] font-[700] text-[#111827]">{isDenied ? "Permission Denied" : "Policy Updated"}</p>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-[700] ${isDenied ? "bg-[#FEE2E2] text-[#B91C1C]" : "bg-[#DCFCE7] text-[#166534]"}`}>
                                                            {isDenied ? "Denied" : "Updated"}
                                                        </span>
                                                    </div>

                                                    <p className="text-[11px] text-[#374151] mt-1">{event.description || "-"}</p>

                                                    <div className="text-[11px] text-[#6B7280] mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                                        {meta.resource && <span>Resource: {titleCase(meta.resource)}</span>}
                                                        {meta.requested_action && <span>Action: {titleCase(meta.requested_action)}</span>}
                                                        {meta.scope && <span>Scope: {titleCase(meta.scope)}</span>}
                                                        {meta.reason && <span>Reason: {titleCase(meta.reason)}</span>}
                                                        {meta.mode && <span>Mode: {titleCase(meta.mode)}</span>}
                                                    </div>

                                                    <p className="text-[10px] text-[#9CA3AF] mt-1">{event.createdAt || "-"}</p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-2 flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            className="h-[30px] px-2 rounded-[6px] border border-[#D1D5DB] text-[11px] font-[700] text-[#374151] disabled:opacity-50"
                                            disabled={auditPagination.currentPage <= 1}
                                            onClick={() => setAuditPage((prev) => Math.max(1, prev - 1))}
                                        >
                                            Prev
                                        </button>
                                        <span className="text-[11px] text-[#6B7280]">
                                            Page {auditPagination.currentPage} of {auditPagination.totalPages}
                                        </span>
                                        <button
                                            type="button"
                                            className="h-[30px] px-2 rounded-[6px] border border-[#D1D5DB] text-[11px] font-[700] text-[#374151] disabled:opacity-50"
                                            disabled={auditPagination.currentPage >= auditPagination.totalPages}
                                            onClick={() => setAuditPage((prev) => Math.min(auditPagination.totalPages, prev + 1))}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                                </>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTeamAccessTopic === "user-defaults" && (
                        <div className="border border-[#E5E7EB] rounded-[10px] p-4 bg-[#FAFBFD]">
                            <p className="text-[15px] font-[700] text-[#111827]">Team User Creation Defaults</p>
                            <p className="text-[12px] text-[#6B7280] mt-1">Configure default direct permissions, data scope defaults, and available onboarding bundles used during team-user creation.</p>

                            <div className="mt-3 mb-2">
                                <label className="text-[12px] font-[700] text-[#374151]">Role To Configure</label>
                                <select
                                    className="mt-1 h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[13px]"
                                    disabled={!canAssignPermissions}
                                    value={activeRoleForDefaults}
                                    onChange={(e) => setActiveRoleForDefaults(e.target.value)}
                                >
                                    {teamRoleOptions.map((role) => (
                                        <option key={role} value={role}>{titleCase(role)}</option>
                                    ))}
                                </select>
                            </div>

                            <p className="text-[12px] font-[700] text-[#374151] mt-3 mb-2">Default Direct Permissions For Selected Role</p>
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
                                                            checked={activeRoleDefaultPermissions.includes(perm)}
                                                            onChange={() => toggleRoleDefaultPermission(perm)}
                                                        />
                                                        {perm}
                                                    </label>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 border border-[#E5E7EB] rounded-[8px] p-3 bg-white">
                                <p className="text-[12px] font-[700] text-[#374151] mb-2">Default Data Scope For Selected Role</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <Field label="Scope Level">
                                        <select
                                            className="h-[38px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[13px] leading-[1.2]"
                                            disabled={!canAssignPermissions}
                                            value={activeRoleDefaultDataScope.scope}
                                            onChange={(e) => updateRoleDefaultDataScope("scope", e.target.value)}
                                        >
                                            {permissionScopes.map((scope) => (
                                                <option key={scope} value={scope}>{titleCase(scope)}</option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>

                                {(scopeZoneOptions.length > 0 || scopeHubOptions.length > 0) && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">
                                        <div>
                                            <p className="text-[11px] font-[700] text-[#6B7280] mb-1">Region Zones</p>
                                            <div className="flex flex-wrap gap-2">
                                                {scopeZoneOptions.map((zone) => (
                                                    <label key={`${activeRoleForDefaults}-zone-${zone}`} className="inline-flex items-center gap-1 text-[11px] text-[#374151]">
                                                        <input
                                                            type="checkbox"
                                                            disabled={!canAssignPermissions}
                                                            checked={activeRoleDefaultDataScope.regionZones.includes(zone)}
                                                            onChange={() => toggleRoleDefaultDataScopeArray("regionZones", zone)}
                                                        />
                                                        {zone}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[11px] font-[700] text-[#6B7280] mb-1">Hub Branches</p>
                                            <div className="flex flex-wrap gap-2">
                                                {scopeHubOptions.map((hub) => (
                                                    <label key={`${activeRoleForDefaults}-hub-${hub}`} className="inline-flex items-center gap-1 text-[11px] text-[#374151]">
                                                        <input
                                                            type="checkbox"
                                                            disabled={!canAssignPermissions}
                                                            checked={activeRoleDefaultDataScope.hubBranches.includes(hub)}
                                                            onChange={() => toggleRoleDefaultDataScopeArray("hubBranches", hub)}
                                                        />
                                                        {hub}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {(settings.team?.teamAccessControl?.onboardingBundles || []).length > 0 && (
                                <div className="mt-4 border border-[#E5E7EB] rounded-[8px] p-3 bg-white">
                                    <p className="text-[13px] font-[700] text-[#111827] mb-2">Optional Onboarding Bundles</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {settings.team.teamAccessControl.onboardingBundles.map((bundle) => (
                                            <div key={bundle.key} className="border border-[#E5E7EB] rounded-[8px] p-2">
                                                <p className="text-[12px] font-[700]">{bundle.label}</p>
                                                <p className="text-[11px] text-[#6B7280] mt-1">Role: {titleCase(bundle.role)}</p>
                                                {bundle.description && <p className="text-[11px] text-[#6B7280] mt-1">{bundle.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTeamAccessTopic === "role-studio" && (
                        <div className="border border-[#E5E7EB] rounded-[10px] p-4 bg-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                            <p className="text-[16px] font-[700] text-[#111827]">Role Studio</p>
                            <p className="text-[12px] text-[#6B7280] mt-1">Create custom roles, generate from templates, clone existing roles, and review role version history.</p>
                        </div>
                        <button
                            type="button"
                            disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy}
                            onClick={refreshRoleStudioRoles}
                            className="h-[34px] px-3 rounded-[8px] border border-[#D1D5DB] text-[12px] font-[700] disabled:opacity-50"
                        >
                            Refresh Roles
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                        <input
                            className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                            placeholder="Search role by name or label"
                            value={roleCatalogSearch}
                            onChange={(e) => setRoleCatalogSearch(e.target.value)}
                        />
                        <select
                            className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                            value={roleTypeFilter}
                            onChange={(e) => setRoleTypeFilter(e.target.value)}
                        >
                            <option value="all">All Role Types</option>
                            <option value="predefined">Predefined</option>
                            <option value="template">Template</option>
                            <option value="clone">Clone</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                        <div className="border border-[#E5E7EB] rounded-[8px] p-3 bg-[#FAFBFD]">
                            <p className="text-[13px] font-[700] text-[#111827] mb-2">Create Custom Role</p>
                            <p className="text-[11px] text-[#6B7280] mb-2">Uses the permission matrix in "Edit Selected Role Permissions" below.</p>
                            <div className="grid grid-cols-1 gap-2">
                                <input
                                    className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                    placeholder="Role name (e.g. last_mile_ops)"
                                    disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy}
                                    value={roleForm.name}
                                    onChange={(e) => setRoleForm((prev) => ({ ...prev, name: e.target.value }))}
                                />
                                <input
                                    className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                    placeholder="Role label"
                                    disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy}
                                    value={roleForm.label}
                                    onChange={(e) => setRoleForm((prev) => ({ ...prev, label: e.target.value }))}
                                />
                                <textarea
                                    rows={2}
                                    className="rounded-[8px] border border-[#D1D5DB] px-2 py-1 text-[12px]"
                                    placeholder="Role description"
                                    disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy}
                                    value={roleForm.description}
                                    onChange={(e) => setRoleForm((prev) => ({ ...prev, description: e.target.value }))}
                                />
                                {(roleFormErrors.name || roleFormErrors.label || roleFormErrors.permissions) && (
                                    <p className="text-[11px] text-[#B91C1C]">
                                        {roleFormErrors.name || roleFormErrors.label || roleFormErrors.permissions}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy}
                                    onClick={createCustomRole}
                                    className="h-[34px] rounded-[8px] bg-[#0955AC] text-white text-[12px] font-[700] disabled:opacity-50"
                                >
                                    Create Custom Role
                                </button>
                            </div>
                        </div>

                        <div className="border border-[#E5E7EB] rounded-[8px] p-3 bg-[#FAFBFD]">
                            <p className="text-[13px] font-[700] text-[#111827] mb-2">Create From Template</p>
                            <div className="grid grid-cols-1 gap-2">
                                <select
                                    className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                    disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy}
                                    value={roleTemplateForm.template}
                                    onChange={(e) => setRoleTemplateForm((prev) => ({ ...prev, template: e.target.value }))}
                                >
                                    {Object.keys(roleStudioTemplates).map((template) => (
                                        <option key={template} value={template}>{titleCase(template)}</option>
                                    ))}
                                </select>
                                <input
                                    className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                    placeholder="New role name"
                                    disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy}
                                    value={roleTemplateForm.name}
                                    onChange={(e) => setRoleTemplateForm((prev) => ({ ...prev, name: e.target.value }))}
                                />
                                <input
                                    className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                    placeholder="Role label (optional)"
                                    disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy}
                                    value={roleTemplateForm.label}
                                    onChange={(e) => setRoleTemplateForm((prev) => ({ ...prev, label: e.target.value }))}
                                />
                                {(roleTemplateFormErrors.template || roleTemplateFormErrors.name) && (
                                    <p className="text-[11px] text-[#B91C1C]">
                                        {roleTemplateFormErrors.template || roleTemplateFormErrors.name}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy}
                                    onClick={createRoleFromTemplate}
                                    className="h-[34px] rounded-[8px] bg-[#0F766E] text-white text-[12px] font-[700] disabled:opacity-50"
                                >
                                    Create From Template
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                        <div className="border border-[#E5E7EB] rounded-[8px] p-3 bg-[#FAFBFD]">
                            <p className="text-[13px] font-[700] text-[#111827] mb-2">Clone Existing Role</p>
                            <div className="grid grid-cols-1 gap-2">
                                <select
                                    className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                    disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy}
                                    value={roleCloneForm.sourceRole}
                                    onChange={(e) => setRoleCloneForm((prev) => ({ ...prev, sourceRole: e.target.value }))}
                                >
                                    {roleStudioRoles.map((role) => (
                                        <option key={role.name} value={role.name}>{role.label || titleCase(role.name)}</option>
                                    ))}
                                </select>
                                <input
                                    className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                    placeholder="Cloned role name"
                                    disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy}
                                    value={roleCloneForm.name}
                                    onChange={(e) => setRoleCloneForm((prev) => ({ ...prev, name: e.target.value }))}
                                />
                                <input
                                    className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                    placeholder="Cloned role label"
                                    disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy}
                                    value={roleCloneForm.label}
                                    onChange={(e) => setRoleCloneForm((prev) => ({ ...prev, label: e.target.value }))}
                                />
                                {(roleCloneFormErrors.sourceRole || roleCloneFormErrors.name) && (
                                    <p className="text-[11px] text-[#B91C1C]">
                                        {roleCloneFormErrors.sourceRole || roleCloneFormErrors.name}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy || !roleCloneForm.sourceRole}
                                    onClick={cloneExistingRole}
                                    className="h-[34px] rounded-[8px] bg-[#92400E] text-white text-[12px] font-[700] disabled:opacity-50"
                                >
                                    Clone Role
                                </button>
                            </div>
                        </div>

                        <div className="border border-[#E5E7EB] rounded-[8px] p-3 bg-[#FAFBFD]">
                            <p className="text-[13px] font-[700] text-[#111827] mb-2">Role Catalog</p>
                            <select
                                className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px] w-full"
                                value={selectedRoleName}
                                onChange={(e) => setSelectedRoleName(e.target.value)}
                            >
                                {filteredRoleStudioRoles.map((role) => (
                                    <option key={role.name} value={role.name}>{role.label || titleCase(role.name)}</option>
                                ))}
                            </select>
                            {filteredRoleStudioRoles.length === 0 && (
                                <p className="text-[11px] text-[#6B7280] mt-1">No roles found for selected filter/search.</p>
                            )}
                            {selectedRole && (
                                <div className="mt-2 text-[12px] text-[#374151] space-y-1">
                                    <p><span className="font-[700]">Type:</span> {titleCase(selectedRole.sourceType || "custom")}</p>
                                    <p><span className="font-[700]">Latest Version:</span> v{selectedRole.latestVersion || 1}</p>
                                    <p><span className="font-[700]">Template:</span> {selectedRole.template || "-"}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 border border-[#E5E7EB] rounded-[8px] p-3">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <p className="text-[13px] font-[700] text-[#111827]">Edit Selected Role Permissions</p>
                            <input
                                className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px] md:w-[260px]"
                                placeholder="Search permissions"
                                value={roleStudioPermissionSearch}
                                onChange={(e) => setRoleStudioPermissionSearch(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            <input
                                className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                placeholder="Selected role label"
                                disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy || !selectedRole}
                                value={roleForm.label}
                                onChange={(e) => setRoleForm((prev) => ({ ...prev, label: e.target.value }))}
                            />
                            <input
                                className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                placeholder="Selected role description"
                                disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy || !selectedRole}
                                value={roleForm.description}
                                onChange={(e) => setRoleForm((prev) => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        {(roleFormErrors.label || roleFormErrors.permissions) && (
                            <p className="text-[11px] text-[#B91C1C] mt-2">
                                {roleFormErrors.label || roleFormErrors.permissions}
                            </p>
                        )}

                        <div className="max-h-[240px] overflow-y-auto border border-[#E5E7EB] rounded-[8px] p-2 mt-2 bg-[#FAFBFD]">
                            {Object.keys(groupedRoleStudioPermissions).map((group) => (
                                <div key={group} className="mb-2">
                                    <p className="text-[11px] font-[700] uppercase text-[#6B7280] mb-1">{titleCase(group)}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {groupedRoleStudioPermissions[group]
                                            .filter((perm) => perm.toLowerCase().includes(roleStudioPermissionSearch.toLowerCase()))
                                            .map((perm) => (
                                                <label key={perm} className="inline-flex items-center gap-2 text-[12px]">
                                                    <input
                                                        type="checkbox"
                                                        disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy || !selectedRole}
                                                        checked={roleForm.permissions.includes(perm)}
                                                        onChange={() => setRoleForm((prev) => ({ ...prev, permissions: toggleInArray(prev.permissions, perm) }))}
                                                    />
                                                    {perm}
                                                </label>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end mt-3">
                            <button
                                type="button"
                                disabled={!canAssignRole || !canAssignPermissions || roleStudioBusy || !selectedRole}
                                onClick={saveRoleEdits}
                                className="h-[34px] px-3 rounded-[8px] bg-[#111827] text-white text-[12px] font-[700] disabled:opacity-50"
                            >
                                Save Role Changes
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 border border-[#E5E7EB] rounded-[8px] p-3 bg-[#FAFBFD]">
                        <p className="text-[13px] font-[700] text-[#111827] mb-2">Version Timeline</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                            <select
                                className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                value={leftVersionNumber}
                                onChange={(e) => setLeftVersionNumber(e.target.value)}
                            >
                                {roleVersionTimeline.map((version) => (
                                    <option key={`left-${version.version}`} value={String(version.version)}>
                                        Left: v{version.version}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="h-[34px] rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                value={rightVersionNumber}
                                onChange={(e) => setRightVersionNumber(e.target.value)}
                            >
                                {roleVersionTimeline.map((version) => (
                                    <option key={`right-${version.version}`} value={String(version.version)}>
                                        Right: v{version.version}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedLeftVersion && selectedRightVersion && (
                            <div className="border border-[#D1D5DB] rounded-[8px] p-2 bg-white mb-2">
                                <p className="text-[12px] font-[700] text-[#111827]">
                                    Permission Diff: v{selectedLeftVersion.version}{" -> "}v{selectedRightVersion.version}
                                </p>
                                <p className="text-[11px] text-[#166534] mt-1">Added: {roleVersionDiff.added.length}</p>
                                {roleVersionDiff.added.length > 0 && (
                                    <p className="text-[11px] text-[#374151]">{roleVersionDiff.added.join(", ")}</p>
                                )}
                                <p className="text-[11px] text-[#B91C1C] mt-1">Removed: {roleVersionDiff.removed.length}</p>
                                {roleVersionDiff.removed.length > 0 && (
                                    <p className="text-[11px] text-[#374151]">{roleVersionDiff.removed.join(", ")}</p>
                                )}
                            </div>
                        )}

                        <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2">
                            {loadingRoleVersions && (
                                <p className="text-[12px] text-[#6B7280]">Loading role versions...</p>
                            )}

                            {!loadingRoleVersions && roleVersionTimeline.length === 0 && (
                                <p className="text-[12px] text-[#6B7280]">No versions available for selected role.</p>
                            )}

                            {!loadingRoleVersions && roleVersionTimeline.map((version) => (
                                <div key={`${selectedRoleName}-${version.version}`} className="border border-[#D1D5DB] rounded-[8px] p-2 bg-white">
                                    <p className="text-[12px] font-[700] text-[#111827]">v{version.version} • {titleCase(version.changeType)}</p>
                                    <p className="text-[11px] text-[#6B7280] mt-1">{version.createdAt || "-"}</p>
                                    <p className="text-[11px] text-[#374151] mt-1">Permissions: {Array.isArray(version.permissions) ? version.permissions.length : 0}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                        </div>
                    )}
                </SectionCard>
            </div>
        );
    })();

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
    );
};

export default Settings;
