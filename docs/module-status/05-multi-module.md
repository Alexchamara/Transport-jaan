# Module 5 — Multi-Module Booking (Bus · Train · Yacht)

**Launch Readiness:** 55 %  
**Status:** Journey-planning skeleton and UI are complete. Backend integration with individual transport providers is partial. Several critical security and operational gaps remain.

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

### 1. Journey Planning
> Building a multi-leg trip from scratch.

| Sub-Feature | Status | Notes |
|---|---|---|
| Multi-leg journey entry form | Done | Add origin, destination, date, and transport mode per leg |
| Add unlimited legs to a journey | Done | No hard cap on number of legs |
| Journey record saved to DB | Done | Stored in `MultiModelJourney` with linked `MultiModelLeg` rows |
| Journey retrieved across steps | Done | State carried through all subsequent pages |
| Connection time validation between legs | Missing | No check that arrival of leg N allows connection to departure of leg N+1 |
| Itinerary optimization suggestions | Missing | No engine to recommend the best combination of options |
| Auth gate at journey-plan step | Partial | Unclear if unauthenticated users are blocked here or only at checkout |

---

### 2. Vehicle / Service Search per Leg
> Finding available transport for each individual leg.

| Sub-Feature | Status | Notes |
|---|---|---|
| Bus schedule search per leg | Done | Available buses loaded by origin/destination/date |
| Train schedule search per leg | Done | Available trains loaded by origin/destination/date |
| Yacht search per leg | Partial | UI components exist; backend availability query for yacht legs unconfirmed |
| Results list per leg | Done | Options shown in a list per transport mode |
| Vehicle detail popup | Done | Detail view for each option before selecting |
| Real-time availability update | Missing | Results fetched once; no live refresh if a schedule fills up mid-session |

---

### 3. Selection & Cart
> Choosing a transport option for each leg and reviewing the full journey.

| Sub-Feature | Status | Notes |
|---|---|---|
| Select a vehicle / schedule per leg | Done | Selection stored in `MultiModelBooking` |
| Cart review page (all legs + costs) | Done | `ReviewJourney` page shows all selected legs |
| Per-leg cost display | Done | Individual leg prices shown |
| Server-side total price validation | Missing | Total assembled client-side only — manipulation risk before payment |
| Seat selection — bus leg | Missing | Skipped in multi-model flow; no seat number assigned |
| Seat selection — train leg | Missing | Skipped; train seat conflict detection not applied |
| Remove / change a leg before payment | Partial | UI may allow re-selection; backend update confirmation unclear |

---

### 4. Traveller Details
> Collecting passenger information for the booking.

| Sub-Feature | Status | Notes |
|---|---|---|
| Passenger name | Done | Captured in traveller details form |
| Passenger contact info | Done | Phone and email |
| Passenger ID number | Done | National ID / passport number |
| Multiple passengers per booking | Partial | Form appears single-passenger; group booking unclear |
| Luggage / baggage declaration | Missing | No cross-leg baggage summary or allowance display |

---

### 5. Payment
> Completing the financial transaction for the multi-leg booking.

| Sub-Feature | Status | Notes |
|---|---|---|
| Payment page renders with booking summary | Done | Page loads and shows leg breakdown |
| Server-side total sent to PayHere | Partial | Unconfirmed; current total may come from client-side |
| PayHere payment initiation | Partial | Payment page exists; actual PayHere API call unconfirmed |
| Payment reference stored against booking | Partial | Must confirm `MultiModelBooking` stores PayHere transaction ID |
| Payment failure handling | Missing | No confirmed retry flow |
| Vendor approval workflow after payment | Done | Multi-leg booking routed to each provider for confirmation |
| Vendor payout split (multiple vendors) | Missing | No automated split; all revenue goes to one bucket |

---

### 6. Booking Confirmation
> What happens after payment is completed.

| Sub-Feature | Status | Notes |
|---|---|---|
| Booking confirmation page — bus legs | Done | Confirmation page per transport type |
| Booking confirmation page — train legs | Done | Confirmation page per transport type |
| Booking confirmation page — yacht legs | Done | Confirmation page per transport type |
| Booking reference number | Done | Reference shown on confirmation |
| Unified itinerary PDF (all legs in one document) | Missing | No single-document itinerary; each leg needs its own ticket |
| Email confirmation to passenger | Partial | Confirmation page exists; email delivery unconfirmed |
| Vendor notification per leg | Missing | No fan-out notification to each provider after payment |

---

### 7. Post-Booking Management
> What passengers and vendors can do after confirmation.

| Sub-Feature | Status | Notes |
|---|---|---|
| Booking history in client account | Partial | Multi-model bookings may not appear in the standard client dashboard |
| Cancel entire booking | Partial | No confirmed cancellation flow for multi-model bookings |
| Cancel an individual leg | Missing | No workflow to cancel one leg without affecting others |
| Modify a leg (change date / transport) | Missing | Not supported post-confirmation |
| Add a new leg after booking | Missing | Not supported |
| Refund handling on cancellation | Missing | No refund logic for multi-model bookings |

---

### 8. Transport-Type Integration
> How well each transport type is wired into the multi-model backend.

| Sub-Feature | Status | Notes |
|---|---|---|
| Bus — schedule lookup | Done | Calls bus schedule query |
| Bus — booking creation | Partial | Booking record created; seat number not assigned |
| Bus — seat conflict check | Missing | Bus seat validation not applied in this flow |
| Train — schedule lookup | Done | Calls train schedule query |
| Train — booking creation | Partial | Booking record created; seat number not assigned |
| Train — seat conflict check | Missing | Train seat unique-constraint not applied in this flow |
| Yacht — availability lookup | Partial | UI exists; backend yacht availability controller unconfirmed |
| Yacht — booking creation | Partial | Unclear if controller logic for yacht leg booking is complete |

---

## Critical Pre-Launch Fixes

| # | Fix | Impact |
|---|---|---|
| 1 | **Server-side price validation** — Calculate and validate the total on the server in `MultiModelBookingController` before initiating PayHere. Never trust a client-submitted total. | High — security / financial |
| 2 | **PayHere integration** — Confirm PayHere is called with the correct amount and that the transaction ID is stored against `MultiModelBooking`. | High — financial |
| 3 | **Seat assignment for bus / train legs** — Add seat selection steps or implement auto-assignment. Without seat numbers, operators cannot honour the booking. | High — operations |
| 4 | **Yacht backend audit** — Check `MultiModelBookingController` for yacht-leg booking logic. If missing, remove yacht from multi-model at launch. | High — reliability |
| 5 | **Auth gate** — Block unauthenticated users at the journey-plan step (not silently at checkout) to avoid losing planned journey data. | Medium — UX |
| 6 | **Vendor fan-out notification** — After payment, notify each vendor whose leg was booked. | Medium — operations |
