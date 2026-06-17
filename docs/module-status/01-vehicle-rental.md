# Module 1 — Vehicle Rental (Land · Air · Sea)

**Launch Readiness:** 90 %  
**Status:** Near production-ready across all three vehicle types.

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

### 1. Browsing & Discovery
> How clients find and explore vehicles across all three types (land, air, sea).

| Sub-Feature | Status | Notes |
|---|---|---|
| Land vehicle listing page | Done | Paginated results with all land vehicles |
| Air vehicle listing page | Done | Separate listing for aircraft |
| Sea vehicle listing page | Done | Separate listing for boats/yachts |
| Search by brand / model | Done | Filter applied at listing level |
| Search by body type | Done | e.g. SUV, sedan, speedboat |
| Search by passenger capacity | Done | Min/max passenger count filter |
| Search by price range | Done | Price slider / min-max input |
| Search by transmission type | Missing | Not present in filter UI |
| Search by fuel type | Missing | Not present in filter UI |
| Search by mileage limit | Missing | Not present in filter UI |
| Vehicle detail page — land specs | Done | Full specification panel for land vehicles |
| Vehicle detail page — air specs | Done | Aircraft-specific specification panel |
| Vehicle detail page — sea specs | Done | Marine-specific specification panel |
| Media gallery (photos) | Done | Multiple photos per vehicle |
| Like / Favourite toggle | Done | Persisted per user in database |
| Star rating display | Done | Aggregated average shown on listing and detail |

---

### 2. Booking Flow
> The full journey from price quote to confirmed booking for all three vehicle types.

| Sub-Feature | Status | Notes |
|---|---|---|
| Quote generation (land) | Done | Calculates cost from dates + duration + addons |
| Quote generation (air) | Done | Air-specific quote logic |
| Quote generation (sea) | Done | Sea-specific quote logic |
| Addon / extras selection | Done | Per-vehicle optional extras (GPS, child seat, crew, etc.) |
| Checkout page | Done | Quote summary + customer info form + payment entry |
| Customer info form | Done | Name, contact, special requirements |
| Booking type-specific fields | Done | Different fields shown for land vs air vs sea |
| Payment confirmation | Done | `BookingPayment` record stored on success |
| Booking summary / receipt page | Done | Reference, dates, and cost breakdown displayed |
| Availability check before booking | Missing | No date-overlap validation — double-booking is possible |
| Real-time availability calendar | Missing | No blocked-date widget on vehicle detail page |

---

### 3. Post-Booking Management
> What clients and vendors can do after a booking is confirmed.

| Sub-Feature | Status | Notes |
|---|---|---|
| Booking history in client dashboard | Done | All bookings listed with status |
| Booking cancellation | Done | Cancellation policy evaluated before cancellation |
| Cancellation refund calculation | Done | Refund percentage based on cancellation window |
| Cancellation refund trigger (PayHere) | Partial | Policy evaluation exists; actual PayHere refund API call unconfirmed |
| Booking modification (date change) | Missing | Post-booking date-change flow does not exist |
| Driver assignment to booking | Missing | No UI for assigning a driver; vendor must handle off-system |

---

### 4. Cancellation Policies
> Rules that govern refund eligibility when a booking is cancelled.

| Sub-Feature | Status | Notes |
|---|---|---|
| Configurable cancellation windows per vehicle | Done | Vendor sets cutoff periods |
| Configurable refund percentages per window | Done | e.g. 100 % if cancelled 7 days before, 50 % within 3 days |
| Policy displayed on checkout before payment | Done | Client sees policy before confirming |
| Policy enforcement on cancellation | Done | Applied when client initiates cancellation |

---

### 5. Reviews & Ratings
> Client feedback on vehicles after a completed rental.

| Sub-Feature | Status | Notes |
|---|---|---|
| Star rating submission (1–5) | Done | Client rates after booking completion |
| Written comment submission | Done | Optional text review |
| Review listing on vehicle detail page | Done | All reviews shown below specs |
| Aggregated average rating | Done | Displayed on listing card and detail page |

---

### 6. Vendor — Vehicle Management
> Tools for rental vendors to manage their fleet.

| Sub-Feature | Status | Notes |
|---|---|---|
| Add a new vehicle | Done | CRUD form for all three types |
| Edit vehicle details | Done | Update specs, pricing, description |
| Delete / remove a vehicle | Done | Remove from active listings |
| Set vehicle status (active / inactive / maintenance) | Done | Controls visibility to clients |
| Upload vehicle documents (registration, insurance) | Done | File storage per vehicle |
| Vehicle document PDF viewer (client side) | Partial | Upload works; inline PDF rendering on detail page unconfirmed |
| Upload vehicle photos | Done | Media gallery management |
| Maintenance log creation | Done | Log maintenance events per vehicle |
| Maintenance log tracking | Done | History of past maintenance records |
| Driver / crew profile management | Partial | Model and document exist; no UI to assign a driver to a booking |
| Driver self-registration | Missing | Drivers cannot register independently; vendor must add them manually |
| Vendor notification on new booking | Partial | Basic record saving exists; no email/push alert to vendor |
| View incoming bookings (vendor dashboard) | Partial | Dashboard exists; confirm all booking types appear correctly |

---

### 7. Pricing
> How vehicle rental prices are set and applied.

| Sub-Feature | Status | Notes |
|---|---|---|
| Static price per vehicle | Done | Vendor sets a daily/hourly rate |
| Addon pricing | Done | Each extra has its own price |
| Dynamic / demand-based pricing | Missing | No surge or seasonal adjustment logic |
| Multi-currency support | Missing | Single currency only (LKR / PayHere default) |
| Vendor payout / commission split | Missing | No automated commission deduction or payout schedule |

---

### 8. Insurance
> Coverage options during the rental period.

| Sub-Feature | Status | Notes |
|---|---|---|
| Insurance add-on during checkout | Missing | No third-party insurance quote or selection |

---

## Critical Pre-Launch Fixes

| # | Fix | Impact |
|---|---|---|
| 1 | **Availability blocking** — Block booked dates so the same vehicle cannot be double-booked. Validate date overlap in `ClientBookingController::store()`. | High — data integrity |
| 2 | **Cancellation refund trigger** — Verify the PayHere refund API is actually called, not just the policy record updated. | High — financial |
| 3 | **Vendor booking notification** — Send email/notification to vendor when a new booking arrives so they can assign a driver. | Medium — operations |
| 4 | **Vendor booking view** — Confirm all three vehicle types (land, air, sea) appear in the vendor's incoming bookings dashboard. | Medium — operations |
