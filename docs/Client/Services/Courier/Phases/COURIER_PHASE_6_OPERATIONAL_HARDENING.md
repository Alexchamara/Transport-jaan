# Courier Phase 6 - Operational Hardening and Observability

This document covers the production hardening layer for client courier flows.

## Scope Delivered

1. Structured logs for client courier create/store/detail read paths.
2. Alert signals for ownership failures, repeated authorization denials, and pricing exceptions.
3. Support runbooks for shipment reconciliation and bill-export incidents.
4. Verification that export paths do not leak data across users.

## Structured Log Events

The following events are emitted in client courier flow:

- `COURIER CLIENT CREATE VIEW OPENED`
- `COURIER CLIENT DETAILS VIEW OPENED`
- `COURIER CLIENT DETAIL READ`
- `COURIER CLIENT STORE ATTEMPT`
- `COURIER CLIENT STORE SUCCESS`
- `COURIER CLIENT STORE FAILURE`
- `COURIER CLIENT PRICING EXCEPTION`
- `COURIER CLIENT OWNERSHIP FAILURE`
- `COURIER CLIENT AUTHORIZATION DENIED`
- `COURIER CLIENT REPEATED AUTHORIZATION DENIALS`

Core context fields:

- `actor_user_id`
- `route_name`
- `path`
- `ip_address`
- `user_agent`
- shipment metadata (where applicable)

## Alerting Rules

### Ownership Failure Alert

Trigger:

- Access attempt to a shipment-owned resource by a non-owner user.

Signal:

- Warning-level ownership failure event, followed by authorization denial tracking.

### Repeated Authorization Denials Alert

Trigger:

- Same actor + route + reason denied 5+ times within 15 minutes.

Signal:

- Error-level event: `COURIER CLIENT REPEATED AUTHORIZATION DENIALS`.

### Pricing Exception Alert

Trigger:

- Pricing enforcement failure in summary preview or store pricing path.

Signal:

- Error-level event: `COURIER CLIENT PRICING EXCEPTION` with phase and message context.

## Support Runbook A - Shipment Reconciliation

Use when user reports missing/incorrect shipment record, unexpected status, or inconsistent quote total.

1. Identify `actor_user_id`, shipment reference, and reported timestamp.
2. Search logs for `COURIER CLIENT STORE ATTEMPT` and matching `COURIER CLIENT STORE SUCCESS`.
3. If no success exists, inspect `COURIER CLIENT STORE FAILURE` and `COURIER CLIENT PRICING EXCEPTION` in the same time window.
4. Validate ownership path by checking `COURIER CLIENT DETAIL READ` against requesting user.
5. Confirm pricing explanation details shown in the latest successful create flow.
6. If assignment or lane policy mismatch is observed, escalate to pricing policy owner with captured log context.

## Support Runbook B - Bill Download / Export Access Issues

Use when bill download fails or user reports access denied.

1. Confirm shipment reference and requesting user id.
2. Check for `COURIER CLIENT OWNERSHIP FAILURE` and `COURIER CLIENT AUTHORIZATION DENIED`.
3. If denials are repeated, check `COURIER CLIENT REPEATED AUTHORIZATION DENIALS` to identify abuse patterns.
4. Verify the requester is the shipment owner (`requested_by_user_id`).
5. If owner is correct but request still fails, inspect route/auth context and session integrity.
6. Close incident with one of:
   - expected deny (non-owner),
   - owner mismatch data issue,
   - authentication/session issue,
   - application defect (requires patch).

## Verification Notes

- Non-owner bill download is explicitly blocked and tested.
- Non-owner detail page access is blocked and tested.
- Repeated unauthorized bill-access attempts produce an alert-level log signal.

## Rollback

If operational logging/alerting causes unexpected load or noise:

1. Disable alert consumers first (do not remove ownership checks).
2. Keep ownership and authorization denial logging enabled for forensic continuity.
3. Roll back to previous controller revision only after confirming no data-exposure regression.
