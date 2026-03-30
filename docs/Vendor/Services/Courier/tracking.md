# Courier Tracking (Vendor) - Clear Operations Documentation

Last updated: 25 March 2026

## 1) Purpose

This document explains the **vendor-side Tracking module** end-to-end:
- what appears on `/courierService/tracking`
- how tracking data is built
- how SLA risk and exceptions are detected
- how operators can update shipment stages from tracking
- how export/reporting works

Tracking is the live monitoring surface for active courier execution.

---

## 2) Where Tracking fits in the courier flow

1. Client creates shipment request.
2. Shipment is assigned to an approved vendor.
3. Vendor progresses shipment through stage updates.
4. Tracking page provides real-time operational visibility and intervention.

In short:
- **Shipments page** = execution queue.
- **Tracking page** = monitoring, SLA control, exception response.

---

## 3) Access control and prerequisites

Tracking page route:
- `GET /courierService/tracking`

Required:
- authenticated user
- courier service workspace membership
- permission: `courier.tracking.view`
- vendor must have approved courier registration scope

Related mutation endpoint used from Tracking UI:
- `POST /courierService/shipments/{shipment}/stage`

If access policy or registration scope fails, tracking is blocked.

---

## 4) What data is shown on Tracking page

The UI receives `courierTracking` payload.

### Summary metrics
- `inTransitNow`
- `outForDeliveryNow`
- `delayedNow`
- `exceptionNow`
- `unscanned6h`
- `deliveredToday`

### Table rows (per shipment)
- tracking number, booking number
- route (origin -> destination)
- current stage
- current location
- last scan timestamp
- ETA
- SLA status
- exception flag
- allowed stage actions
- timeline event list (for details drawer)

### Grouped provider stats (optional)
When `groupBy=provider`, page shows provider-level cards:
- total
- in transit
- delayed
- exceptions

---

## 5) Tracking stage and timeline model

Tracking row stage comes from the same operational stage logic as Shipments:
- `new_assignments`
- `ready_for_pickup`
- `picked_up`
- `in_transit`
- `out_for_delivery`
- `exception`
- `delivered`
- `cancelled`

Timeline events are built from `courier_tracking_events` ordered by `recorded_at` descending.

Each timeline entry contains:
- `status`
- `statusLabel`
- `location`
- `description`
- `recordedAt`

---

## 6) SLA and delay detection logic

Tracking SLA behavior is derived from:
- estimated delivery time
- delivered timestamp (if delivered)
- current shipment stage/status

SLA output states:
- `on_track`
- `at_risk`
- `delayed`
- `on_time`
- `early`
- `unknown`

Key interpretation:
- `delayed`: ETA already breached or delivered after ETA
- `at_risk`: close to ETA boundary
- `on_time`/`early`: delivered with good timeline outcome

---

## 7) Exception detection logic

A shipment is treated as exception when:
- shipment status is in exception set (`exception`, `failed`, `returned`, `cancelled`), or
- any tracking event contains an exception-like status

This drives:
- summary `exceptionNow`
- exception filtering
- operator attention queue

---

## 8) Filters and controls on `/courierService/tracking`

### Quick controls
- `Exception Only` toggle
- `No Scan > Xh` chips (0, 6, 12, 24)

### Main filters
- search (`q`): booking/tracking
- category
- service
- stage
- SLA status
- group by (`provider`)
- from/to date
- per-page and page

Behavior details:
- `exceptionOnly=1` keeps only exception rows.
- `unscannedHours>0` keeps rows where last scan older than threshold or missing.
- filtering is server-side via Inertia reload.

---

## 9) Stage actions from Tracking page

Tracking table supports direct shipment stage actions:
- `accept_assignment`
- `ready_for_pickup`
- `picked_up`
- `in_transit`
- `out_for_delivery`
- `mark_exception`
- `mark_delivered`
- `cancel_shipment`

When operator clicks action:
1. UI posts to `POST /courierService/shipments/{shipment}/stage`.
2. Backend validates stage transition rules.
3. Backend writes shipment status + tracking event.
4. UI refreshes with updated stage/timeline.

Destructive action (`cancel_shipment`) is confirmation-gated in UI.

---

## 10) CSV export behavior

Tracking page supports CSV export with current filters.

Export trigger:
- `GET /courierService/tracking?...&export=csv`

CSV columns:
- Tracking Number
- Booking Number
- Category
- Service
- Provider
- Current Stage
- Current Location
- Last Scan At
- ETA
- SLA Status
- Exception (Yes/No)

This is intended for operations reporting and escalation reviews.

---

## 11) UI structure in vendor dashboard

Main page blocks:
1. Header + context text
2. Summary metric cards
3. quick exception/unscanned controls
4. advanced filter row
5. optional provider grouping cards
6. tracking table with actions
7. pagination row
8. right-side timeline drawer (on row click)

Timeline drawer is the main forensic view for one shipment.

---

## 12) Operational SOP (recommended)

### Start of shift
1. Open `/courierService/tracking`.
2. Check `delayedNow` and `exceptionNow` first.
3. Apply `Exception Only` and clear urgent blockers.

### During shift
1. Watch `No Scan > 6h` queue.
2. Group by provider when needed to identify carrier bottlenecks.
3. Apply stage actions promptly for stale `picked_up`/`in_transit` items.

### End of shift
1. Export filtered CSV for unresolved delayed/exception shipments.
2. Hand over timeline notes by tracking number.
3. Verify `outForDeliveryNow` and pending scans for next shift.

---

## 13) Common issues and fixes

### Issue: No tracking rows shown
- Check category/date filters and search query.
- Ensure vendor has approved courier category scope.

### Issue: `No actions` on row
- Stage may be terminal.
- Assignment health may block mutation.
- Role permission may not allow update.

### Issue: Unscanned queue too high
- Validate device scanning workflow and checkpoint updates.
- Use provider grouping to isolate source.

### Issue: CSV doesn’t match expectation
- Export always reflects current filter state.
- Clear filters and retry for full dataset export.

---

## 14) How the Vendor Dashboard Tracking section works (`/courierService/tracking`)

This is the exact runtime behavior of the Tracking page in vendor dashboard.

### 14.1 Page load sequence

When vendor opens `/courierService/tracking`:
1. Request hits `GET /courierService/tracking`.
2. Backend validates auth + workspace + `courier.tracking.view` permission.
3. Backend loads vendor-assigned shipments only.
4. Policy scope and approved category constraints are applied.
5. Query filters are applied (`q`, category, service, stage, SLA, date, exception-only, unscanned-hours).
6. Backend builds `courierTracking` payload (`summary`, `rows`, `providerStats`, `filterOptions`, `pagination`).
7. Inertia renders `TrackingContent`.

### 14.2 What operator sees first

Top decision layer (immediate triage):
- `delayedNow`
- `exceptionNow`
- `unscanned6h`

If these are high, operator should use quick controls before deep filtering:
- `Exception Only`
- `No Scan > Xh`

### 14.3 How filters work in dashboard

- Filters are **server-side** (not local-only).
- Clicking Apply or changing quick controls reloads the page with query params.
- `groupBy=provider` adds provider summary cards for bottleneck analysis.
- Reset clears all tracking filters and reloads full permitted dataset.

### 14.4 How row actions work from Tracking table

From each row, operator can run allowed stage actions.

Action flow:
1. Operator clicks an action button.
2. UI posts to `POST /courierService/shipments/{shipment}/stage`.
3. Backend checks assignment health + stage transition rule + policy restrictions.
4. Backend updates shipment status and appends tracking event.
5. UI refreshes with updated stage/SLA/timeline.

`cancel_shipment` is confirmation-gated in UI before request submission.

### 14.5 Timeline drawer behavior

Clicking a row opens right-side timeline drawer.

Drawer includes:
- shipment identity (tracking, booking, route)
- current stage/SLA
- chronological tracking events (status, time, location, description)

This is used for incident decisions, escalation handover, and audit clarity.

### 14.6 CSV export behavior in dashboard

Export uses current filter state.

Flow:
1. Operator clicks Export CSV.
2. Browser calls `GET /courierService/tracking?...&export=csv`.
3. Backend streams filtered rows via `downloadTrackingCsv()`.

Operational rule: export is a **snapshot of current filtered view**, not global data unless filters are cleared.

### 14.7 Practical control-tower loop

Recommended loop while working on this page:
1. Triage exceptions and no-scan shipments.
2. Update stale stages directly from row actions.
3. Re-check delayed/at-risk pool.
4. Use provider grouping for recurring bottlenecks.
5. Export unresolved queue at shift end.

This makes Tracking the real-time control tower for courier execution.

