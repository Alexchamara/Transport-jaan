# Module 4 — Warehouse Booking

**Launch Readiness:** 88 %  
**Status:** Core booking flow, vendor management, and client dashboard are complete. Payment integration and a few integration gaps remain.

---

## Status Legend
| Symbol | Meaning |
|---|---|
| Done | Fully implemented and working |
| Partial | Partially implemented — logic or UI incomplete |
| Missing | Not implemented — needs to be built |

---

## Feature Breakdown

---

### 1. Discovery & Browsing
> How clients find and explore warehouse units.

| Sub-Feature | Status | Notes |
|---|---|---|
| Warehouse listing page | Done | All available units displayed |
| Filter by location | Done | City / region filter |
| Filter by storage category (dry, cold, hazmat) | Done | Category filter in listing |
| Filter by unit size | Done | Size range filter |
| Filter by price range | Done | Min/max price filter |
| Filter by climate-controlled flag | Partial | UI component exists; backend query filter unconfirmed |
| Filter by hazmat certification | Partial | UI component exists; backend query filter unconfirmed |
| Unit detail page — photos | Done | Photo gallery per unit |
| Unit detail page — amenities list | Done | CCTV, forklift access, loading dock, etc. |
| Unit detail page — specification panel | Done | Dimensions, capacity, storage type |
| Unit detail page — documents | Done | Fire safety certs, operating licences |
| Like / Favourite toggle | Done | Persisted per user in database |
| Star rating display | Done | Aggregated average on listing and detail |

---

### 2. Booking Flow
> End-to-end process for reserving a warehouse unit.

| Sub-Feature | Status | Notes |
|---|---|---|
| Category selection step | Done | Client selects storage type before listing |
| Unit listing after category selection | Done | Filtered listing shown |
| Unit detail view before booking | Done | Full detail page accessible |
| Date and time range selection | Done | Start date/time + end date/time picker |
| Hourly pricing calculation | Done | Cost calculated per hour |
| Daily pricing calculation | Done | Cost calculated per day |
| Monthly pricing calculation | Done | Cost calculated per month |
| Availability check before booking | Done | Checks existing bookings before allowing creation |
| Concurrent availability race condition guard | Partial | Application-level check; no DB-level lock on date-range overlap |
| Customer info form | Done | Name, contact, requirements |
| Booking summary / receipt page | Done | Full cost breakdown displayed |
| Payment (digital) | Partial | Payment status field exists in DB; PayHere integration for warehouse unconfirmed |
| Payment (manual / cash) | Partial | If cash is intended, UI must communicate this clearly |

---

### 3. Post-Booking Management
> Actions available to clients after a booking is confirmed.

| Sub-Feature | Status | Notes |
|---|---|---|
| Booking history in client dashboard | Done | All bookings listed |
| Booking cancellation | Done | Cancellation policy evaluated before processing |
| Cancellation refund calculation | Done | Based on configured cancellation window |
| Cancellation refund trigger | Partial | Calculation done; actual refund action unconfirmed |
| Booking extension (add more time) | Missing | Not supported |
| Booking shortening | Missing | Not supported |
| Multi-unit booking in one checkout | Missing | One unit per booking flow only |

---

### 4. Reviews & Ratings
> Client feedback after a completed storage booking.

| Sub-Feature | Status | Notes |
|---|---|---|
| Star rating submission (1–5) | Done | Available after booking completion |
| Written comment submission | Done | Optional text review |
| Review listing on unit detail page | Done | All reviews shown |
| Aggregated average rating | Done | Displayed on listing card and detail page |

---

### 5. Vendor — Unit Management
> Tools for warehouse vendors to manage their storage units.

| Sub-Feature | Status | Notes |
|---|---|---|
| Add a new warehouse unit | Done | CRUD form |
| Edit unit details | Done | Update specs, pricing, description |
| Delete / remove a unit | Done | Remove from listings |
| Upload unit photos | Done | Multiple images per unit |
| Define amenities | Done | Select from amenity list |
| Attach compliance documents | Done | File upload per unit |
| Set unit status (active / inactive / under review) | Done | Controls client visibility |
| Unit approval workflow | Done | New units sent to superadmin for approval before going live |
| Rejected unit cannot be booked | Partial | Workflow exists; confirm rejected units are blocked from booking |
| Set pricing (hourly / daily / monthly) | Done | Pricing fields per tier |
| Partial-capacity booking (e.g. 200 of 1 000 sq ft) | Missing | Entire unit is booked as a whole; no partial model |

---

### 6. Vendor Dashboard
> Analytics and management tools for warehouse vendors.

| Sub-Feature | Status | Notes |
|---|---|---|
| Booking list with search and filter | Done | Searchable, filterable table |
| Reservation confirmation (from dashboard) | Done | Vendor can confirm a pending reservation |
| Reservation cancellation (from dashboard) | Done | Vendor can cancel a reservation |
| Total bookings metric | Done | Shown on dashboard home |
| Revenue by period chart | Done | Chart.js graphs |
| Occupancy rate chart | Done | Visual occupancy analytics |
| Calendar view of bookings | Done | Visual schedule per unit |
| iCal / Google Calendar export | Partial | `WarehouseCalendarController` exists; bidirectional sync unconfirmed |
| Client management | Done | View client details and booking history |
| Send notification to client | Done | Manual notification dispatch |
| Auto-notification on new booking | Partial | Controller exists; automatic email/SMS on new booking unconfirmed |
| Financial tracking — payment records | Done | Payment status and amounts logged |
| Financial tracking — expense logging | Done | Expense records per unit |
| Vendor payout / commission split | Missing | No automated commission deduction or payout |

---

### 7. Security & Advanced Features
> Features related to physical access and asset protection.

| Sub-Feature | Status | Notes |
|---|---|---|
| Climate / temperature monitoring | Missing | No IoT data feeds for cold-storage units |
| Humidity / sensor alerts | Missing | Not implemented |
| Key-card / PIN access issuance | Missing | No access-control integration |
| Entry log for clients | Missing | No who-entered-when display |
| Insurance for stored goods | Missing | No insurance option during checkout |
| Inventory / SKU tracking | Missing | No inventory management for goods stored inside |
| Automated recurring invoice (monthly contracts) | Missing | Invoicing is manual |

---

## Critical Pre-Launch Fixes

| # | Fix | Impact |
|---|---|---|
| 1 | **Payment step** — Clarify and implement payment. If digital, wire PayHere; if manual/cash, add clear instructions in the UI. | High — financial |
| 2 | **Concurrent booking race condition** — Add a DB-level lock or unique constraint on unit + date-range overlap. | High — data integrity |
| 3 | **Approval workflow test** — Run the full cycle: vendor submits → superadmin approves/rejects → confirm rejected units cannot be booked. | High — operations |
| 4 | **Cancellation refund trigger** — Verify policy logic triggers an actual refund action, not only a DB status update. | High — financial |
| 5 | **Vendor notification** — Send email to vendor when a client books their unit. | Medium — operations |
