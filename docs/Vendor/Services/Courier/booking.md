# Courier Booking Flow (End-to-End)

Last updated: 25 March 2026

## 1) Purpose

This document explains how Courier Booking works from start to finish across:
- Client side (booking creation and tracking)
- Vendor side (booking operations and shipment execution)
- Superadmin side (vendor registration approvals that control who can operate)

It also explains how booking updates are validated and enforced.

---

## 2) High-level lifecycle

1. Vendor registers courier services (`Domestic`, `International`, or both).
2. Superadmin approves courier service registrations.
3. Client creates a courier booking through Create -> Review -> Details -> Summary -> Submit.
4. System validates policy and assigns shipment to an eligible approved vendor.
5. Vendor handles booking lifecycle (quote, confirm, cancel, etc.) and shipment stage lifecycle (pickup -> transit -> delivery).
6. Client tracks shipment, can cancel only when allowed, and can download owner-only bill.

---

## 3) Superadmin and registration dependency (start point)

Courier bookings depend on approved vendor registrations:

- Only vendors with approved courier registration are eligible.
- Assignment category is strict:
	- `domestic` shipment -> vendors approved for domestic courier subcategory.
	- `international` shipment -> vendors approved for international courier subcategory.
- If no eligible registration exists, shipment remains `unassigned`.

This is the operational gate for vendor visibility and execution.

---

## 4) Client booking flow (Create -> Submit)

### Step A: Create
- Route: `GET /couriers/create`
- User starts package draft with selected provider/service and quote context.

### Step B: Review
- Route: `POST /couriers/review`
- Stores normalized `courier_preview` session payload (sender, recipient, shipment, packages, review context).

### Step C: Details
- Routes:
	- `GET /couriers/details`
	- `POST /couriers/details`
- Validates sender/recipient addresses, pickup window, package data, service level.

### Step D: Summary
- Route: `GET /couriers/summary`
- Builds pricing preview and assignment preview.
- Enforces lane matrix/policy behavior for estimate.

### Step E: Store (Submit)
- Route: `POST /couriers`
- Uses validated payload + session guard.
- Persists:
	- sender and recipient contacts
	- sender and recipient addresses
	- shipment record
	- package rows
- Runs vendor assignment service.
- Applies service-catalog and policy assertions.
- Stores final estimated cost.

---

## 5) Category resolution and assignment

Category is resolved by countries:
- Sender country = `LK` and recipient country = `LK` -> `domestic`
- Otherwise -> `international`

Assignment service behavior:
- Finds approved courier registrations for required category.
- Balances workload by active shipment count.
- Writes shipment assignment fields:
	- `assignment_category`
	- `assignment_status`
	- `assigned_vendor_user_id`
	- `assigned_vendor_registration_id`
	- `assigned_at`
- Adds tracking event `assigned` when assignment changes.

---

## 6) Booking update rules (client side)

Client shipment status transitions are strictly enforced:

- `pending` -> `confirmed` or `cancelled`
- `confirmed` -> `in_transit` or `cancelled`
- `in_transit` -> `delivered` or `cancelled`
- `delivered` -> terminal
- `cancelled` -> terminal

Additional protections:
- Idempotent update: same status update returns success without duplicate transition.
- Delivered shipment cannot be cancelled.
- Session tampering protection: submit payload fingerprint must match preview session.
- Corrupt/expired session returns user to Create flow safely.

---

## 7) Vendor booking operations

Vendor booking UI route:
- `GET /courierService/bookings`

Booking lifecycle update routes:
- `POST /courierService/bookings/{shipment}/lifecycle`
- `POST /courierService/bookings/bulk-lifecycle`

### Vendor booking statuses (operational)
- `new_request`
- `quote_pending`
- `quoted`
- `awaiting_client_confirmation`
- `confirmed`
- `cancelled`
- `rejected`
- `expired`

### Booking actions
- `accept_booking`
- `request_revision`
- `send_quote`
- `mark_awaiting_confirmation`
- `cancel_booking`
- `reject_booking`
- `expire_booking`
- `reopen_booking`

Each action writes tracking events (e.g., `booking_quoted`, `booking_confirmed`) and may update shipment status.

---

## 8) Vendor shipment execution operations

Vendor shipment UI route:
- `GET /courierService/units`

Shipment stage update routes:
- `POST /courierService/shipments/{shipment}/stage`
- `POST /courierService/shipments/bulk-stage`

### Shipment stages
- `new_assignments`
- `ready_for_pickup`
- `picked_up`
- `in_transit`
- `out_for_delivery`
- `exception`
- `delivered`
- `cancelled`

### Stage actions
- `accept_assignment`
- `ready_for_pickup`
- `picked_up`
- `in_transit`
- `out_for_delivery`
- `mark_exception`
- `mark_delivered`
- `cancel_shipment`

Hard guard:
- Vendor stage updates are blocked if assignment health is not `assigned`.

---

## 9) Pricing and policy enforcement during booking

During summary/store, pricing is not just UI math; backend enforces:

- Lane matrix matching (origin zone, destination zone, service level, distance band)
- Formula controls (weight/volumetric handling, surcharge, tax)
- Policy modules (examples):
	- remote area surcharge
	- oversize/overweight charges
	- peak/holiday surcharge
	- COD fee
	- minimum shipment guardrail
	- customer contract pricing
	- quote runtime governance guardrails
	- speed/ETA tier engine
	- international dimensions engine

If no active matching lane is found (when lane matrix is enabled), booking is blocked with validation error.

---

## 10) Client post-booking management

Dashboard and detail:
- `GET /courierBookingDashboard`
- `GET /courier-shipment/{id}`

Mutations:
- `POST /courier-shipment/{id}/update-status`
- `POST /courier-shipment/{id}/cancel`

Bill download:
- `GET /couriers/{shipment}/bill`

Security:
- Bill is owner-only (`requested_by_user_id` must match authenticated user).
- Cross-user bill access is forbidden.

---

## 11) Core data entities involved

- `courier_shipments`
	- main operational record
	- status + assignment + pricing fields
- `courier_contacts`
	- sender/recipient identities
- `courier_addresses`
	- pickup/drop addresses
- `courier_packages`
	- per-package pricing/spec details
- `courier_tracking_events`
	- timeline source of truth for booking and stage transitions

---

## 12) End-to-end example (practical)

1. Client books Colombo (`LK`) -> Kandy (`LK`) with Next Day service.
2. System resolves `domestic` category.
3. System finds approved domestic courier vendors and assigns least-loaded eligible vendor.
4. Vendor sees item in Bookings as `new_request`.
5. Vendor sends quote -> booking becomes `quoted`.
6. Vendor confirms booking -> shipment moves to confirmed path.
7. Vendor updates shipment stages: ready_for_pickup -> picked_up -> in_transit -> out_for_delivery -> delivered.
8. Client sees full timeline and downloads bill.

---

## 13) Operational checkpoints

Before go-live, verify:
- Vendor courier registrations are approved for correct categories.
- Lane matrix has coverage for active lanes.
- Service catalog keys and cutoff policies are valid.
- Role/permission access is correctly scoped for booking/stage updates.
- Owner-only bill access works (403 on cross-user attempts).

---

## 14) Quick troubleshooting

- Booking not visible to vendor:
	- Check assignment fields and vendor registration approval.
- Booking cannot update lifecycle:
	- Check current booking status vs allowed booking actions.
- Shipment stage update blocked:
	- Check assignment health and allowed stage actions.
- Price seems wrong:
	- Check lane matrix match, formula config, and active policy modules.
- Bill download denied:
	- Check shipment ownership (`requested_by_user_id`).

---

## 15) How the Vendor Dashboard Bookings page works (`/courierService/bookings`)

This section explains exactly how the Bookings page behaves in the vendor dashboard.

### 15.1 Entry and access control

- URL: `http://127.0.0.1:8000/courierService/bookings`
- Backend route: `GET /courierService/bookings`
- Required conditions:
	- authenticated user
	- user must be in courier service workspace
	- permission `courier.bookings.view`
	- vendor must have approved courier registration scope

If these checks fail, the page is blocked by middleware/policy.

### 15.2 What data is loaded

The page receives `courierBookings` payload with:
- `summary`
	- `newRequestsToday`
	- `awaitingConfirmation`
	- `confirmedToday`
	- `cancellationsToday`
	- `conversionRate`
	- `avgConfirmationHours`
- `statusCounts` for booking status chips
- `rows` for the table
- `filters` and `pagination`
- `filterOptions`
	- booking statuses
	- payment statuses
	- approved categories only
	- services
	- per-page options
	- allowed lifecycle action options

### 15.3 UI blocks on Bookings page

1. **Summary cards** (top KPIs)
2. **Booking status pills** (All, New Request, Quoted, Confirmed, etc.)
3. **Filter bar**
	- search (`Booking`, `Tracking`, `Client`)
	- category
	- service
	- booking status
	- payment status
	- from date / to date
	- apply + clear filters
4. **Bulk action toolbar**
	- row selection checkbox
	- bulk action dropdown
	- apply to selected
5. **Main booking table**
	- Booking No, Created, Client, Route, Category, Service
	- Quote, Payment badge, Booking status badge
	- SLA to confirm hours
	- per-row action buttons
6. **Right-side details drawer** on row click
	- shows full booking snapshot and same action buttons
7. **Pagination controls**
	- per-page selector
	- previous/next

### 15.4 Filter behavior

Filters are server-driven (Inertia GET to same route), not client-only.

Applied filter keys:
- `q`, `category`, `service`
- `bookingStatus`, `paymentStatus`
- `fromDate`, `toDate`
- `page`, `perPage`

Important behavior:
- Category filter is restricted to vendor approved categories.
- Status-pill click immediately applies `bookingStatus`.
- Clear Filters resets all filter keys and reloads full dataset.

### 15.5 Booking lifecycle engine behind row actions

Per-row actions are not hardcoded; they come from current booking status.

Allowed booking status machine:
- `new_request` -> `send_quote` / `request_revision` / `accept_booking` / `reject_booking` / `expire_booking`
- `quote_pending` -> `send_quote` / `request_revision` / `reject_booking` / `expire_booking`
- `quoted` -> `mark_awaiting_confirmation` / `accept_booking` / `request_revision` / `reject_booking`
- `awaiting_client_confirmation` -> `accept_booking` / `request_revision` / `cancel_booking`
- `confirmed` -> `cancel_booking`
- `cancelled`/`rejected`/`expired` -> `reopen_booking`

When action is submitted:
- endpoint: `POST /courierService/bookings/{shipment}/lifecycle`
- backend validates action against current booking status
- shipment status may change (`pending`, `confirmed`, `cancelled`)
- tracking event is appended (`booking_quoted`, `booking_confirmed`, etc.)

Destructive actions (`cancel`, `reject`, `expire`) are confirmation-gated in UI.

### 15.6 Bulk lifecycle updates

Bulk update endpoint:
- `POST /courierService/bookings/bulk-lifecycle`

Flow:
1. Select multiple rows.
2. Choose bulk action.
3. Confirm modal.
4. Backend applies action only to eligible rows.
5. Ineligible rows are skipped safely.

### 15.7 Payment and quote display notes

- `quoteAmount` is server-provided (`estimated_cost` based).
- Payment status is derived operationally:
	- cancelled -> `failed`
	- pending or zero estimate -> `pending`
	- otherwise -> `paid`

### 15.8 Why a booking may show “No actions”

Common reasons:
- current booking status has no allowed transitions
- assignment/permission policy blocks mutation
- user lacks required lifecycle permission

### 15.9 Relationship with Shipment page

Bookings page controls **commercial/confirmation lifecycle**.
Shipments page (`/courierService/units`) controls **physical execution lifecycle**.

Typical handoff:
- booking reaches `confirmed` in Bookings page
- operations team progresses pickup/transit/delivery in Shipments page

