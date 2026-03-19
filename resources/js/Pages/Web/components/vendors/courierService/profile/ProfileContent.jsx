import React, { useEffect, useMemo, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { Building2, Eye, EyeOff, FileCheck2, KeyRound, ShieldCheck, Users } from "lucide-react";
import CourierFeedbackModal from "../common/CourierFeedbackModal";
import useCourierActionModal from "../common/useCourierActionModal";

const EMPTY = {
    isTeamUser: false,
    profile: {
        logoUrl: null,
        companyName: "",
        displayName: "",
        businessRegistrationNo: "",
        taxId: "",
        website: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        supportEmail: "",
        supportHotline: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        publicAbout: "",
        publicSupportHours: "",
        status: "draft",
        reviewedAt: "",
        adminNotes: "",
    },
    summary: {
        completionScore: 0,
        approvedServices: 0,
        pendingServices: 0,
        rejectedServices: 0,
    },
    serviceEnrollment: [],
    activity: [],
};

const statusBadge = (status) => {
    switch (status) {
        case "approved":
            return "bg-[#DCFCE7] text-[#166534]";
        case "submitted":
            return "bg-[#DBEAFE] text-[#1D4ED8]";
        case "revision_requested":
            return "bg-[#FEF3C7] text-[#92400E]";
        case "rejected":
            return "bg-[#FEE2E2] text-[#991B1B]";
        default:
            return "bg-[#F3F4F6] text-[#374151]";
    }
};

const titleCase = (value) => String(value || "").replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const TAB_CONFIG = [
    { key: "company", label: "Company Info", icon: Building2 },
    { key: "security", label: "Security", icon: KeyRound },
    { key: "compliance", label: "Compliance", icon: FileCheck2 },
    { key: "services", label: "Service Access", icon: ShieldCheck },
    { key: "activity", label: "Activity Log", icon: Users },
];

const TAB_FIELDS = {
    company: [
        "companyName",
        "displayName",
        "businessRegistrationNo",
        "taxId",
        "website",
        "contactPerson",
        "contactEmail",
        "contactPhone",
        "supportEmail",
        "supportHotline",
        "addressLine1",
        "addressLine2",
        "city",
        "state",
        "postalCode",
        "country",
        "publicAbout",
        "publicSupportHours",
    ],
    security: [],
    compliance: [],
    services: [],
    activity: [],
};

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

const ErrorText = ({ children }) => (children ? <p className="text-[11px] text-[#DC2626] mt-1">{children}</p> : null);

const ProfileContent = () => {
    const props = usePage().props;
    const courierProfile = props.courierProfile || EMPTY;
    const isTeamUser = Boolean(courierProfile.isTeamUser);
    const flash = props.flash || {};
    const errors = props.errors || {};
    const logoInputRef = useRef(null);
    const [logoPreview, setLogoPreview] = useState(courierProfile.profile.logoUrl || null);
    const [logoFile, setLogoFile] = useState(null);
    const [clientErrors, setClientErrors] = useState({});

    const [activeTab, setActiveTab] = useState("company");
    const initialForm = useMemo(() => ({
        companyName: courierProfile.profile.companyName || "",
        displayName: courierProfile.profile.displayName || "",
        businessRegistrationNo: courierProfile.profile.businessRegistrationNo || "",
        taxId: courierProfile.profile.taxId || "",
        website: courierProfile.profile.website || "",
        contactPerson: courierProfile.profile.contactPerson || "",
        contactEmail: courierProfile.profile.contactEmail || "",
        contactPhone: courierProfile.profile.contactPhone || "",
        supportEmail: courierProfile.profile.supportEmail || "",
        supportHotline: courierProfile.profile.supportHotline || "",
        addressLine1: courierProfile.profile.addressLine1 || "",
        addressLine2: courierProfile.profile.addressLine2 || "",
        city: courierProfile.profile.city || "",
        state: courierProfile.profile.state || "",
        postalCode: courierProfile.profile.postalCode || "",
        country: courierProfile.profile.country || "",
        publicAbout: courierProfile.profile.publicAbout || "",
        publicSupportHours: courierProfile.profile.publicSupportHours || "",
    }), [courierProfile.profile]);

    const [form, setForm] = useState(initialForm);
    const [baselineForm, setBaselineForm] = useState(initialForm);
    const [securityForm, setSecurityForm] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        next: false,
        confirm: false,
    });

    const {
        feedback,
        closeFeedback,
        setFeedback,
        confirmState,
        openConfirm,
        closeConfirm,
        runConfirm,
    } = useCourierActionModal(flash, 2800);

    const serviceRows = Array.isArray(courierProfile.serviceEnrollment) ? courierProfile.serviceEnrollment : [];
    const activityRows = Array.isArray(courierProfile.activity) ? courierProfile.activity : [];
    const isCompanyDirty = JSON.stringify(form) !== JSON.stringify(baselineForm) || Boolean(logoFile);
    const isSecurityDirty = Object.values(securityForm).some((value) => String(value || "").trim() !== "");
    const isDirty = isCompanyDirty || isSecurityDirty;
    const editableTab = activeTab === "company" || activeTab === "security";
    const isTabDirty = activeTab === "security"
        ? isSecurityDirty
        : (TAB_FIELDS[activeTab].some((field) => form[field] !== baselineForm[field]) || (activeTab === "company" && Boolean(logoFile)));
    const hasSecurityOpenParam = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tab") === "security";
    const visibleTabs = isTeamUser
        ? TAB_CONFIG.filter((tab) => ["company", "security"].includes(tab.key))
        : TAB_CONFIG;

    useEffect(() => {
        if (!hasSecurityOpenParam) {
            return;
        }

        setActiveTab("security");
    }, [hasSecurityOpenParam]);

    const summaryCards = useMemo(
        () => isTeamUser
            ? [
                { key: "completionScore", label: "Profile Completion", value: `${courierProfile.summary.completionScore}%` },
            ]
            : [
                { key: "completionScore", label: "Profile Completion", value: `${courierProfile.summary.completionScore}%` },
                { key: "approvedServices", label: "Approved Services", value: courierProfile.summary.approvedServices },
                { key: "pendingServices", label: "Pending Services", value: courierProfile.summary.pendingServices },
                { key: "rejectedServices", label: "Rejected Services", value: courierProfile.summary.rejectedServices },
            ],
        [courierProfile.summary, isTeamUser],
    );

    const saveProfile = () => {
        if (!String(form.companyName || "").trim()) {
            setClientErrors((prev) => ({ ...prev, companyName: "Company name is required." }));
            return;
        }

        openConfirm({
            title: "Save Courier Profile",
            message: "Save profile updates now?",
            onConfirm: () => {
                router.post(route("courierService.profile.update"), { ...form, logo: logoFile, section: activeTab }, {
                    preserveScroll: true,
                    preserveState: true,
                    forceFormData: true,
                    onSuccess: () => {
                        setBaselineForm(form);
                        setLogoFile(null);
                    },
                    onError: () => {
                        setFeedback({ type: "error", message: "Failed to save courier profile. Please review inputs." });
                    },
                });
            },
        });
    };

    const saveSecurity = () => {
        const currentPassword = String(securityForm.current_password || "").trim();
        const newPassword = String(securityForm.password || "").trim();
        const confirmPassword = String(securityForm.password_confirmation || "").trim();

        if (!currentPassword || !newPassword || !confirmPassword) {
            setFeedback({ type: "error", message: "Please fill current, new, and confirm password fields." });
            return;
        }

        if (newPassword !== confirmPassword) {
            setFeedback({ type: "error", message: "New password and confirmation do not match." });
            return;
        }

        openConfirm({
            title: "Update Password",
            message: "Save your new account password now?",
            onConfirm: () => {
                router.put(route("password.update"), securityForm, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        setSecurityForm({
                            current_password: "",
                            password: "",
                            password_confirmation: "",
                        });
                        setFeedback({ type: "success", message: "Password updated successfully." });
                    },
                    onError: () => {
                        setFeedback({ type: "error", message: "Failed to update password. Check your current password and try again." });
                    },
                });
            },
        });
    };

    const handleTabChange = (nextTab) => {
        if (nextTab === activeTab) {
            return;
        }

        if (!isDirty) {
            setActiveTab(nextTab);
            return;
        }

        openConfirm({
            title: "Unsaved Changes",
            message: "You have unsaved profile changes. Switch tab without saving?",
            onConfirm: () => setActiveTab(nextTab),
        });
    };

    const removeLogo = () => {
        openConfirm({
            title: isTeamUser ? "Remove Profile Picture" : "Remove Profile Logo",
            message: isTeamUser ? "Remove your current profile picture?" : "Remove the current company logo from profile?",
            onConfirm: () => {
                router.delete(route("courierService.profile.logo.remove"), {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        setLogoPreview(null);
                        setLogoFile(null);
                    },
                    onError: () => {
                        setFeedback({ type: "error", message: "Failed to remove profile logo." });
                    },
                });
            },
        });
    };

    const onLogoChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
            setClientErrors((prev) => ({ ...prev, logo: isTeamUser ? "Please upload a JPG, PNG, or WEBP profile picture." : "Please upload JPG, PNG, or WEBP image." }));
            return;
        }

        if (file.size > 3 * 1024 * 1024) {
            setClientErrors((prev) => ({ ...prev, logo: isTeamUser ? "Profile picture must be under 3MB." : "Logo must be under 3MB." }));
            return;
        }

        setClientErrors((prev) => ({ ...prev, logo: undefined }));
        setLogoFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            setLogoPreview(e.target?.result || null);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="w-full h-auto lg:pl-4 lg:pr-5 pt-6 pb-12">
            <CourierFeedbackModal
                open={Boolean(feedback)}
                type={feedback?.type || "info"}
                message={feedback?.message || ""}
                onClose={closeFeedback}
            />
            onConfirm={
                typeof feedback?.message === "string" && feedback.message.toLowerCase().includes("please update your password before continuing")
                    ? () => { closeFeedback(); setActiveTab("security"); }
                    : undefined
            }

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
                    <h1 className="figtree text-[34px] font-[700]">{isTeamUser ? "My Courier Profile" : "Courier Profile"}</h1>
                    <p className="text-[14px] text-[#6B7280] mt-1">
                        {isTeamUser
                            ? "Manage your personal profile details used in courier team workflows."
                            : "Manage business identity, compliance readiness, service enrollment, and account activity."}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={activeTab === "security" ? saveSecurity : saveProfile}
                    disabled={!isDirty || !editableTab}
                    className="h-[38px] px-5 rounded-[8px] bg-[#0955AC] text-white text-[13px] font-[700] disabled:opacity-50"
                >
                    {activeTab === "security" ? "Update Password" : "Save Profile"}
                </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 ${isTeamUser ? "xl:grid-cols-1" : "xl:grid-cols-4"} gap-4 mb-5`}>
                {summaryCards.map((card) => (
                    <div key={card.key} className="bg-white rounded-[10px] px-4 py-3" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
                        <p className="text-[12px] text-[#6B7280] font-[600]">{card.label}</p>
                        <p className="text-[26px] leading-tight font-[700] mt-1">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[250px_1fr] gap-5">
                <div className="bg-white rounded-[10px] p-4 h-fit" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
                    <p className="text-[12px] text-[#6B7280] font-[700] uppercase tracking-wide mb-3">{isTeamUser ? "My Profile" : "Profile Modules"}</p>
                    <div className="space-y-2">
                        {visibleTabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleTabChange(tab.key)}
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
                    {activeTab === "company" && (
                        <SectionCard title={isTeamUser ? "My Account Profile" : "Company and Contact Profile"} description={isTeamUser ? "Personal identity and contact details for your courier team account." : "Core identity and operational contacts used in courier workflows."}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2 border border-[#E5E7EB] rounded-[8px] p-4 flex items-center gap-4">
                                    <div className="h-[72px] w-[72px] rounded-full bg-[#F3F4F6] overflow-hidden flex items-center justify-center text-[11px] text-[#6B7280]">
                                        {logoPreview ? <img src={logoPreview} alt={isTeamUser ? "Profile picture" : "Company logo"} className="h-full w-full object-cover" /> : (isTeamUser ? "No Photo" : "No Logo")}
                                    </div>
                                    <div>
                                        <input ref={logoInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={onLogoChange} />
                                        <div className="flex gap-2">
                                            <button type="button" className="h-[34px] px-3 rounded-[8px] bg-[#0955AC] text-white text-[12px] font-[700]" onClick={() => logoInputRef.current?.click()}>
                                                {isTeamUser ? "Upload Profile Picture" : "Upload Logo"}
                                            </button>
                                            {logoPreview && (
                                                <button type="button" className="h-[34px] px-3 rounded-[8px] border border-[#DC2626] text-[#DC2626] text-[12px] font-[700]" onClick={removeLogo}>
                                                    {isTeamUser ? "Remove Picture" : "Remove Logo"}
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-[#6B7280] mt-1">{isTeamUser ? "JPG, PNG, WEBP profile picture up to 3MB." : "JPG, PNG, WEBP up to 3MB."}</p>
                                        <ErrorText>{clientErrors.logo || errors.logo}</ErrorText>
                                    </div>
                                </div>
                                <Field label={isTeamUser ? "Full Name" : "Company Name"}><input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.companyName} onChange={(e) => { setForm((prev) => ({ ...prev, companyName: e.target.value })); setClientErrors((prev) => ({ ...prev, companyName: undefined })); }} /><ErrorText>{clientErrors.companyName || errors.companyName}</ErrorText></Field>
                                <Field label="Display Name"><input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.displayName} onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))} /></Field>
                                {!isTeamUser && <Field label="Business Registration No"><input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.businessRegistrationNo} onChange={(e) => setForm((prev) => ({ ...prev, businessRegistrationNo: e.target.value }))} /><ErrorText>{errors.businessRegistrationNo}</ErrorText></Field>}
                                {!isTeamUser && <Field label="Tax ID"><input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.taxId} onChange={(e) => setForm((prev) => ({ ...prev, taxId: e.target.value }))} /><ErrorText>{errors.taxId}</ErrorText></Field>}
                                <Field label="Contact Person"><input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.contactPerson} onChange={(e) => setForm((prev) => ({ ...prev, contactPerson: e.target.value }))} /></Field>
                                <Field label="Contact Email"><input type="email" className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.contactEmail} onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))} /><ErrorText>{errors.contactEmail}</ErrorText></Field>
                                <Field label="Contact Phone"><input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.contactPhone} onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))} /><ErrorText>{errors.contactPhone}</ErrorText></Field>
                                <Field label="Website"><input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.website} onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))} /><ErrorText>{errors.website}</ErrorText></Field>
                                {!isTeamUser && <Field label="Support Email"><input type="email" className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.supportEmail} onChange={(e) => setForm((prev) => ({ ...prev, supportEmail: e.target.value }))} /><ErrorText>{errors.supportEmail}</ErrorText></Field>}
                                {!isTeamUser && <Field label="Support Hotline"><input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.supportHotline} onChange={(e) => setForm((prev) => ({ ...prev, supportHotline: e.target.value }))} /><ErrorText>{errors.supportHotline}</ErrorText></Field>}
                                <Field label="Address Line 1"><input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.addressLine1} onChange={(e) => setForm((prev) => ({ ...prev, addressLine1: e.target.value }))} /></Field>
                                <Field label="Address Line 2"><input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.addressLine2} onChange={(e) => setForm((prev) => ({ ...prev, addressLine2: e.target.value }))} /></Field>
                                <Field label="City"><input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} /></Field>
                                <Field label="State"><input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.state} onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))} /></Field>
                                <Field label="Postal Code"><input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.postalCode} onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))} /><ErrorText>{errors.postalCode}</ErrorText></Field>
                                <Field label="Country"><input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.country} onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))} /></Field>
                                {!isTeamUser && <div className="md:col-span-2">
                                    <Field label="Public About"><textarea rows={3} className="w-full rounded-[8px] border border-[#D1D5DB]" value={form.publicAbout} onChange={(e) => setForm((prev) => ({ ...prev, publicAbout: e.target.value }))} /></Field>
                                </div>}
                                {!isTeamUser && <Field label="Public Support Hours"><input className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB]" value={form.publicSupportHours} onChange={(e) => setForm((prev) => ({ ...prev, publicSupportHours: e.target.value }))} /></Field>}
                            </div>
                        </SectionCard>
                    )}

                    {activeTab === "security" && (
                        <SectionCard title="Profile Security" description="Change your account password and keep your team access secure.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Current Password">
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB] pr-10"
                                            value={securityForm.current_password}
                                            onChange={(e) => setSecurityForm((prev) => ({ ...prev, current_password: e.target.value }))}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 px-3 text-[#6B7280] hover:text-[#111827]"
                                            onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                                        >
                                            {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <ErrorText>{errors.current_password}</ErrorText>
                                </Field>
                                <div />
                                <Field label="New Password">
                                    <div className="relative">
                                        <input
                                            type={showPasswords.next ? "text" : "password"}
                                            className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB] pr-10"
                                            value={securityForm.password}
                                            onChange={(e) => setSecurityForm((prev) => ({ ...prev, password: e.target.value }))}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 px-3 text-[#6B7280] hover:text-[#111827]"
                                            onClick={() => setShowPasswords((prev) => ({ ...prev, next: !prev.next }))}
                                        >
                                            {showPasswords.next ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <ErrorText>{errors.password}</ErrorText>
                                </Field>
                                <Field label="Confirm New Password">
                                    <div className="relative">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            className="w-full h-[42px] rounded-[8px] border border-[#D1D5DB] pr-10"
                                            value={securityForm.password_confirmation}
                                            onChange={(e) => setSecurityForm((prev) => ({ ...prev, password_confirmation: e.target.value }))}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 px-3 text-[#6B7280] hover:text-[#111827]"
                                            onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                                        >
                                            {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <ErrorText>{errors.password_confirmation}</ErrorText>
                                </Field>
                            </div>
                        </SectionCard>
                    )}

                    {activeTab === "compliance" && (
                        <SectionCard title="Compliance and Verification" description="Current compliance status for vendor profile verification.">
                            <div className="space-y-3 text-[14px]">
                                <p><span className="font-[700]">Submission Status:</span> <span className={`ml-2 px-2 py-1 rounded-full text-[11px] font-[700] ${statusBadge(courierProfile.profile.status)}`}>{titleCase(courierProfile.profile.status)}</span></p>
                                <p><span className="font-[700]">Reviewed At:</span> {courierProfile.profile.reviewedAt || "-"}</p>
                                <p><span className="font-[700]">Admin Notes:</span> {courierProfile.profile.adminNotes || "No notes"}</p>
                            </div>
                        </SectionCard>
                    )}

                    {activeTab === "services" && (
                        <SectionCard title="Service Enrollment" description="All registered service sub-categories and their approval state.">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-[13px]">
                                    <thead className="bg-[#D8E4F2]">
                                        <tr>
                                            <th className="px-3 py-3 font-[700]">Service</th>
                                            <th className="px-3 py-3 font-[700]">Category</th>
                                            <th className="px-3 py-3 font-[700]">Status</th>
                                            <th className="px-3 py-3 font-[700]">Submitted</th>
                                            <th className="px-3 py-3 font-[700]">Reviewed</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {serviceRows.length > 0 ? serviceRows.map((row) => (
                                            <tr key={row.id} className="border-b border-[#E5E7EB]">
                                                <td className="px-3 py-3">{row.service || "-"}</td>
                                                <td className="px-3 py-3">{row.category || "-"}</td>
                                                <td className="px-3 py-3"><span className={`px-2 py-1 rounded-full text-[11px] font-[700] ${statusBadge(row.status)}`}>{titleCase(row.status)}</span></td>
                                                <td className="px-3 py-3">{row.submittedAt || "-"}</td>
                                                <td className="px-3 py-3">{row.reviewedAt || "-"}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-3 py-8 text-center text-[#6B7280]">No service enrollment records found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>
                    )}

                    {activeTab === "activity" && (
                        <SectionCard title="Recent Activity" description="Latest account-level activity records for this vendor.">
                            <div className="space-y-2">
                                {activityRows.length > 0 ? activityRows.map((item) => (
                                    <div key={item.id} className="border border-[#E5E7EB] rounded-[8px] px-3 py-3">
                                        <p className="text-[13px] font-[700]">{item.description}</p>
                                        <p className="text-[11px] text-[#6B7280] mt-1">{titleCase(item.action)} • {item.createdAt || "-"}</p>
                                    </div>
                                )) : (
                                    <p className="text-[13px] text-[#6B7280]">No recent activity records.</p>
                                )}
                            </div>
                        </SectionCard>
                    )}

                    <div className="flex items-center justify-end gap-3">
                        {!editableTab && <p className="text-[12px] text-[#6B7280]">This tab is view-only.</p>}
                        <button
                            type="button"
                            onClick={activeTab === "security" ? saveSecurity : saveProfile}
                            disabled={!isDirty || !editableTab || !isTabDirty}
                            className="h-[38px] px-5 rounded-[8px] bg-[#111827] text-white text-[13px] font-[700] disabled:opacity-50"
                        >
                            {activeTab === "security" ? "Update Password" : "Save Current Tab"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileContent;
