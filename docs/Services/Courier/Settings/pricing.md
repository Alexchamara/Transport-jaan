# Courier Settings: Pricing (Complete Guide)

## 1. Purpose

This document explains all pricing-related settings in Courier Service and how they work together in production.

Use this guide when you need to:
- configure or update pricing,
- understand quote behavior on client side,
- operate governance flows safely,
- troubleshoot pricing incidents,
- rollback to a previous stable pricing version.

## 2. Pricing Scope and Structure

Pricing is category-scoped:
- domestic
- logistic

A vendor can manage only approved categories from registration scope.

Pricing settings are grouped as:
- Currency Localization
- Formula Controls
- Rate Cards
- Service Catalog
- Zone Master
- Lane Matrix Pricing
- Rule-Based Policy Modules
- Formula Validation Preview
- Pricing Governance

## 3. Who Uses This and Why

### Vendor
- Configures tariffs and policy behavior.
- Publishes/schedules/requests approval.
- Maintains route, surcharge, and contract logic.

### Client Impact
- Receives final quote totals affected by these settings.
- Can be blocked by invalid service-level, tier, lane, or policy constraints.
- Sees better consistency when governance and guardrails are used correctly.

### Superadmin Dependency
- Approves vendor registration scope (domestic/logistic).
- Ensures role and governance standards are in place.
- Oversees incident control and compliance patterns.

## 4. Runtime Quote Flow (How Final Price Is Built)

At a high level, runtime quote flow is:
1. Resolve assignment category (domestic/logistic).
2. Load vendor pricing config for that category.
3. Enforce service catalog and tier policy constraints.
4. If lane matrix is enabled, enforce matching lane rule; otherwise use fallback quote base.
5. Apply formula math.
6. Apply policy modules in order.
7. Apply runtime governance guardrails.
8. Convert currency for display and return final estimate.

Important:
- Lane matrix can hard-fail pricing if no active rule matches.
- Guardrails and field locks can reject or cap client-side review changes.

## 5. Currency Localization

Fields:
- `baseCurrency`
- `displayCurrency`
- `locale`
- `exchangeRateProvider`
- `autoLiveRates`
- `manualRates`
- `lastSyncedAt`

What should be done:
- Keep base currency stable unless there is an approved finance change.
- Keep manual rates accurate if live rates are unavailable.

Connected components:
- Formula preview total display.
- Runtime conversion behavior.
- Live-rate sync action.

Change impact:
- `displayCurrency` changes presentation.
- `manualRates` changes converted totals.

How clients are affected:
- Quoted display totals change with conversion rates.

Maintenance:
- Daily rate freshness check.
- Weekly finance cross-check.

Example:
- Base LKR, Display USD for export-focused logistics clients.

## 6. Formula Controls

Fields:
- `volumetricDivisor`
- `useChargeableWeight`
- `fuelSurchargePercent`
- `handlingFee`
- `taxPercent`
- `roundTo`

What should be done:
- Validate divisor and surcharge with actual cost profile.
- Keep round precision aligned with billing policy.

Connected components:
- Rate cards and lane tariff rows.
- Formula preview.
- Runtime estimation chain.

Change impact:
- Affects broad quote behavior per category.

How clients are affected:
- Immediate change in quote values, especially volumetric shipments.

Maintenance:
- Monthly formula review with finance and ops.

Example:
- Increased fuel surcharge during high fuel volatility periods.

## 7. Rate Cards

Fields per row:
- `id`
- `label`
- `serviceLevelKey`
- `slaDays`
- `basePrice`
- `perKgPrice`
- `minPrice`
- `priorityMultiplier`

What should be done:
- Keep rows tied to valid service-level keys.

Connected components:
- Formula preview calculations.
- Fallback/base pricing behavior when lane matrix is not driving the tariff.

Change impact:
- Direct tier-level quote shifts.

How clients are affected:
- Sees changed price by service tier.

Maintenance:
- Monthly competitiveness and margin review.

Example:
- One-day domestic tier updated for high-density metro demand.

## 8. Service Catalog

Fields per row:
- `key`
- `label`
- `promisedSlaDays`
- `cutoffTime`
- `isActive`
- `sortOrder`

What should be done:
- Keep keys normalized and stable.
- Use `isActive` to safely disable unavailable service levels.

Connected components:
- Shipment service-level validation.
- Tier engine key lookup.
- Lane matrix service-level matching.

Change impact:
- Wrong or disabled keys can block booking path.

How clients are affected:
- May be prevented from selecting invalid/unavailable service levels.

Maintenance:
- Daily cutoff and availability validation.

Example:
- Same-day cutoff moved earlier during heavy traffic periods.

## 9. Zone Master

Fields per row:
- `key`
- `label`
- `isActive`
- `sortOrder`

What should be done:
- Maintain stable zone keys.
- Only deactivate zones after lane migration planning.

Connected components:
- Lane matrix origin/destination zone matching.
- Route specificity scoring.

Change impact:
- Incorrect keys can break lane matching and quote enforcement.

How clients are affected:
- Potential pricing failures on affected routes.

Maintenance:
- Weekly geography alignment checks.

Example:
- Add new suburban zone key before introducing fresh lane rules.

## 10. Lane Matrix Pricing

Top-level fields:
- `enabled.domestic`
- `enabled.logistic`

Lane row fields:
- `id`
- `originZone`
- `destinationZone`
- `serviceLevelKey`
- `distanceFromKm`
- `distanceToKm`
- `distanceBaseKm`
- `perKmPrice`
- `distanceSurcharge`
- `distanceMultiplier`
- `basePrice`
- `perKgPrice`
- `minPrice`
- `priorityMultiplier`
- `isActive`

What should be done:
- Build from specific routes to fallback patterns.
- Validate wildcard use (`*`) intentionally.

Connected components:
- Address-to-zone resolver.
- Distance matching logic.
- Rule specificity score selection.
- Formula and policy modules downstream.

Change impact:
- Enabling lane matrix forces strict route-match behavior.
- Missing lanes can create validation errors.

How clients are affected:
- Better route-specific fairness but stricter route coverage needs.

Maintenance:
- Weekly lane coverage audit.
- Update lane rows before route expansion go-live.

Example:
- Colombo to Kandy next-day band priced separately from generic inland traffic.

## 11. Rule-Based Policy Modules

These run over base formula output and can increase, reduce, cap, or block quote outcomes.

### 11.1 Speed/ETA Explicit Tier Engine

Engine fields:
- `enabled`
- `enforceFixedNamedTiers`
- `enforceTierPricingMultiplier`

Tier fields:
- `enabled`
- `etaLabel`
- `etaMinDays`
- `etaMaxDays`
- `priceMultiplier`
- `maxDistanceKm`
- `maxWeightKg`
- `minLeadHours`
- `maxLeadHours`
- `allowedPickupDays`
- `blackoutDates`

What should be done:
- Keep service keys aligned with catalog.
- Validate day/date/lead rules before publish.

Connected components:
- Shipment pickup date/time.
- Service-level policy validators.
- ETA projection output.

Change impact:
- Can reject non-compliant bookings.
- Can materially change price via multiplier.

How clients are affected:
- Stricter but clearer ETA/service boundaries.

Maintenance:
- Weekly blackout and pickup policy review.

Example:
- Same-day tier only allowed within defined distance and lead window.

### 11.2 Logistic Dimensions Engine

Fields:
- `enabled`
- `enforceForLogisticOnly`
- `unitTypeMultipliers`
- `routeClassMultipliers`
- `handlingClassMultipliers`
- `w2wOption.enabled`
- `w2wOption.strictForLogistic`
- `w2wOption.defaultMode`
- `w2wOption.minimumUnitCount`
- `w2wOption.maximumUnitCount`
- `w2wOption.modeMultipliers`

What should be done:
- Keep multiplier keys consistent with shipment payload keys.
- Keep min/max unit constraints practical.

Connected components:
- Shipment logistic dimensions input.
- Runtime validation and multiplier projection.

Change impact:
- Invalid keys lead to validation failures.

How clients are affected:
- More accurate complexity pricing on logistic shipments.

Maintenance:
- Bi-weekly operations calibration.

Example:
- Door-to-door mode multiplier higher than port-to-port for long-haul logistics.

### 11.3 Remote Area Surcharge

Fields:
- `enabled`
- `flatFee`
- `applyOnOrigin`
- `applyOnDestination`
- `postalCodePrefixes`
- `cityKeywords`

What should be done:
- Maintain precise prefixes/keywords.

Connected components:
- Sender/recipient address fields.

Change impact:
- Broad matching can overcharge non-remote routes.

How clients are affected:
- Remote routes receive surcharge where applicable.

Maintenance:
- Monthly keyword cleanup.

Example:
- Prefix-based surcharge for hard-to-reach hill-country routes.

### 11.4 Oversize / Overweight Rules

Fields:
- `enabled`
- `maxWeightKg`
- `overweightPerKgFee`
- `maxLengthCm`
- `maxWidthCm`
- `maxHeightCm`
- `oversizeFlatFee`

What should be done:
- Keep limits aligned with handling capability.

Connected components:
- Package dimensions and weight.

Change impact:
- Protects margin for costly handling profiles.

How clients are affected:
- Heavy/bulky items priced with explicit surcharge logic.

Maintenance:
- Quarterly threshold review with warehouse and fleet teams.

Example:
- Large appliance shipment triggers oversize fee even when weight threshold is not breached.

### 11.5 Peak Hour / Holiday Surcharges

Fields:
- `enabled`
- `peakStartTime`
- `peakEndTime`
- `daysOfWeek`
- `peakPercent`
- `peakFlatFee`
- `holidayDates`
- `holidayPercent`
- `holidayFlatFee`

What should be done:
- Keep holiday dates updated and validated.
- Confirm overnight window behavior.

Connected components:
- Pickup date and pickup window start.

Change impact:
- Significant short-term quote movement in surge windows.

How clients are affected:
- Premium pricing on peak and holiday pickups.

Maintenance:
- Pre-season calendar updates.

Example:
- Avurudu and Vesak pickups priced with holiday uplift.

### 11.6 COD and Minimum Charge Guardrail

COD fields:
- `codFee.enabled`
- `codFee.flatFee`
- `codFee.percentOfDeclaredValue`
- `codFee.minFee`
- `codFee.maxFee`

Minimum fields:
- `minimumShipmentCharge.enabled`
- `minimumShipmentCharge.minimumTotal`

What should be done:
- Set COD and minimum floors to protect operating margin.

Connected components:
- Declared value in shipment/packages.

Change impact:
- Prevents underpricing low-ticket or collection-heavy orders.

How clients are affected:
- Clear baseline charges for COD and low-value shipments.

Maintenance:
- Monthly finance and collections review.

Example:
- COD grocery order still receives minimum operational charge.

### 11.7 Quote Runtime Governance Guardrails

Fields:
- `quoteRuntimeGovernance.enabled`
- `fieldLocks.enabled`
- `fieldLocks.lockShipmentServiceLevel`
- `fieldLocks.lockPackageServiceLevel`
- `fieldLocks.lockPackageCourierProvider`
- `fieldLocks.lockQuoteTotal`
- `discountGuardrails.enabled`
- `discountGuardrails.maxDiscountPercent`
- `discountGuardrails.maxDiscountAmountUsd`
- `floorPriceGuardrail.enabled`
- `floorPriceGuardrail.minimumTotalUsd`

What should be done:
- Enable locks for controlled review workflows.
- Set conservative discount and floor boundaries.

Connected components:
- Review context selected quotes and discount values.
- Runtime validators and guardrail calculators.

Change impact:
- Blocks unauthorized quote tampering.

How clients are affected:
- More reliable final review and confirmation totals.

Maintenance:
- Quarterly governance control review.

Example:
- Requested discount above policy is capped automatically; difference recorded in policy breakdown.

### 11.8 Customer Contract Pricing

Top-level fields:
- `customerContractPricing.enabled`
- `customerContractPricing.contracts`

Contract fields:
- `enabled`
- `priority`
- `allAccounts`
- `accountUserId`
- `accountUserIds`
- `category`
- `categories`
- `effectiveFrom`
- `effectiveTo`
- `autoRenew`
- `renewalCycleDays`
- `renewalGraceDays`
- `maxRenewals`
- `negotiatedRateType`
- `negotiatedRateValue`
- `minimumTotal`
- `volumeMetric`
- `volumeLookbackDays`
- `volumeTiers`

Volume tier fields:
- `enabled`
- `minVolume`
- `maxVolume`
- `adjustmentType`
- `adjustmentValue`

What should be done:
- Keep priority deterministic.
- Keep account targeting and date windows clean.
- Keep metric choice aligned to contract type.

Connected components:
- Review context account identity.
- Historical shipment metrics for lookback.
- Runtime contract + tier matcher.

Change impact:
- Strong impact on enterprise account pricing and margin.

How clients are affected:
- Eligible accounts get negotiated and/or volume-based pricing automatically.

Maintenance:
- Weekly active-contract audit.
- Monthly profitability review by contract.

Example:
- Large retail account receives percent-off plus extra tier discount after volume threshold.

## 12. Formula Validation Preview

Preview inputs:
- `weightKg`
- `lengthCm`
- `widthCm`
- `heightCm`

Preview outputs per tier:
- chargeable weight,
- service-level label/cutoff,
- base-currency total,
- display-currency total.

What should be done:
- Test at least 3 patterns before publish:
- light document,
- standard parcel,
- bulky shipment.

Connected components:
- Formula + rate card + localization.

Change impact:
- Catches major arithmetic mistakes before production.

How clients are affected:
- Fewer pricing surprises after release.

Maintenance:
- Mandatory preview run before each publish or approval.

## 13. Pricing Governance Lifecycle

Supported actions:
- Publish Now
- Schedule Publish
- Approve Publish
- Reject Publish
- Rollback Version

Core governance fields:
- `requireApproval`
- `approverRoles`
- `draftVersion`
- `publishedVersion`
- `pendingApproval`
- `scheduledPublish`
- `versionHistory`
- `changeLog`

Strict rule:
- No self-approval: requester cannot approve own pending publish.

What should be done:
- Always include action note.
- Keep backup approver available.
- Confirm rollback target before risky changes.

Connected components:
- Settings governance actions.
- Scheduled publish command.
- Version history rollback resolver.

Change impact:
- Controls release speed and risk exposure.

How clients are affected:
- Better release stability and faster incident recovery.

Maintenance:
- Weekly governance audit: queue, rejection reasons, rollback frequency.

## 14. Troubleshooting Quick Map

### Publish succeeded but quotes unchanged
- Check category used in action.
- Check pending request actually approved.
- Check scheduled effective time reached.
- Check lane matrix is enabled and has matching active rule.

### Approver cannot approve
- Check role is in `approverRoles`.
- Check requester != approver.
- Check membership/permission health.

### Unexpected low/high totals
- Check recent formula edits.
- Check policy module compounding effects.
- Check discount/floor governance settings.
- Rollback to previous stable version if needed.

### One category failing only
- Check category-specific service catalog.
- Check zone and lane matrix rows.
- Check category policy module values.

## 15. Maintenance Cadence

Daily:
- Monitor quote anomalies by category.
- Review pending approvals and scheduled queue.

Weekly:
- Lane coverage and rejection reason review.
- Contract and guardrail utilization review.

Monthly:
- End-to-end pricing audit.
- Rollback drill.
- KPI and margin review.

## 16. Field-Level Production Change Checklist

- [ ] Correct pricing category selected.
- [ ] Registration scope allows that category.
- [ ] Currency settings and rates verified.
- [ ] Formula changes preview-tested.
- [ ] Service catalog keys aligned with tiers and lanes.
- [ ] Zone changes verified against lane matrix.
- [ ] Lane matrix has no critical route gaps.
- [ ] Policy modules checked for compounding effects.
- [ ] Runtime locks and guardrails validated.
- [ ] Contract pricing rules validated for target accounts.
- [ ] Governance action note completed.
- [ ] No self-approval condition satisfied.
- [ ] Rollback target verified in version history.
