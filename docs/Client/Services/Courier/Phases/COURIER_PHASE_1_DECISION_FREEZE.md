# Client Courier Phase 1 Decision Freeze

## Purpose
This document records the production decisions that are now frozen for Phase 1 of the client courier flow.

The goal of Phase 1 is to remove ambiguous behavior and lock core security and ownership rules before deeper refactors.

## Phase 1 Decisions (Frozen)

### D1. Booking flow requires authenticated user
- Decision: all client courier booking workflow endpoints are authenticated-only.
- Rationale: production shipments must be tied to an accountable user identity.
- Implementation:
  - `GET /couriers/create`
  - `POST /couriers/review`
  - `GET /couriers/details`
  - `POST /couriers/details`
  - `GET /couriers/summary`
  - `POST /couriers`

### D2. Bill downloads are owner-only
- Decision: shipment bill download is allowed only for the authenticated owner of that shipment.
- Rationale: bill data contains personal address/contact and commercial quote details.
- Implementation:
  - `GET /couriers/{shipment}/bill` now requires authentication and strict owner check.
  - Shipments with missing ownership (`requested_by_user_id` null) are denied.

### D3. Client courier navigation must use valid destinations
- Decision: placeholder links in courier menu are not allowed in production.
- Rationale: dead links create user confusion and break conversion paths.
- Implementation:
  - `Domestic` -> `/couriers/create`
  - `My Shipments` -> `/courierBookingDashboard`

### D4. Public discovery remains available
- Decision: marketing/discovery page remains public.
- Rationale: funnel entry can be public while transactional booking remains authenticated.
- Implementation:
  - `GET /courier-service` remains public.

## Real-World Operational Notes
- Existing legacy shipments with null owner ID cannot download bills after this phase.
- Support process should re-link those records manually if legal/compliance allows.
- Monitoring should track authentication redirects and bill 403 events to detect friction.

## Acceptance Criteria
- Unauthenticated user cannot open `/couriers/create` and is redirected to sign-in.
- Unauthenticated user cannot access `/couriers/{id}/bill`.
- Authenticated user cannot download another user's bill (403).
- Client header courier menu has no empty href values.
- Public `/courier-service` still works.

## Rollback Strategy
- If conversion drop is unacceptable, temporarily move booking routes back to public while keeping bill route owner-only.
- Any rollback must be documented with timestamp, reason, and planned re-enable date.

## Next Phase Handoff
Phase 2 should freeze payload contracts and normalize dashboard/all-bookings DTO mapping so both surfaces consume the same courier address and shipment schema.
