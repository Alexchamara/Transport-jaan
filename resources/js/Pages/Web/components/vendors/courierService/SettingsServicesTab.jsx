import React from "react";

const SectionCard = ({ title, description, children }) => (
    <div className="bg-white rounded-[10px] p-5 md:p-6" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
        <div className="mb-4">
            <h2 className="text-[18px] font-[700] text-[#111827]">{title}</h2>
            {description && <p className="text-[12px] text-[#6B7280] mt-1">{description}</p>}
        </div>
        {children}
    </div>
);

const Toggle = ({ label, checked, onChange, description, disabled = false }) => (
    <div className={`flex items-start justify-between gap-3 border border-[#E5E7EB] rounded-[8px] px-3 py-3 ${disabled ? "opacity-50" : ""}`}>
        <div>
            <p className="text-[13px] font-[700] text-[#111827]">{label}</p>
            {description && <p className="text-[11px] text-[#6B7280] mt-0.5">{description}</p>}
        </div>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-disabled={disabled}
            disabled={disabled}
            onClick={() => {
                if (disabled) {
                    return;
                }
                onChange(!checked);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-[#0955AC]" : "bg-[#D1D5DB]"} ${disabled ? "cursor-not-allowed" : ""}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
        </button>
    </div>
);

const Field = ({ label, children, help }) => (
    <label className="block">
        <span className="text-[13px] font-[700] text-[#374151]">{label}</span>
        <div className="mt-1">{children}</div>
        {help && <p className="text-[11px] text-[#6B7280] mt-1">{help}</p>}
    </label>
);

const SettingsServicesTab = (props) => {
    const {
        codCapabilityCanRequest,
        codCapabilityCategoryLabel,
        codCapabilityDecisionReason,
        codCapabilityRequestedAt,
        codCapabilityReviewedAt,
        codCapabilityReviewedBy,
        codCapabilityStatus,
        codCapabilityStatusLabel,
        codRequestBusy,
        codRequestNote,
        codStatusTone,
        servicesCodSettings,
        setCodRequestNote,
        submitCodCapabilityRequest,
        updateServiceCodValue,
    } = props;

            return (
                <div className="space-y-4">
                    <SectionCard title="Service Capabilities" description="Configure operational service behavior and request controlled capability enablement.">
                        <p className="text-[12px] text-[#6B7280] mb-3">COD capability applies to domestic routes only.</p>

                        <div className={`rounded-[10px] border px-4 py-3 ${codStatusTone}`}>
                            <p className="text-[13px] font-[700]">{codCapabilityCategoryLabel} COD Capability Status: {codCapabilityStatusLabel}</p>
                            <p className="text-[12px] mt-1">
                                {codCapabilityStatus === "approved" && `Your courier workspace is approved to operate ${codCapabilityCategoryLabel.toLowerCase()} COD bookings.`}
                                {codCapabilityStatus === "pending" && `Your ${codCapabilityCategoryLabel.toLowerCase()} COD request is pending superadmin review.`}
                                {codCapabilityStatus === "rejected" && `Your previous ${codCapabilityCategoryLabel.toLowerCase()} COD request was rejected. Update details and re-submit.`}
                                {codCapabilityStatus === "not_requested" && `${codCapabilityCategoryLabel} COD is not enabled yet. Submit a request for superadmin approval.`}
                            </p>
                            {codCapabilityRequestedAt && (
                                <p className="text-[11px] mt-2">Requested at: {codCapabilityRequestedAt}</p>
                            )}
                            {codCapabilityReviewedAt && (
                                <p className="text-[11px] mt-1">Reviewed at: {codCapabilityReviewedAt}{codCapabilityReviewedBy ? ` by ${codCapabilityReviewedBy}` : ""}</p>
                            )}
                            {codCapabilityDecisionReason && (
                                <p className="text-[11px] mt-1">Decision note: {codCapabilityDecisionReason}</p>
                            )}
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Toggle
                                label="Allow COD At Checkout"
                                checked={Boolean(servicesCodSettings.acceptCodAtCheckout)}
                                onChange={(next) => updateServiceCodValue("acceptCodAtCheckout", next)}
                                description="Expose COD as an option during courier booking checkout."
                            />
                            <Toggle
                                label="Allow Domestic COD"
                                checked={Boolean(servicesCodSettings.allowCodForDomestic)}
                                onChange={(next) => updateServiceCodValue("allowCodForDomestic", next)}
                                description="Keep domestic COD path active once capability is approved."
                            />
                            <Toggle
                                label="Allow Team Override"
                                checked={Boolean(servicesCodSettings.allowTeamOverride)}
                                onChange={(next) => updateServiceCodValue("allowTeamOverride", next)}
                                description="Use only with explicit COD override permissions for authorized staff."
                            />
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3">
                            <Field label={`${codCapabilityCategoryLabel} COD Request Note`} help="Share readiness details such as SOP, collection controls, and reconciliation process.">
                                <textarea
                                    rows={3}
                                    className="w-full rounded-[8px] border border-[#D1D5DB]"
                                    value={codRequestNote}
                                    onChange={(event) => setCodRequestNote(event.target.value)}
                                    placeholder="COD readiness summary..."
                                />
                            </Field>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={submitCodCapabilityRequest}
                                    disabled={!codCapabilityCanRequest || codRequestBusy}
                                    className="h-[38px] px-5 rounded-[8px] bg-[#0955AC] text-white text-[13px] font-[700] disabled:opacity-50"
                                >
                                    {codRequestBusy
                                        ? "Submitting..."
                                        : (codCapabilityStatus === "rejected"
                                            ? `Re-submit ${codCapabilityCategoryLabel} COD Request`
                                            : `Submit ${codCapabilityCategoryLabel} COD Request`)}
                                </button>
                            </div>
                        </div>
                    </SectionCard>
                </div>
            );
};

export default SettingsServicesTab;
