# Module 2 — Ticket Booking (Air · Train · Bus)

**Launch Readiness:** 80 %  
**Status:** Bus and Train are production-ready. Air/Flight booking is a stub only — no search, no seat map, no schedule system.

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

### 1. Bus Ticket Booking
> End-to-end flow for searching and booking a bus seat.

| Sub-Feature | Status | Notes |
|---|---|---|
| Search by origin station | Done | Station dropdown populated from DB |
| Search by destination station | Done | Station dropdown populated from DB |
| Search by travel date | Done | Date picker with past-date guard |
| Results listing | Done | Shows bus name, departure/arrival times, class, seats, price |
| Seat availability check | Done | Remaining seats validated before booking |
| Booking creation | Done | Stores passenger info, seat count, contact details |
| Seat number assignment | Partial | Availability counted but no individual seat number assigned to bus passenger |
| Window / aisle seat preference | Missing | No seat preference selection |
| Bus class selection (e.g. luxury / semi-luxury) | Missing | No class tier selection |
| Booking reference generation | Done | Cryptographic reference with embedded checksum |
| PDF ticket generation | Done | Downloadable ticket via `TicketGenerationService` |
| Email ticket delivery | Done | Ticket sent to passenger email on confirmation |
| Boarding pass / QR code | Missing | PDF only; no QR/barcode for digital scanning |
| Booking success page | Done | Shows reference, journey summary, and download link |
| Booking cancellation | Done | Policy-driven cancellation with refund eligibility check |
| Refund amount calculation | Done | Based on cancellation window |
| Actual PayHere refund reversal | Partial | Calculation done; PayHere API call unconfirmed |
| Booking modification (date / seat change) | Missing | Not supported post-booking |

---

### 2. Train Ticket Booking
> End-to-end flow for searching and booking a train seat.

| Sub-Feature | Status | Notes |
|---|---|---|
| Search by origin station | Done | Station dropdown from DB |
| Search by destination station | Done | Station dropdown from DB |
| Search by travel date | Done | Date picker with past-date guard |
| Results listing | Done | Shows train, schedule, available seats, price |
| Individual seat selection | Done | Passenger picks a specific seat number from available pool |
| Seat conflict detection | Done | Two bookings cannot claim the same seat |
| Concurrent seat conflict (DB-level lock) | Partial | Application-level check exists; no DB unique constraint or pessimistic lock |
| Class selection (first / second / sleeper) | Partial | Seats are numbered but no class distinction shown in search or booking |
| Booking creation | Done | Stores passenger info and seat assignment |
| Booking reference generation | Done | Same cryptographic service as bus |
| PDF ticket generation | Done | Downloadable ticket |
| Email ticket delivery | Done | Ticket sent on confirmation |
| Boarding pass / QR code | Missing | PDF only |
| Booking success page | Done | Reference, journey, download link |
| Booking cancellation | Done | Policy evaluated before processing |
| Refund amount calculation | Done | Based on cancellation window |
| Actual PayHere refund reversal | Partial | Calculation done; PayHere API call unconfirmed |
| Booking modification | Missing | Not supported post-booking |

---

### 3. Flight / Air Ticket Booking
> Stub only — the booking flow does not exist yet.

| Sub-Feature | Status | Notes |
|---|---|---|
| Flight schedule database | Missing | No flight schedule table or CRUD |
| Flight search by origin / destination / date | Missing | No search UI or backend query |
| Flight results listing | Missing | No results page |
| Seat map / seat selection | Missing | Not started |
| Airline / class selection | Missing | Not started |
| Booking creation | Partial | `FlightBookingController::store()` saves raw posted data only |
| Booking reference generation | Missing | Reference service not wired to flight flow |
| PDF ticket generation | Missing | Not wired |
| Email ticket delivery | Missing | Not wired |
| Baggage selection / allowance | Missing | Not started |
| Booking cancellation | Partial | Cancellation policy handler exists but no test path |
| Boarding pass / QR code | Missing | Not started |
| Airline partner / GDS integration | Missing | No Amadeus, Sabre, or equivalent API |

---

### 4. Shared Booking Services
> Infrastructure used across bus and train booking.

| Sub-Feature | Status | Notes |
|---|---|---|
| Business validation (18 rules) | Done | Past dates, capacity, overbooking, seat conflict, duplicate bookings |
| Booking reference generator | Done | Collision-resistant, checksum-embedded |
| Ticket reference verification endpoint | Done | Validate a reference to confirm authenticity |
| Cancellation policy engine | Done | Calculates refund amount based on advance notice |
| PDF ticket generation service | Done | `TicketGenerationService` used by bus and train |
| Email rendering — Gmail / Outlook / mobile | Partial | Service exists; cross-client rendering not confirmed |
| Real-time seat availability push | Missing | Seat count checked at booking only; no live update for concurrent users |
| Baggage management | Missing | No allowance display or extra baggage fee selection |
| Multi-currency support | Missing | Single currency only |
| Foreign passenger passport field | Missing | No passport number field |

---

### 5. Operator / Vendor Portal
> Tools for bus and train operators to manage their services.

| Sub-Feature | Status | Notes |
|---|---|---|
| Schedule management UI | Partial | Models and migrations exist; no operator UI to add / edit schedules |
| Station management UI | Partial | Models exist; no UI |
| Bus / train fleet management UI | Partial | Models exist; no UI |
| View bookings for own routes | Missing | Operators cannot log in to see their bookings |
| Capacity / manifest management | Missing | Not started |

---

## Critical Pre-Launch Fixes

| # | Fix | Impact |
|---|---|---|
| 1 | **Flight tab** — Remove the flight tab from the UI at launch, or complete the minimum flight booking flow. A broken tab is worse than no tab. | High — UX |
| 2 | **Refund reversal** — Confirm `CancellationPolicyService` triggers the actual PayHere refund API, not only a DB status update. | High — financial |
| 3 | **Concurrent seat lock** — Add a DB-level unique constraint or pessimistic lock on seat assignment to prevent race conditions. | High — data integrity |
| 4 | **Schedule seeding** — Add at minimum a superadmin UI to create schedules; operators cannot use the system without schedules in the DB. | High — operations |
| 5 | **Email template QA** — Test ticket email rendering across Gmail, Outlook, and mobile before launch. | Medium — quality |
