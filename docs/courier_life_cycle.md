# Courier Pricing Lifecycle Operations Guide (Vendor Side First)

## 1. Purpose and Audience

This guide explains how to operate the courier pricing lifecycle in your Laravel + Inertia system for a person with zero technical background.

It is practical, step-by-step, and aligned to the current implementation:
- Pricing is category scoped: domestic and International.
- Vendor access to category depends on approved vendor registration scope.
- Runtime quote logic uses lane matrix + formula + policy modules.
- Runtime governance can enforce field locks and guardrails.
- Governance includes publish now, schedule, approve, reject, rollback, and strict no self-approval.
- Version history is tracked and used for rollback.

## 2. Quick System Map (Non-Technical)

Think of courier pricing as a controlled pipeline:
1. Vendor prepares pricing data.
2. Vendor requests publish or schedules publish.
3. Governance reviews and approves or rejects (with maker-checker rules).
4. Published pricing is used in live quote calculations.
5. Teams monitor impact, maintain rules, and rollback if needed.

Main connected parts:
- Vendor Settings UI (where pricing is edited and governance actions are triggered).
- Pricing storage (vendor settings JSON with category-specific values).
- Client quote runtime (where final price is calculated for bookings/quotes).
- Governance workflow (approval, scheduling, rollback, version history).
- Scheduled publish command (automatically applies due scheduled versions).

## 3. Lifecycle Modules

Each module includes:
- What should be done
- What is connected and what those components are
- What impact a change causes
- How clients are affected
- How to maintain it
- How to operate it with a real-world Sri Lanka example
- Vendor, Client impact, and Superadmin dependency views

---

## Module A: Prerequisites and Access Readiness

### Vendor Perspective
- Vendor must have approved courier registration for at least one pricing category.
- Vendor team members must have correct workspace membership and permission to update settings.
- Vendor should know whether they can operate domestic, International, or both.

### Client Impact Perspective
- If vendor category access is missing, client quotes in that category cannot be correctly served by that vendor.
- Wrong access mapping can cause delayed quote responses or wrong vendor matching.

### Superadmin Dependency Perspective
- Superadmin or platform operations controls registration approval flow and category mapping integrity.
- Superadmin ensures role templates and permissions are correctly seeded and assigned.

### What should be done
- Confirm approved registration scope for vendor: domestic, International, or both.
- Confirm workspace and role permissions before pricing operations start.
- Confirm governance roles (who can request, who can approve).

### What is connected to it and what those components are
- Vendor registration records: source of category authorization.
- Service workspace membership: controls who can access settings.
- RBAC permissions: controls who can update pricing and run governance actions.

### What impact a change causes
- Changing registration scope immediately changes which category pricing can be managed.
- Changing role assignments changes who can publish, approve, or rollback.

### How clients are affected
- Clients see reliable quotes only when vendor has valid category approval and active pricing.
- If access is removed for a category, client experience for that category can degrade until reassigned.

### How to maintain it
- Weekly check: registration status vs active category pricing.
- Weekly check: user roles and approver roles match operations policy.

### Real-world example (Sri Lanka)
- Vendor A is approved for domestic only.
- They can set rates for Colombo to Kandy domestic parcels.
- They cannot operate International price tables for container-linked B2B runs until International registration is approved.

### Prerequisite checklist
- [ ] Vendor registration is approved.
- [ ] Category scope is confirmed (domestic/International/both).
- [ ] Workspace membership is active.
- [ ] Settings update permission exists.
- [ ] Governance approver roles are configured.

---

## Module B: Pricing Model Preparation (By Category)

### Vendor Perspective
- Build pricing separately for domestic and International.
- Prepare lane matrix rows, formula values, and policy modules per category.

### Client Impact Perspective
- Client quote quality depends on complete and clean lane + formula + policy data.
- Missing lane rows or invalid policy values can produce fallback pricing or quote failures.

### Superadmin Dependency Perspective
- Superadmin defines baseline operational standards (required fields, validation standards, allowed structures).
- Superadmin supports vendor onboarding and data quality audits.

### What should be done
- For each approved category:
1. Define lane matrix entries (origin/destination/service combination).
2. Define formula values (base components, surcharges, handling logic).
3. Define policy modules (discount rules, floor/minimum guardrails, constraints).
4. Confirm localization/currency settings.

### What is connected to it and what those components are
- Lane matrix: route-level pricing lookup logic.
- Formula: numeric computation rules applied to each quote.
- Policy modules: business rules such as contract pricing, guardrails, and conditional adjustments.
- Governance fields: version, pending approval, schedule, and history metadata.

### What impact a change causes
- Lane changes affect specific routes immediately after publish.
- Formula changes affect all quotes in that category using that formula.
- Policy changes can override raw formula outputs (for example, contract pricing or floor protection).

### How clients are affected
- Client may see lower/higher quotes, different discount behavior, or eligibility changes.
- SLA promises can be impacted if zone/lane logic changes lead to route mismatch.

### How to maintain it
- Keep lane coverage map current by district/zone.
- Review formula weights monthly against fuel and handling cost trends.
- Test high-volume and edge routes before publication.

### Real-world example (Sri Lanka)
- Domestic category:
- Route Colombo 01 to Galle Fort, same-day express.
- Lane matrix identifies route band and distance bracket.
- Formula applies base fee + distance component + handling fee.
- Policy module applies client contract discount for a retail chain with 300+ monthly shipments.

### Preparation checklist
- [ ] Category selected correctly.
- [ ] Lane rows cover active business routes.
- [ ] Formula values are complete and validated.
- [ ] Policy modules are enabled only where needed.
- [ ] Test quote samples are prepared.

---

## Module C: Drafting, Guardrails, and Safe Change Design

### Vendor Perspective
- Save draft changes first.
- Use quote runtime governance options to prevent unsafe edits and enforce limits.

### Client Impact Perspective
- Guardrails protect clients from extreme price jumps or accidental zero pricing.
- Field locks protect critical fields from unauthorized or accidental edits.

### Superadmin Dependency Perspective
- Superadmin defines policy standards and audits whether vendors are respecting guardrails.
- Superadmin can enforce incident protocols if unsafe configurations are detected.

### What should be done
- Apply draft updates category by category.
- Configure field locks for sensitive fields.
- Configure guardrails (for example, minimum floor and max discount boundaries).
- Validate draft with sample quotes before governance actions.

### What is connected to it and what those components are
- Draft state: temporary working version before publish.
- Field locks: edit restrictions on specified pricing fields.
- Guardrails: rule boundaries that block unsafe runtime outputs.
- Change log and governance metadata: traceability of who changed what and when.

### What impact a change causes
- Locked fields reduce accidental operational risk.
- Guardrails prevent margin loss and abnormal client quote outcomes.
- Overly strict guardrails can reduce competitiveness.

### How clients are affected
- More stable and predictable quote prices.
- Fewer sudden invoice disputes caused by bad pricing input.

### How to maintain it
- Review locked fields quarterly.
- Review guardrail thresholds monthly with finance and operations.
- Keep a documented exception process for emergency campaigns.

### Real-world example (Sri Lanka)
- During Avurudu peak season, vendor team proposes a 20 percent promotional discount.
- Guardrail allows only up to 12 percent in domestic category.
- System stops unsafe discount, avoiding loss-making quotes to high-volume e-commerce clients.

### Safe-change checklist
- [ ] Draft saved before governance action.
- [ ] Field locks configured for critical values.
- [ ] Floor/discount guardrails validated.
- [ ] 5 to 10 sample quotes tested.
- [ ] Change reason documented in note.

---

## Module D: Governance Operations (Publish, Schedule, Approve, Reject, Rollback)

### Vendor Perspective
- Vendor runs pricing governance actions from settings.
- Actions are category specific.
- Maker-checker applies: requester cannot self-approve.

### Client Impact Perspective
- Governance controls reduce production errors.
- Scheduled release supports low-disruption changes outside peak client hours.
- Rollback can quickly restore trusted pricing during incidents.

### Superadmin Dependency Perspective
- Superadmin ensures governance policy is active and auditable.
- Superadmin monitors misuse patterns, approval bottlenecks, and emergency rollback frequency.

### What should be done
- Use the right action for the right situation:
1. Publish now: immediate release (or pending approval if approval required).
2. Schedule publish: future timed release.
3. Approve publish: approver confirms pending request.
4. Reject publish: approver declines and requests correction.
5. Rollback version: publish a previous version snapshot.

### What is connected to it and what those components are
- Pending approval object: stores snapshot, requester, and request time.
- Scheduled publish object: stores snapshot and effective time.
- Version history: list of previous published versions with metadata.
- Change log: governance audit events.

### What impact a change causes
- Publish now updates live quote behavior for chosen category.
- Schedule publish updates at effective time by command execution.
- Approve converts pending snapshot into active version.
- Reject keeps current production version unchanged.
- Rollback reverts operational logic to an earlier trusted version.

### How clients are affected
- Approved/published changes alter quote values immediately or at schedule time.
- Rejected changes protect clients from unverified pricing.
- Rollback minimizes downtime impact after a bad release.

### How to maintain it
- Set clear approver rosters and backup approvers.
- Use notes for every governance action.
- Review version history and change logs weekly.

### Real-world example (Sri Lanka)
- International category update is planned for Monday 6:00 AM for Colombo Port distribution routes.
- Vendor schedules publish Sunday night.
- Monday command applies version automatically.
- If Monday 9:30 AM quote errors spike, approver triggers rollback to version 12.

### Strict no self-approval rule (must enforce)
- Requester of a pending publish cannot approve that same request.
- Even if requester has an approver role, approval must be done by another eligible user.

### Governance action checklist
- [ ] Correct pricing category selected.
- [ ] Governance note entered.
- [ ] Approval requirement checked.
- [ ] Requester and approver are different users.
- [ ] Version history updated after publish/rollback.

---

## Module E: Client Quote Runtime Impact (What Happens After Publish)

### Vendor Perspective
- Published configuration drives real quote outputs for client requests.
- Vendor must understand that lane matrix, formula, and policy modules all combine at runtime.

### Client Impact Perspective
- Client sees final quote based on route data + category + policies.
- Client experience depends on consistency and response speed.

### Superadmin Dependency Perspective
- Superadmin monitors platform-level quote health, anomalies, and fairness compliance.

### What should be done
- Confirm runtime path for each category:
1. Route/lane selection.
2. Formula computation.
3. Policy module adjustments.
4. Guardrail and field lock enforcement.
5. Final quote output.

### What is connected to it and what those components are
- Lane matrix: route lookup and route-level adjustments.
- Formula: base arithmetic engine.
- Policy modules: rule overlays (contracts, thresholds, compliance controls).
- Governance state: determines which version is active.

### What impact a change causes
- Small formula changes can affect every quote in category.
- Lane matrix changes can affect selected districts or corridors only.
- Policy module changes can affect selected client segments.

### How clients are affected
- Price, speed of quote response, and confidence in consistency.
- Contract clients can receive category-scoped negotiated behavior.

### How to maintain it
- Daily monitor top routes and top clients for variance.
- Keep a baseline quote set and compare before/after each publish.

### Real-world example (Sri Lanka)
- A Kandy retail chain places 1,500 monthly domestic parcels.
- Contract policy module applies negotiated rates only for approved domestic category.
- International category remains unaffected for this client.

### Runtime assurance checklist
- [ ] Baseline quotes saved before release.
- [ ] Post-release quote diff reviewed for top 20 lanes.
- [ ] Guardrail breach count checked.
- [ ] Client contract rules verified.

---

## Module F: Ongoing Maintenance and Continuous Operations

### Vendor Perspective
- Pricing operations are continuous, not one-time.
- Vendor operations should run daily, weekly, and monthly routines.

### Client Impact Perspective
- Good maintenance means fewer quote surprises and fewer disputes.

### Superadmin Dependency Perspective
- Superadmin validates operational maturity and enforces corrective plans for repeated failures.

### What should be done
- Run maintenance cadence:
1. Daily: monitor failed quotes, guardrail breaches, approval backlog.
2. Weekly: review margin, lane coverage, and rejected changes.
3. Monthly: full pricing health audit by category.

### What is connected to it and what those components are
- Governance logs and version history.
- Quote outcomes and support tickets.
- Finance margin analysis and contract compliance checks.

### What impact a change causes
- Timely maintenance reduces incident frequency.
- Ignored maintenance causes hidden configuration drift.

### How clients are affected
- Better predictability, fewer support escalations, and faster correction cycles.

### How to maintain it
- Use KPI checklist (provided below).
- Keep a release calendar and responsibility matrix.
- Keep rollback rehearsals in monthly drills.

### Real-world example (Sri Lanka)
- Fuel cost rises quickly over two weeks.
- Vendor updates domestic formula surcharge with approval.
- Weekly monitoring confirms margin recovery without abnormal client churn.

### Maintenance checklist
- [ ] Daily quote anomaly review completed.
- [ ] Weekly governance backlog reviewed.
- [ ] Monthly version-history audit completed.
- [ ] Top complaint causes mapped to pricing components.

---

## Module G: Incident Response and Rollback Operations

### Vendor Perspective
- When pricing incident happens, speed and discipline are critical.
- Rollback is the primary stabilization tool.

### Client Impact Perspective
- Fast rollback reduces wrong-quote exposure and trust damage.

### Superadmin Dependency Perspective
- Superadmin coordinates cross-vendor incidents, communications, and postmortem quality.

### What should be done
- Incident steps:
1. Detect issue (abnormal quote spike/drop, complaint burst, margin alarm).
2. Freeze further risky edits.
3. Identify affected category (domestic or International).
4. Select rollback target from version history.
5. Execute rollback action and validate sample quotes.
6. Communicate status to support, sales, and client-facing teams.
7. Document root cause and prevention actions.

### What is connected to it and what those components are
- Version history: source of trusted rollback target.
- Governance rollback action: controlled publication of prior snapshot.
- Change log: forensic timeline.
- Support channels: client communication layer.

### What impact a change causes
- Rollback restores prior stable behavior quickly.
- If wrong rollback target is chosen, issue can persist.

### How clients are affected
- Temporary quote volatility during incident window.
- Rapid rollback minimizes downstream billing disputes.

### How to maintain it
- Keep at least one known stable version tagged internally.
- Run rollback drill monthly per category.
- Keep incident comms template ready.

### Real-world example (Sri Lanka)
- International quotes from Colombo Port to Kurunegala drop below cost due to incorrect multiplier.
- Ops detects margin anomaly in one hour.
- Approver rolls back from version 18 to version 17.
- Quotes normalize and client escalations stop.

### Incident rollback checklist
- [ ] Incident severity declared.
- [ ] Category isolated.
- [ ] Rollback version selected from history.
- [ ] Rollback executed by authorized approver.
- [ ] 10 critical route quotes revalidated.
- [ ] Stakeholder communication sent.
- [ ] Postmortem logged.

---

## 4. Risk Matrix

| Risk | Likelihood | Impact | Early Signal | Preventive Control | Immediate Action |
|---|---|---|---|---|---|
| Wrong lane matrix row for high-volume route | Medium | High | Sudden route-level quote mismatch | Peer review + sample quote tests | Rollback and patch lane row |
| Formula multiplier typo | Medium | High | Margin drop across category | Field locks + guardrails + approval | Emergency rollback |
| Unauthorized category operation | Low | High | Access errors or forbidden actions | Registration-scope enforcement | Correct registration mapping |
| Self-approval bypass attempt | Low | High | Audit mismatch on requester/approver | Strict no self-approval rule | Block action and investigate |
| Scheduled publish at wrong time | Medium | Medium | Off-hour quote behavior change | Publish calendar + approval note | Rollback and reschedule |
| Missing guardrail configuration | Medium | High | Extreme discounts/floor breach | Runtime governance checks | Apply guardrails and republish |
| Approval bottleneck | Medium | Medium | Pending queue grows | Backup approvers and SLA | Escalate to superadmin |
| Frequent rollbacks | Medium | High | Multiple reversions per month | Better testing and release gating | Freeze major changes and audit |

## 5. Troubleshooting Playbook

### Issue 1: Publish action completed but client quotes did not change
- What to check:
- [ ] Correct category was published.
- [ ] Pending approval was actually approved.
- [ ] Scheduled publish effective time has passed.
- [ ] Runtime test quotes are using the same category.
- Action:
- [ ] Verify active governance version.
- [ ] Verify latest version history entry.
- [ ] Re-run controlled sample quotes.

### Issue 2: Approver cannot approve request
- What to check:
- [ ] User role is in approver roles.
- [ ] Requester is not same as approver.
- [ ] Membership and permission are active.
- Action:
- [ ] Assign backup approver.
- [ ] Keep request pending until valid approver acts.

### Issue 3: Unexpected low or zero quote values
- What to check:
- [ ] Formula changes in latest version.
- [ ] Policy module overrides.
- [ ] Guardrail thresholds and floor settings.
- Action:
- [ ] Rollback to previous stable version.
- [ ] Re-test and republish corrected version.

### Issue 4: Only one category behaving incorrectly
- What to check:
- [ ] Category-specific lane matrix.
- [ ] Category formula block.
- [ ] Category policy modules.
- Action:
- [ ] Rollback only affected category.
- [ ] Keep unaffected category unchanged.

### Issue 5: Too many rejected publish requests
- What to check:
- [ ] Draft quality and missing test evidence.
- [ ] Approver notes pattern.
- Action:
- [ ] Add pre-publish checklist enforcement.
- [ ] Run draft quality training for vendor team.

## 6. KPI Checklist (Operational Health)

Track weekly and monthly.

### Governance KPIs
- [ ] Approval turnaround time (target: within agreed SLA).
- [ ] Pending publish queue size by category.
- [ ] Reject rate with reason classification.
- [ ] Self-approval violation attempts (target: zero successful).

### Runtime KPIs
- [ ] Quote success rate by category.
- [ ] Quote anomaly rate (large variance vs baseline).
- [ ] Guardrail breach count.
- [ ] Top-lane quote stability index.

### Commercial KPIs
- [ ] Gross margin trend by category.
- [ ] Contract client variance vs expected pricing.
- [ ] Client pricing complaint count.
- [ ] Refund/credit notes linked to pricing issues.

### Reliability KPIs
- [ ] Rollback frequency (target: low and declining).
- [ ] Mean time to detect pricing incident.
- [ ] Mean time to restore stable pricing.

## 7. Day-by-Day Onboarding Plan (First 10 Days)

### Day 1: Orientation
- [ ] Understand domestic vs International category model.
- [ ] Learn registration-scope dependency.
- [ ] Review governance actions and approval flow.

### Day 2: Access and Roles
- [ ] Validate workspace membership and permissions.
- [ ] Confirm approver roster and backup approver.

### Day 3: Data Structure Basics
- [ ] Learn lane matrix concept.
- [ ] Learn formula and policy module basics.

### Day 4: Draft Practice (Domestic)
- [ ] Build draft for 3 domestic routes.
- [ ] Add guardrails and test sample quotes.

### Day 5: Governance Practice
- [ ] Simulate publish now with approval required.
- [ ] Simulate approve and reject paths.

### Day 6: Scheduled Release Practice
- [ ] Schedule a low-risk release.
- [ ] Validate timing and post-release checks.

### Day 7: Rollback Drill
- [ ] Pick known stable version.
- [ ] Execute rollback simulation and recovery validation.

### Day 8: Client Impact Validation
- [ ] Review top 20 client quote comparisons before/after.
- [ ] Document client-facing communication steps.

### Day 9: Incident Simulation
- [ ] Simulate low-margin incident.
- [ ] Perform detection, rollback, and postmortem draft.

### Day 10: Readiness Sign-off
- [ ] Complete KPI checklist review.
- [ ] Complete governance compliance checklist.
- [ ] Sign off with superadmin/ops lead.

## 8. Operational SOP: Daily/Weekly/Monthly

### Daily SOP
- [ ] Check pending approvals and schedule queue.
- [ ] Check quote anomalies by category.
- [ ] Check guardrail and lock-related blocks.

### Weekly SOP
- [ ] Review published changes and business outcomes.
- [ ] Review rejection reasons and fix recurring errors.
- [ ] Audit top client segments for pricing consistency.

### Monthly SOP
- [ ] Run full version history review.
- [ ] Run rollback drill per category.
- [ ] Tune formula and policy modules with finance input.

## 9. Change Communication Template (Internal)

Use this for every publish, schedule, or rollback.

- Category: domestic/International
- Action: publish now/schedule/approve/reject/rollback
- Version: from X to Y
- Effective time: immediate or scheduled timestamp
- Expected client impact: none/limited/moderate/high
- Validation done: sample routes and top clients
- Owner: name
- Approver: name
- Backout plan: rollback version number

## 10. Final Control Checklist (Before Any Production Change)

- [ ] Category selected correctly.
- [ ] Registration scope allows this category.
- [ ] Draft tested with real route examples.
- [ ] Guardrails and field locks validated.
- [ ] Governance note is clear and specific.
- [ ] No self-approval condition satisfied.
- [ ] Rollback target known before release.
- [ ] Client impact message prepared.

---

## Appendix: One End-to-End Sri Lanka Scenario

Scenario: Vendor updates domestic rates for Colombo 01, Dehiwala, and Gampaha due to fuel and labor increase.

1. Vendor prepares domestic lane matrix update and formula adjustment.
2. Vendor enables guardrail so final discount cannot exceed policy limit.
3. Vendor saves draft and requests publish with note.
4. Different approver reviews sample quote sheet and approves.
5. New version becomes active for domestic only.
6. Client quotes increase by controlled amount, International category remains unchanged.
7. Ops monitors complaint rate and margin for 48 hours.
8. If anomaly appears, approver rolls back to previous domestic version using version history.

Outcome:
- Controlled release, auditable approval, protected client experience, fast recovery path.

---

## 11. Advanced Pricing Deep Dive (Field-by-Field)

This section explains every major part under Advanced Pricing in simple, practical language.

How to read this section:
- Field: the actual config key in the system.
- What it does: plain meaning of the field.
- Client-side connection: where it affects the quote/booking journey.
- Operations view: what Vendor, Client impact, and Superadmin dependency look like.

### 11.1 Currency Localization

Fields:
- `baseCurrency`: master currency used for formula math in this category.
- `displayCurrency`: currency shown in vendor preview and quote display layer.
- `locale`: display format locale, for example `en-LK`.
- `exchangeRateProvider`: live-rate source label, default provider is frankfurter.app.
- `autoLiveRates`: if true, vendor intends to keep rates synced from provider.
- `manualRates`: map of currency code to rate. Base currency is forced to `1`.
- `lastSyncedAt`: timestamp for last live-rate sync.

What should be done:
- Keep `baseCurrency` stable unless finance explicitly approves a migration.
- Keep realistic `manualRates` when live sync is unavailable.
- Re-sync before major campaign or season peak.

Connected components:
- Formula preview uses localization to calculate display totals.
- Runtime quote conversion uses manual rates from vendor settings.
- Live sync button updates manual rate values and sync timestamp.

Change impact:
- Changing `displayCurrency` changes how price is presented, not the logic of lane/formula.
- Changing `manualRates` directly changes converted totals seen by users.

How clients are affected:
- Client-facing estimate can move up/down if conversion rates change.
- Poor rates create trust issues when invoice and quote diverge.

Maintenance:
- Daily: check if key rates are stale.
- Weekly: compare rates with treasury/finance source.

Sri Lanka example:
- Vendor keeps base as LKR and display as USD for export clients in Colombo port logistics.
- USD rate is refreshed before Monday pricing release to avoid underquoting.

Operations view:
- Vendor: keeps practical conversion for quoting.
- Client impact: sees stable and understandable currency output.
- Superadmin dependency: ensures rate-sync path is healthy and auditable.

### 11.2 Formula Controls (Domestic)

Fields:
- `volumetricDivisor`: converts volume to volumetric weight.
- `useChargeableWeight`: if true, uses max(actual, volumetric) weight.
- `fuelSurchargePercent`: percent add-on after base tier computation.
- `handlingFee`: flat add-on per quote calculation path.
- `taxPercent`: percent applied on subtotal.
- `roundTo`: decimal precision, bounded to 0 to 4.

What should be done:
- Calibrate divisor and surcharge with current operations cost.
- Keep `roundTo` consistent with billing policy.

Connected components:
- Formula preview panel in settings.
- Runtime estimated cost calculation before policy module adjustments.
- Lane/rate card values feed into this formula chain.

Change impact:
- Formula changes affect broad traffic in the category.
- `useChargeableWeight` toggle can materially change bulky parcel pricing.

How clients are affected:
- Immediate quote value changes, especially for high-volume light shipments.

Maintenance:
- Monthly finance review of surcharge and handling.
- Peak-season review for fuel/tax changes.

Sri Lanka example:
- Colombo to Galle e-commerce parcels increased handling due fuel and sorting load.
- Vendor raises `fuelSurchargePercent` and validates preview for 0.5 kg to 10 kg ranges.

Operations view:
- Vendor: controls base commercial behavior.
- Client impact: sees quicker movement in quote totals.
- Superadmin dependency: may require policy controls for risky jumps.

### 11.3 Rule-Based Policy Modules Overview

All modules below are category-scoped and run on top of formula output. They can increase, decrease, cap, or block outcomes.

#### 11.3.1 Speed/ETA Explicit Tier Engine

Engine fields:
- `enabled`: turns tier policy checks/projections on.
- `enforceFixedNamedTiers`: selected shipment service level must exist in tier map.
- `enforceTierPricingMultiplier`: applies selected tier `priceMultiplier` at runtime.

Tier fields (per tier key such as `same_day`, `next_day`):
- `enabled`
- `etaLabel`
- `etaMinDays`, `etaMaxDays`
- `priceMultiplier`
- `maxDistanceKm`
- `maxWeightKg`
- `minLeadHours`, `maxLeadHours`
- `allowedPickupDays` (1 to 7)
- `blackoutDates` (`YYYY-MM-DD`)

What should be done:
- Keep tier set aligned with service catalog keys.
- Validate pickup-time and blackout constraints before publishing.

Connected components:
- Service catalog and selected shipment service level.
- Runtime validators reject invalid tier/date/lead/distance/weight combinations.
- Runtime projection block in pricing explanation.

Change impact:
- Tight tier constraints reduce operational breaches but can reject more bookings.
- Multiplier changes quickly affect margin and conversion.

How clients are affected:
- Client may get validation errors for unavailable pickup windows.
- ETA promises become stricter and more reliable.

Maintenance:
- Weekly: blackout dates and pickup-day matrix.
- Monthly: check multiplier competitiveness.

Sri Lanka example:
- `same_day` in Western Province capped to distance threshold and strict pickup lead.
- Client requesting too-late pickup gets instant validation feedback instead of later rejection.

Operations view:
- Vendor: controls speed promise discipline.
- Client impact: sees clear availability boundaries.
- Superadmin dependency: can audit SLA governance quality.

#### 11.3.2 International Dimensions Engine

Engine fields:
- `enabled`
- `enforceForInternationalOnly`
- `unitTypeMultipliers` map
- `routeClassMultipliers` map
- `handlingClassMultipliers` map

W2W option fields:
- `w2wOption.enabled`
- `w2wOption.strictForInternational`
- `w2wOption.defaultMode`
- `w2wOption.minimumUnitCount`
- `w2wOption.maximumUnitCount`
- `w2wOption.modeMultipliers`

What should be done:
- Keep multiplier keys aligned to booking payload values.
- Keep min/max unit controls realistic for logistics ops.

Connected components:
- Shipment International dimensions payload (`unitType`, `routeClass`, `handlingClass`, `w2wMode`, `unitCount`).
- Runtime validation checks allowed keys and unit limits.
- Runtime multiplier stack can adjust quote total.

Change impact:
- Wrong map keys cause validation failures.
- Aggressive multipliers can price out clients.

How clients are affected:
- Logistics clients receive stricter data requirements and more accurate complexity pricing.

Maintenance:
- Bi-weekly review with logistics floor team.
- Align multipliers with incident and handling cost data.

Sri Lanka example:
- Port-to-port mode priced lower than door-to-door for Colombo to Trincomalee flow.
- Hazardous handling class multiplier protects margin on specialized movement.

Operations view:
- Vendor: maps operational complexity into price.
- Client impact: more transparent International price differences.
- Superadmin dependency: ensures International schema discipline across vendors.

#### 11.3.3 Remote Area Surcharge

Fields:
- `enabled`
- `flatFee`
- `applyOnOrigin`
- `applyOnDestination`
- `postalCodePrefixes`
- `cityKeywords`

What should be done:
- Define prefixes/keywords for remote coverage.
- Decide whether origin, destination, or both should trigger.

Connected components:
- Sender and recipient address payload (`postalCode`, `city`, `state`).
- Runtime matcher checks prefix or keyword presence.

Change impact:
- Too broad keywords can overcharge many routes.

How clients are affected:
- Clients in remote routes see explicit uplift in quote.

Maintenance:
- Monthly cleanup of keyword lists to avoid false positives.

Sri Lanka example:
- Add postal prefixes for estate and hill-country remote zones.

Operations view:
- Vendor: recovers last-mile remote cost.
- Client impact: pays fair remote premium where applicable.
- Superadmin dependency: can review fairness and abuse risk.

#### 11.3.4 Oversize / Overweight Rules

Fields:
- `enabled`
- `maxWeightKg`
- `overweightPerKgFee`
- `maxLengthCm`, `maxWidthCm`, `maxHeightCm`
- `oversizeFlatFee`

What should be done:
- Set realistic physical thresholds per category.

Connected components:
- Package fields (`weightKg`, `lengthCm`, `widthCm`, `heightCm`, `quantity`).
- Runtime computes overweight total and oversize total separately.

Change impact:
- Protects margin on hard-to-handle parcels.

How clients are affected:
- Bulky/heavy shipments receive clear surcharge components.

Maintenance:
- Review threshold fit with warehouse and vehicle constraints.

Sri Lanka example:
- Furniture parcel exceeding length limit gets oversize fee even if weight is normal.

Operations view:
- Vendor: aligns pricing with handling effort.
- Client impact: predictable fee for large cargo.
- Superadmin dependency: can monitor complaint spikes due to threshold tuning.

#### 11.3.5 Peak Hour / Holiday Surcharges

Fields:
- `enabled`
- `peakStartTime`, `peakEndTime`
- `daysOfWeek`
- `peakPercent`, `peakFlatFee`
- `holidayDates`
- `holidayPercent`, `holidayFlatFee`

What should be done:
- Keep holiday list up-to-date.
- Validate overnight window logic if start > end.

Connected components:
- Shipment pickup date and pickup start time.
- Runtime checks day-of-week, window inclusion, holiday date match.

Change impact:
- Can significantly alter same-day booking totals in rush periods.

How clients are affected:
- Peak/holiday quotes increase transparently at booking time.

Maintenance:
- Update holiday dates ahead of festive season.

Sri Lanka example:
- Avurudu and Vesak date surcharges applied for high-demand pickup windows.

Operations view:
- Vendor: protects capacity during surge.
- Client impact: sees premium for high-demand windows.
- Superadmin dependency: ensures seasonal surcharge use remains compliant.

#### 11.3.6 COD and Minimum Charge Guardrail

COD fields:
- `codFee.enabled`
- `codFee.flatFee`
- `codFee.percentOfDeclaredValue`
- `codFee.minFee`
- `codFee.maxFee`

Minimum charge fields:
- `minimumShipmentCharge.enabled`
- `minimumShipmentCharge.minimumTotal`

What should be done:
- Configure COD ranges to avoid undercharging high-value collections.
- Keep minimum charge aligned with operating floor.

Connected components:
- Shipment declared value and package declared values.
- Runtime applies COD first, then minimum total guardrail.

Change impact:
- Prevents unprofitable small-ticket deliveries.

How clients are affected:
- COD orders and low-value shipments can have clear baseline fees.

Maintenance:
- Monthly COD fee fit review with finance collections data.

Sri Lanka example:
- COD grocery delivery with low subtotal still honors minimum operational charge.

Operations view:
- Vendor: protects collection and delivery economics.
- Client impact: fewer unexpectedly rejected low-value orders.
- Superadmin dependency: can audit abusive minimum-charge settings.

#### 11.3.7 Quote Runtime Governance Guardrails

Top-level field:
- `quoteRuntimeGovernance.enabled`

Field lock block:
- `fieldLocks.enabled`
- `lockShipmentServiceLevel`
- `lockPackageServiceLevel`
- `lockPackageCourierProvider`
- `lockQuoteTotal`

Discount guardrails block:
- `discountGuardrails.enabled`
- `maxDiscountPercent`
- `maxDiscountAmountUsd`

Floor guardrail block:
- `floorPriceGuardrail.enabled`
- `minimumTotalUsd`

What should be done:
- Enable field locks when quotes are reviewed and selected before confirm.
- Set discount ceilings and floor minimum aligned with policy.

Connected components:
- Review context payload (`selectedQuotes`, `discountPercent`, `discountAmountUSD`, `totalPriceUSD`).
- Runtime validators block mismatch and invalid overrides.
- Runtime guardrails cap discount and enforce floor.

Change impact:
- Stops accidental or unauthorized quote tampering.

How clients are affected:
- Higher trust in approved quote consistency.

Maintenance:
- Review lock policy quarterly with sales and compliance.

Sri Lanka example:
- Sales tries large discretionary discount above ceiling.
- System applies allowed amount only and records guardrail delta in breakdown.

Operations view:
- Vendor: enforces policy at execution time.
- Client impact: stable, governed price outcomes.
- Superadmin dependency: validates governance integrity and auditability.

#### 11.3.8 Customer Contract Pricing

Top-level fields:
- `customerContractPricing.enabled`
- `customerContractPricing.contracts`

Per-contract fields:
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
- `negotiatedRateType` (`percent_off`, `flat_off`, `fixed_total`, `multiplier`)
- `negotiatedRateValue`
- `minimumTotal`
- `volumeMetric` (`shipment_count_30d`, `total_weight_kg_30d`, `revenue_usd_30d`, `current_shipment_weight_kg`)
- `volumeLookbackDays`
- `volumeTiers[]` with:
- `enabled`, `minVolume`, `maxVolume`, `adjustmentType`, `adjustmentValue`

What should be done:
- Keep contract priorities clear to avoid ambiguous matching.
- Keep account targeting and category scope correct.
- Keep effective dates and renewal policy consistent with legal terms.

Connected components:
- Review context account ID.
- Shipment history for lookback metrics.
- Runtime contract matcher, renewal checks, and tier matcher.

Change impact:
- Contract updates can strongly change strategic client pricing.

How clients are affected:
- Eligible accounts get negotiated or volume-tier adjustments automatically.

Maintenance:
- Weekly active contract audit.
- Monthly usage and profitability review by contract tier.

Sri Lanka example:
- National retail chain receives domestic percent-off plus additional volume-tier discount once 30-day shipment threshold is crossed.

Operations view:
- Vendor: supports negotiated enterprise pricing safely.
- Client impact: contract entitlements applied consistently.
- Superadmin dependency: supports dispute resolution with audit trace.

### 11.4 Service Catalog

Fields per service level row:
- `key`
- `label`
- `promisedSlaDays`
- `cutoffTime`
- `isActive`
- `sortOrder`

What should be done:
- Keep service keys stable and normalized.
- Ensure inactive rows are not used for live booking.

Connected components:
- Shipment service-level validation.
- Tier engine key matching.
- Lane matrix service-level matching.

Change impact:
- Deactivating a key can block new bookings using that service level.

How clients are affected:
- Client sees immediate availability and cutoff enforcement.

Maintenance:
- Daily cutoff review for operational holidays and rush periods.

Sri Lanka example:
- Same-day service cutoff moved earlier during heavy monsoon disruption.

Operations view:
- Vendor: controls service promise catalog.
- Client impact: clearer and enforceable service availability.
- Superadmin dependency: monitors SLA integrity across vendors.

### 11.5 Pricing Governance

Fields:
- `requireApproval`
- `approverRoles[]`
- `draftVersion`
- `publishedVersion`
- `publishedAt`
- `publishedBy`
- `pendingApproval` object (`snapshot`, `requestedAt`, `requestedBy`, `note`)
- `scheduledPublish` object (`snapshot`, `effectiveAt`, `scheduledBy`, `note`)
- `versionHistory[]` (`version`, `publishedAt`, `publishedBy`, `event`, `snapshot`, `meta`)
- `changeLog[]` (`event`, `at`, `actorUserId`, `meta`)

Supported actions:
- publish now
- schedule publish
- approve publish
- reject publish
- rollback version

Critical rule:
- Requester cannot self-approve their own pending publish.

What should be done:
- Use notes for every governance action.
- Keep approver roles current.

Connected components:
- Settings action endpoint.
- Scheduled publish command execution.
- Rollback resolver from version history.

Change impact:
- Governance shape controls how quickly changes hit client quotes.

How clients are affected:
- Better release reliability and quick rollback recovery.

Maintenance:
- Weekly review of pending queue, rejection reasons, and rollback count.

Sri Lanka example:
- Monday International release is approved by a different approver and later rolled back safely after anomaly detection.

Operations view:
- Vendor: controlled release workflow.
- Client impact: lower incident exposure.
- Superadmin dependency: audit and compliance oversight.

### 11.6 Rate Cards

Fields per rate card row:
- `id`
- `label`
- `serviceLevelKey`
- `slaDays`
- `basePrice`
- `perKgPrice`
- `minPrice`
- `priorityMultiplier`

What should be done:
- Keep rate card rows mapped to valid service-level keys.

Connected components:
- Formula preview and fallback quote logic.
- Service-level labels in UI.

Change impact:
- Alters tier-level quote baseline quickly.

How clients are affected:
- Directly changes quoted amount by service level.

Maintenance:
- Maintain route and segment competitiveness monthly.

Sri Lanka example:
- One-day domestic row adjusted for Colombo same-day congestion.

Operations view:
- Vendor: direct price architecture control.
- Client impact: visible tier-based price shifts.
- Superadmin dependency: may monitor outlier pricing.

### 11.7 Zone Master (Domestic)

Fields per zone row:
- `key`
- `label`
- `isActive`
- `sortOrder`

What should be done:
- Keep zone keys normalized and consistent.
- Deactivate zones only after lane migration.

Connected components:
- Lane matrix origin and destination zone selection.

Change impact:
- Invalid/inactive zone configuration can break lane matching.

How clients are affected:
- Route may fail lane-based pricing if zone map is inconsistent.

Maintenance:
- Review district changes and delivery corridor updates.

Sri Lanka example:
- Domestic zone reclassification for expanding suburban delivery belt around Gampaha.

Operations view:
- Vendor: geography foundation for tariffs.
- Client impact: route accuracy and price consistency.
- Superadmin dependency: supports standardization where needed.

### 11.8 Lane Matrix Pricing

Top-level fields:
- `enabled.domestic`
- `enabled.international`

Lane rule fields:
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
- Build lane rules from specific to broad fallback.
- Keep wildcard usage intentional (`*` zones).

Connected components:
- Address-to-zone resolver.
- Distance matching logic.
- Rule specificity scoring.
- Formula and policy modules run after lane result.

Change impact:
- Enabling lane matrix shifts from fallback behavior to strict lane enforcement.
- Missing lane causes validation failure.

How clients are affected:
- Better route-accurate pricing but stricter route coverage requirements.

Maintenance:
- Weekly lane coverage audit for active service routes.
- Add rules before launching new districts.

Sri Lanka example:
- Colombo to Kandy `next_day` lane gets dedicated distance band with specific multiplier for hill-country route profile.

Operations view:
- Vendor: route-level tariff precision.
- Client impact: quote closely follows route economics.
- Superadmin dependency: monitors coverage and failure rates.

### 11.9 Formula Validation Preview

Preview input fields:
- `weightKg`
- `lengthCm`
- `widthCm`
- `heightCm`

Preview output per tier:
- chargeable weight
- service-level label and cutoff
- base currency total
- display currency total

What should be done:
- Run preview for light, medium, and bulky examples before publish.

Connected components:
- Rate cards + formula + localization in settings UI.
- Uses same core arithmetic path used in runtime intent.

Change impact:
- Fast detection of misconfigured divisors, fees, and tax settings.

How clients are affected:
- Reduces chance of surprise quote shifts after release.

Maintenance:
- Mandatory preview validation before every publish action.

Sri Lanka example:
- Validate 0.5 kg document and 12 kg parcel preview for Colombo district before approving seasonal surcharge.

Operations view:
- Vendor: safe pre-release verification.
- Client impact: fewer post-release quote anomalies.
- Superadmin dependency: can require preview evidence in approval process.

## 12. Advanced Pricing Change Control Checklist (Field-Level)

- [ ] Correct category selected (`domestic` or `International`).
- [ ] Currency base/display and rates verified.
- [ ] Formula changes tested with preview inputs.
- [ ] Service catalog keys still match rate cards and lane rules.
- [ ] Zone changes validated against lane matrix coverage.
- [ ] Lane matrix has no critical route gaps.
- [ ] Policy modules reviewed for unintended compounding effects.
- [ ] Quote runtime field locks and guardrails validated.
- [ ] Contract pricing priority/date/volume logic tested.
- [ ] Governance action and note completed.
- [ ] No self-approval rule respected.
- [ ] Rollback target confirmed in version history.


