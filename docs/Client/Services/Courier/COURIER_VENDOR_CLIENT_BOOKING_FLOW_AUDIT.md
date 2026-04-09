# Courier Vendor-Client Booking Flow Audit

Date: 2026-04-09
Scope: Deep review of whether vendor-side courier configuration changes propagate correctly into client-side booking behavior.

## Executive Verdict

The vendor and client sides are strongly connected on critical booking paths, and the core integration is working.

- Core status: working and test-verified.
- Confidence: high for pricing and COD enforcement paths.
- Important caveat: not fully perfect yet. There are a few consistency gaps where behavior can drift from intended governance or UI expectations.

## What Was Audited

1. Vendor settings write path (controller actions, normalization, category scope enforcement).
2. Client booking read/enforcement path (provider listing, assignment, pricing, policy checks, COD checks).
3. Governance semantics (draft/publish/approval behavior and impact on runtime pricing).
4. COD capability and COD service policy interactions.
5. Existing feature tests that prove vendor-to-client propagation.

## Key Integration Architecture

## Source of truth

- Vendor-configurable settings are persisted in the `courier_vendor_settings` table via model `VendorCourierSetting`.
- Client booking flow reads from this same settings document during create/summary/store.

This is the central integration contract between vendor-side configuration and client-side runtime behavior.

## Vendor-side write and normalization

Primary write entrypoint:
- `VendorCourierDashboardController::updateSettings` in app/Http/Controllers/CourierControllers/Vendor/VendorCourierDashboardController.php:834

Important normalization and scoping:
- `normalizeCourierServiceSettings` in app/Http/Controllers/CourierControllers/Vendor/VendorCourierDashboardController.php:4242
- `normalizePricingSettings` in app/Http/Controllers/CourierControllers/Vendor/VendorCourierDashboardController.php:4753
- `resolveApprovedCourierPricingCategories` in app/Http/Controllers/CourierControllers/Vendor/VendorCourierDashboardController.php:7871
- `enforceApprovedPricingCategoryWriteScope` in app/Http/Controllers/CourierControllers/Vendor/VendorCourierDashboardController.php:7910

COD capability request entrypoint:
- `requestCodCapability` in app/Http/Controllers/CourierControllers/Vendor/VendorCourierDashboardController.php:1106

Pricing import entrypoints:
- `pricingImportPreview` in app/Http/Controllers/CourierControllers/Vendor/VendorCourierDashboardController.php:1223
- `pricingImportApply` in app/Http/Controllers/CourierControllers/Vendor/VendorCourierDashboardController.php:1322

## Client-side read and enforcement

Provider list and pre-booking surfacing:
- `resolveCreateQuoteProviders` in app/Http/Controllers/CourierControllers/Client/ClientCourierController.php:3594

Pricing settings consumed at runtime:
- `resolveCategoryPricingConfigForVendor` in app/Http/Controllers/CourierControllers/Client/ClientCourierController.php:2042
- `resolveLaneMatrixForVendor` in app/Http/Controllers/CourierControllers/Client/ClientCourierController.php:1528

COD and policy enforcement during booking:
- `assertShipmentCODPolicy` in app/Http/Controllers/CourierControllers/Client/ClientCourierController.php:3292
- `resolveApprovedVendorCodCapability` in app/Http/Controllers/CourierControllers/Client/ClientCourierController.php:3344
- `resolveVendorCodServicePolicy` in app/Http/Controllers/CourierControllers/Client/ClientCourierController.php:3363

Service-level and advanced policy enforcement during booking:
- `assertShipmentServiceCatalogPolicy` in app/Http/Controllers/CourierControllers/Client/ClientCourierController.php:3253
- `assertSpeedEtaTierPolicyConstraints` in app/Http/Controllers/CourierControllers/Client/ClientCourierController.php:3381
- `assertInternationalDimensionsPolicyConstraints` in app/Http/Controllers/CourierControllers/Client/ClientCourierController.php:3502

Assignment bridge:
- `CourierVendorAssignmentService::determineAssignment` in app/Services/Courier/CourierVendorAssignmentService.php:10

## Direct Vendor-to-Client Effect Matrix

### Pricing formula and policy modules

Vendor-side:
- Saved/normalized under `settings.pricing` by `updateSettings` and `normalizePricingSettings`.

Client-side effect:
- Used by `resolveCategoryPricingConfigForVendor` and applied in `resolveEstimatedCostWithLaneMatrix` and policy application pipeline.

Result:
- Changes to remote surcharge, COD fee, speed tier multipliers, contract pricing, floor/ceiling guardrails directly change client-side estimated cost and validations.

### Lane matrix and zone mapping

Vendor-side:
- Managed under `settings.pricing.laneMatrix`, `zoneMaster`, `cityZoneMap` (including import flow).

Client-side effect:
- Read by `resolveLaneMatrixForVendor` and matched against sender/recipient zones and service level.

Result:
- Lane enablement and row changes alter client pricing mode and can block booking when no matching rule exists.

### Service catalog

Vendor-side:
- Managed under `settings.pricing.serviceCatalog`.

Client-side effect:
- Enforced by `assertShipmentServiceCatalogPolicy`.

Result:
- If selected service level is not active in vendor catalog, booking is rejected.

### COD capability + COD service policy

Vendor-side:
- Capability request path writes `courier_vendor_cod_capabilities`.
- Service toggles written in `settings.services.cod` with normalization.

Client-side effect:
- `assertShipmentCODPolicy` requires:
  - domestic category,
  - assigned vendor,
  - approved non-expired vendor COD capability,
  - vendor COD service policy allowing checkout and domestic COD.

Result:
- Vendor COD controls and approval state directly gate whether client can submit COD bookings.

## Test Evidence (Executed)

Focused integration run:
- Command:
  - `DB_CONNECTION=mysql DB_DATABASE=Transport DB_HOST=127.0.0.1 DB_PORT=3306 DB_USERNAME=root DB_PASSWORD=*** php artisan test tests/Feature/Courier/CourierAdvancedPricingPoliciesTest.php tests/Feature/Courier/CourierPricingGovernanceTest.php tests/Feature/Courier/CourierSubmissionTest.php`
- Result:
  - 54 passed, 358 assertions

Broader courier run done earlier in the same session:
- Result:
  - 84 passed, 751 assertions, exit code 0

Most relevant proof tests for vendor-to-client linkage:
- tests/Feature/Courier/CourierAdvancedPricingPoliciesTest.php
  - Seeds vendor settings, then posts client booking, asserts pricing/exceptions/COD outcomes.
- tests/Feature/Courier/CourierSubmissionTest.php
  - Validates client booking runtime behavior and operational logging.
- tests/Feature/Courier/CourierPricingGovernanceTest.php
  - Validates governance metadata transitions for vendor pricing actions.

## Findings: What Works Well

1. Single-source settings contract is real and active.
- Vendor writes and client reads are connected through `VendorCourierSetting`.

2. Runtime enforcement is strong.
- Client store path enforces service catalog, speed/ETA, international dimensions, quote governance locks, lane rules, COD policy, and capability status.

3. COD control plane is robust.
- Vendor capability approval plus service toggles are required at client checkout.
- Domestic-only COD guardrail is actively enforced.

4. Observability and safety checks are in place.
- Client flow has structured observability logs and negative-path coverage.

## Findings: Gaps (Not Fully Perfect Yet)

1. Pricing governance appears metadata-first, not runtime-gating for client reads.
- Vendor controller supports `requireApproval`, `pendingApproval`, `publishedVersion`, and snapshot history.
- Client runtime pricing reads directly from current `settings.pricing` in `resolveCategoryPricingConfigForVendor`.
- There is no explicit client read path that selects only the currently published snapshot.

Impact:
- Draft changes can influence client booking behavior before governance publish/approve steps, depending on how vendor users save edits.

2. Client create-page provider tiers are static, not vendor service-catalog driven.
- `resolveCreateQuoteProviders` maps providers through `resolveQuoteProviderTiers`, which returns static tier cards by category.
- Runtime store enforcement still validates against vendor service catalog, so this is mostly a UX consistency issue.

Impact:
- Client may see tier options on create page that differ from vendor active service catalog, then hit validation later in flow.

3. Provider list does not filter by active vendor tiers at listing time.
- Provider can appear in create list because registration is approved, even if service catalog is effectively non-actionable.

Impact:
- Possible late rejection in booking rather than early filtering in provider list.

## Final Assessment

- If the question is: Are vendor and client flows connected? Yes, definitely.
- If the question is: Is it fully perfect with no caveats? Not yet.

Current state is production-strong for core enforcement and COD policy correctness, but there are governance/UI consistency improvements needed to call it fully perfect.

## Recommended Next Improvements

1. Enforce published-only pricing at client runtime.
- Introduce a resolver that reads the published snapshot (by category) for client pricing and policy decisions.

2. Make create-page tiers come from vendor service catalog.
- Replace static `resolveQuoteProviderTiers` output with settings-driven active tiers.

3. Optionally hide vendors that have no active actionable tiers for the target category.
- Shift failure-left from store-time validation to create-time filtering.
