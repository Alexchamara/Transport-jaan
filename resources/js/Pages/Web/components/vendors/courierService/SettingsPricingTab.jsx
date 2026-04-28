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

const Field = ({ label, children, help }) => (
    <label className="block">
        <span className="text-[13px] font-[700] text-[#374151]">{label}</span>
        <div className="mt-1">{children}</div>
        {help && <p className="text-[11px] text-[#6B7280] mt-1">{help}</p>}
    </label>
);

const SettingsPricingTab = (props) => {
    const {
        CURRENCY_OPTIONS,
        DEFAULT_SETTINGS,
        PRICING_TOPIC_CONFIG,
        activeInternationalDimensionsEngine,
        activeLaneEnabled,
        activeLaneRows,
        activePricingApprovalAuthority,
        activePricingCategory,
        activePricingFormula,
        activePricingGovernance,
        activePricingLocalization,
        activePricingPolicyModules,
        activePricingRows,
        activePricingTopic,
        activePricingZones,
        activeServiceCatalogRows,
        activeServiceLevelOptions,
        activeSpeedEtaTierEngine,
        activeSpeedEtaTierRows,
        activeZoneOptions,
        addPricingLaneRule,
        addPricingServiceLevel,
        addPricingTier,
        addPricingZone,
        applyPricingImportToDraft,
        canConfigurePricingGovernance,
        canPublishPricingChanges,
        canReviewPricingPublish,
        fetchLiveExchangeRates,
        formatMoney,
        formatMultiplierMapInput,
        governanceApproverRoleOptions,
        isSuperAdminPricingAuthority,
        liveRateBusy,
        navigatePricingCategory,
        navigatePricingTopic,
        normalizeImportCityKey,
        openAddTierModal,
        parseCommaList,
        parseMultiplierMapInput,
        pendingApprovalRequestedByCurrentActor,
        previewPricingImport,
        pricingGovernanceActionBusy,
        pricingGovernanceNote,
        pricingImportApplyBusy,
        pricingImportFile,
        pricingImportManualResolutions,
        pricingImportManualReviewConfirmed,
        pricingImportMode,
        pricingImportPreviewBusy,
        pricingImportPreviewToken,
        pricingImportResolutionStrategy,
        pricingImportResult,
        pricingPreviewInput,
        pricingPreviewRows,
        pricingPublishAt,
        pricingRollbackVersion,
        pricingZoneDraft,
        removePricingLaneRule,
        removePricingServiceLevel,
        removePricingTier,
        removePricingTierEngineTier,
        removePricingZone,
        rollbackCandidates,
        runPricingGovernanceAction,
        setPricingGovernanceNote,
        setPricingImportFile,
        setPricingImportManualResolutions,
        setPricingImportManualReviewConfirmed,
        setPricingImportMode,
        setPricingImportPreviewToken,
        setPricingImportResolutionStrategy,
        setPricingImportResult,
        setPricingPreviewInput,
        setPricingPublishAt,
        setPricingRollbackVersion,
        setPricingZoneDraft,
        titleCase,
        toggleInArray,
        updatePricingFormula,
        updatePricingGovernance,
        updatePricingLaneMatrix,
        updatePricingLaneRule,
        updatePricingLocalization,
        updatePricingPolicyModule,
        updatePricingServiceLevel,
        updatePricingTier,
        updatePricingTierEngineTier,
        updatePricingZone,
        visiblePricingCategoryOptions,
    } = props;

            if (visiblePricingCategoryOptions.length === 0) {
                return (
                    <SectionCard title="Advanced Pricing" description="Configure domestic/international rate cards with category-based approvals.">
                        <p className="text-[12px] text-[#B45309]">
                            Pricing setup is locked because no courier pricing category is approved yet. Ask super admin to approve Domestic and/or international courier registration.
                        </p>
                    </SectionCard>
                );
            }

            return (
                <div className="space-y-4">
                    <div className="bg-white rounded-[10px] p-4" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-[12px] text-[#6B7280] font-[700] uppercase tracking-wide">Pricing Category</p>
                                <p className="text-[12px] text-[#475569] mt-1">Switch between Domestic and International pricing using URL-based tabs.</p>
                            </div>
                            <div className="inline-flex rounded-[8px] border border-[#D1D5DB] p-1 bg-[#F8FAFC]">
                                {visiblePricingCategoryOptions.map((item) => (
                                    <button
                                        key={`pricing-category-tab-${item.key}`}
                                        type="button"
                                        className={`h-[30px] px-4 rounded-[6px] text-[12px] font-[700] transition-colors ${activePricingCategory === item.key ? "bg-[#0955AC] text-white" : "text-[#475569] hover:text-[#1F2937]"}`}
                                        onClick={() => navigatePricingCategory(item.key)}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {visiblePricingCategoryOptions.length === 1 && (
                            <p className="mt-2 text-[11px] text-[#64748B]">
                                Pricing is currently available only for {titleCase(visiblePricingCategoryOptions[0].key)} based on super admin service approval.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-5">
                        <div className="bg-white rounded-[10px] p-4 h-fit" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
                            <p className="text-[12px] text-[#6B7280] font-[700] uppercase tracking-wide mb-3">Pricing Topics</p>
                            <div className="space-y-2">
                                {PRICING_TOPIC_CONFIG.map((topic) => (
                                    <button
                                        key={topic.key}
                                        type="button"
                                        onClick={() => navigatePricingTopic(topic.key, { category: activePricingCategory })}
                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-left text-[13px] font-[700] transition-colors ${activePricingTopic === topic.key
                                                ? "bg-[#0955AC] text-white"
                                                : "bg-[#F3F4F6] text-[#374151]"
                                            }`}
                                    >
                                        <span>{topic.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <SectionCard title="Advanced Pricing" description={`Configure ${titleCase(activePricingCategory)} rate cards, localized currency display, and formula controls for accurate quote calculations.`}>
                            <div className="space-y-4">
                            {activePricingTopic === "currency-formula" && (
                                <div id="pricing-topic-currency-formula" className="grid grid-cols-1 lg:grid-cols-2 gap-4 scroll-mt-24">
                                    <div className="border border-[#E5E7EB] rounded-[10px] p-3 bg-[#F8FAFC]">
                                        <p className="text-[13px] font-[700] text-[#111827] mb-2">Currency Localization</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <Field label="Base Currency">
                                                <select
                                                    className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                    value={String(activePricingLocalization.baseCurrency || "LKR").toUpperCase()}
                                                    onChange={(e) => updatePricingLocalization(activePricingCategory, "baseCurrency", String(e.target.value || "LKR").toUpperCase())}
                                                >
                                                    {CURRENCY_OPTIONS.map((currencyCode) => (
                                                        <option key={`base_currency_${currencyCode}`} value={currencyCode}>{currencyCode}</option>
                                                    ))}
                                                </select>
                                            </Field>
                                            <Field label="Display Currency">
                                                <select
                                                    className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                    value={String(activePricingLocalization.displayCurrency || "LKR").toUpperCase()}
                                                    onChange={(e) => updatePricingLocalization(activePricingCategory, "displayCurrency", String(e.target.value || "LKR").toUpperCase())}
                                                >
                                                    {CURRENCY_OPTIONS.map((currencyCode) => (
                                                        <option key={`display_currency_${currencyCode}`} value={currencyCode}>{currencyCode}</option>
                                                    ))}
                                                </select>
                                            </Field>
                                            <Field label="Locale">
                                                <input
                                                    className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                    value={String(activePricingLocalization.locale || "en-LK")}
                                                    onChange={(e) => updatePricingLocalization(activePricingCategory, "locale", e.target.value)}
                                                    placeholder="en-LK"
                                                />
                                            </Field>
                                            <Field label="Display Exchange Rate">
                                                <input
                                                    type="number"
                                                    min={0.000001}
                                                    step="0.000001"
                                                    className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                    value={Number((activePricingLocalization.manualRates || {})[String(activePricingLocalization.displayCurrency || "LKR").toUpperCase()] || 1)}
                                                    onChange={(e) => {
                                                        const displayCurrency = String(activePricingLocalization.displayCurrency || "LKR").toUpperCase();
                                                        const nextRate = Math.max(0.000001, Number(e.target.value || 1));
                                                        const currentManual = activePricingLocalization.manualRates || {};
                                                        updatePricingLocalization(activePricingCategory, "manualRates", {
                                                            ...currentManual,
                                                            [String(activePricingLocalization.baseCurrency || "LKR").toUpperCase()]: 1,
                                                            [displayCurrency]: nextRate,
                                                        });
                                                    }}
                                                />
                                            </Field>
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                disabled={liveRateBusy}
                                                className="h-[32px] px-3 rounded-[8px] border border-[#0955AC] text-[#0955AC] text-[11px] font-[700] disabled:opacity-50"
                                                onClick={fetchLiveExchangeRates}
                                            >
                                                {liveRateBusy ? "Syncing..." : "Sync Live Rates"}
                                            </button>
                                            <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(activePricingLocalization.autoLiveRates)}
                                                    onChange={(e) => updatePricingLocalization(activePricingCategory, "autoLiveRates", e.target.checked)}
                                                />
                                                Enable live-rate strategy
                                            </label>
                                            <span className="text-[11px] text-[#64748B]">
                                                Provider: {activePricingLocalization.exchangeRateProvider || "frankfurter.app"}
                                            </span>
                                            <span className="text-[11px] text-[#64748B]">
                                                Last Sync: {activePricingLocalization.lastSyncedAt || "Not synced"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border border-[#E5E7EB] rounded-[10px] p-3 bg-[#F8FAFC]">
                                        <p className="text-[13px] font-[700] text-[#111827] mb-2">Formula Controls ({titleCase(activePricingCategory)})</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Field label="Volumetric Divisor">
                                                <input type="number" min={1} className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingFormula.volumetricDivisor || 5000)} onChange={(e) => updatePricingFormula(activePricingCategory, "volumetricDivisor", Number(e.target.value || 5000))} />
                                            </Field>
                                            <Field label="Fuel Surcharge %">
                                                <input type="number" min={0} step="0.01" className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingFormula.fuelSurchargePercent || 0)} onChange={(e) => updatePricingFormula(activePricingCategory, "fuelSurchargePercent", Number(e.target.value || 0))} />
                                            </Field>
                                            <Field label="Handling Fee">
                                                <input type="number" min={0} step="0.01" className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingFormula.handlingFee || 0)} onChange={(e) => updatePricingFormula(activePricingCategory, "handlingFee", Number(e.target.value || 0))} />
                                            </Field>
                                            <Field label="Tax %">
                                                <input type="number" min={0} step="0.01" className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingFormula.taxPercent || 0)} onChange={(e) => updatePricingFormula(activePricingCategory, "taxPercent", Number(e.target.value || 0))} />
                                            </Field>
                                        </div>
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(activePricingFormula.useChargeableWeight)}
                                                    onChange={(e) => updatePricingFormula(activePricingCategory, "useChargeableWeight", e.target.checked)}
                                                />
                                                Use chargeable weight
                                            </label>
                                            <Field label="Round Decimals">
                                                <input type="number" min={0} max={4} className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingFormula.roundTo || 2)} onChange={(e) => updatePricingFormula(activePricingCategory, "roundTo", Number(e.target.value || 2))} />
                                            </Field>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activePricingTopic === "policy-modules" && (
                                <div id="pricing-topic-policy-modules" className="mt-4 border border-[#E5E7EB] rounded-[10px] p-3 bg-[#F8FAFC] scroll-mt-24">
                                    <p className="text-[13px] font-[700] text-[#111827] mb-2">Rule-Based Policy Modules ({titleCase(activePricingCategory)})</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-3 md:col-span-2">
                                            <p className="text-[12px] font-[700] text-[#111827]">Speed/ETA Explicit Tier Engine</p>
                                            <p className="text-[11px] text-[#64748B] mt-1">Manage your own tiers with explicit ETA ranges, constraints, and optional tier price multipliers.</p>
                                            <div className="mt-2 flex flex-wrap gap-3">
                                                <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(activeSpeedEtaTierEngine?.enabled)}
                                                        onChange={(e) => updatePricingPolicyModule(activePricingCategory, "speedEtaTierEngine", "enabled", e.target.checked)}
                                                    />
                                                    Enable
                                                </label>
                                                <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(activeSpeedEtaTierEngine?.enforceFixedNamedTiers)}
                                                        onChange={(e) => updatePricingPolicyModule(activePricingCategory, "speedEtaTierEngine", "enforceFixedNamedTiers", e.target.checked)}
                                                    />
                                                    Require Selected Service Tier To Exist
                                                </label>
                                                <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(activeSpeedEtaTierEngine?.enforceTierPricingMultiplier)}
                                                        onChange={(e) => updatePricingPolicyModule(activePricingCategory, "speedEtaTierEngine", "enforceTierPricingMultiplier", e.target.checked)}
                                                    />
                                                    Enforce Tier Price Multiplier
                                                </label>
                                                <button
                                                    type="button"
                                                    className="h-[30px] px-3 rounded-[8px] border border-[#0955AC] text-[#0955AC] text-[11px] font-[700]"
                                                    onClick={() => openAddTierModal(activePricingCategory)}
                                                >
                                                    Add Tier
                                                </button>
                                            </div>

                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full min-w-[1200px] text-[12px]">
                                                    <thead>
                                                        <tr className="bg-[#F8FAFC] text-left border border-[#E5E7EB]">
                                                            <th className="px-2 py-2">Tier</th>
                                                            <th className="px-2 py-2">Enabled</th>
                                                            <th className="px-2 py-2">ETA Label</th>
                                                            <th className="px-2 py-2">ETA Min Days</th>
                                                            <th className="px-2 py-2">ETA Max Days</th>
                                                            <th className="px-2 py-2">Price Multiplier</th>
                                                            <th className="px-2 py-2">Max Distance (km)</th>
                                                            <th className="px-2 py-2">Max Weight (kg)</th>
                                                            <th className="px-2 py-2">Min Lead Hours</th>
                                                            <th className="px-2 py-2">Max Lead Hours</th>
                                                            <th className="px-2 py-2">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {activeSpeedEtaTierRows.map((tier) => {
                                                            const tierRow = tier.row || {};
                                                            return (
                                                                <tr key={`speed-eta-tier-${tier.key}`} className="border-x border-b border-[#E5E7EB]">
                                                                    <td className="px-2 py-2 font-[700] text-[#0F172A]">{tier.key}</td>
                                                                    <td className="px-2 py-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={Boolean(tierRow?.enabled)}
                                                                            onChange={(e) => updatePricingTierEngineTier(activePricingCategory, tier.key, "enabled", e.target.checked)}
                                                                        />
                                                                    </td>
                                                                    <td className="px-2 py-2"><input className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2" value={String(tierRow?.etaLabel || titleCase(tier.key))} onChange={(e) => updatePricingTierEngineTier(activePricingCategory, tier.key, "etaLabel", e.target.value)} /></td>
                                                                    <td className="px-2 py-2"><input type="number" min={0} step="1" className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2" value={Number(tierRow?.etaMinDays ?? 0)} onChange={(e) => updatePricingTierEngineTier(activePricingCategory, tier.key, "etaMinDays", Number(e.target.value || 0))} /></td>
                                                                    <td className="px-2 py-2"><input type="number" min={0} step="1" className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2" value={tierRow?.etaMaxDays === null || tierRow?.etaMaxDays === undefined ? "" : Number(tierRow?.etaMaxDays ?? 0)} onChange={(e) => updatePricingTierEngineTier(activePricingCategory, tier.key, "etaMaxDays", e.target.value === "" ? null : Number(e.target.value || 0))} placeholder="No cap" /></td>
                                                                    <td className="px-2 py-2"><input type="number" min={0.1} step="0.01" className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2" value={Number(tierRow?.priceMultiplier ?? 1)} onChange={(e) => updatePricingTierEngineTier(activePricingCategory, tier.key, "priceMultiplier", Number(e.target.value || 1))} /></td>
                                                                    <td className="px-2 py-2"><input type="number" min={0.1} step="0.1" className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2" value={tierRow?.maxDistanceKm === null || tierRow?.maxDistanceKm === undefined ? "" : Number(tierRow?.maxDistanceKm ?? 0)} onChange={(e) => updatePricingTierEngineTier(activePricingCategory, tier.key, "maxDistanceKm", e.target.value === "" ? null : Number(e.target.value || 0))} placeholder="No cap" /></td>
                                                                    <td className="px-2 py-2"><input type="number" min={0.1} step="0.1" className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2" value={tierRow?.maxWeightKg === null || tierRow?.maxWeightKg === undefined ? "" : Number(tierRow?.maxWeightKg ?? 0)} onChange={(e) => updatePricingTierEngineTier(activePricingCategory, tier.key, "maxWeightKg", e.target.value === "" ? null : Number(e.target.value || 0))} placeholder="No cap" /></td>
                                                                    <td className="px-2 py-2"><input type="number" min={0} step="0.25" className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2" value={Number(tierRow?.minLeadHours ?? 0)} onChange={(e) => updatePricingTierEngineTier(activePricingCategory, tier.key, "minLeadHours", Number(e.target.value || 0))} /></td>
                                                                    <td className="px-2 py-2"><input type="number" min={0} step="0.25" className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2" value={tierRow?.maxLeadHours === null || tierRow?.maxLeadHours === undefined ? "" : Number(tierRow?.maxLeadHours ?? 0)} onChange={(e) => updatePricingTierEngineTier(activePricingCategory, tier.key, "maxLeadHours", e.target.value === "" ? null : Number(e.target.value || 0))} placeholder="No cap" /></td>
                                                                    <td className="px-2 py-2">
                                                                        <button
                                                                            type="button"
                                                                            className="h-[28px] px-2 rounded-[6px] border border-[#DC2626] text-[#DC2626] text-[11px] font-[700]"
                                                                            onClick={() => removePricingTierEngineTier(activePricingCategory, tier.key)}
                                                                        >
                                                                            Remove
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {activeSpeedEtaTierRows.map((tier) => {
                                                    const tierRow = tier.row || {};
                                                    return (
                                                        <div key={`speed-eta-tier-list-${tier.key}`} className="rounded-[8px] border border-[#E5E7EB] p-2">
                                                            <p className="text-[11px] font-[700] text-[#0F172A]">{tierRow?.etaLabel || titleCase(tier.key)} Constraints</p>
                                                            <Field label="Allowed Pickup Days (1-7, comma-separated)">
                                                                <input
                                                                    className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                                    value={Array.isArray(tierRow?.allowedPickupDays) ? tierRow.allowedPickupDays.join(", ") : "1, 2, 3, 4, 5, 6, 7"}
                                                                    onChange={(e) => updatePricingTierEngineTier(
                                                                        activePricingCategory,
                                                                        tier.key,
                                                                        "allowedPickupDays",
                                                                        parseCommaList(e.target.value, (item) => Number(item)).filter((item) => Number.isInteger(item) && item >= 1 && item <= 7),
                                                                    )}
                                                                />
                                                            </Field>
                                                            <Field label="Blackout Dates (YYYY-MM-DD, comma-separated)">
                                                                <input
                                                                    className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                                    value={Array.isArray(tierRow?.blackoutDates) ? tierRow.blackoutDates.join(", ") : ""}
                                                                    onChange={(e) => updatePricingTierEngineTier(activePricingCategory, tier.key, "blackoutDates", parseCommaList(e.target.value))}
                                                                    placeholder="2026-12-25, 2027-01-01"
                                                                />
                                                            </Field>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {activePricingCategory === "international" && (
                                            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-3 md:col-span-2">
                                                <p className="text-[12px] font-[700] text-[#111827]">International Dimensions Engine</p>
                                                <p className="text-[11px] text-[#64748B] mt-1">Enforce unit type, route class, handling class, and W2W option multipliers. Keys should match shipment inputs.</p>
                                                <div className="mt-2 flex flex-wrap gap-3">
                                                    <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(activeInternationalDimensionsEngine?.enabled)}
                                                            onChange={(e) => updatePricingPolicyModule(activePricingCategory, "internationalDimensionsEngine", "enabled", e.target.checked)}
                                                        />
                                                        Enable
                                                    </label>
                                                    <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(activeInternationalDimensionsEngine?.enforceForInternationalOnly)}
                                                            onChange={(e) => updatePricingPolicyModule(activePricingCategory, "internationalDimensionsEngine", "enforceForInternationalOnly", e.target.checked)}
                                                        />
                                                        Enforce for International category only
                                                    </label>
                                                    <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(activeInternationalDimensionsEngine?.w2wOption?.enabled)}
                                                            onChange={(e) => updatePricingPolicyModule(
                                                                activePricingCategory,
                                                                "internationalDimensionsEngine",
                                                                "w2wOption",
                                                                {
                                                                    ...(activeInternationalDimensionsEngine?.w2wOption || DEFAULT_SETTINGS.pricing.policyModules[activePricingCategory].internationalDimensionsEngine.w2wOption),
                                                                    enabled: e.target.checked,
                                                                },
                                                            )}
                                                        />
                                                        Enable W2W mode engine
                                                    </label>
                                                </div>

                                                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                                                    <Field label="Unit Type Multipliers (key: value)">
                                                        <textarea
                                                            rows={5}
                                                            className="w-full rounded-[8px] border border-[#D1D5DB] px-2 py-2 text-[12px]"
                                                            value={formatMultiplierMapInput(activeInternationalDimensionsEngine?.unitTypeMultipliers || {})}
                                                            onChange={(e) => updatePricingPolicyModule(activePricingCategory, "internationalDimensionsEngine", "unitTypeMultipliers", parseMultiplierMapInput(e.target.value))}
                                                            placeholder={"parcel: 1.0\npallet: 1.18\ncrate: 1.24"}
                                                        />
                                                    </Field>
                                                    <Field label="Route Class Multipliers (key: value)">
                                                        <textarea
                                                            rows={5}
                                                            className="w-full rounded-[8px] border border-[#D1D5DB] px-2 py-2 text-[12px]"
                                                            value={formatMultiplierMapInput(activeInternationalDimensionsEngine?.routeClassMultipliers || {})}
                                                            onChange={(e) => updatePricingPolicyModule(activePricingCategory, "internationalDimensionsEngine", "routeClassMultipliers", parseMultiplierMapInput(e.target.value))}
                                                            placeholder={"standard: 1.0\nexpress_corridor: 1.12\nremote_corridor: 1.22"}
                                                        />
                                                    </Field>
                                                    <Field label="Handling Class Multipliers (key: value)">
                                                        <textarea
                                                            rows={5}
                                                            className="w-full rounded-[8px] border border-[#D1D5DB] px-2 py-2 text-[12px]"
                                                            value={formatMultiplierMapInput(activeInternationalDimensionsEngine?.handlingClassMultipliers || {})}
                                                            onChange={(e) => updatePricingPolicyModule(activePricingCategory, "internationalDimensionsEngine", "handlingClassMultipliers", parseMultiplierMapInput(e.target.value))}
                                                            placeholder={"standard: 1.0\nfragile: 1.08\nhazardous: 1.2"}
                                                        />
                                                    </Field>
                                                </div>

                                                <div className="mt-3 rounded-[8px] border border-[#E5E7EB] p-3">
                                                    <p className="text-[11px] font-[700] text-[#111827]">W2W Option Policy</p>
                                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-2">
                                                        <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                            <input
                                                                type="checkbox"
                                                                checked={Boolean(activeInternationalDimensionsEngine?.w2wOption?.strictForInternational)}
                                                                onChange={(e) => updatePricingPolicyModule(
                                                                    activePricingCategory,
                                                                    "internationalDimensionsEngine",
                                                                    "w2wOption",
                                                                    {
                                                                        ...(activeInternationalDimensionsEngine?.w2wOption || DEFAULT_SETTINGS.pricing.policyModules[activePricingCategory].internationalDimensionsEngine.w2wOption),
                                                                        strictForInternational: e.target.checked,
                                                                    },
                                                                )}
                                                            />
                                                            Strict for international
                                                        </label>
                                                        <Field label="Default Mode">
                                                            <input
                                                                className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                                value={String(activeInternationalDimensionsEngine?.w2wOption?.defaultMode || "")}
                                                                onChange={(e) => updatePricingPolicyModule(
                                                                    activePricingCategory,
                                                                    "internationalDimensionsEngine",
                                                                    "w2wOption",
                                                                    {
                                                                        ...(activeInternationalDimensionsEngine?.w2wOption || DEFAULT_SETTINGS.pricing.policyModules[activePricingCategory].internationalDimensionsEngine.w2wOption),
                                                                        defaultMode: String(e.target.value || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""),
                                                                    },
                                                                )}
                                                            />
                                                        </Field>
                                                        <Field label="Min Unit Count">
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                step="1"
                                                                className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                                value={Number(activeInternationalDimensionsEngine?.w2wOption?.minimumUnitCount || 1)}
                                                                onChange={(e) => updatePricingPolicyModule(
                                                                    activePricingCategory,
                                                                    "internationalDimensionsEngine",
                                                                    "w2wOption",
                                                                    {
                                                                        ...(activeInternationalDimensionsEngine?.w2wOption || DEFAULT_SETTINGS.pricing.policyModules[activePricingCategory].internationalDimensionsEngine.w2wOption),
                                                                        minimumUnitCount: Number(e.target.value || 1),
                                                                    },
                                                                )}
                                                            />
                                                        </Field>
                                                        <Field label="Max Unit Count (optional)">
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                step="1"
                                                                className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                                value={activeInternationalDimensionsEngine?.w2wOption?.maximumUnitCount === null || activeInternationalDimensionsEngine?.w2wOption?.maximumUnitCount === undefined ? "" : Number(activeInternationalDimensionsEngine?.w2wOption?.maximumUnitCount || 1)}
                                                                onChange={(e) => updatePricingPolicyModule(
                                                                    activePricingCategory,
                                                                    "internationalDimensionsEngine",
                                                                    "w2wOption",
                                                                    {
                                                                        ...(activeInternationalDimensionsEngine?.w2wOption || DEFAULT_SETTINGS.pricing.policyModules[activePricingCategory].internationalDimensionsEngine.w2wOption),
                                                                        maximumUnitCount: e.target.value === "" ? null : Number(e.target.value || 1),
                                                                    },
                                                                )}
                                                            />
                                                        </Field>
                                                    </div>
                                                    <Field label="W2W Mode Multipliers (key: value)">
                                                        <textarea
                                                            rows={4}
                                                            className="w-full rounded-[8px] border border-[#D1D5DB] px-2 py-2 text-[12px]"
                                                            value={formatMultiplierMapInput(activeInternationalDimensionsEngine?.w2wOption?.modeMultipliers || {})}
                                                            onChange={(e) => updatePricingPolicyModule(
                                                                activePricingCategory,
                                                                "internationalDimensionsEngine",
                                                                "w2wOption",
                                                                {
                                                                    ...(activeInternationalDimensionsEngine?.w2wOption || DEFAULT_SETTINGS.pricing.policyModules[activePricingCategory].internationalDimensionsEngine.w2wOption),
                                                                    modeMultipliers: parseMultiplierMapInput(e.target.value),
                                                                },
                                                            )}
                                                            placeholder={"door_to_door: 1.15\nport_to_port: 0.92\nhybrid: 1.0"}
                                                        />
                                                    </Field>
                                                </div>
                                            </div>
                                        )}

                                        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-3">
                                            <p className="text-[12px] font-[700] text-[#111827]">Remote Area Surcharge</p>
                                            <label className="mt-2 inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(activePricingPolicyModules.remoteAreaSurcharge?.enabled)}
                                                    onChange={(e) => updatePricingPolicyModule(activePricingCategory, "remoteAreaSurcharge", "enabled", e.target.checked)}
                                                />
                                                Enable
                                            </label>
                                            <div className="mt-2 grid grid-cols-2 gap-2">
                                                <Field label="Flat Fee">
                                                    <input type="number" min={0} step="0.01" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingPolicyModules.remoteAreaSurcharge?.flatFee || 0)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "remoteAreaSurcharge", "flatFee", Number(e.target.value || 0))} />
                                                </Field>
                                                <div className="grid grid-cols-1 gap-1">
                                                    <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                        <input type="checkbox" checked={Boolean(activePricingPolicyModules.remoteAreaSurcharge?.applyOnOrigin)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "remoteAreaSurcharge", "applyOnOrigin", e.target.checked)} />
                                                        Apply on origin
                                                    </label>
                                                    <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                        <input type="checkbox" checked={Boolean(activePricingPolicyModules.remoteAreaSurcharge?.applyOnDestination)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "remoteAreaSurcharge", "applyOnDestination", e.target.checked)} />
                                                        Apply on destination
                                                    </label>
                                                </div>
                                            </div>
                                            <Field label="Postal Prefixes (comma-separated)">
                                                <input
                                                    className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                    value={(activePricingPolicyModules.remoteAreaSurcharge?.postalCodePrefixes || []).join(", ")}
                                                    onChange={(e) => updatePricingPolicyModule(activePricingCategory, "remoteAreaSurcharge", "postalCodePrefixes", parseCommaList(e.target.value, (item) => item.toUpperCase()))}
                                                    placeholder="81, 82"
                                                />
                                            </Field>
                                            <Field label="City Keywords (comma-separated)">
                                                <input
                                                    className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                    value={(activePricingPolicyModules.remoteAreaSurcharge?.cityKeywords || []).join(", ")}
                                                    onChange={(e) => updatePricingPolicyModule(activePricingCategory, "remoteAreaSurcharge", "cityKeywords", parseCommaList(e.target.value, (item) => item.toLowerCase()))}
                                                    placeholder="rural, mountain"
                                                />
                                            </Field>
                                        </div>

                                        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-3">
                                            <p className="text-[12px] font-[700] text-[#111827]">Oversize / Overweight Rules</p>
                                            <label className="mt-2 inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(activePricingPolicyModules.oversizeOverweightRules?.enabled)}
                                                    onChange={(e) => updatePricingPolicyModule(activePricingCategory, "oversizeOverweightRules", "enabled", e.target.checked)}
                                                />
                                                Enable
                                            </label>
                                            <div className="mt-2 grid grid-cols-2 gap-2">
                                                <Field label="Max Weight (kg)"><input type="number" min={0.1} step="0.1" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingPolicyModules.oversizeOverweightRules?.maxWeightKg || 25)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "oversizeOverweightRules", "maxWeightKg", Number(e.target.value || 25))} /></Field>
                                                <Field label="Overweight Fee / kg"><input type="number" min={0} step="0.01" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingPolicyModules.oversizeOverweightRules?.overweightPerKgFee || 0)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "oversizeOverweightRules", "overweightPerKgFee", Number(e.target.value || 0))} /></Field>
                                                <Field label="Max Length (cm)"><input type="number" min={1} step="1" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingPolicyModules.oversizeOverweightRules?.maxLengthCm || 120)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "oversizeOverweightRules", "maxLengthCm", Number(e.target.value || 120))} /></Field>
                                                <Field label="Max Width (cm)"><input type="number" min={1} step="1" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingPolicyModules.oversizeOverweightRules?.maxWidthCm || 80)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "oversizeOverweightRules", "maxWidthCm", Number(e.target.value || 80))} /></Field>
                                                <Field label="Max Height (cm)"><input type="number" min={1} step="1" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingPolicyModules.oversizeOverweightRules?.maxHeightCm || 80)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "oversizeOverweightRules", "maxHeightCm", Number(e.target.value || 80))} /></Field>
                                                <Field label="Oversize Flat Fee"><input type="number" min={0} step="0.01" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingPolicyModules.oversizeOverweightRules?.oversizeFlatFee || 0)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "oversizeOverweightRules", "oversizeFlatFee", Number(e.target.value || 0))} /></Field>
                                            </div>
                                        </div>

                                        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-3">
                                            <p className="text-[12px] font-[700] text-[#111827]">Peak Hour / Holiday Surcharges</p>
                                            <label className="mt-2 inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(activePricingPolicyModules.peakHolidaySurcharge?.enabled)}
                                                    onChange={(e) => updatePricingPolicyModule(activePricingCategory, "peakHolidaySurcharge", "enabled", e.target.checked)}
                                                />
                                                Enable
                                            </label>
                                            <div className="mt-2 grid grid-cols-2 gap-2">
                                                <Field label="Peak Start"><input type="time" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={String(activePricingPolicyModules.peakHolidaySurcharge?.peakStartTime || "17:00")} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "peakHolidaySurcharge", "peakStartTime", e.target.value)} /></Field>
                                                <Field label="Peak End"><input type="time" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={String(activePricingPolicyModules.peakHolidaySurcharge?.peakEndTime || "21:00")} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "peakHolidaySurcharge", "peakEndTime", e.target.value)} /></Field>
                                                <Field label="Peak %"><input type="number" min={0} step="0.01" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingPolicyModules.peakHolidaySurcharge?.peakPercent || 0)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "peakHolidaySurcharge", "peakPercent", Number(e.target.value || 0))} /></Field>
                                                <Field label="Peak Flat Fee"><input type="number" min={0} step="0.01" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingPolicyModules.peakHolidaySurcharge?.peakFlatFee || 0)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "peakHolidaySurcharge", "peakFlatFee", Number(e.target.value || 0))} /></Field>
                                                <Field label="Holiday %"><input type="number" min={0} step="0.01" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingPolicyModules.peakHolidaySurcharge?.holidayPercent || 0)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "peakHolidaySurcharge", "holidayPercent", Number(e.target.value || 0))} /></Field>
                                                <Field label="Holiday Flat Fee"><input type="number" min={0} step="0.01" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingPolicyModules.peakHolidaySurcharge?.holidayFlatFee || 0)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "peakHolidaySurcharge", "holidayFlatFee", Number(e.target.value || 0))} /></Field>
                                            </div>
                                            <Field label="Holiday Dates (YYYY-MM-DD, comma-separated)">
                                                <input
                                                    className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                    value={(activePricingPolicyModules.peakHolidaySurcharge?.holidayDates || []).join(", ")}
                                                    onChange={(e) => updatePricingPolicyModule(activePricingCategory, "peakHolidaySurcharge", "holidayDates", parseCommaList(e.target.value))}
                                                    placeholder="2026-12-25, 2027-01-01"
                                                />
                                            </Field>
                                        </div>

                                        {activePricingCategory === "domestic" && (
                                            <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-3">
                                                <p className="text-[12px] font-[700] text-[#111827]">COD and Minimum Charge Guardrail</p>
                                                <label className="mt-2 inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(activePricingPolicyModules.codFee?.enabled)}
                                                        onChange={(e) => updatePricingPolicyModule(activePricingCategory, "codFee", "enabled", e.target.checked)}
                                                    />
                                                    Enable COD Fee
                                                </label>
                                                <div className="mt-2 grid grid-cols-2 gap-2">
                                                    <Field label="COD Flat Fee"><input type="number" min={0} step="0.01" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingPolicyModules.codFee?.flatFee || 0)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "codFee", "flatFee", Number(e.target.value || 0))} /></Field>
                                                    <Field label="COD % Declared"><input type="number" min={0} step="0.01" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingPolicyModules.codFee?.percentOfDeclaredValue || 0)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "codFee", "percentOfDeclaredValue", Number(e.target.value || 0))} /></Field>
                                                    <Field label="COD Min Fee"><input type="number" min={0} step="0.01" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingPolicyModules.codFee?.minFee || 0)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "codFee", "minFee", Number(e.target.value || 0))} /></Field>
                                                    <Field label="COD Max Fee (optional)"><input type="number" min={0} step="0.01" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={activePricingPolicyModules.codFee?.maxFee === null || activePricingPolicyModules.codFee?.maxFee === undefined ? "" : Number(activePricingPolicyModules.codFee?.maxFee || 0)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "codFee", "maxFee", e.target.value === "" ? null : Number(e.target.value || 0))} /></Field>
                                                </div>
                                                <label className="mt-2 inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(activePricingPolicyModules.minimumShipmentCharge?.enabled)}
                                                        onChange={(e) => updatePricingPolicyModule(activePricingCategory, "minimumShipmentCharge", "enabled", e.target.checked)}
                                                    />
                                                    Enforce Minimum Shipment Charge
                                                </label>
                                                <Field label="Minimum Total">
                                                    <input type="number" min={0} step="0.01" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(activePricingPolicyModules.minimumShipmentCharge?.minimumTotal || 0)} onChange={(e) => updatePricingPolicyModule(activePricingCategory, "minimumShipmentCharge", "minimumTotal", Number(e.target.value || 0))} />
                                                </Field>
                                            </div>
                                        )}

                                        <div className="rounded-[8px] border border-[#E5E7EB] bg-white p-3">
                                            <p className="text-[12px] font-[700] text-[#111827]">Quote Runtime Governance Guardrails</p>
                                            <p className="mt-1 text-[11px] text-[#64748B]">Lock quote-critical fields and enforce discount/floor controls at booking runtime.</p>

                                            <label className="mt-2 inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(activePricingPolicyModules.quoteRuntimeGovernance?.enabled)}
                                                    onChange={(e) => updatePricingPolicyModule(activePricingCategory, "quoteRuntimeGovernance", "enabled", e.target.checked)}
                                                />
                                                Enable Quote Runtime Governance
                                            </label>

                                            <div className="mt-3 rounded-[8px] border border-[#E5E7EB] p-2">
                                                <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(activePricingPolicyModules.quoteRuntimeGovernance?.fieldLocks?.enabled)}
                                                        onChange={(e) => updatePricingPolicyModule(
                                                            activePricingCategory,
                                                            "quoteRuntimeGovernance",
                                                            "fieldLocks",
                                                            {
                                                                ...(activePricingPolicyModules.quoteRuntimeGovernance?.fieldLocks || DEFAULT_SETTINGS.pricing.policyModules[activePricingCategory].quoteRuntimeGovernance.fieldLocks),
                                                                enabled: e.target.checked,
                                                            },
                                                        )}
                                                    />
                                                    Enable Field Locks
                                                </label>
                                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-[#334155]">
                                                    <label className="inline-flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(activePricingPolicyModules.quoteRuntimeGovernance?.fieldLocks?.lockShipmentServiceLevel)}
                                                            onChange={(e) => updatePricingPolicyModule(
                                                                activePricingCategory,
                                                                "quoteRuntimeGovernance",
                                                                "fieldLocks",
                                                                {
                                                                    ...(activePricingPolicyModules.quoteRuntimeGovernance?.fieldLocks || DEFAULT_SETTINGS.pricing.policyModules[activePricingCategory].quoteRuntimeGovernance.fieldLocks),
                                                                    lockShipmentServiceLevel: e.target.checked,
                                                                },
                                                            )}
                                                        />
                                                        Lock Shipment Service Level
                                                    </label>
                                                    <label className="inline-flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(activePricingPolicyModules.quoteRuntimeGovernance?.fieldLocks?.lockPackageServiceLevel)}
                                                            onChange={(e) => updatePricingPolicyModule(
                                                                activePricingCategory,
                                                                "quoteRuntimeGovernance",
                                                                "fieldLocks",
                                                                {
                                                                    ...(activePricingPolicyModules.quoteRuntimeGovernance?.fieldLocks || DEFAULT_SETTINGS.pricing.policyModules[activePricingCategory].quoteRuntimeGovernance.fieldLocks),
                                                                    lockPackageServiceLevel: e.target.checked,
                                                                },
                                                            )}
                                                        />
                                                        Lock Package Service Level
                                                    </label>
                                                    <label className="inline-flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(activePricingPolicyModules.quoteRuntimeGovernance?.fieldLocks?.lockPackageCourierProvider)}
                                                            onChange={(e) => updatePricingPolicyModule(
                                                                activePricingCategory,
                                                                "quoteRuntimeGovernance",
                                                                "fieldLocks",
                                                                {
                                                                    ...(activePricingPolicyModules.quoteRuntimeGovernance?.fieldLocks || DEFAULT_SETTINGS.pricing.policyModules[activePricingCategory].quoteRuntimeGovernance.fieldLocks),
                                                                    lockPackageCourierProvider: e.target.checked,
                                                                },
                                                            )}
                                                        />
                                                        Lock Package Courier Provider
                                                    </label>
                                                    <label className="inline-flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(activePricingPolicyModules.quoteRuntimeGovernance?.fieldLocks?.lockQuoteTotal)}
                                                            onChange={(e) => updatePricingPolicyModule(
                                                                activePricingCategory,
                                                                "quoteRuntimeGovernance",
                                                                "fieldLocks",
                                                                {
                                                                    ...(activePricingPolicyModules.quoteRuntimeGovernance?.fieldLocks || DEFAULT_SETTINGS.pricing.policyModules[activePricingCategory].quoteRuntimeGovernance.fieldLocks),
                                                                    lockQuoteTotal: e.target.checked,
                                                                },
                                                            )}
                                                        />
                                                        Lock Review Quote Total
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="mt-3 rounded-[8px] border border-[#E5E7EB] p-2">
                                                <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(activePricingPolicyModules.quoteRuntimeGovernance?.discountGuardrails?.enabled)}
                                                        onChange={(e) => updatePricingPolicyModule(
                                                            activePricingCategory,
                                                            "quoteRuntimeGovernance",
                                                            "discountGuardrails",
                                                            {
                                                                ...(activePricingPolicyModules.quoteRuntimeGovernance?.discountGuardrails || DEFAULT_SETTINGS.pricing.policyModules[activePricingCategory].quoteRuntimeGovernance.discountGuardrails),
                                                                enabled: e.target.checked,
                                                            },
                                                        )}
                                                    />
                                                    Enable Discount Ceiling Guardrails
                                                </label>
                                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    <Field label="Max Discount (%)">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            step="0.01"
                                                            className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                            value={Number(activePricingPolicyModules.quoteRuntimeGovernance?.discountGuardrails?.maxDiscountPercent || 0)}
                                                            onChange={(e) => updatePricingPolicyModule(
                                                                activePricingCategory,
                                                                "quoteRuntimeGovernance",
                                                                "discountGuardrails",
                                                                {
                                                                    ...(activePricingPolicyModules.quoteRuntimeGovernance?.discountGuardrails || DEFAULT_SETTINGS.pricing.policyModules[activePricingCategory].quoteRuntimeGovernance.discountGuardrails),
                                                                    maxDiscountPercent: Number(e.target.value || 0),
                                                                },
                                                            )}
                                                        />
                                                    </Field>
                                                    <Field label="Max Discount Amount (USD)">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            step="0.01"
                                                            className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                            value={Number(activePricingPolicyModules.quoteRuntimeGovernance?.discountGuardrails?.maxDiscountAmountUsd || 0)}
                                                            onChange={(e) => updatePricingPolicyModule(
                                                                activePricingCategory,
                                                                "quoteRuntimeGovernance",
                                                                "discountGuardrails",
                                                                {
                                                                    ...(activePricingPolicyModules.quoteRuntimeGovernance?.discountGuardrails || DEFAULT_SETTINGS.pricing.policyModules[activePricingCategory].quoteRuntimeGovernance.discountGuardrails),
                                                                    maxDiscountAmountUsd: Number(e.target.value || 0),
                                                                },
                                                            )}
                                                        />
                                                    </Field>
                                                </div>
                                            </div>

                                            <div className="mt-3 rounded-[8px] border border-[#E5E7EB] p-2">
                                                <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(activePricingPolicyModules.quoteRuntimeGovernance?.floorPriceGuardrail?.enabled)}
                                                        onChange={(e) => updatePricingPolicyModule(
                                                            activePricingCategory,
                                                            "quoteRuntimeGovernance",
                                                            "floorPriceGuardrail",
                                                            {
                                                                ...(activePricingPolicyModules.quoteRuntimeGovernance?.floorPriceGuardrail || DEFAULT_SETTINGS.pricing.policyModules[activePricingCategory].quoteRuntimeGovernance.floorPriceGuardrail),
                                                                enabled: e.target.checked,
                                                            },
                                                        )}
                                                    />
                                                    Enable Floor Price Guardrail
                                                </label>
                                                <Field label="Minimum Total (USD)">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                        value={Number(activePricingPolicyModules.quoteRuntimeGovernance?.floorPriceGuardrail?.minimumTotalUsd || 0)}
                                                        onChange={(e) => updatePricingPolicyModule(
                                                            activePricingCategory,
                                                            "quoteRuntimeGovernance",
                                                            "floorPriceGuardrail",
                                                            {
                                                                ...(activePricingPolicyModules.quoteRuntimeGovernance?.floorPriceGuardrail || DEFAULT_SETTINGS.pricing.policyModules[activePricingCategory].quoteRuntimeGovernance.floorPriceGuardrail),
                                                                minimumTotalUsd: Number(e.target.value || 0),
                                                            },
                                                        )}
                                                    />
                                                </Field>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activePricingTopic === "contracts" && (
                                <div id="pricing-topic-contracts" className="mt-4 border border-[#E5E7EB] rounded-[10px] p-3 bg-white scroll-mt-24">
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <p className="text-[13px] font-[700] text-[#111827]">Customer Contract Pricing</p>
                                            <p className="text-[11px] text-[#64748B] mt-1">Configure account-level negotiated rates, effective ranges, renewal controls, and volume tiers.</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="h-[30px] px-3 rounded-[8px] border border-[#0955AC] text-[#0955AC] text-[11px] font-[700]"
                                            onClick={() => {
                                                const existingContracts = Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts)
                                                    ? activePricingPolicyModules.customerContractPricing.contracts
                                                    : [];
                                                updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", [
                                                    ...existingContracts,
                                                    {
                                                        enabled: true,
                                                        priority: 0,
                                                        allAccounts: true,
                                                        accountUserIds: [],
                                                        category: activePricingCategory,
                                                        categories: [activePricingCategory],
                                                        effectiveFrom: "",
                                                        effectiveTo: "",
                                                        autoRenew: false,
                                                        renewalCycleDays: 30,
                                                        renewalGraceDays: 0,
                                                        maxRenewals: 0,
                                                        negotiatedRateType: "percent_off",
                                                        negotiatedRateValue: 0,
                                                        minimumTotal: 0,
                                                        volumeMetric: "shipment_count_30d",
                                                        volumeLookbackDays: 30,
                                                        volumeTiers: [],
                                                    },
                                                ]);
                                            }}
                                        >
                                            Add Contract
                                        </button>
                                    </div>

                                    <label className="mt-3 inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(activePricingPolicyModules.customerContractPricing?.enabled)}
                                            onChange={(e) => updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "enabled", e.target.checked)}
                                        />
                                        Enable Customer Contract Pricing
                                    </label>

                                    <div className="mt-3 space-y-3">
                                        {(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts)
                                            ? activePricingPolicyModules.customerContractPricing.contracts
                                            : []).map((contract, contractIndex) => {
                                                const contractRow = contract && typeof contract === "object" ? contract : {};
                                                const tiers = Array.isArray(contractRow.volumeTiers) ? contractRow.volumeTiers : [];

                                                return (
                                                    <div key={`contract-${activePricingCategory}-${contractIndex}`} className="rounded-[8px] border border-[#E5E7EB] p-3 bg-[#F8FAFC]">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-[12px] font-[700] text-[#111827]">Contract #{contractIndex + 1}</p>
                                                            <button
                                                                type="button"
                                                                className="h-[26px] px-2 rounded-[6px] border border-[#FCA5A5] text-[#B91C1C] text-[11px] font-[700]"
                                                                onClick={() => {
                                                                    const nextContracts = (Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts)
                                                                        ? activePricingPolicyModules.customerContractPricing.contracts
                                                                        : []).filter((_, idx) => idx !== contractIndex);
                                                                    updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                }}
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>

                                                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                                                            <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={Boolean(contractRow.enabled ?? true)}
                                                                    onChange={(e) => {
                                                                        const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                        nextContracts[contractIndex] = { ...contractRow, enabled: e.target.checked };
                                                                        updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                    }}
                                                                />
                                                                Active
                                                            </label>
                                                            <Field label="Priority">
                                                                <input
                                                                    type="number"
                                                                    step="1"
                                                                    className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                                    value={Number(contractRow.priority || 0)}
                                                                    onChange={(e) => {
                                                                        const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                        nextContracts[contractIndex] = { ...contractRow, priority: Number(e.target.value || 0) };
                                                                        updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                    }}
                                                                />
                                                            </Field>
                                                            <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={Boolean(contractRow.allAccounts)}
                                                                    onChange={(e) => {
                                                                        const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                        nextContracts[contractIndex] = { ...contractRow, allAccounts: e.target.checked };
                                                                        updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                    }}
                                                                />
                                                                Apply To All Accounts
                                                            </label>
                                                        </div>

                                                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            <Field label="Account User IDs (comma-separated)">
                                                                <input
                                                                    className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                                    value={Array.isArray(contractRow.accountUserIds) ? contractRow.accountUserIds.join(", ") : ""}
                                                                    onChange={(e) => {
                                                                        const parsedIds = parseCommaList(e.target.value)
                                                                            .map((value) => Number(value))
                                                                            .filter((value) => Number.isInteger(value) && value > 0);
                                                                        const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                        nextContracts[contractIndex] = { ...contractRow, accountUserIds: parsedIds };
                                                                        updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                    }}
                                                                    placeholder="102, 204, 305"
                                                                />
                                                            </Field>
                                                            <Field label="Contract Category (Locked)">
                                                                <div className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] bg-[#F8FAFC] px-2 text-[12px] text-[#334155] flex items-center">
                                                                    {titleCase(activePricingCategory)}
                                                                </div>
                                                            </Field>
                                                            <Field label="Effective From">
                                                                <input
                                                                    type="date"
                                                                    className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                                    value={String(contractRow.effectiveFrom || "")}
                                                                    onChange={(e) => {
                                                                        const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                        nextContracts[contractIndex] = { ...contractRow, effectiveFrom: e.target.value };
                                                                        updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                    }}
                                                                />
                                                            </Field>
                                                            <Field label="Effective To">
                                                                <input
                                                                    type="date"
                                                                    className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                                    value={String(contractRow.effectiveTo || "")}
                                                                    onChange={(e) => {
                                                                        const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                        nextContracts[contractIndex] = { ...contractRow, effectiveTo: e.target.value };
                                                                        updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                    }}
                                                                />
                                                            </Field>
                                                        </div>

                                                        <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-2">
                                                            <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={Boolean(contractRow.autoRenew)}
                                                                    onChange={(e) => {
                                                                        const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                        nextContracts[contractIndex] = { ...contractRow, autoRenew: e.target.checked };
                                                                        updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                    }}
                                                                />
                                                                Auto Renew
                                                            </label>
                                                            <Field label="Renewal Cycle (days)">
                                                                <input type="number" min={0} step="1" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(contractRow.renewalCycleDays || 0)} onChange={(e) => {
                                                                    const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                    nextContracts[contractIndex] = { ...contractRow, renewalCycleDays: Number(e.target.value || 0) };
                                                                    updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                }} />
                                                            </Field>
                                                            <Field label="Renewal Grace (days)">
                                                                <input type="number" min={0} step="1" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(contractRow.renewalGraceDays || 0)} onChange={(e) => {
                                                                    const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                    nextContracts[contractIndex] = { ...contractRow, renewalGraceDays: Number(e.target.value || 0) };
                                                                    updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                }} />
                                                            </Field>
                                                            <Field label="Max Renewals (0 = unlimited)">
                                                                <input type="number" min={0} step="1" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(contractRow.maxRenewals || 0)} onChange={(e) => {
                                                                    const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                    nextContracts[contractIndex] = { ...contractRow, maxRenewals: Number(e.target.value || 0) };
                                                                    updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                }} />
                                                            </Field>
                                                        </div>

                                                        <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-2">
                                                            <Field label="Negotiated Rate Type">
                                                                <select
                                                                    className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                                    value={String(contractRow.negotiatedRateType || "percent_off")}
                                                                    onChange={(e) => {
                                                                        const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                        nextContracts[contractIndex] = { ...contractRow, negotiatedRateType: e.target.value };
                                                                        updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                    }}
                                                                >
                                                                    <option value="percent_off">Percent Off</option>
                                                                    <option value="flat_off">Flat Off</option>
                                                                    <option value="fixed_total">Fixed Total</option>
                                                                    <option value="multiplier">Multiplier</option>
                                                                </select>
                                                            </Field>
                                                            <Field label="Negotiated Value">
                                                                <input type="number" min={0} step="0.01" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(contractRow.negotiatedRateValue || 0)} onChange={(e) => {
                                                                    const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                    nextContracts[contractIndex] = { ...contractRow, negotiatedRateValue: Number(e.target.value || 0) };
                                                                    updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                }} />
                                                            </Field>
                                                            <Field label="Contract Minimum Total">
                                                                <input type="number" min={0} step="0.01" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(contractRow.minimumTotal || 0)} onChange={(e) => {
                                                                    const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                    nextContracts[contractIndex] = { ...contractRow, minimumTotal: Number(e.target.value || 0) };
                                                                    updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                }} />
                                                            </Field>
                                                            <Field label="Volume Metric">
                                                                <select
                                                                    className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                                    value={String(contractRow.volumeMetric || "shipment_count_30d")}
                                                                    onChange={(e) => {
                                                                        const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                        nextContracts[contractIndex] = { ...contractRow, volumeMetric: e.target.value };
                                                                        updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                    }}
                                                                >
                                                                    <option value="shipment_count_30d">Shipment Count (30d)</option>
                                                                    <option value="total_weight_kg_30d">Total Weight KG (30d)</option>
                                                                    <option value="revenue_usd_30d">Revenue USD (30d)</option>
                                                                    <option value="current_shipment_weight_kg">Current Shipment Weight KG</option>
                                                                </select>
                                                            </Field>
                                                        </div>

                                                        <Field label="Volume Lookback Days">
                                                            <input type="number" min={1} step="1" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(contractRow.volumeLookbackDays || 30)} onChange={(e) => {
                                                                const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                nextContracts[contractIndex] = { ...contractRow, volumeLookbackDays: Number(e.target.value || 30) };
                                                                updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                            }} />
                                                        </Field>

                                                        <div className="mt-2 rounded-[8px] border border-[#E5E7EB] bg-white p-2">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className="text-[11px] font-[700] text-[#334155]">Volume Tiers</p>
                                                                <button
                                                                    type="button"
                                                                    className="h-[24px] px-2 rounded-[6px] border border-[#0955AC] text-[#0955AC] text-[10px] font-[700]"
                                                                    onClick={() => {
                                                                        const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                        const nextTiers = [...tiers, { enabled: true, minVolume: 0, maxVolume: null, adjustmentType: "percent_off", adjustmentValue: 0 }];
                                                                        nextContracts[contractIndex] = { ...contractRow, volumeTiers: nextTiers };
                                                                        updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                    }}
                                                                >
                                                                    Add Tier
                                                                </button>
                                                            </div>

                                                            <div className="mt-2 space-y-2">
                                                                {tiers.map((tier, tierIndex) => {
                                                                    const tierRow = tier && typeof tier === "object" ? tier : {};
                                                                    return (
                                                                        <div key={`tier-${contractIndex}-${tierIndex}`} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                                                                            <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155] pb-1">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={Boolean(tierRow.enabled ?? true)}
                                                                                    onChange={(e) => {
                                                                                        const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                                        const nextTiers = [...tiers];
                                                                                        nextTiers[tierIndex] = { ...tierRow, enabled: e.target.checked };
                                                                                        nextContracts[contractIndex] = { ...contractRow, volumeTiers: nextTiers };
                                                                                        updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                                    }}
                                                                                />
                                                                                Active
                                                                            </label>
                                                                            <Field label="Min Volume"><input type="number" min={0} step="0.01" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(tierRow.minVolume || 0)} onChange={(e) => {
                                                                                const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                                const nextTiers = [...tiers];
                                                                                nextTiers[tierIndex] = { ...tierRow, minVolume: Number(e.target.value || 0) };
                                                                                nextContracts[contractIndex] = { ...contractRow, volumeTiers: nextTiers };
                                                                                updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                            }} /></Field>
                                                                            <Field label="Max Volume"><input type="number" min={0} step="0.01" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={tierRow.maxVolume === null || tierRow.maxVolume === undefined ? "" : Number(tierRow.maxVolume || 0)} onChange={(e) => {
                                                                                const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                                const nextTiers = [...tiers];
                                                                                nextTiers[tierIndex] = { ...tierRow, maxVolume: e.target.value === "" ? null : Number(e.target.value || 0) };
                                                                                nextContracts[contractIndex] = { ...contractRow, volumeTiers: nextTiers };
                                                                                updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                            }} /></Field>
                                                                            <Field label="Adjustment Type">
                                                                                <select className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={String(tierRow.adjustmentType || "percent_off")} onChange={(e) => {
                                                                                    const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                                    const nextTiers = [...tiers];
                                                                                    nextTiers[tierIndex] = { ...tierRow, adjustmentType: e.target.value };
                                                                                    nextContracts[contractIndex] = { ...contractRow, volumeTiers: nextTiers };
                                                                                    updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                                }}>
                                                                                    <option value="percent_off">Percent Off</option>
                                                                                    <option value="flat_off">Flat Off</option>
                                                                                    <option value="fixed_total">Fixed Total</option>
                                                                                    <option value="multiplier">Multiplier</option>
                                                                                </select>
                                                                            </Field>
                                                                            <Field label="Adjustment Value"><input type="number" min={0} step="0.01" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(tierRow.adjustmentValue || 0)} onChange={(e) => {
                                                                                const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                                const nextTiers = [...tiers];
                                                                                nextTiers[tierIndex] = { ...tierRow, adjustmentValue: Number(e.target.value || 0) };
                                                                                nextContracts[contractIndex] = { ...contractRow, volumeTiers: nextTiers };
                                                                                updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                            }} /></Field>
                                                                            <div className="flex items-end">
                                                                                <button
                                                                                    type="button"
                                                                                    className="h-[44px] px-2 rounded-[6px] border border-[#FCA5A5] text-[#B91C1C] text-[10px] font-[700]"
                                                                                    onClick={() => {
                                                                                        const nextContracts = [...(Array.isArray(activePricingPolicyModules.customerContractPricing?.contracts) ? activePricingPolicyModules.customerContractPricing.contracts : [])];
                                                                                        const nextTiers = tiers.filter((_, idx) => idx !== tierIndex);
                                                                                        nextContracts[contractIndex] = { ...contractRow, volumeTiers: nextTiers };
                                                                                        updatePricingPolicyModule(activePricingCategory, "customerContractPricing", "contracts", nextContracts);
                                                                                    }}
                                                                                >
                                                                                    Remove Tier
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            {activePricingTopic === "service-catalog" && (
                                <div id="pricing-topic-service-catalog" className="mt-4 border border-[#E5E7EB] rounded-[10px] p-3 bg-white scroll-mt-24">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-[13px] font-[700] text-[#111827]">Service Catalog</p>
                                        <button
                                            type="button"
                                            className="h-[30px] px-3 rounded-[8px] border border-[#0955AC] text-[#0955AC] text-[11px] font-[700]"
                                            onClick={() => addPricingServiceLevel(activePricingCategory)}
                                        >
                                            Add Service Level
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-[#64748B] mt-1">Define explicit service-level policies with cutoff times and promised SLA for {titleCase(activePricingCategory)}.</p>
                                    <div className="mt-2 overflow-x-auto">
                                        <table className="w-full min-w-[920px] text-[12px]">
                                            <thead>
                                                <tr className="bg-[#F8FAFC] text-left border border-[#E5E7EB]">
                                                    <th className="px-2 py-2">Key</th>
                                                    <th className="px-2 py-2">Label</th>
                                                    <th className="px-2 py-2">Promised SLA (days)</th>
                                                    <th className="px-2 py-2">Cutoff Time</th>
                                                    <th className="px-2 py-2">Active</th>
                                                    <th className="px-2 py-2">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeServiceCatalogRows.map((row, index) => (
                                                    <tr key={`${activePricingCategory}-service-${row?.key || index}`} className="border-x border-b border-[#E5E7EB]">
                                                        <td className="px-2 py-2">
                                                            <input
                                                                className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2"
                                                                value={String(row?.key || "")}
                                                                onChange={(e) => updatePricingServiceLevel(
                                                                    activePricingCategory,
                                                                    index,
                                                                    "key",
                                                                    String(e.target.value || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""),
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-2 py-2"><input className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2" value={String(row?.label || "")} onChange={(e) => updatePricingServiceLevel(activePricingCategory, index, "label", e.target.value)} /></td>
                                                        <td className="px-2 py-2"><input type="number" min={1} className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2" value={Number(row?.promisedSlaDays || 1)} onChange={(e) => updatePricingServiceLevel(activePricingCategory, index, "promisedSlaDays", Number(e.target.value || 1))} /></td>
                                                        <td className="px-2 py-2"><input type="time" className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] px-2" value={String(row?.cutoffTime || "18:00")} onChange={(e) => updatePricingServiceLevel(activePricingCategory, index, "cutoffTime", e.target.value)} /></td>
                                                        <td className="px-2 py-2">
                                                            <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={Boolean(row?.isActive)}
                                                                    onChange={(e) => updatePricingServiceLevel(activePricingCategory, index, "isActive", e.target.checked)}
                                                                />
                                                                Active
                                                            </label>
                                                        </td>
                                                        <td className="px-2 py-2">
                                                            <button type="button" className="h-[28px] px-2 rounded-[6px] border border-[#FCA5A5] text-[#B91C1C] text-[11px] font-[700]" onClick={() => removePricingServiceLevel(activePricingCategory, index)}>
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activePricingTopic === "governance" && (
                                <div id="pricing-topic-governance" className="mt-4 border border-[#E5E7EB] rounded-[10px] p-3 bg-[#F8FAFC] scroll-mt-24">
                                    <p className="text-[13px] font-[700] text-[#111827] mb-2">Pricing Governance</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(activePricingGovernance.requireApproval)}
                                                disabled={!canConfigurePricingGovernance}
                                                onChange={(e) => updatePricingGovernance(activePricingCategory, "requireApproval", e.target.checked)}
                                            />
                                            Require approval before publish
                                        </label>
                                        <Field label="Approver Roles">
                                            <div className="w-full rounded-[8px] border border-[#D1D5DB] bg-white p-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {governanceApproverRoleOptions.map((roleName) => {
                                                        const selectedRoles = Array.isArray(activePricingGovernance.approverRoles)
                                                            ? activePricingGovernance.approverRoles
                                                            : [];
                                                        const isSelected = selectedRoles.includes(roleName);

                                                        return (
                                                            <label
                                                                key={`governance-approver-${roleName}`}
                                                                className={`inline-flex items-center gap-1 rounded-[999px] border px-2 py-1 text-[11px] font-[700] ${isSelected ? "border-[#0955AC] bg-[#EFF6FF] text-[#0955AC]" : "border-[#E5E7EB] text-[#475569]"}`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    className="h-[12px] w-[12px]"
                                                                    disabled={!canConfigurePricingGovernance}
                                                                    checked={isSelected}
                                                                    onChange={() => updatePricingGovernance(
                                                                        activePricingCategory,
                                                                        "approverRoles",
                                                                        toggleInArray(selectedRoles, roleName),
                                                                    )}
                                                                />
                                                                {roleName}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </Field>
                                        <Field label="Schedule Publish At">
                                            <input
                                                type="datetime-local"
                                                className="h-[36px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]"
                                                value={pricingPublishAt}
                                                onChange={(e) => setPricingPublishAt(e.target.value)}
                                            />
                                        </Field>
                                    </div>

                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <p className="text-[11px] text-[#475569]">Draft Version: {Number(activePricingGovernance.draftVersion || 1)}</p>
                                        <p className="text-[11px] text-[#475569]">Published Version: {Number(activePricingGovernance.publishedVersion || 1)}</p>
                                        <p className="text-[11px] text-[#475569]">Published At: {activePricingGovernance.publishedAt || "Not published"}</p>
                                        <p className="text-[11px] text-[#475569]">Pending Approval: {activePricingGovernance.pendingApproval ? "Yes" : "No"}</p>
                                        <p className="text-[11px] text-[#475569]">Approval Authority: {titleCase(activePricingApprovalAuthority)}</p>
                                    </div>

                                    <textarea
                                        rows={2}
                                        className="mt-2 w-full rounded-[8px] border border-[#D1D5DB] px-2 py-1 text-[12px]"
                                        placeholder="Optional governance note"
                                        value={pricingGovernanceNote}
                                        onChange={(e) => setPricingGovernanceNote(e.target.value)}
                                    />

                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        {canPublishPricingChanges && (
                                            <button
                                                type="button"
                                                disabled={pricingGovernanceActionBusy}
                                                className="h-[30px] px-3 rounded-[8px] bg-[#0F766E] text-white text-[11px] font-[700] disabled:opacity-50"
                                                onClick={() => runPricingGovernanceAction("pricing_publish_now")}
                                            >
                                                Publish Now
                                            </button>
                                        )}
                                        {canPublishPricingChanges && (
                                            <button
                                                type="button"
                                                disabled={pricingGovernanceActionBusy || !pricingPublishAt}
                                                className="h-[30px] px-3 rounded-[8px] border border-[#0955AC] text-[#0955AC] text-[11px] font-[700] disabled:opacity-50"
                                                onClick={() => runPricingGovernanceAction("pricing_schedule_publish", { effectiveAt: pricingPublishAt })}
                                            >
                                                Schedule Publish
                                            </button>
                                        )}
                                        {canReviewPricingPublish && (
                                            <button
                                                type="button"
                                                disabled={pricingGovernanceActionBusy || !activePricingGovernance.pendingApproval || pendingApprovalRequestedByCurrentActor}
                                                className="h-[30px] px-3 rounded-[8px] bg-[#0955AC] text-white text-[11px] font-[700] disabled:opacity-50"
                                                onClick={() => runPricingGovernanceAction("pricing_approve_publish")}
                                            >
                                                Approve Publish
                                            </button>
                                        )}
                                        {canReviewPricingPublish && (
                                            <button
                                                type="button"
                                                disabled={pricingGovernanceActionBusy || !activePricingGovernance.pendingApproval}
                                                className="h-[30px] px-3 rounded-[8px] border border-[#FCA5A5] text-[#B91C1C] text-[11px] font-[700] disabled:opacity-50"
                                                onClick={() => runPricingGovernanceAction("pricing_reject_publish")}
                                            >
                                                Reject Publish
                                            </button>
                                        )}
                                        {canReviewPricingPublish && (
                                            <div className="inline-flex items-center gap-2">
                                                <select
                                                    className="h-[30px] rounded-[8px] border border-[#D1D5DB] px-2 text-[11px]"
                                                    value={pricingRollbackVersion}
                                                    onChange={(e) => setPricingRollbackVersion(e.target.value)}
                                                >
                                                    <option value="">Previous Version</option>
                                                    {rollbackCandidates.map((entry) => (
                                                        <option key={`rollback-version-${entry.version}`} value={String(entry.version)}>
                                                            v{Number(entry.version)}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    disabled={pricingGovernanceActionBusy || rollbackCandidates.length === 0}
                                                    className="h-[30px] px-3 rounded-[8px] border border-[#0F766E] text-[#0F766E] text-[11px] font-[700] disabled:opacity-50"
                                                    onClick={() => runPricingGovernanceAction("pricing_rollback_version", {
                                                        rollbackVersion: pricingRollbackVersion ? Number(pricingRollbackVersion) : null,
                                                    })}
                                                >
                                                    Rollback Version
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {pendingApprovalRequestedByCurrentActor && canReviewPricingPublish && (
                                        <p className="mt-2 text-[11px] text-[#B45309]">Four-eyes control: requester cannot approve their own publish request.</p>
                                    )}
                                    {isSuperAdminPricingAuthority && (
                                        <p className="mt-2 text-[11px] text-[#1E3A8A]">Approval, rejection, and rollback are delegated to SuperAdmin for this pricing category.</p>
                                    )}
                                    {!canPublishPricingChanges && !canReviewPricingPublish && (
                                        <p className="mt-2 text-[11px] text-[#6B7280]">You do not have permission to run pricing governance actions.</p>
                                    )}

                                    <div className="mt-3 border border-[#E5E7EB] rounded-[8px] p-2 bg-white max-h-[180px] overflow-y-auto">
                                        <p className="text-[12px] font-[700] text-[#111827] mb-1">Pricing Audit Trail</p>
                                        {(activePricingGovernance.changeLog || []).length === 0 && (
                                            <p className="text-[11px] text-[#6B7280]">No governance events yet.</p>
                                        )}
                                        {(activePricingGovernance.changeLog || []).map((entry, idx) => (
                                            <p key={`pricing-log-${idx}`} className="text-[11px] text-[#475569] mb-1">
                                                {String(entry?.at || "-")} • {titleCase(String(entry?.event || "event"))}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activePricingTopic === "rate-cards" && (
                                <div id="pricing-topic-rate-cards" className="mt-4 border border-[#E5E7EB] rounded-[10px] p-3 bg-white scroll-mt-24">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-[13px] font-[700] text-[#111827]">Rate Cards</p>
                                        <span className="inline-flex items-center h-[28px] px-3 rounded-[999px] bg-[#EFF6FF] text-[#1E3A8A] text-[11px] font-[700]">
                                            {titleCase(activePricingCategory)}
                                        </span>
                                    </div>
                                    <div className="mt-2 overflow-x-auto">
                                        <table className="w-max min-w-[1100px] text-[11px]">
                                            <thead>
                                                <tr className="bg-[#F8FAFC] text-left border border-[#E5E7EB]">
                                                    <th className="px-2 py-2 min-w-[140px]">Label</th>
                                                    <th className="px-2 py-2 min-w-[180px]">Service Level</th>
                                                    <th className="px-2 py-2 min-w-[90px]">SLA Days</th>
                                                    <th className="px-2 py-2 min-w-[110px]">Base Price</th>
                                                    <th className="px-2 py-2 min-w-[90px]">Per Kg</th>
                                                    <th className="px-2 py-2 min-w-[110px]">Min Price</th>
                                                    <th className="px-2 py-2 min-w-[110px]">Priority Mult.</th>
                                                    <th className="px-2 py-2 min-w-[80px]">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activePricingRows.map((row, index) => (
                                                    <tr key={`${activePricingCategory}-${row?.id || index}`} className="border-x border-b border-[#E5E7EB]">
                                                        <td className="px-2 py-3"><input className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]" value={String(row?.label || "")} onChange={(e) => updatePricingTier(activePricingCategory, index, "label", e.target.value)} /></td>
                                                        <td className="px-2 py-3 min-w-[180px]">
                                                            <select
                                                                className="h-[44px] w-full min-w-[160px] rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A]"
                                                                value={String(row?.serviceLevelKey || activeServiceLevelOptions[0]?.key || "")}
                                                                onChange={(e) => updatePricingTier(activePricingCategory, index, "serviceLevelKey", e.target.value)}
                                                            >
                                                                {activeServiceLevelOptions.map((option) => (
                                                                    <option key={`${activePricingCategory}-tier-service-${option.key}`} value={option.key}>{option.label}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-2 py-3"><input type="number" min={1} className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]" value={Number(row?.slaDays || 1)} onChange={(e) => updatePricingTier(activePricingCategory, index, "slaDays", Number(e.target.value || 1))} /></td>
                                                        <td className="px-2 py-3"><input type="number" min={0} step="0.01" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]" value={Number(row?.basePrice || 0)} onChange={(e) => updatePricingTier(activePricingCategory, index, "basePrice", Number(e.target.value || 0))} /></td>
                                                        <td className="px-2 py-3"><input type="number" min={0} step="0.01" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]" value={Number(row?.perKgPrice || 0)} onChange={(e) => updatePricingTier(activePricingCategory, index, "perKgPrice", Number(e.target.value || 0))} /></td>
                                                        <td className="px-2 py-3"><input type="number" min={0} step="0.01" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]" value={Number(row?.minPrice || 0)} onChange={(e) => updatePricingTier(activePricingCategory, index, "minPrice", Number(e.target.value || 0))} /></td>
                                                        <td className="px-2 py-3"><input type="number" min={0.1} step="0.01" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]" value={Number(row?.priorityMultiplier || 1)} onChange={(e) => updatePricingTier(activePricingCategory, index, "priorityMultiplier", Number(e.target.value || 1))} /></td>
                                                        <td className="px-2 py-3">
                                                            <button type="button" className="h-[44px] px-2 rounded-[6px] border border-[#FCA5A5] text-[#B91C1C] text-[11px] font-[700]" onClick={() => removePricingTier(activePricingCategory, index)}>
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-2">
                                        <button type="button" className="h-[30px] px-3 rounded-[8px] border border-[#0955AC] text-[#0955AC] text-[11px] font-[700]" onClick={() => addPricingTier(activePricingCategory)}>
                                            Add Tier
                                        </button>
                                    </div>

                                    <div className="mt-4 border border-[#E2E8F0] rounded-[10px] p-3 bg-[#F8FAFC]">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div>
                                                <p className="text-[13px] font-[700] text-[#111827]">Bulk Import (Advanced)</p>
                                                <p className="text-[11px] text-[#64748B] mt-1">Upload XLSX, CSV, JSON, or PDF pricing files. System auto-detects structure, scores confidence, and flags mapping conflicts.</p>
                                            </div>
                                            <div className="inline-flex items-center gap-2">
                                                <select
                                                    className="h-[30px] rounded-[8px] border border-[#CBD5E1] px-2 text-[11px]"
                                                    value={pricingImportMode}
                                                    onChange={(e) => setPricingImportMode(e.target.value)}
                                                >
                                                    <option value="replace">Replace {titleCase(activePricingCategory)} Draft</option>
                                                    <option value="merge">Merge Into {titleCase(activePricingCategory)} Draft</option>
                                                </select>
                                                <select
                                                    className="h-[30px] rounded-[8px] border border-[#CBD5E1] px-2 text-[11px]"
                                                    value={pricingImportResolutionStrategy}
                                                    onChange={(e) => setPricingImportResolutionStrategy(e.target.value)}
                                                >
                                                    <option value="prefer_most_frequent">Conflicts: Prefer Most Frequent Zone</option>
                                                    <option value="prefer_existing">Conflicts: Prefer Existing City Mapping</option>
                                                    <option value="manual">Conflicts: Manual City Mapping</option>
                                                </select>
                                                <button
                                                    type="button"
                                                    disabled={pricingImportPreviewBusy || pricingImportApplyBusy}
                                                    className="h-[30px] px-3 rounded-[8px] border border-[#0955AC] text-[#0955AC] text-[11px] font-[700] disabled:opacity-50"
                                                    onClick={previewPricingImport}
                                                >
                                                    {pricingImportPreviewBusy ? "Analyzing..." : "Analyze Import"}
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={pricingImportApplyBusy || !pricingImportResult?.patch || !pricingImportPreviewToken || (pricingImportResult?.requiresManualReview && !pricingImportManualReviewConfirmed)}
                                                    className="h-[30px] px-3 rounded-[8px] bg-[#0F766E] text-white text-[11px] font-[700] disabled:opacity-50"
                                                    onClick={applyPricingImportToDraft}
                                                >
                                                    {pricingImportApplyBusy ? "Applying..." : "Apply To Draft"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <input
                                                key={`pricing-import-file-${activePricingCategory}`}
                                                type="file"
                                                accept=".xlsx,.xls,.csv,.txt,.json,.pdf"
                                                className="block w-full md:w-[420px] text-[11px] text-[#334155] file:mr-2 file:rounded-[6px] file:border file:border-[#CBD5E1] file:bg-white file:px-2 file:py-1 file:text-[11px] file:font-[600] file:text-[#334155]"
                                                onChange={(e) => {
                                                    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                                                    setPricingImportFile(file);
                                                    setPricingImportResult(null);
                                                    setPricingImportPreviewToken("");
                                                    setPricingImportManualReviewConfirmed(false);
                                                    setPricingImportManualResolutions({});
                                                }}
                                            />
                                            {pricingImportFile && (
                                                <span className="inline-flex items-center rounded-[999px] bg-white border border-[#CBD5E1] px-2 py-1 text-[11px] font-[700] text-[#334155]">
                                                    {pricingImportFile.name}
                                                </span>
                                            )}
                                        </div>

                                        {pricingImportResult && (
                                            <div className="mt-3 border border-[#E2E8F0] rounded-[8px] p-3 bg-white">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                    <div className="rounded-[8px] border border-[#E2E8F0] px-2 py-2">
                                                        <p className="text-[10px] text-[#64748B] uppercase tracking-wide">Detected</p>
                                                        <p className="text-[12px] font-[700] text-[#0F172A] mt-1">{String(pricingImportResult?.detectedFormat || "unknown").toUpperCase()}</p>
                                                    </div>
                                                    <div className="rounded-[8px] border border-[#E2E8F0] px-2 py-2">
                                                        <p className="text-[10px] text-[#64748B] uppercase tracking-wide">Confidence</p>
                                                        <p className="text-[12px] font-[700] text-[#0F172A] mt-1">{Math.round(Number(pricingImportResult?.confidence || 0) * 100)}%</p>
                                                    </div>
                                                    <div className="rounded-[8px] border border-[#E2E8F0] px-2 py-2">
                                                        <p className="text-[10px] text-[#64748B] uppercase tracking-wide">Rows Parsed</p>
                                                        <p className="text-[12px] font-[700] text-[#0F172A] mt-1">{Number(pricingImportResult?.rowsParsed || 0)} / {Number(pricingImportResult?.rowsScanned || 0)}</p>
                                                    </div>
                                                    <div className="rounded-[8px] border border-[#E2E8F0] px-2 py-2">
                                                        <p className="text-[10px] text-[#64748B] uppercase tracking-wide">Patch Size</p>
                                                        <p className="text-[12px] font-[700] text-[#0F172A] mt-1">
                                                            {Number(pricingImportResult?.summary?.zoneCount || 0)} zones, {Number(pricingImportResult?.summary?.categoryCount || 0)} tiers, {Number(pricingImportResult?.summary?.laneCount || 0)} lanes
                                                        </p>
                                                    </div>
                                                </div>

                                                {pricingImportResult?.requiresManualReview && (
                                                    <div className="mt-2 rounded-[8px] border border-[#FCD34D] bg-[#FFFBEB] px-2 py-2">
                                                        <p className="text-[11px] text-[#92400E] font-[700]">Manual review required before apply</p>
                                                        <p className="mt-1 text-[11px] text-[#92400E]">Low confidence or conflicts were detected. Confirm review after checking sample rows, warnings, and conflict mappings.</p>
                                                        {String(pricingImportResult?.detectedFormat || "").toLowerCase() === "pdf" && (
                                                            <p className="mt-1 text-[11px] text-[#92400E]">Best practice for PDF: correct extracted rows in XLSX/CSV and re-import before final apply.</p>
                                                        )}
                                                        <label className="mt-2 inline-flex items-center gap-2 text-[11px] text-[#78350F] font-[700]">
                                                            <input
                                                                type="checkbox"
                                                                className="h-3.5 w-3.5 rounded border border-[#D97706]"
                                                                checked={pricingImportManualReviewConfirmed}
                                                                onChange={(e) => setPricingImportManualReviewConfirmed(Boolean(e.target.checked))}
                                                            />
                                                            I reviewed conflicts/warnings and confirm this import is ready to apply.
                                                        </label>
                                                    </div>
                                                )}

                                                {(pricingImportResult?.conflicts || []).length > 0 && (
                                                    <div className="mt-2 rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-2">
                                                        <p className="text-[11px] font-[700] text-[#991B1B]">Conflicts</p>
                                                        <p className="text-[11px] text-[#7F1D1D] mt-1">
                                                            Strategy: {pricingImportResolutionStrategy === "manual"
                                                                ? "Manual city mapping"
                                                                : pricingImportResolutionStrategy === "prefer_existing"
                                                                    ? "Prefer existing saved city mapping"
                                                                    : "Prefer most frequent imported zone"}
                                                        </p>
                                                        {(pricingImportResult?.conflicts || []).slice(0, 8).map((conflict, idx) => {
                                                            const cityKey = normalizeImportCityKey(conflict?.cityKey || conflict?.city || "");
                                                            const selectedZone = pricingImportManualResolutions[cityKey] || "";

                                                            return (
                                                                <div key={`import-conflict-${idx}`} className="mt-2 rounded-[6px] border border-[#FECACA] bg-white px-2 py-2">
                                                                    <p className="text-[11px] text-[#7F1D1D] font-[700]">
                                                                        {String(conflict?.city || conflict?.cityKey || "City")}
                                                                    </p>
                                                                    <p className="text-[11px] text-[#7F1D1D] mt-1">
                                                                        {Array.isArray(conflict?.zones) ? `Zones: ${conflict.zones.join(", ")}` : "Multiple zones detected"}
                                                                    </p>
                                                                    {conflict?.zoneVotes && typeof conflict.zoneVotes === "object" && (
                                                                        <p className="text-[11px] text-[#7F1D1D] mt-1">
                                                                            Votes: {Object.entries(conflict.zoneVotes)
                                                                                .map(([zoneKey, count]) => `${zoneKey}=${Number(count || 0)}`)
                                                                                .join(", ")}
                                                                        </p>
                                                                    )}
                                                                    {pricingImportResolutionStrategy === "manual" && (
                                                                        <div className="mt-2 inline-flex items-center gap-2">
                                                                            <span className="text-[11px] font-[700] text-[#7F1D1D]">Select zone</span>
                                                                            <select
                                                                                className="h-[28px] rounded-[6px] border border-[#FCA5A5] bg-white px-2 text-[11px]"
                                                                                value={selectedZone}
                                                                                onChange={(e) => {
                                                                                    const value = String(e.target.value || "");
                                                                                    if (!cityKey) {
                                                                                        return;
                                                                                    }

                                                                                    setPricingImportManualResolutions((prev) => ({
                                                                                        ...prev,
                                                                                        [cityKey]: value,
                                                                                    }));
                                                                                }}
                                                                            >
                                                                                <option value="">Select zone</option>
                                                                                {(Array.isArray(conflict?.zones) ? conflict.zones : []).map((zoneOption) => (
                                                                                    <option key={`conflict-zone-option-${cityKey}-${zoneOption}`} value={String(zoneOption)}>{String(zoneOption)}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {(pricingImportResult?.warnings || []).length > 0 && (
                                                    <div className="mt-2 rounded-[8px] border border-[#FCD34D] bg-[#FFFBEB] p-2">
                                                        <p className="text-[11px] font-[700] text-[#92400E]">Warnings</p>
                                                        {(pricingImportResult?.warnings || []).slice(0, 4).map((warning, idx) => (
                                                            <p key={`import-warning-${idx}`} className="text-[11px] text-[#92400E] mt-1">{String(warning || "")}</p>
                                                        ))}
                                                    </div>
                                                )}

                                                {(pricingImportResult?.sampleRows || []).length > 0 && (
                                                    <div className="mt-2 rounded-[8px] border border-[#E2E8F0] p-2">
                                                        <p className="text-[11px] font-[700] text-[#111827]">Parsed Row Sample</p>
                                                        <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {(pricingImportResult?.sampleRows || []).slice(0, 4).map((sample, idx) => (
                                                                <div key={`import-sample-${idx}`} className="rounded-[6px] bg-[#F8FAFC] px-2 py-1 border border-[#E2E8F0]">
                                                                    <p className="text-[11px] text-[#334155]">City: {String(sample?.city || "-")}</p>
                                                                    <p className="text-[11px] text-[#334155]">Zone: {String(sample?.zone || "-")}</p>
                                                                    <p className="text-[11px] text-[#334155]">Service: {String(sample?.serviceLevelKey || "-")}</p>
                                                                    <p className="text-[11px] text-[#334155]">Base: {sample?.basePrice ?? "-"} • Per Kg: {sample?.perKgPrice ?? "-"}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {pricingImportResult?.appliedSummary && (
                                                    <p className="mt-2 text-[11px] text-[#0F766E] font-[700]">
                                                        Applied in {String(pricingImportResult.appliedSummary.mode || pricingImportMode)} mode: {Number(pricingImportResult.appliedSummary.zoneCount || 0)} zones, {Number(pricingImportResult.appliedSummary.categoryCount || 0)} tiers, {Number(pricingImportResult.appliedSummary.laneCount || 0)} lanes.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activePricingTopic === "zone-master" && (
                                <div id="pricing-topic-zone-master" className="mt-4 border border-[#E5E7EB] rounded-[10px] p-3 bg-white scroll-mt-24">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="text-[13px] font-[700] text-[#111827]">Zone Master ({titleCase(activePricingCategory)})</p>
                                            <p className="text-[11px] text-[#64748B] mt-1">Define category-specific zones for {titleCase(activePricingCategory)} lane rules.</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                className="h-[32px] w-[220px] rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]"
                                                value={pricingZoneDraft}
                                                placeholder="Add zone label"
                                                onChange={(e) => setPricingZoneDraft(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="h-[30px] px-3 rounded-[8px] border border-[#0955AC] text-[#0955AC] text-[11px] font-[700]"
                                                onClick={() => addPricingZone(activePricingCategory)}
                                            >
                                                Add Zone
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-2 overflow-x-auto">
                                        <table className="w-full min-w-[560px] text-[12px]">
                                            <thead>
                                                <tr className="bg-[#F8FAFC] text-left border border-[#E5E7EB]">
                                                    <th className="px-2 py-2">Zone Label</th>
                                                    <th className="px-2 py-2">Zone Key</th>
                                                    <th className="px-2 py-2">Active</th>
                                                    <th className="px-2 py-2">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activePricingZones.map((zone, index) => (
                                                    <tr key={`zone-master-${zone?.key || index}`} className="border-x border-b border-[#E5E7EB]">
                                                        <td className="px-2 py-2">
                                                            <input
                                                                className="h-[32px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]"
                                                                value={String(zone?.label || "")}
                                                                onChange={(e) => updatePricingZone(activePricingCategory, index, "label", e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="px-2 py-2">
                                                            <span className="inline-flex h-[32px] items-center rounded-[8px] border border-[#E5E7EB] bg-[#F8FAFC] px-2 text-[11px] font-[700] text-[#334155]">{String(zone?.key || "")}</span>
                                                        </td>
                                                        <td className="px-2 py-2">
                                                            <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={Boolean(zone?.isActive)}
                                                                    onChange={(e) => updatePricingZone(activePricingCategory, index, "isActive", e.target.checked)}
                                                                />
                                                                Active
                                                            </label>
                                                        </td>
                                                        <td className="px-2 py-2">
                                                            <button
                                                                type="button"
                                                                className="h-[28px] px-2 rounded-[6px] border border-[#FCA5A5] text-[#B91C1C] text-[11px] font-[700]"
                                                                onClick={() => removePricingZone(activePricingCategory, index)}
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activePricingTopic === "lane-matrix" && (
                                <div id="pricing-topic-lane-matrix" className="mt-4 border border-[#E5E7EB] rounded-[10px] p-3 bg-white scroll-mt-24">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-[13px] font-[700] text-[#111827]">Lane Matrix Pricing</p>
                                        <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                            <input
                                                type="checkbox"
                                                checked={activeLaneEnabled}
                                                onChange={(e) => updatePricingLaneMatrix(activePricingCategory, "enabled", e.target.checked)}
                                            />
                                            Enable lane-based pricing enforcement
                                        </label>
                                    </div>
                                    <p className="text-[11px] text-[#64748B] mt-1">When enabled, booking runtime requires a matching lane rule by origin zone, destination zone, service level, and distance band (if configured).</p>

                                    <div className="mt-2 overflow-x-auto">
                                        <table className="w-max min-w-[2100px] text-[11px]">
                                            <thead>
                                                <tr className="bg-[#F8FAFC] text-left border border-[#E5E7EB]">
                                                    <th className="px-2 py-2 min-w-[160px]">Origin Zone</th>
                                                    <th className="px-2 py-2 min-w-[160px]">Destination Zone</th>
                                                    <th className="px-2 py-2 min-w-[160px]">Service Level</th>
                                                    <th className="px-2 py-2 min-w-[130px]">Distance From (km)</th>
                                                    <th className="px-2 py-2 min-w-[130px]">Distance To (km)</th>
                                                    <th className="px-2 py-2 min-w-[110px]">Included Km</th>
                                                    <th className="px-2 py-2 min-w-[90px]">Per Km</th>
                                                    <th className="px-2 py-2 min-w-[110px]">Distance Fee</th>
                                                    <th className="px-2 py-2 min-w-[110px]">Distance Mult.</th>
                                                    <th className="px-2 py-2 min-w-[100px]">Base Price</th>
                                                    <th className="px-2 py-2 min-w-[90px]">Per Kg</th>
                                                    <th className="px-2 py-2 min-w-[100px]">Min Price</th>
                                                    <th className="px-2 py-2 min-w-[110px]">Priority Mult.</th>
                                                    <th className="px-2 py-2 min-w-[70px]">Active</th>
                                                    <th className="px-2 py-2 min-w-[80px]">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {activeLaneRows.map((row, index) => (
                                                    <tr key={`${activePricingCategory}-lane-${row?.id || index}`} className="border-x border-b border-[#E5E7EB]">
                                                        <td className="px-2 py-3 min-w-[160px]">
                                                            <select
                                                                className="h-[44px] w-full min-w-[140px] rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A]"
                                                                value={String(row?.originZone || "*")}
                                                                onChange={(e) => updatePricingLaneRule(activePricingCategory, index, "originZone", String(e.target.value || "*"))}
                                                            >
                                                                {activeZoneOptions.map((option) => (
                                                                    <option key={`${activePricingCategory}-origin-zone-${option.key}`} value={option.key}>{option.label}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-2 py-3 min-w-[160px]">
                                                            <select
                                                                className="h-[44px] w-full min-w-[140px] rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A]"
                                                                value={String(row?.destinationZone || "*")}
                                                                onChange={(e) => updatePricingLaneRule(activePricingCategory, index, "destinationZone", String(e.target.value || "*"))}
                                                            >
                                                                {activeZoneOptions.map((option) => (
                                                                    <option key={`${activePricingCategory}-destination-zone-${option.key}`} value={option.key}>{option.label}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-2 py-3 min-w-[160px]">
                                                            <select
                                                                className="h-[44px] w-full min-w-[140px] rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A]"
                                                                value={String(row?.serviceLevelKey || activeServiceLevelOptions[0]?.key || "")}
                                                                onChange={(e) => updatePricingLaneRule(activePricingCategory, index, "serviceLevelKey", e.target.value)}
                                                            >
                                                                {activeServiceLevelOptions.map((option) => (
                                                                    <option key={`${activePricingCategory}-lane-service-${option.key}`} value={option.key}>{option.label}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-2 py-3"><input type="number" min={0} step="0.1" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]" value={Number(row?.distanceFromKm || 0)} onChange={(e) => updatePricingLaneRule(activePricingCategory, index, "distanceFromKm", Number(e.target.value || 0))} /></td>
                                                        <td className="px-2 py-3"><input type="number" min={0} step="0.1" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]" value={row?.distanceToKm === null || row?.distanceToKm === undefined || row?.distanceToKm === "" ? "" : Number(row?.distanceToKm || 0)} placeholder="No limit" onChange={(e) => updatePricingLaneRule(activePricingCategory, index, "distanceToKm", e.target.value === "" ? null : Number(e.target.value || 0))} /></td>
                                                        <td className="px-2 py-3"><input type="number" min={0} step="0.1" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]" value={Number(row?.distanceBaseKm || 0)} onChange={(e) => updatePricingLaneRule(activePricingCategory, index, "distanceBaseKm", Number(e.target.value || 0))} /></td>
                                                        <td className="px-2 py-3"><input type="number" min={0} step="0.01" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]" value={Number(row?.perKmPrice || 0)} onChange={(e) => updatePricingLaneRule(activePricingCategory, index, "perKmPrice", Number(e.target.value || 0))} /></td>
                                                        <td className="px-2 py-3"><input type="number" min={0} step="0.01" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]" value={Number(row?.distanceSurcharge || 0)} onChange={(e) => updatePricingLaneRule(activePricingCategory, index, "distanceSurcharge", Number(e.target.value || 0))} /></td>
                                                        <td className="px-2 py-3"><input type="number" min={0.1} step="0.01" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]" value={Number(row?.distanceMultiplier || 1)} onChange={(e) => updatePricingLaneRule(activePricingCategory, index, "distanceMultiplier", Number(e.target.value || 1))} /></td>
                                                        <td className="px-2 py-3"><input type="number" min={0} step="0.01" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]" value={Number(row?.basePrice || 0)} onChange={(e) => updatePricingLaneRule(activePricingCategory, index, "basePrice", Number(e.target.value || 0))} /></td>
                                                        <td className="px-2 py-3"><input type="number" min={0} step="0.01" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]" value={Number(row?.perKgPrice || 0)} onChange={(e) => updatePricingLaneRule(activePricingCategory, index, "perKgPrice", Number(e.target.value || 0))} /></td>
                                                        <td className="px-2 py-3"><input type="number" min={0} step="0.01" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]" value={Number(row?.minPrice || 0)} onChange={(e) => updatePricingLaneRule(activePricingCategory, index, "minPrice", Number(e.target.value || 0))} /></td>
                                                        <td className="px-2 py-3"><input type="number" min={0.1} step="0.01" className="h-[44px] w-full rounded-[8px] border border-[#D1D5DB] bg-white px-2 text-[#0F172A] placeholder:text-[#94A3B8]" value={Number(row?.priorityMultiplier || 1)} onChange={(e) => updatePricingLaneRule(activePricingCategory, index, "priorityMultiplier", Number(e.target.value || 1))} /></td>
                                                        <td className="px-2 py-3">
                                                            <label className="inline-flex items-center gap-2 text-[11px] font-[700] text-[#334155]">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={Boolean(row?.isActive)}
                                                                    onChange={(e) => updatePricingLaneRule(activePricingCategory, index, "isActive", e.target.checked)}
                                                                />
                                                                Active
                                                            </label>
                                                        </td>
                                                        <td className="px-2 py-3">
                                                            <button type="button" className="h-[44px] px-2 rounded-[6px] border border-[#FCA5A5] text-[#B91C1C] text-[11px] font-[700]" onClick={() => removePricingLaneRule(activePricingCategory, index)}>
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-2">
                                        <button type="button" className="h-[30px] px-3 rounded-[8px] border border-[#0955AC] text-[#0955AC] text-[11px] font-[700]" onClick={() => addPricingLaneRule(activePricingCategory)}>
                                            Add Lane Rule
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activePricingTopic === "preview" && (
                                <div id="pricing-topic-preview" className="mt-4 border border-[#E5E7EB] rounded-[10px] p-3 bg-[#F8FAFC] scroll-mt-24">
                                    <p className="text-[13px] font-[700] text-[#111827] mb-2">Formula Validation Preview</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        <Field label="Weight (kg)"><input type="number" min={0.1} step="0.1" className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(pricingPreviewInput.weightKg || 0)} onChange={(e) => setPricingPreviewInput((prev) => ({ ...prev, weightKg: Number(e.target.value || 0) }))} /></Field>
                                        <Field label="Length (cm)"><input type="number" min={1} className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(pricingPreviewInput.lengthCm || 0)} onChange={(e) => setPricingPreviewInput((prev) => ({ ...prev, lengthCm: Number(e.target.value || 0) }))} /></Field>
                                        <Field label="Width (cm)"><input type="number" min={1} className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(pricingPreviewInput.widthCm || 0)} onChange={(e) => setPricingPreviewInput((prev) => ({ ...prev, widthCm: Number(e.target.value || 0) }))} /></Field>
                                        <Field label="Height (cm)"><input type="number" min={1} className="h-[34px] w-full rounded-[8px] border border-[#D1D5DB] px-2 text-[12px]" value={Number(pricingPreviewInput.heightCm || 0)} onChange={(e) => setPricingPreviewInput((prev) => ({ ...prev, heightCm: Number(e.target.value || 0) }))} /></Field>
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        {pricingPreviewRows.map((row) => (
                                            <div key={`preview-${row.id}`} className="border border-[#E5E7EB] rounded-[8px] p-2 bg-white">
                                                <p className="text-[12px] font-[700] text-[#111827]">{row.label} ({row.slaDays} day{row.slaDays > 1 ? "s" : ""})</p>
                                                <p className="text-[11px] text-[#475569] mt-1">Service Level: {row.serviceLevelLabel} • Cutoff {row.cutoffTime}</p>
                                                <p className="text-[11px] text-[#475569] mt-1">Chargeable Weight: {row.chargeableWeight} kg</p>
                                                <p className="text-[11px] text-[#475569] mt-1">Base Currency Total: {formatMoney(row.totalBaseCurrency, activePricingLocalization.baseCurrency, activePricingLocalization.locale)}</p>
                                                <p className="text-[12px] font-[700] text-[#0F172A] mt-1">Display Total: {formatMoney(row.totalDisplayCurrency, activePricingLocalization.displayCurrency, activePricingLocalization.locale)}</p>
                                            </div>
                                        ))}
                                        {pricingPreviewRows.length === 0 && (
                                            <p className="text-[11px] text-[#6B7280]">No pricing tiers configured for this category.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            </div>
                        </SectionCard>
                    </div>
                </div>
            );
};

export default SettingsPricingTab;
