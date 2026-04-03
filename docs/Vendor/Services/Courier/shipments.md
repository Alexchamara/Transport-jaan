# Courier Shipments (Vendor) - Clear Operations Documentation

Last updated: 25 March 2026

## 1) Purpose

This document explains the **vendor-side Shipments module** end-to-end:

- what appears on `/courierService/units`
- how shipment stages work
- how updates are validated
- how filters, bulk actions, SLA, and assignment health are calculated

This is the operational queue after booking confirmation.

---

## 2) Where Shipments fits in the courier flow

1. Client creates and submits booking.
2. System assigns shipment to an eligible approved vendor (`domestic` or `international`).
3. Vendor handles booking lifecycle in Bookings page.
4. Vendor handles **physical execution lifecycle** in Shipments page (`/courierService/units`).

In short:

- **Bookings page** = commercial/confirmation lifecycle.
- **Shipments page** = operational movement lifecycle.

---

## 3) Access control and prerequisites

Shipments page route:

- `GET /courierService/units`

Required:

- authenticated user
- courier service workspace membership
- permission: `courier.shipments.view`
- vendor must have approved courier registration

Mutation routes:

- `POST /courierService/shipments/{shipment}/stage`
- `POST /courierService/shipments/bulk-stage`

Mutation permissions:

- `courier.shipments.update_stage`
- `courier.shipments.bulk_update`

If checks fail, access/update is blocked.

---

## 4) What data is shown on the Shipments page

The UI receives `courierShipments` payload with:

### Summary metrics

- `totalAssigned`
- `newAssignments`
- `readyForPickup`
- `inTransit` (picked_up + in_transit + out_for_delivery)
- `exception`
- `deliveredToday`

### Table rows (per shipment)

- booking and tracking identifiers
- category (`Domestic`/`International`)
- sender/recipient and origin/destination
- service, status label, stage label
- pickup window, ETA, last scan
- SLA status
- assignment health
- allowed actions for current stage
- detail payload (delivery notes, internal notes, package count, total weight)

### Filter options

- stage list
- shipment status list
- service list
- category list (restricted to approved vendor categories)
- per-page options

---

## 5) Category logic used in Shipments

Category is resolved as:

- If `assignment_category` exists (`domestic`/`international`), use it.
- Else fallback by country:
    - sender `LK` + recipient `LK` => `Domestic`
    - otherwise => `International`

Category filtering enforces real geography:

- Domestic filter -> both sender and recipient country `LK`
- International filter -> at least one side not `LK`

---

## 6) Shipment stage model (core operational state machine)

Stages:

- `new_assignments`
- `ready_for_pickup`
- `picked_up`
- `in_transit`
- `out_for_delivery`
- `exception`
- `delivered`
- `cancelled`

How current stage is derived:

1. Use latest tracking event if it matches known stage.
2. Map special event aliases (`assigned`/`accepted` -> `new_assignments`).
3. Fallback from shipment status:
    - `pending` -> `new_assignments`
    - `confirmed` -> `ready_for_pickup`
    - `in_transit` -> `in_transit`
    - `delivered` -> `delivered`
    - `cancelled` -> `cancelled`

---

## 7) Allowed shipment actions by stage

Action mapping enforced by backend:

- `new_assignments` -> `accept_assignment`, `ready_for_pickup`, `cancel_shipment`
- `ready_for_pickup` -> `picked_up`, `mark_exception`, `cancel_shipment`
- `picked_up` -> `in_transit`, `mark_exception`
- `in_transit` -> `out_for_delivery`, `mark_exception`
- `out_for_delivery` -> `mark_delivered`, `mark_exception`
- `exception` -> `in_transit`, `cancel_shipment`
- `delivered` -> no actions
- `cancelled` -> no actions

When action runs:

- shipment `status` is updated to mapped status
- tracking event is inserted with mapped event name

Examples:

- `mark_delivered` -> status `delivered`, event `delivered`
- `cancel_shipment` -> status `cancelled`, event `cancelled`

---

## 8) Assignment health guard (critical)

Before any stage update, assignment health is checked.

Possible health states:

- `assigned`
- `pending_confirmation`
- `registration_missing`
- `unassigned`

Only `assigned` can execute stage actions.

If not assigned, updates are blocked to prevent unauthorized/invalid execution.

---

## 9) SLA, timeline, and exception behavior

### ETA logic

ETA is estimated from pickup date + service-level heuristic.

### Timeline state

- `early`
- `on_time`
- `delayed`
- `null` (unknown)

### SLA badge resolution

- delayed timeline -> `delayed`
- early timeline -> `early`
- delivered and on-time -> `on_time`
- not delivered and ETA within risk window -> `at_risk`
- otherwise -> `on_track` or `unknown`

### Exception detection

Shipment is exception if:

- shipment status is one of `exception`, `failed`, `returned`, `cancelled`, or
- any tracking event has exception status

---

## 10) Filters and search on `/courierService/units`

Available filters:

- search (`q`) by booking/tracking reference
- category
- service
- status
- stage (stage pills and dropdown)
- date range (`fromDate`, `toDate`)
- pagination (`page`, `perPage`)

Search behavior:

- accepts booking reference (`CR-...`) or tracking (`TRK-...`)
- tracking search normalizes `TRK-` back to shipment reference matching

Filtering is server-side (Inertia reload), not only client-side.

---

## 11) Bulk stage updates

Endpoint:

- `POST /courierService/shipments/bulk-stage`

Flow:

1. Operator selects multiple shipment rows.
2. Chooses one action.
3. Confirmation modal appears.
4. Backend applies update only where allowed by stage rules.
5. Non-eligible rows are skipped.

Result message includes success + skipped counts.

---

## 12) UI structure in vendor dashboard

Main blocks on page:

1. Header + module description
2. Summary metric cards
3. Stage quick pills
4. Filter bar
5. Bulk action toolbar
6. Shipment table with action buttons
7. Pagination controls
8. Right-side details drawer (on row click)

Details drawer includes sender/recipient, route, stage, SLA, assignment, package totals, notes.

---

## 13) Operational SOP (recommended daily usage)

### Morning

1. Open `/courierService/units`.
2. Check `newAssignments` and `readyForPickup` cards.
3. Filter by stage `new_assignments` and process acceptance/ready actions.

### Mid-day

1. Filter `in_transit` and `out_for_delivery`.
2. Watch `at_risk`/`delayed` SLA rows.
3. Mark exceptions immediately when operational issues happen.

### End of day

1. Confirm `deliveredToday` count.
2. Resolve remaining `exception` rows.
3. Validate no stuck shipments in invalid stage for too long.

---

## 14) Common issues and fixes

### Issue: "No actions" shown for a row

- Check current stage: some stages are terminal.
- Check assignment health is `assigned`.
- Check user permission for stage updates.

### Issue: Bulk update partially applied

- Expected if some selected rows are in invalid stages for that action.
- Review skipped count message.

### Issue: Shipment not visible

- Check approved category scope for vendor.
- Check category filter and date range.
- Check assignment vendor ID on shipment.

### Issue: Cannot cancel shipment

- Team policy may restrict cancellation for dispatcher roles.
- Permission model may deny `cancel` action.

---

## 15) Quick reference

- View Shipments: `GET /courierService/units`
- Update one shipment stage: `POST /courierService/shipments/{shipment}/stage`
- Bulk update stages: `POST /courierService/shipments/bulk-stage`
- Tracking view (related): `GET /courierService/tracking`

Shipments module is the vendor execution backbone. Keep assignment clean, stage transitions valid, and SLA/exception handling timely.

---

## 16) How the Vendor Dashboard Shipments page works (`/courierService/units`)

This section describes the exact runtime behavior of the Shipments page in the vendor dashboard.

### 16.1 Entry and authorization path

- URL: `http://127.0.0.1:8000/courierService/units`
- Backend route: `GET /courierService/units`
- Middleware and policy gates ensure:
    - authenticated actor
    - courier workspace context
    - shipment view permission
    - approved courier registration scope

If any gate fails, page access is blocked before data rendering.

### 16.2 Data preparation sequence (backend)

1. Backend resolves vendor context and approved categories.
2. Base shipment query is scoped to `assigned_vendor_user_id`.
3. Scope and data-scope policies are applied.
4. Category constraints are enforced (`domestic`, `international`, or both).
5. User filters are applied (`q`, service, status, stage, dates).
6. Rows are transformed into shipment DTO for UI.
7. Summary metrics and filter options are generated.
8. Pagination slice is returned as `courierShipments` payload.

### 16.3 What each table row means operationally

Each row combines execution-critical signals:

- **Identity:** booking number + tracking number
- **Routing:** category + origin/destination
- **Execution:** stage + status + allowed actions
- **Control:** assignment health + SLA state + exception flag
- **Timing:** pickup window + ETA + last scan

Operators should use these fields in this order:

1. assignment health
2. stage
3. SLA/exception
4. action buttons

### 16.4 Stage transitions on this page

When operator clicks an action button:

- UI calls `POST /courierService/shipments/{shipment}/stage`.
- Backend validates:
    - shipment belongs to vendor
    - assignment health is `assigned`
    - action is allowed for current stage
    - policy allows cancellation (if cancel action)
- If valid:
    - shipment status is updated
    - tracking event is appended
    - flash success is returned

If invalid, update is rejected and user receives error feedback.

### 16.5 Bulk updates on this page

Bulk update flow:

1. Select rows.
2. Pick one action.
3. Confirm modal.
4. UI calls `POST /courierService/shipments/bulk-stage`.
5. Backend applies action only to eligible rows.
6. Skipped rows are reported (lifecycle mismatch or policy block).

### 16.6 Filter behavior in dashboard runtime

Filters trigger server-side reload (Inertia), not local table-only filtering.

Behavior highlights:

- Search accepts booking and tracking forms (`CR-...` / `TRK-...`).
- Category options are restricted to vendor-approved categories.
- Stage pills and dropdown stage filter use the same stage keys.
- Date filters operate on shipment creation date range.

### 16.7 "No actions" in Shipments row - exact meaning

`No actions` appears when at least one of these is true:

- stage is terminal (`delivered`, `cancelled`)
- assignment health is not `assigned`
- actor lacks shipment mutation permissions
- policy disallows specific action for actor role

### 16.8 Recommended operator pattern inside `/courierService/units`

- Clear `new_assignments` first.
- Move confirmed work to `ready_for_pickup` and `picked_up` quickly.
- Keep `exception` queue near-zero throughout day.
- End day with reconciliation of `out_for_delivery` and `delivered`.

This keeps SLA drift low and avoids stale shipments.
