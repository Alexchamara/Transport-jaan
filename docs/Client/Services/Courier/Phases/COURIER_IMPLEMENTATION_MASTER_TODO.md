# Client Courier Implementation Master Todo

This master checklist is used before and during implementation of each phase so scope is explicit and nothing is skipped.

## Phase 1 - Security Baseline and Access Boundaries
- [ ] Lock courier booking routes to authenticated users.
- [ ] Enforce owner-only bill download authorization.
- [ ] Remove dead/placeholder courier navigation links.
- [ ] Add feature tests for guest blocking and non-owner bill denial.
- [ ] Add rollback note and acceptance criteria in phase documentation.

## Phase 2 - Unified Courier DTO Contract (Current)
- [ ] Freeze canonical courier DTO schema for dashboard, detail, and all-bookings contexts.
- [ ] Create shared transformer class in backend support layer.
- [ ] Refactor courier controller methods to use shared transformer output.
- [ ] Refactor all-bookings courier mapper to use the same transformer.
- [ ] Normalize address fields to courier model reality (`line1`, `line2`, `postal_code`).
- [ ] Preserve legacy keys required by existing frontend while adding canonical keys.
- [ ] Add unit tests for transformer output and address composition.
- [ ] Run targeted feature and unit test suites.

## Phase 3 - UI Contract Consumption and Cleanup
- [x] Update all-bookings and courier dashboards to consume canonical DTO fields.
- [x] Remove duplicate/legacy UI fallback chains where canonical fields exist.
- [ ] Add visual regression checks for courier cards, details modal, and receipt/export sections.
- [x] Add front-end contract smoke tests for critical fields.

## Phase 4 - Workflow Integrity and State Guarantees
- [x] Validate create -> review -> details -> summary -> store flow invariants.
- [x] Protect against partial session payload corruption.
- [x] Ensure tracking and status transitions remain owner-safe and idempotent.
- [x] Add negative-path tests for invalid transitions and tampered payloads.

## Phase 5 - Policy and Pricing Determinism
- [x] Ensure pricing output is deterministic across all policy modules.
- [x] Add snapshot-style assertions for pricing explanation payload.
- [x] Eliminate date-fragile tests and enforce dynamic date handling.
- [x] Add guardrail tests for min/max thresholds and policy conflicts.

## Phase 6 - Operational Hardening and Observability
- [x] Add structured logs for courier create/store/detail read paths.
- [x] Add alerts for ownership failures, repeated authorization denials, and pricing exceptions.
- [x] Document support runbooks for shipment reconciliation and bill issues.
- [x] Verify export/report paths do not expose unauthorized data.

## Phase 7 - Rollout, Monitoring, and Stabilization
- [x] Create release checklist with canary window and fallback criteria.
- [x] Monitor conversion, error rates, and support tickets post-release.
- [x] Patch residual edge cases from production telemetry.
- [x] Publish final phase completion and post-implementation summary.
